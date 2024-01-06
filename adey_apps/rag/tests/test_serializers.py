import pytest
from adey_apps.rag.serializers import ChatCreateSerializer
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
]

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
    
    
    

