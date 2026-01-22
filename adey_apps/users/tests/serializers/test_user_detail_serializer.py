import pytest
from adey_apps.users.serializers import UserDetailSerializer

pytestmark = pytest.mark.django_db


def test_user_detail_serializer_valid_data(user):
    serializer = UserDetailSerializer(user)
    data = serializer.data
    
    assert data['email'] == user.email
    assert data['name'] == user.name
    assert data['is_verified'] == user.is_verified
    assert 'avatar' in data


def test_user_detail_serializer_update_fields(user):
    data = {
        'name': 'Updated Name',
    }
    serializer = UserDetailSerializer(user, data=data, partial=True)
    assert serializer.is_valid()
    serializer.save()

    user.refresh_from_db()
    
    assert user.name == 'Updated Name'


def test_user_detail_serializer_read_only_fields(user):
    original_email = user.email
    original_verified = user.is_verified
    
    data = {
        'email': 'newemail@example.com',
        'is_verified': not original_verified
    }
    serializer = UserDetailSerializer(user, data=data, partial=True)
    assert serializer.is_valid()
    serializer.save()
    
    user.refresh_from_db()
    
    assert user.email == original_email
    assert user.is_verified == original_verified
