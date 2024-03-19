from celery import shared_task
from celery.utils.log import get_task_logger
from adey_apps.users.utils import send_act_email, send_pwd_email

logger = get_task_logger(__name__)


@shared_task(name="send_activation_email")  # type: ignore
def send_activation_email(to_email: str, url: str) -> None:
    logger.info("Sending activation email")
    send_act_email(to_email, url)


@shared_task(name="send_password_reset_email")  # type: ignore
def send_password_reset_email(to_email: str, url: str) -> None:
    logger.info("Sending Password reset email")
    send_pwd_email(to_email, url)