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
    ChatBotAnalytics,
    ChatToolsAddAPIView,
    WidgetPreferenceViewSet,
    ChatPreferenceAPIView
)

router = routers.DefaultRouter()

urlpatterns = [
    path("<str:chat_id>/messages/", MessageListCreateViewSet.as_view(), name="message-list-create"),
    path("chat/", ChatCreateAPIView.as_view(), name="chat-create"),
    path("chat/<slug:slug>/", ChatUpdateAPIView.as_view(), name="chat-update"),
    path("chat/<slug:chat_slug>/build", ChatBotBuildApiView.as_view(), name="chat-bot-build"),
    re_path(r"^chat_bot/(?P<identifier>[0-9a-f-]+)/$", ChatBotApiView.as_view(), name="chat-bot"),
    path("dashboard/", ChatBotAnalytics.as_view(), name="dashboard"),
    path("chat/<slug:chat_slug>/tools/<slug:slug>", ChatToolsAddAPIView.as_view(), name="chat-tools-add"),
    path("chat/<slug:chat_slug>/preference/<str:identifier>/", ChatPreferenceAPIView.as_view(), name="chat-preference-add"),
]

router.register("chats", ChatViewSet, "chat")
router.register(r"(?P<chat_slug>[-\w]+)/resource", ResourceViewSet, "resource")
router.register(r"(?P<task_id>[-\w]+)/message", MessageResponseViewSet, "message-status")
router.register(r"widget/preferences", WidgetPreferenceViewSet, "widget-preference")

urlpatterns += router.urls
