from rest_framework.permissions import BasePermission
from adey_apps.rag.utils import Url
from django.conf import settings
from rest_framework.exceptions import PermissionDenied


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
    