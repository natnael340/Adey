from django.urls import path
from rest_framework import routers
from adey_apps.rag.views import ChatViewSet, ResourceViewSet, MessageListCreateViewSet, MessageResponseViewSet

router = routers.DefaultRouter()

urlpatterns = [
    path("<str:chat_id>/messages/", MessageListCreateViewSet.as_view(), name="message-list-create"),
]

router.register("chat", ChatViewSet, "chat")
router.register(r"(?P<chat_slug>[-\w]+)/resource", ResourceViewSet, "resource")
router.register(r"(?P<task_id>[-\w]+)/message", MessageResponseViewSet, "message-status")

urlpatterns += router.urls
