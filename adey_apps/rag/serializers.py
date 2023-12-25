from rest_framework import serializers
from django.http import Http404

from adey_apps.rag.models import Chat, Resource, Message


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ('name', 'slug', 'assistant_name', 'assistant_description')
    def validate(self, attrs):
        attrs['user'] = self.context.get('request').user
        return super().validate(attrs)
    

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
    response = serializers.CharField(read_only=True, required=False)
    class Meta:
        model = Message
        fields = ('username', 'inquiry', 'response')