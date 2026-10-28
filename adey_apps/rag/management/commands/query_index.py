from django.core.management.base import BaseCommand, CommandError

from adey_apps.rag.models import Chat
from adey_apps.rag.passes import answer


class Command(BaseCommand):
    help = "Ask a chat a question through the configured pass and print the answer and sources"

    def add_arguments(self, parser):
        parser.add_argument("chat_identifier", type=str)
        parser.add_argument("question", type=str)

    def handle(self, chat_identifier, question, **options):
        try:
            chat = Chat.objects.get(identifier=chat_identifier)
        except Chat.DoesNotExist:
            raise CommandError("No such Chat exists with the given identifier.")
        result = answer(chat, "cli", question)
        self.stdout.write(result.answer)
        for source in result.sources:
            page = f" (p. {source['page']})" if source.get("page") is not None else ""
            self.stdout.write(f"- {source['title']}{page}")
