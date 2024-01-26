from rest_framework.permissions import BasePermission


class HasChatBotPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        origin = request.headers.get('origin', "")
        if origin in obj.allowed_urls:
            return True
        return False