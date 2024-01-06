from uuid import uuid4

from django.utils import timezone
from django.http import Http404
from django.conf import settings

from rest_framework.viewsets import ModelViewSet, GenericViewSet, ReadOnlyModelViewSet
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, CreateAPIView, RetrieveAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from celery.result import AsyncResult
from celery_progress.backend import Progress

from adey_apps.rag.serializers import ChatSerializer, ChatCreateSerializer, MessageSerializer, ResourceSerializer
from adey_apps.rag.models import Chat, Resource, Message, MessageTypeChoices
from adey_apps.rag.tasks import get_rag_response

# Create your views here.

class ChatViewSet(ReadOnlyModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = (IsAuthenticated,)
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user)
    

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
    

class ResourceViewSet(ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = (IsAuthenticated,)
    lookup_field = "slug"
    lookup_url_kwarg="slug"

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["chat_slug"] = self.kwargs.get("chat_slug")
        return context

    def get_queryset(self):
        chat = Chat.objects.filter(slug=self.kwargs["chat_slug"], user=self.request.user).first()
        if chat:
            return Resource.objects.filter(chat=chat)
        
        raise Http404
    

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
