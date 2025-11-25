import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from adey_apps.users.models import User
from adey_apps.users.factories import UserFactory

pytestmark = pytest.mark.django_db

@pytest.fixture
def api_client():
    return APIClient()

USER_DETAIL_URL = "user-detail"
USER_DETAIL_URL_CHANGE_PASSWORD = "user-change-password"

@pytest.fixture
def user_detail_url():
    return reverse(USER_DETAIL_URL)

@pytest.fixture
def user_detail_url_change_password():
    return reverse(USER_DETAIL_URL_CHANGE_PASSWORD)


def test_user_viewset_retrieve_authenticated(api_client, user):
    api_client.force_authenticate(user=user)
    url = reverse('user_detail')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['email'] == user.email


def test_user_viewset_retrieve_anonymous(api_client):
    url = reverse('user_detail')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_user_viewset_partial_update_name(api_client, user):
    api_client.force_authenticate(user=user)
    url = reverse('user_detail')
    data = {'name': 'New Name'}
    response = api_client.patch(url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.name == 'New Name'


def test_user_viewset_destroy(api_client, user):
    api_client.force_authenticate(user=user)
    url = reverse('user_detail')
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not User.objects.filter(id=user.id).exists()


def test_user_viewset_change_password_success(api_client, user):
    # Ensure user has known password
    user.set_password('password123')
    user.save()
    
    api_client.force_authenticate(user=user)
    data = {
        'old_password': 'password123',
        'new_password': 'StrongPassword123!',
        'confirm_new_password': 'StrongPassword123!'
    }
    
    response = api_client.post(reverse('user_change_password'), data, format='json')
    if response.status_code != status.HTTP_200_OK:
        pytest.fail(f"Password change failed: {response.data}")
    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.check_password('StrongPassword123!')


def test_user_viewset_change_password_invalid_old(api_client, user):
    api_client.force_authenticate(user=user)
    url = reverse('user_change_password')
    data = {
        'old_password': 'wrongpassword',
        'new_password': 'StrongPassword123!',
        'confirm_new_password': 'StrongPassword123!'
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_user_viewset_change_password_mismatch(api_client, user):
    api_client.force_authenticate(user=user)
    url = reverse('user_change_password')
    data = {
        'old_password': 'password123',
        'new_password': 'newpassword123',
        'confirm_new_password': 'mismatchpassword'
    }
    user.set_password('password123')
    user.save()
    
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
