from django.contrib import admin
from adey_apps.rag.models import Resource, Chat, Message
# Register your models here.

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "chat")


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "assistant_name", "user", "identifier")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("session_id", "username", "chat")