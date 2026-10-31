from django.core.management.base import BaseCommand, CommandError

from adey_apps.rag.ingest import index_chat
from adey_apps.rag.models import Chat


class Command(BaseCommand):
    help = "Rebuild the vector index for every chat that has resources (or one chat)."

    def add_arguments(self, parser):
        parser.add_argument("--chat", help="Only reindex the chat with this slug.")

    def handle(self, *args, **options):
        chats = Chat.objects.filter(resource__isnull=False).distinct()
        if options["chat"]:
            chats = chats.filter(slug=options["chat"])
        failed = False
        for chat in chats:
            try:
                self.stdout.write(f"{chat.slug}: {index_chat(chat)} chunks")
            except Exception as error:
                failed = True
                self.stdout.write(f"{chat.slug}: FAILED {error}")
        if failed:
            raise CommandError("Some chats failed to reindex.")
