import pytest
from rest_framework import status
from pytest_factoryboy import register
from adey_apps.users.factories import UserFactory
from adey_apps.rag.factories import AssistantCharacterFactory, ChatFactory

TEST_PASSWORD = "superstrongpassword"

@pytest.fixture
def user_with_password(user):
    user.set_password(TEST_PASSWORD)
    user.save()

    return user


@pytest.fixture()
def logged_in_client(client, user_with_password):
    response = client.login(email=user_with_password.email, password=TEST_PASSWORD)
    assert response
    return client


register(UserFactory)
register(AssistantCharacterFactory)
register(ChatFactory)
