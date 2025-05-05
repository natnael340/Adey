import pytest
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework import status
from django.http.response import Http404
from adey_apps.rag.mixins import ChatMixin

pytestmark = pytest.mark.django_db


class ChatViewSetUnderTest(ChatMixin, GenericViewSet):
   pass


def test_chat_mixin_resolve_chat_instance_with_slug_and_user_in_request(chat, user_with_password, rf):
    request = rf.get("/")
    request.user = user_with_password
    
    view = ChatViewSetUnderTest()
    view.setup(request, chat_slug=chat.slug)

    assert view.resolve_chat_or_404(request) == chat


def test_chat_mixin_raise_error_if_chat_slug_is_invalid(chat, user_with_password, rf):
    request = rf.get("/")
    request.user = user_with_password
    
    view = ChatViewSetUnderTest()
    view.setup(request, chat_slug="DUMMY")

    with pytest.raises(Http404):
        view.resolve_chat_or_404(request)


def test_chat_mixin_raise_error_if_chat_does_not_belong_to_user_in_request(chat, user_with_password, rf, user_factory):
    request = rf.get("/")
    request.user = user_factory()
    
    view = ChatViewSetUnderTest()
    view.setup(request, chat_slug=chat.slug)

    with pytest.raises(Http404):
        view.resolve_chat_or_404(request)


def test_chat_mixin_raise_error_if_chat_slug_is_omitted_from_view_kwargs(chat, user_with_password, rf, user_factory):
    request = rf.get("/")
    request.user = user_with_password
    
    view = ChatViewSetUnderTest()
    view.setup(request)

    with pytest.raises(Http404):
        view.resolve_chat_or_404(request)


def test_chat_mixin_initialize_request_attach_chat_to_request(rf, user_with_password, chat, mocker):
    request = rf.get("/")
    request.user = user_with_password

    view = ChatViewSetUnderTest()
    view.setup(request, chat_slug=chat.slug)
    view.action_map = {"list": "get"}

    spy_resolve_chat = mocker.spy(view, "resolve_chat_or_404")
    request = view.initialize_request(request)

    assert request.chat == chat
    spy_resolve_chat.assert_called_once()
