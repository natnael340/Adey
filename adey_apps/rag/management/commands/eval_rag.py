import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from adey_apps.rag.evaluation import load_cases, record, run_eval
from adey_apps.rag.models import Chat

RESULTS_PATH = Path(__file__).resolve().parents[2] / "evals" / "results.jsonl"


class Command(BaseCommand):
    help = "Run eval cases against a chat through one or more passes and print metrics"

    def add_arguments(self, parser):
        parser.add_argument("chat", type=str, help="chat slug, or chat id if all digits")
        parser.add_argument("cases", type=str)
        parser.add_argument("--pass", dest="passes", action="append", default=None)
        parser.add_argument("--out", type=str, default=None)
        parser.add_argument("--results", type=Path, default=RESULTS_PATH)

    def handle(self, chat, cases, passes, out, results, **options):
        lookup = {"pk": int(chat)} if chat.isdigit() else {"slug": chat}
        chats = list(Chat.objects.filter(**lookup)[:2])
        if not chats:
            raise CommandError("No such Chat exists with the given slug or id.")
        if len(chats) > 1:
            raise CommandError("Slug matches more than one chat; use a unique slug.")
        names = passes or ["router", "rag"]
        unknown = [n for n in names if n not in settings.AGENT_PASSES]
        if unknown:
            raise CommandError(f"Unknown pass {unknown[0]!r}; valid: {', '.join(settings.AGENT_PASSES)}")
        case_list = load_cases(cases)
        all_rows = []
        for name in names:
            report = run_eval(chats[0], case_list, name)
            all_rows += report.pop("rows")
            self.stdout.write(
                " ".join(f"{k}={v:.2f}" if isinstance(v, float) else f"{k}={v}" for k, v in report.items())
            )
            record(results, report, chat=chats[0], cases_path=cases)
        if out:
            with open(out, "w", encoding="utf-8") as f:
                f.writelines(json.dumps(row) + "\n" for row in all_rows)
