from typing import Any, Optional
from django.core.management.base import BaseCommand, CommandParser
from django.utils.encoding import force_str
from django.conf import settings
from adey_apps.users.models import User
from adey_apps.rag.models import Resource, Chat
from adey_apps.rag.utils import query_chat_vector_db
import os

os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY


class Command(BaseCommand):
    help = "Query the pg vector index for the user and the chat_slug"

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("chat_id", type=str, help="Email of the user")
        parser.add_argument("query", type=str, help="Email of the user")
    
    def handle(self, chat_id, query, **options: Any) -> None:
        try:
            chat = Chat.objects.get(identifier=chat_id)
            result = query_chat_vector_db(chat, query)
            print(result)
        except Chat.DoesNotExist:
            self.stderr.write(f"No such Chat exists with the given slug.")
        except Exception as e:
            self.stderr.write(f"Exception occurred. Error: {e.__str__()}")

        