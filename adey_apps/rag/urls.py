from django.urls import path, re_path
from rest_framework import routers
from adey_apps.rag.views import (
    ChatViewSet, 
    ResourceViewSet, 
    MessageListCreateViewSet, 
    MessageResponseViewSet,
    ChatCreateAPIView,
    ChatUpdateAPIView,
    ChatBotApiView,
    ChatBotBuildApiView,
)

router = routers.DefaultRouter()

urlpatterns = [
    path("<str:chat_id>/messages/", MessageListCreateViewSet.as_view(), name="message-list-create"),
    path("chat/", ChatCreateAPIView.as_view(), name="chat-create"),
    path("chat/<slug:slug>/", ChatUpdateAPIView.as_view(), name="chat-update"),
    path("chat/<slug:slug>/build", ChatBotBuildApiView.as_view(), name="chat-bot-build"),
    re_path(r"^chat_bot/(?P<identifier>[0-9a-f-]+)/$", ChatBotApiView.as_view(), name="chat-bot")
]

router.register("chats", ChatViewSet, "chat")
router.register(r"(?P<chat_slug>[-\w]+)/resource", ResourceViewSet, "resource")
router.register(r"(?P<task_id>[-\w]+)/message", MessageResponseViewSet, "message-status")

urlpatterns += router.urls
