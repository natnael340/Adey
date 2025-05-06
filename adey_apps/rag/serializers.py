import time
import base64
from datetime import datetime
import magic

from rest_framework import serializers
from django.http import Http404
from django.conf import settings
from django.core.files.base import ContentFile
from django.db.models.functions import TruncDate
from django.db.models import Count
from django.core.validators import FileExtensionValidator

from adey_apps.rag.models import Chat, Resource, Message, AssistantCharacter, MessageTypeChoices
from adey_apps.adey_commons.serializers import ManyToManyListField

class AssistantCharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistantCharacter
        fields = ('name',)

class ChatSerializer(serializers.ModelSerializer):
    identifier = serializers.UUIDField(read_only=True)
    assistant_picture_url = serializers.SerializerMethodField()
    assistant_characters = AssistantCharacterSerializer(many=True)
    resources = serializers.SerializerMethodField(read_only=True)
    conversations = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Chat
        fields = (
            'identifier', 
            'name', 
            'slug', 
            "business_name",
            'business_description',
            'assistant_name',
            "assistant_role", 
            "assistant_characters",
            "assistant_picture_url",
            "resources",
            "conversations",
            "allowed_urls",
            "status",
        )

    def get_assistant_picture_url(self, instance):
        if instance.assistant_picture:
            request = self.context.get("request", None)
            if request:
                return request.build_absolute_uri(instance.assistant_picture.url)
            return instance.assistant_picture.url

        return ""
    
    def get_resources(self, instance):
        return instance.resource_set.count()
    
    def get_conversations(self, instance):
        return instance.message_set.count()
    
    def validate(self, attrs):
        attrs['user'] = self.context.get('request').user
        return super().validate(attrs)



class ChatCreateSerializer(serializers.ModelSerializer):
    assistant_picture_data = serializers.CharField(write_only=True)
    assistant_characters = ManyToManyListField(child=serializers.CharField(), bf_name="name")

    class Meta:
        model = Chat
        fields = (
            'identifier', 
            'name', 
            'slug', 
            'assistant_name', 
            "assistant_role",
            'business_description', 
            'assistant_picture_data', 
            'business_name', 
            'assistant_characters',
            "allowed_urls",
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

    def create(self, validated_data):

        validated_data['user'] = self.context.get('request').user
        picture = validated_data.pop("assistant_picture_data", None)
        if picture:
            file_format, data = picture.split(";base64,")
            file_name = str(int(time.time()))
            extension = file_format.split("/")[1]
            validated_data["assistant_picture"] = ContentFile(base64.b64decode(data), f"{file_name}.{extension}")
        
        assistant_characters = validated_data.pop("assistant_characters", [])
        instance = super().create(validated_data)
        characters = []
        for character in assistant_characters:
            characters.append(AssistantCharacter.objects.create(name=character))

        instance.assistant_characters.set(characters)
            
        return instance
    
    def update(self, instance, validated_data):
        assistant_characters = validated_data.pop("assistant_characters", [])
        characters = []
        for character in assistant_characters:
            characters.append(AssistantCharacter.objects.create(name=character))
            
        instance.assistant_characters.set(characters)
        
        return super().update(instance, validated_data)
    

class ResourceSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=256)
    slug = serializers.SlugField(max_length=256, required=False, allow_blank=True)
    document = serializers.FileField(
        allow_empty_file=False,
        validators=[FileExtensionValidator(allowed_extensions=["txt", "pdf"])],
    )
    document_type = serializers.ChoiceField(choices=Resource.DocumentTypeChoices, default=Resource.DocumentTypeChoices.TXT)
    
    class Meta:
        model = Resource
        fields = ('name', 'slug', 'document', "document_type")

    
    def create(self, validated_data):
        chat = self.context.get("request").chat
        chat.status = "ready"
        chat.save()

        validated_data["chat"] = chat

        return super().create(validated_data)

    def validate(self, attrs):
        attrs = super().validate(attrs)

        file = attrs['document']
        initial_bytes = file.read(2048)
        file.seek(0)  # reset pointer for further processing
        detected_mime = magic.from_buffer(initial_bytes, mime=True)

        mime_map = {
            "text/plain": Resource.DocumentTypeChoices.TXT,
            "application/pdf": Resource.DocumentTypeChoices.PDF,
        }
        if detected_mime not in mime_map:
            raise serializers.ValidationError({
                'document': f'Unsupported file type: {detected_mime}. Only .txt and .pdf allowed.'
            })

        # Override document_type based on actual file content
        attrs['document_type'] = mime_map[detected_mime]
        return attrs

   
class MessageSerializer(serializers.ModelSerializer):
    message_type = serializers.CharField(read_only=True)
    class Meta:
        model = Message
        fields = ('username', 'message', 'message_type', "seen", "created")


class MessageAnalyticsSerializer(serializers.Serializer):
    date = serializers.SerializerMethodField(read_only=True)
    count = serializers.SerializerMethodField(read_only=True)


    def get_date(self, instance):
        if instance.get("date"):
            date = instance["date"]
            # date_obj = datetime.strptime(date, "%Y-%m-%d")

            return date.strftime("%b %d, %Y")
        
        return None

    def get_count(self, instance):
        return instance["count"] if instance.get("count") else 0
    
    @classmethod
    def setup_eager_loading(cls, queryset):
        queryset = queryset.annotate(date=TruncDate('created'))
        queryset = queryset.values('date').annotate(count=Count('id')).order_by('date')
        return queryset
        


class ChatBotAnalyticsSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField( read_only=True)
    message_data = serializers.SerializerMethodField( read_only=True)
    user_session_count = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Chat
        fields = ("name", "message_count", "message_data", "user_session_count")


    def get_message_count(self, instance):
        return instance.message_set.filter(message_type=MessageTypeChoices.HUMAN).count()

    def get_message_data(self, instance):
        qs = MessageAnalyticsSerializer.setup_eager_loading(
            instance.message_set.all().filter(message_type=MessageTypeChoices.HUMAN)
            )
        return MessageAnalyticsSerializer(qs, many=True).data

    def get_user_session_count(self, instance):
        return instance.message_set.all().values(
            'session_id'
        ).annotate(count=Count('session_id')).count()

    


class ChatBotSerializer(serializers.Serializer):
    messages = serializers.SerializerMethodField(read_only=True)
    assistant_name = serializers.CharField(read_only=True)
    assistant_role = serializers.CharField(read_only=True)
    assistant_pic = serializers.SerializerMethodField(read_only=True)
    allowed_urls = serializers.ListField(read_only=True)
    unread_messages_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Chat
        fields = ('messages', 'assistant_name', 'assistant_role', 'assistant_pic', "allowed_urls", "unread_messages_count")
        read_only_fields = ('messages', 'assistant_name', 'assistant_role', 'assistant_pic', "allowed_urls", "unread_messages_count")

    def get_messages(self, obj):
        request = self.context.get('request')
        
        if request:
            user_session_id = request.COOKIES.get("user_session_id", "")
            
            messages = obj.message_set.all().filter(session_id=user_session_id)
            return MessageSerializer(instance=messages, many=True).data
        return []
    
    def get_unread_messages_count(self, obj):
        return len(list(filter(lambda message: not message["seen"], self.get_messages(obj))))
    
    def get_assistant_pic(self, obj):
        if obj.assistant_picture:
            request = self.context.get("request", None)
            if request:
                return request.build_absolute_uri(obj.assistant_picture.url)
            return obj.assistant_picture.url
        return ""