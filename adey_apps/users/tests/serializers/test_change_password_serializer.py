import pytest
from adey_apps.users.serializers import ChangePasswordSerializer

def test_change_password_serializer_valid():
    data = {
        'old_password': 'old_password',
        'new_password': 'new_password123',
        'confirm_new_password': 'new_password123'
    }
    serializer = ChangePasswordSerializer(data=data)
    assert serializer.is_valid()
    assert serializer.validated_data['new_password'] == 'new_password123'
    assert serializer.validated_data['confirm_new_password'] == 'new_password123'
    assert serializer.validated_data['old_password'] == 'old_password'


def test_change_password_serializer_mismatch():
    data = {
        'old_password': 'old_password',
        'new_password': 'new_password123',
        'confirm_new_password': 'mismatch_password'
    }
    serializer = ChangePasswordSerializer(data=data)
    assert not serializer.is_valid()
    assert 'non_field_errors' in serializer.errors
