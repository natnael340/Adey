from corsheaders.signals import check_request_enabled
from rest_framework.request import Request
import re
from asgiref.sync import async_to_sync
from adey_apps.rag.models import Chat
from django.dispatch import receiver
from django.conf import settings

async def get_chat(identifier):
    return await Chat.objects.aget(identifier=identifier)

def cors_allow_chatbot_request(sender, request, **kwargs):
    origin = request.headers.get("Origin", "")
    if origin in settings.FRONTEND_URLS:
        return True
    elif re.search(r"/rag/chat_bot/[0-9a-f-]+/$", request.path):
        chat_id = request.path.split("/")[-2]
        try:
            chat = async_to_sync(get_chat)(identifier=chat_id)
            return origin in chat.allowed_urls
        except Exception:
            pass

    return False
    

check_request_enabled.connect(cors_allow_chatbot_request, weak=False)