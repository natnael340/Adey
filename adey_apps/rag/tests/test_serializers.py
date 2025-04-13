import copy

from django.core.files.uploadedfile import SimpleUploadedFile

import pytest
from rest_framework.exceptions import ValidationError
from adey_apps.rag.models import Resource
from adey_apps.rag.serializers import ChatCreateSerializer, ResourceSerializer
from adey_apps.rag.tests.conftest import CHAT_DATA

pytestmark = pytest.mark.django_db

CHAT_CREATE_SERIALIZERS_FIELDS = [
    'identifier', 
    'name', 
    'slug', 
    'assistant_name', 
    "business_name",
    'business_description', 
    "assistant_picture_data",
    "assistant_characters",
    "assistant_role",
    "allowed_urls",
]

RESOURCE_SERIALIZER_FIELDS = ('name', 'slug', 'document', 'document_type')
RESOURCE_SERIALIZER_DATA = {
    'name': 'Test Resource',
    'slug': 'test-resource',
    'document': 'Sample document content',
    'document_type': 'TXT',
}


@pytest.fixture
def setup_resource_serializer_data():
    data = copy.copy(RESOURCE_SERIALIZER_DATA)
    data['document'] = SimpleUploadedFile(
        name='test.txt',
        content=RESOURCE_SERIALIZER_DATA['document'].encode(),
        content_type='text/plain'
    )

    return data


def test_chat_create_serializer_has_correct_fields():
    assert set(ChatCreateSerializer.Meta.fields) == set(CHAT_CREATE_SERIALIZERS_FIELDS)


def test_chat_create_serializer_create_chat_instance_for_correct_data(rf, user):
    request = rf.get("/")
    request.user = user
    serializer = ChatCreateSerializer(data=CHAT_DATA, context={"request": request})
    assert serializer.is_valid()
    instance = serializer.save()

    assert instance.name == CHAT_DATA["name"]
    assert instance.assistant_name == CHAT_DATA["assistant_name"]
    assert instance.business_name == CHAT_DATA["business_name"]
    assert instance.business_description == CHAT_DATA["business_description"]
    assert all(character.name in CHAT_DATA["assistant_characters"] for character in instance.assistant_characters.all())
    

def test_resource_serializer_has_correct_fields():
    assert set(ResourceSerializer.Meta.fields) == set(RESOURCE_SERIALIZER_FIELDS), (
        "Serializer fields should match expected fields"
    )


def test_resource_serializer_deserializer_instance_correctly(resource):
    serializer = ResourceSerializer(instance=resource)
    
    assert serializer.data['name'] == resource.name
    assert serializer.data['slug'] == resource.slug
    assert serializer.data['document'] == resource.document.url
    assert serializer.data['document_type'] == resource.document_type


def test_resource_serializer_successfully_serialize_data(setup_resource_serializer_data):
    serializer = ResourceSerializer(data=setup_resource_serializer_data)
    
    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data['name'] == RESOURCE_SERIALIZER_DATA['name']
    assert serializer.validated_data['slug'] == RESOURCE_SERIALIZER_DATA['slug']
    assert serializer.validated_data['document'] == setup_resource_serializer_data['document']
    assert serializer.validated_data['document_type'] == RESOURCE_SERIALIZER_DATA['document_type']


@pytest.mark.parametrize("field, error", [("name", "This field is required."), ("document", "No file was submitted.")])
def test_resource_serializer_validates_required_fields(field, setup_resource_serializer_data, error):
    data = copy.copy(setup_resource_serializer_data)
    data.pop(field) 
    
    serializer = ResourceSerializer(data=data)

    with pytest.raises(ValidationError, match=fr"{error}"):
        serializer.is_valid(raise_exception=True)


def test_resource_serializer_document_type_have_default_value(setup_resource_serializer_data):
    data = copy.copy(setup_resource_serializer_data)
    data.pop('document_type')
    
    serializer = ResourceSerializer(data=data)
    
    assert serializer.is_valid()
    assert serializer.validated_data['document_type'] == Resource.DocumentTypeChoices.TXT


def test_resource_serializer_allows_blank_slug(setup_resource_serializer_data):
    data = copy.copy(setup_resource_serializer_data)
    data.pop('slug')
    
    serializer = ResourceSerializer(data=data)
    
    assert serializer.is_valid()
    assert "slug" not in serializer.validated_data


@pytest.mark.parametrize("value", ["invalid_slug!", "slug with space"])
def test_resource_serializer_raise_error_for_invalid_slug_value(value, setup_resource_serializer_data):
    data = copy.copy(setup_resource_serializer_data)
    data['slug'] = value
    
    serializer = ResourceSerializer(data=data)
    
    with pytest.raises(ValidationError, match=r"Enter a valid \"slug\" consisting of letters, numbers, underscores or hyphens."):
        serializer.is_valid(raise_exception=True)


def test_resource_serializer_raise_error_for_invalid_document_type(setup_resource_serializer_data):
    data = copy.copy(setup_resource_serializer_data)
    data['document_type'] = "DUMMY"
    
    serializer = ResourceSerializer(data=data)
    
    with pytest.raises(ValidationError, match=r"\"DUMMY\" is not a valid choice."):
        serializer.is_valid(raise_exception=True)


def test_resource_serializer_create_instance_correctly(rf, chat_factory, user_with_password, setup_resource_serializer_data):
    chat = chat_factory(user=user_with_password, status='prepared')

    request = rf.post('/', setup_resource_serializer_data, format='multipart')
    request.chat = chat

    serializer = ResourceSerializer(data=setup_resource_serializer_data, context={'request': request})
    
    assert serializer.is_valid()
    resource = serializer.save()
    
    assert resource.name == RESOURCE_SERIALIZER_DATA['name']
    assert resource.slug == RESOURCE_SERIALIZER_DATA['slug']
    assert resource.document.read().decode("utf-8") == RESOURCE_SERIALIZER_DATA["document"]
    assert resource.document_type == RESOURCE_SERIALIZER_DATA['document_type']

    chat.refresh_from_db()
    assert chat.status == 'ready'