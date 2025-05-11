from uuid import uuid4
import os

from django.utils import timezone
from django.http import Http404
from django.conf import settings
from django.utils.encoding import force_str
from django.db.models import Count
from django.shortcuts import get_object_or_404

from langchain_community.vectorstores import PGVector
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter


from rest_framework.viewsets import ModelViewSet, GenericViewSet, ReadOnlyModelViewSet
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, CreateAPIView, RetrieveAPIView, UpdateAPIView, GenericAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from adey_apps.rag.utils import URLTextLoader, URLPdfLoader

from celery.result import AsyncResult
from celery_progress.backend import Progress

from adey_apps.rag.serializers import (
    ChatSerializer, 
    ChatCreateSerializer, 
    MessageSerializer, 
    ResourceSerializer, 
    ChatBotSerializer,
    MessageAnalyticsSerializer,
    ChatBotAnalyticsSerializer,
    ChatDetailSerializer,
)
from adey_apps.rag.mixins import ChatMixin
from adey_apps.rag.models import Chat, Resource, Message, MessageTypeChoices, AgentTool
from adey_apps.rag.tasks import get_rag_response
from adey_apps.rag.utils import Url
from adey_apps.adey_commons.paginations import StandardResultsSetPagination
from adey_apps.adey_commons.permissions import HasChatBotPermission
from adey_apps.users.serializers import PlanSerializer

# Create your views here.

class ChatViewSet(ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action  == "list":
            return ChatSerializer
        else:
            return ChatDetailSerializer
    

class ChatCreateAPIView(CreateAPIView):
    serializer_class = ChatCreateSerializer
    permission_classes = (IsAuthenticated,)
    

class ChatUpdateAPIView(UpdateAPIView):
    serializer_class = ChatCreateSerializer
    permission_classes = (IsAuthenticated,)
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user)
    

class ResourceViewSet(ChatMixin, ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = StandardResultsSetPagination
    lookup_field = "slug"
    lookup_url_kwarg="slug"

    def get_queryset(self):
        """
        Filter Resource with chat's slug and chat author.
        """
        return Resource.objects.filter(chat=self.request.chat)
       

class MessageListCreateViewSet(ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        chat_id = self.kwargs.get("chat_id")
        user_session_id = self.request.COOKIES.get("user_session_id", "")
        try:
            chat = Chat.objects.get(identifier=chat_id)
            if not user_session_id:
                user_session_id = uuid4().hex
                Message.objects.create(chat=chat, session_id=user_session_id, message="Hello there! We're glad you're here. How may we help you?", message_type=MessageTypeChoices.AI)
            self.kwargs["user_session_id"] = user_session_id
            return  Message.objects.filter(chat=chat, session_id=user_session_id).order_by("created")
        except Chat.DoesNotExist:
            raise Http404
    
    def perform_create(self, serializer):
        chat_id = self.kwargs.get('chat_id')
        user_session_id = self.request.COOKIES.get("user_session_id", uuid4())
        try:
            chat = Chat.objects.filter(identifier=chat_id).first()
            serializer.save(chat=chat, session_id=user_session_id, message_type=MessageTypeChoices.HUMAN)
            result = get_rag_response.delay(chat_id, user_session_id, self.request.data["message"])
            self.kwargs["user_session_id"] = user_session_id
            self.kwargs["task_id"] = result.task_id
        except Chat.DoesNotExist:
            raise Http404
        return super().perform_create(serializer)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        if not self.request.COOKIES.get("user_session_id", None):
            response.set_cookie("user_session_id", self.kwargs["user_session_id"], max_age=604800)

        return response
    
    def create(self, request, *args, **kwargs):
        response =  super().create(request, *args, **kwargs)

        if response.status_code == status.HTTP_201_CREATED:
            if not self.request.COOKIES.get("user_session_id", None):
                response.set_cookie("user_session_id", self.kwargs["user_session_id"], max_age=604800)
            response.data["task_id"] = self.kwargs["task_id"]

        return response

        


class MessageResponseViewSet(GenericViewSet):
    serializer_class = MessageSerializer
    @action(methods=["GET"], detail=False, url_path="status")
    def get_status(self, *args, **kwargs):
        task_id = kwargs.get("task_id", None)
        print(AsyncResult(task_id))
        info = Progress(AsyncResult(task_id)).get_info()

        return Response({
            "task_id": task_id,
            "progress": info
        }, status=status.HTTP_200_OK)


class ChatBotApiView(RetrieveAPIView):
    serializer_class = ChatBotSerializer
    permission_classes = (HasChatBotPermission,)
    queryset = Chat.objects.all()
    lookup_field="identifier"
    lookup_url_kwarg="identifier"

    def retrieve(self, request, *args, **kwargs):        
        response =  super().retrieve(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            user_session_id = uuid4().hex
            if not self.request.COOKIES.get("user_session_id", None):
                response.set_cookie("user_session_id", user_session_id, max_age=604800)
            
        return response


class ChatBotBuildApiView(ChatMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            resources = request.chat.resource_set.all()
            documents = []
           
            for resource in resources:    
                if resource.document_type == Resource.DocumentTypeChoices.PDF:
                    if settings.ENVIRONMENT == "production":
                        loader = URLPdfLoader(resource.document.url)
                    else:
                        loader = PyPDFLoader(resource.document.path)
                else:
                    if settings.ENVIRONMENT == "production":
                        loader = URLTextLoader(resource.document.url)
                    else:
                        loader = TextLoader(resource.document.path)
                documents.extend(loader.load())
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            chunks = text_splitter.split_documents(documents)
            embedding = OpenAIEmbeddings()
            PGVector.from_documents(
                embedding=embedding,
                documents=chunks,
                collection_name=force_str(request.chat.identifier),
                connection_string=settings.PG_VECTOR_DB_URL,
            )
            request.chat.status = "finished"
            request.chat.save()
        except Chat.DoesNotExist:
            return Response({"success": False, "message": "Chat does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(e)
            return Response({"success": False, "message": "Server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"success": True}, status=status.HTTP_200_OK)



class ChatBotAnalytics(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        chats = user.chat_set.all()

        messages = Message.objects.filter(chat__in=chats)
        user_messages = messages.filter(message_type=MessageTypeChoices.HUMAN)
        qs = MessageAnalyticsSerializer.setup_eager_loading(user_messages)
        messages_data = MessageAnalyticsSerializer(qs, many=True).data
        chats_data = ChatBotAnalyticsSerializer(chats, many=True).data
        
        return Response({
            "user_plan": PlanSerializer(user.subscription.plan).data,
            "total_messages_count": user_messages.count(),
            "message_statistics": messages_data,
            "chat_statistics": chats_data,
            "total_chat_bots_count": chats.count(),
            "total_chats_count": messages.count(),
            "total_sessions_count": messages.values(
                'session_id'
            ).annotate(count=Count('session_id')).count()
        })

class ChatToolsAddAPIView(ChatMixin, APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        chat = request.chat
        slug = kwargs.get("slug")

        tool = get_object_or_404(AgentTool, slug=slug)
        if tool not in chat.tools.all():
            chat.tools.add(tool)
            chat.save()
            return Response({"success": True, "message": "Tool added successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"success": False, "message": "Tool already exists."}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        chat = request.chat
        slug = kwargs.get("slug")

        tool = get_object_or_404(AgentTool, slug=slug)
        chat.tools.remove(tool)
        chat.save()

        if tool.tool_type == AgentTool.ToolTypeChoices.RAG:
            # Avoid bulk_delete to ensure post_delete signals are sent
            [resource.delete() for resource in Resource.objects.filter(chat=chat)]
            PGVector(
                collection_name=force_str(chat.identifier),
                connection_string=settings.PG_VECTOR_DB_URL,
                embedding_function=OpenAIEmbeddings()
            ).delete_collection()
        
        return Response({"success": True, "message": "Tool removed successfully."}, status=status.HTTP_200_OK)