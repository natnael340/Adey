import pytest
import json
from django.urls import reverse

from adey_apps.rag.serializers import ChatCreateSerializer
from adey_apps.rag.models import Chat
from adey_apps.rag.views import ChatUpdateAPIView
from adey_apps.rag.tests.conftest import CHAT_DATA

pytestmark = pytest.mark.django_db

CHAT_CREATE_URL_NAME = "chat-create"
CHAT_UPDATE_URL_NAME = "chat-update"



@pytest.fixture
def chat_request(rf, user):
    req = rf.post("/", data=CHAT_DATA)
    req.user = user

    return req


def test_chat_create_view_set_create_chat_instance(logged_in_client ):
    response = logged_in_client.post(reverse(CHAT_CREATE_URL_NAME), data=CHAT_DATA)
    assert response.status_code == 201

    chat = Chat.objects.last()
    assert chat.name == CHAT_DATA["name"]


def test_chat_update_view_set_get_query_set_returns_only_chats_for_the_user(chat_request, user, chat_factory):
    chats = chat_factory.create_batch(3, user=user)
    chat_factory.create_batch(3)
    view = ChatUpdateAPIView()
    view.setup(chat_request)
    assert set(view.get_queryset()) == set(chats)

def test_chat_update_view_set_update_chat_instance(chat, logged_in_client):
    response = logged_in_client.put(
        reverse(CHAT_UPDATE_URL_NAME, args=[chat.slug]), 
        data=json.dumps(CHAT_DATA), 
        content_type="application/json"
    )
    assert response.status_code == 200

    chat.refresh_from_db()
    assert chat.name == CHAT_DATA["name"]
    assert chat.assistant_name == CHAT_DATA["assistant_name"]
    assert chat.business_name == CHAT_DATA["business_name"]
    assert chat.business_description == CHAT_DATA["business_description"]
    assert all(character.name in CHAT_DATA["assistant_characters"] for character in chat.assistant_characters.all())

def test_build_endpoint_indexes_chat(chat, logged_in_client, mocker):
    index = mocker.patch("adey_apps.rag.views.index_chat")
    response = logged_in_client.get(reverse("chat-bot-build", args=[chat.slug]))
    assert response.status_code == 200
    index.assert_called_once_with(chat)
    chat.refresh_from_db()
    assert chat.status == "finished"


def _skills_url(chat, pk=None, validate=False):
    if pk is None:
        return reverse("chat-skill-validate" if validate else "chat-skill-list", kwargs={"chat_slug": chat.slug})
    return reverse("chat-skill-validate-saved" if validate else "chat-skill-detail",
                   kwargs={"chat_slug": chat.slug, "pk": pk})


@pytest.fixture
def echo_enrollment(chat):
    from adey_apps.rag.models import ChatSkill
    return ChatSkill.objects.create(chat=chat, key="test.echo_key", config={"api_key": "sk-secret-1234"})


def test_catalog_lists_schema(logged_in_client):
    response = logged_in_client.get(reverse("skill-catalog"))
    assert response.status_code == 200
    catalog = {c["key"]: c for c in response.json()}
    assert catalog["clock.now"]["config_schema"] == {}
    assert catalog["clock.now"]["default"] is True
    assert catalog["test.echo_key"]["config_schema"]["properties"]["api_key"]["format"] == "password"


def test_enroll_masks_secret(chat, logged_in_client):
    response = logged_in_client.post(
        _skills_url(chat),
        data=json.dumps({"key": "test.echo_key", "config": {"api_key": "sk-secret-1234"}}),
        content_type="application/json",
    )
    assert response.status_code == 201
    assert response.json()["config"] == {"api_key": "••••1234"}
    assert "sk-secret" not in logged_in_client.get(_skills_url(chat)).content.decode()


def test_patch_without_secret_keeps_it(chat, logged_in_client, echo_enrollment):
    url = _skills_url(chat, echo_enrollment.id)
    assert logged_in_client.patch(url, data=json.dumps({"is_active": False}), content_type="application/json").status_code == 200
    response = logged_in_client.patch(url, data=json.dumps({"config": {"api_key": "••••1234"}}), content_type="application/json")
    assert response.status_code == 200
    echo_enrollment.refresh_from_db()
    assert echo_enrollment.config == {"api_key": "sk-secret-1234"}
    assert echo_enrollment.is_active is False


def test_invalid_config_400(chat, logged_in_client):
    response = logged_in_client.post(
        _skills_url(chat), data=json.dumps({"key": "test.echo_key", "config": {}}), content_type="application/json"
    )
    assert response.status_code == 400
    assert "api_key" in response.json()


def test_verify_failure_400(chat, logged_in_client, mocker):
    from django.core.exceptions import ValidationError
    from adey_apps.rag.tests.skills import EchoKey
    mocker.patch.object(EchoKey, "verify", side_effect=ValidationError({"api_key": "rejected by Calendly"}))
    response = logged_in_client.post(
        _skills_url(chat),
        data=json.dumps({"key": "test.echo_key", "config": {"api_key": "sk-secret-1234"}}),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert "rejected by Calendly" in response.content.decode()


def test_other_users_bot_404(logged_in_client, chat_factory):
    other = chat_factory()
    assert logged_in_client.get(_skills_url(other)).status_code == 404


def test_duplicate_enrollment_400(chat, logged_in_client):
    data = json.dumps({"key": "clock.now"})
    assert logged_in_client.post(_skills_url(chat), data=data, content_type="application/json").status_code == 201
    assert logged_in_client.post(_skills_url(chat), data=data, content_type="application/json").status_code == 400


def test_validate_ok_saves_nothing(chat, logged_in_client):
    from adey_apps.rag.models import ChatSkill
    response = logged_in_client.post(
        _skills_url(chat, validate=True),
        data=json.dumps({"key": "test.echo_key", "config": {"api_key": "sk-secret-1234"}}),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {"valid": True}
    assert ChatSkill.objects.count() == 0


def test_validate_reports_field_errors(chat, logged_in_client, mocker):
    from django.core.exceptions import ValidationError
    from adey_apps.rag.tests.skills import EchoKey
    url = _skills_url(chat, validate=True)
    response = logged_in_client.post(url, data=json.dumps({"key": "test.echo_key", "config": {}}), content_type="application/json")
    assert response.status_code == 400
    assert response.json()["valid"] is False and response.json()["errors"]["api_key"]

    mocker.patch.object(EchoKey, "verify", side_effect=ValidationError({"api_key": "rejected by Calendly"}))
    response = logged_in_client.post(
        url, data=json.dumps({"key": "test.echo_key", "config": {"api_key": "sk-x"}}), content_type="application/json"
    )
    assert response.status_code == 400
    assert response.json()["errors"] == {"api_key": ["rejected by Calendly"]}


def test_validate_saved_uses_stored_secret(chat, logged_in_client, echo_enrollment, mocker):
    from adey_apps.rag.tests.skills import EchoKey
    verify = mocker.patch.object(EchoKey, "verify")
    response = logged_in_client.post(
        _skills_url(chat, echo_enrollment.id, validate=True), data=json.dumps({}), content_type="application/json"
    )
    assert response.status_code == 200
    assert verify.call_args.args[0].api_key.get_secret_value() == "sk-secret-1234"


def test_patch_is_throttled_like_validate(chat, logged_in_client, echo_enrollment):
    url = _skills_url(chat, echo_enrollment.id)
    statuses = [
        logged_in_client.patch(url, data=json.dumps({"is_active": True}), content_type="application/json").status_code
        for _ in range(11)
    ]
    assert statuses == [200] * 10 + [429]
    assert logged_in_client.get(url).status_code == 200
