import pytest
from django.urls import reverse

from adey_apps.rag.models import ChatSkill

pytestmark = pytest.mark.django_db


def test_admin_shows_config_errors_instead_of_crashing(client, chat, django_user_model):
    client.force_login(django_user_model.objects.create_superuser(email="admin@adey.test", password="pw"))
    response = client.post(reverse("admin:rag_chatskill_add"), {"chat": chat.pk, "key": "test.echo_key", "is_active": "on"})
    assert response.status_code == 200
    assert "api_key: Field required" in response.content.decode()
    assert not ChatSkill.objects.exists()
