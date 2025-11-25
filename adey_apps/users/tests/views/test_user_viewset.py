import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from adey_apps.users.models import User

pytestmark = pytest.mark.django_db

@pytest.fixture
def api_client():
    return APIClient()

USER_DETAIL_URL = "user_detail"
USER_CHANGE_PASSWORD_URL = "user_change_password"

@pytest.fixture
def setup_user_detail_url():
    return reverse(USER_DETAIL_URL)

@pytest.fixture
def setup_user_change_password_url():
    return reverse(USER_CHANGE_PASSWORD_URL)


def test_user_viewset_retrieve_authenticated(api_client, user, setup_user_detail_url):
    api_client.force_authenticate(user=user)
    response = api_client.get(setup_user_detail_url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['email'] == user.email


def test_user_viewset_retrieve_anonymous(api_client, setup_user_detail_url):
    response = api_client.get(setup_user_detail_url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_user_viewset_partial_update_name(api_client, user, setup_user_detail_url):
    api_client.force_authenticate(user=user)
    data = {'name': 'New Name'}
    response = api_client.patch(setup_user_detail_url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.name == 'New Name'


def test_user_viewset_destroy(api_client, user, setup_user_detail_url):
    api_client.force_authenticate(user=user)
    
    response = api_client.delete(setup_user_detail_url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not User.objects.filter(id=user.id).exists()


def test_user_viewset_change_password_success(api_client, user, setup_user_change_password_url):
    # Ensure user has known password
    user.set_password('password123')
    user.save()
    
    api_client.force_authenticate(user=user)
    data = {
        'old_password': 'password123',
        'new_password': 'StrongPassword123!',
        'confirm_new_password': 'StrongPassword123!'
    }
    
    response = api_client.post(setup_user_change_password_url, data, format='json')
    if response.status_code != status.HTTP_200_OK:
        pytest.fail(f"Password change failed: {response.data}")
    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.check_password('StrongPassword123!')


def test_user_viewset_change_password_invalid_old(api_client, user, setup_user_change_password_url):
    api_client.force_authenticate(user=user)
    
    data = {
        'old_password': 'wrongpassword',
        'new_password': 'StrongPassword123!',
        'confirm_new_password': 'StrongPassword123!'
    }
    response = api_client.post(setup_user_change_password_url, data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_user_viewset_change_password_mismatch(api_client, user, setup_user_change_password_url):
    api_client.force_authenticate(user=user)
    
    data = {
        'old_password': 'password123',
        'new_password': 'newpassword123',
        'confirm_new_password': 'mismatchpassword'
    }
    user.set_password('password123')
    user.save()
    
    response = api_client.post(setup_user_change_password_url, data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
