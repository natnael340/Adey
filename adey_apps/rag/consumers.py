from uuid import uuid4
from channels.generic.websocket import JsonWebsocketConsumer
from channels.exceptions import DenyConnection
from adey_apps.rag.agent import Agent
from adey_apps.rag.models import Chat, Message, MessageTypeChoices


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
        res_headers = {}
        
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.user_session_id = headers.get(b"cookie", None)

        try:
            chat = Chat.objects.get(identifier=self.chat_id)
            self.chat = chat
            self.agent = Agent(chat)

            if not self.user_session_id:
                self.user_session_id = uuid4().hex
                res_headers["Set-Cookie"] = f"user_session_id={self.user_session_id}"
                self.accept(subprotocol=(None, res_headers))
                initial_message = "Hello! How can I assist you today?"
                Message.objects.create(
                    chat=chat, 
                    session_id=self.user_session_id, 
                    message=initial_message,
                    message_type=MessageTypeChoices.AI,
                )
                self.agent.setup_chain(self.user_session_id, new_chat=True)
                self.send_json({
                    "message_type": MessageTypeChoices.AI,
                    "message": initial_message,
                })
            else:
                self.user_session_id = self.user_session_id.decode("utf-8").split("=")[1]
                self.agent.setup_chain(self.user_session_id)
                self.accept()        
        except Chat.DoesNotExist:
            raise DenyConnection("Chat with this identifier does not exist.")

    def receive_json(self, content, **kwargs):
        Message.objects.create(
            chat=self.chat, 
            session_id=self.user_session_id, 
            message=content["message"],
            message_type=MessageTypeChoices.HUMAN,
        )
        res = self.agent.query(content["message"])

        Message.objects.create(
            chat=self.chat, 
            session_id=self.user_session_id, 
            message=res,
            message_type=MessageTypeChoices.AI,
        )

        self.send_json({
            "message_type": MessageTypeChoices.AI,
            "message": res,
        })
        
    
