from uuid import uuid4
from channels.generic.websocket import JsonWebsocketConsumer
from channels.exceptions import DenyConnection
from django.conf import settings
from adey_apps.rag.agent_v2 import Agent
from adey_apps.rag.models import Chat, Message, MessageTypeChoices
from adey_apps.adey_commons.permissions import has_chat_request_permission
from adey_apps.rag.utils import key_value_to_dict
import logging

logger = logging.getLogger(__name__)


CONVERSATION_STAGE =  {
    "LIST": 1,
    "MESSAGE": 2,
}

class ChatConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None

    def connect(self):
        headers = dict(self.scope["headers"])
        
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        cookie = headers.get(b"cookie", None)
        print
        if cookie:
            cookie = key_value_to_dict(cookie.decode("utf-8"))
            if cookie.get("user_session_id"):
                self.session_id = cookie.get("user_session_id")
            else:
                raise DenyConnection("Session ID not set")
        else:
            raise DenyConnection("Unauthorized")

        try:
            chat = Chat.objects.get(identifier=self.chat_id)
            if not self.check_permission(headers, chat):
                raise DenyConnection("Origin denied.")
            self.chat = chat
            self.agent = Agent(chat)
            initial_message_exists = Message.objects.filter(chat=chat, session_id=self.session_id).exists()
            if not initial_message_exists and self.session_id:
                self.accept()
                Message.objects.create(
                    chat=chat, 
                    session_id=self.session_id, 
                    message=chat.intro_text,
                    message_type=MessageTypeChoices.AI,
                )
                #self.agent.setup_chain(self.session_id, new_chat=True)
                self.send_json({
                    "message_type": MessageTypeChoices.AI,
                    "message": chat.intro_text,
                })
            elif not self.session_id:
                raise DenyConnection("Session ID not set")
            else:
                self.session_id = self.session_id
                #self.agent.setup_chain(self.session_id)
                self.accept()        
        except Chat.DoesNotExist:
            raise DenyConnection("Chat with this identifier does not exist.")
    
    def check_permission(self, headers, chat: Chat):
        origin = headers.get(b'origin', b"").decode()
        if origin in settings.FRONTEND_URLS:
            return True
        if origin and not origin.endswith("/"):
            origin += "/"
            
        if origin in settings.FRONTEND_URLS:
            return True
        return origin in chat.allowed_urls


    def receive_json(self, content, **kwargs):
        if content["type"] == "message":
            if not has_chat_request_permission(self.chat.user):
               self.send_json({
                "type": "error",
                "message": "Request quota limit reached!"
               })
               self.close()

            
            try:
                res = self.agent.query(content["message"], session_id=self.session_id)
            except Exception as e:
                logger.error(e.__str__())
                self.send_json({
                    "type": "error",
                    "message": "Server error!",
                })
            else:
                Message.objects.create(
                    chat=self.chat, 
                    session_id=self.session_id, 
                    message=content["message"],
                    message_type=MessageTypeChoices.HUMAN,
                )
                Message.objects.create(
                    chat=self.chat, 
                    session_id=self.session_id, 
                    message=res,
                    message_type=MessageTypeChoices.AI,
                )

                self.send_json({
                    "type": "message",
                    "message_type": MessageTypeChoices.AI,
                    "message": res,
                })
        elif content["type"] == "instruction":
            if content["action"] == "message_seen":
                Message.objects.filter(
                    chat=self.chat, session_id=self.session_id
                ).update(seen=True)
        
    
