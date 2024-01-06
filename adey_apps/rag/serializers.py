import time
import base64

from rest_framework import serializers
from django.http import Http404
from django.conf import settings
from django.core.files.base import ContentFile

from adey_apps.rag.models import Chat, Resource, Message, AssistantCharacter
from adey_apps.adey_commons.serializers import ManyToManyListField

class AssistantCharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistantCharacter
        fields = ('name',)

class ChatSerializer(serializers.ModelSerializer):
    identifier = serializers.UUIDField(read_only=True)
    assistant_picture_url = serializers.SerializerMethodField()
    assistant_characters = AssistantCharacterSerializer(many=True)
    class Meta:
        model = Chat
        fields = (
            'identifier', 
            'name', 
            'slug', 
            "business_name",
            'business_description',
            'assistant_name', 
            "assistant_characters",
            "assistant_picture_url"
        )

    def get_assistant_picture_url(self, instance):
        if instance.assistant_picture:
            return instance.assistant_picture.url

        return ""
    def validate(self, attrs):
        attrs['user'] = self.context.get('request').user
        return super().validate(attrs)



class ChatCreateSerializer(serializers.ModelSerializer):
    assistant_picture_data = serializers.CharField(write_only=True)
    assistant_characters = ManyToManyListField(child=serializers.CharField(), bf_name="name")

    class Meta:
        model = Chat
        fields = (
            'identifier', 'name', 'slug', 'assistant_name', 'business_description', 'assistant_picture_data', 'business_name', 'assistant_characters',
        )

    def get_assistant_picture_url(self, instance):
        return instance.assistant_picture.url
        
    def validate_assistant_picture_data(self, value: str):
        if value and value.startswith("data:image/"):
            extension = value.split(";")[0].split("/")[1]
            if extension not in settings.ALLOWED_IMAGE_EXTENSIONS:
                raise serializers.ValidationError(f"{extension} is not allowed.")
            return value
        elif value and not value.startswith("data:image/"):
            raise serializers.ValidationError("invalid image data.")
        else:
            return value 

    def validate(self, attrs):
        attrs = super().validate(attrs)
        attrs['user'] = self.context.get('request').user
        picture = attrs.pop("assistant_picture_data", None)
        if picture:
            file_format, data = picture.split(";base64,")
            file_name = str(int(time.time()))
            extension = file_format.split("/")[1]
            attrs["assistant_picture"] = ContentFile(base64.b64decode(data))
        return attrs

    def create(self, validated_data):
        assistant_characters = validated_data.pop("assistant_characters")
        instance = super().create(validated_data)
        characters = []
        for character in assistant_characters:
            characters.append(AssistantCharacter.objects.create(name=character))

        instance.assistant_characters.set(characters)
            
        return instance
    
    def update(self, instance, validated_data):
        assistant_characters = validated_data.pop("assistant_characters")
        characters = []
        for character in assistant_characters:
            characters.append(AssistantCharacter.objects.create(name=character))
            
        instance.assistant_characters.set(characters)
        
        return super().update(instance, validated_data)
    

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ('name', 'slug', 'document')

    def validate(self, attrs):
        chat = Chat.objects.filter(
            slug=self.context["chat_slug"], user=self.context["request"].user
        ).first() 
        if not chat:
            raise Http404
        attrs["chat"] = chat
        return super().validate(attrs)

   
class MessageSerializer(serializers.ModelSerializer):
    message_type = serializers.CharField(read_only=True)
    class Meta:
        model = Message
        fields = ('username', 'message', 'message_type')