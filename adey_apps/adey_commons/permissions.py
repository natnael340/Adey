from datetime import datetime
from rest_framework.permissions import BasePermission
from adey_apps.rag.utils import Url
from django.conf import settings
from rest_framework.exceptions import PermissionDenied
from adey_apps.rag.models import Message, MessageTypeChoices


class HasChatBotPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        origin = request.headers.get('origin', "")
        if request.headers.get("Origin", "") in settings.FRONTEND_URLS:
            return True
        
        if origin and not origin.endswith("/"):
            origin += "/"
        
        if any(Url(origin) == Url(url) for url in obj.allowed_urls):
            return True

        raise PermissionDenied("Origin not allowed.")
    

class HasPermissionToAddChatBot(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.chat_set.count() < user.subscription.plan.max_chatbot:
            return True
        
        return False


class HasPermissionToAddSession(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        chats = user.chat_set.all()
        messages = Message.objects.filter(chat__in=chats).values("session_id").distinct()
        if messages.count() < user.subscription.plan.max_user_session:
            return True
        
        return False


def has_chat_request_permission(user):
    chats = user.chat_set.all()
    messages = Message.objects.filter(
        chat__in=chats, 
        message_type=MessageTypeChoices.HUMAN, 
        created__month=datetime.now().month,
        created__year=datetime.now().year,
    )

    if messages.count() <  user.subscription.plan.max_request_per_month:
        return True
    
    return False






