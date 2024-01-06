from django.urls import re_path
from adey_apps.rag.consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r"rag/(?P<chat_id>[0-9a-f\-]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/messages/$", ChatConsumer.as_asgi()),
]