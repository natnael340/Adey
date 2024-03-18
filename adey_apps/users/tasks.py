from celery import shared_task
from celery.utils.log import get_task_logger
from adey_apps.users.utils import send_activation_email as send_email

logger = get_task_logger(__name__)


@shared_task(name="send_activation_email")  # type: ignore
def send_activation_email(to_email: str, url: str) -> None:
    logger.info("Sending activation email")
    send_email(to_email, url)
