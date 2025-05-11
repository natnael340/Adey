from django.shortcuts import get_object_or_404

from rest_framework.viewsets import GenericViewSet
from rest_framework.request import Request
from adey_apps.rag.models import Chat
from django.http import Http404


class ChatMixin:
    def initialize_request(self:GenericViewSet, request: Request, *args, **kwargs) -> Request:
        """
        Initialize the request and add the chat object to it.
        """
        request = super().initialize_request(request, *args, **kwargs)
        request.chat = self.resolve_chat_or_404(request)
        
        return request
    
    def resolve_chat_or_404(self:GenericViewSet, request:Request) -> Chat:
        """
        Resolve the chat object from the request.
        """
        chat = get_object_or_404(Chat, slug=self.kwargs.get("chat_slug"), user=request.user)
        
        return chat