from django_filters import rest_framework as filters
from adey_apps.rag.models import Message, Chat


class MessageFilter(filters.FilterSet):
    """
    FilterSet for Message model to filter messages by chat slug and date range.
    """
    bot_slug = filters.ModelChoiceFilter(field_name="chat__slug", to_field_name="slug", queryset=Chat.objects.all())

    class Meta:
        model = Message
        fields = ["bot_slug"]