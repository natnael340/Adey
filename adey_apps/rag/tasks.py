from celery import shared_task

from adey_apps.rag.models import Chat, Message
from adey_apps.rag.agent_v2 import Agent
from adey_apps.rag.serializers import MessageSerializer

@shared_task(bind=True)
def get_rag_response(self, chat_id, user_session_id, query) -> str:
    chat = Chat.objects.get(identifier=chat_id)
    response = Agent(chat).query(query, session_id=user_session_id)
    message = Message.objects.filter(chat=chat, session_id=user_session_id).last()
    message.response = response
    message.save()
    
    return MessageSerializer(instance=message).data

