import json

from django.core.management.base import BaseCommand, CommandError

from adey_apps.rag.evaluation import load_cases, run_eval
from adey_apps.rag.models import Chat


class Command(BaseCommand):
    help = "Run eval cases against a chat through one or more passes and print metrics"

    def add_arguments(self, parser):
        parser.add_argument("chat_slug", type=str)
        parser.add_argument("cases", type=str)
        parser.add_argument("--pass", dest="passes", action="append", default=None)
        parser.add_argument("--out", type=str, default=None)

    def handle(self, chat_slug, cases, passes, out, **options):
        chats = list(Chat.objects.filter(slug=chat_slug)[:2])
        if not chats:
            raise CommandError("No such Chat exists with the given slug.")
        if len(chats) > 1:
            raise CommandError("Slug matches more than one chat; use a unique slug.")
        case_list = load_cases(cases)
        all_rows = []
        for name in passes or ["rag", "agent"]:
            report = run_eval(chats[0], case_list, name)
            all_rows += report.pop("rows")
            self.stdout.write(
                " ".join(f"{k}={v:.2f}" if isinstance(v, float) else f"{k}={v}" for k, v in report.items())
            )
        if out:
            with open(out, "w", encoding="utf-8") as f:
                f.writelines(json.dumps(row) + "\n" for row in all_rows)
