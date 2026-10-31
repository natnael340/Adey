from django.utils import timezone

from adey_apps.rag.skills.base import Skill


class ClockNow(Skill):
    key = "clock.now"
    default = True
    description = (
        "Get the current date and time. Use for questions about today's date, "
        "the current time or the day of the week."
    )

    def run(self) -> str:
        now = timezone.localtime()
        return f"{now:%A} {now.day} {now:%B %Y, %H:%M} ({timezone.get_current_timezone_name()})"
