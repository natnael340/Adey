import pytest
import json
from django.urls import reverse

from adey_apps.rag.serializers import ChatCreateSerializer
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