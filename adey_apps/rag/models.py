from collections.abc import Iterable
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import ArrayField
from django.template.defaultfilters import slugify
from uuid import uuid4
from jsonschema import validate
from adey_apps.adey_commons.models import BaseModel
from adey_apps.rag.constants import WIDGET_PREFERENCE_SCHEMA

# Create your models here.
class MessageTypeChoices(models.TextChoices):
    AI = "AI", "AI"
    HUMAN = "HUMAN", "HUMAN"


class Resource(BaseModel):
    class DocumentTypeChoices(models.TextChoices):
        PDF = "PDF", "PDF"
        TXT = "TXT", "TXT"
        CSV = "CSV", "CSV"
        HTML = "HTML", "HTML"
        JSON = "JSON", "JSON"
        MD = "MD", "MD"
    
    name = models.CharField(max_length=256)
    slug = models.SlugField(max_length=256, blank=True)
    document = models.FileField()
    document_type = models.CharField(max_length=5, choices=DocumentTypeChoices.choices, default=DocumentTypeChoices.TXT)
    chat = models.ForeignKey(to="rag.Chat", on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("slug", "chat"), name="unique_together_slug_and_chat"
            )
        ]


    def save(self, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(**kwargs)
    
    
    def __str__(self) -> str:
        return f"{self.chat} - {self.slug}"
    
class AssistantCharacter(models.Model):
    name = models.CharField(max_length=256)
    slug = models.SlugField(max_length=300, blank=True)

    def save(self, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(**kwargs) 


class Chat(BaseModel):

    class StatusChoices(models.TextChoices):
        PREPARED = "prepared", "PREPARED"
        READY = "ready", "READY"
        FINISHED = "finished", "FINISHED"
        FAILED = "failed", "FAILED"
    
    identifier = models.UUIDField(
        "Identifier", unique=True, db_index=True, editable=False, default=uuid4
    )
    name = models.CharField("Chat name", max_length=255)
    slug = models.SlugField("Slug", blank=True)
    business_name = models.CharField("Business name", max_length=256)
    business_description = models.TextField("Business description")
    assistant_name = models.CharField("Assistant name", max_length=256)
    assistant_picture = models.ImageField("Assistant picture", null=True, blank=True)
    assistant_characters = models.ManyToManyField(verbose_name="Assistant Characters", to=AssistantCharacter, blank=True)
    assistant_role = models.CharField(max_length=256, blank=True)
    allowed_urls = ArrayField(models.URLField(max_length=255), blank=True, default=list)
    intro_text = models.TextField(default="Hello! How can I assist you today?")
    user = models.ForeignKey(to="users.User", on_delete=models.CASCADE)
    status = models.CharField("Status", max_length=8, choices=StatusChoices.choices, default="prepared")
    widget_preference = models.ForeignKey(
        to="rag.WidgetPreference", on_delete=models.SET_NULL, blank=True, null=True
    )
    tools = models.ManyToManyField("rag.AgentTool", blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("slug", "user"), name="unique_together_slug_and_user"
            )
        ]

    def save(self, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(**kwargs)
    
    def __str__(self) -> str:
        return self.slug


class Message(BaseModel):
    ANONYMOUS = "Anonymous"
    session_id = models.CharField("Session ID", max_length=256)
    username = models.CharField("Username", max_length=128, default=ANONYMOUS)
    message = models.TextField("Message")
    message_type = models.CharField("Message type", choices=MessageTypeChoices.choices, default=MessageTypeChoices.AI)
    chat = models.ForeignKey(to=Chat, on_delete=models.CASCADE)
    seen = models.BooleanField(default=False) 

    def __str__(self) -> str:
        return f"{self.username} - {self.session_id}"
    
    def save(self, **kwargs) -> None:
        if self.message_type == MessageTypeChoices.HUMAN:
            self.seen = True
        return super().save(**kwargs)


class WidgetPreference(BaseModel):
    identifier = models.UUIDField(
        "Identifier", unique=True, db_index=True, editable=False, default=uuid4
    )
    name = models.CharField("Name", max_length=256)
    preferences = models.JSONField("Preferences", default=dict)
    is_public = models.BooleanField("Is Public", default=False)
    is_default = models.BooleanField("Is Default", default=False)

    def _check_preferences(self):
        try:
            validate(instance=self.preferences, schema=WIDGET_PREFERENCE_SCHEMA)
        except Exception as e:
            raise ValidationError("Preference validation failed")
        
    def save(self, *args, **kwargs) -> None:
        self._check_preferences()

        super().save(*args, **kwargs)


class AgentTool(BaseModel):
    class ToolTypeChoices(models.TextChoices):
        RAG = "rag", "Retrieval Augmented Generation"
        API = "api", "API Call"
        APS = "aps", "Appointment Scheduler"

    name = models.CharField(max_length=256)
    slug = models.SlugField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    tool_type = models.CharField(max_length=3, choices=ToolTypeChoices.choices, default=ToolTypeChoices.RAG)
    tool_path = models.CharField(max_length=256, blank=True)
    is_active = models.BooleanField(default=False)

    def _check_tool_path(self):
        if self.is_active and not self.tool_path:
            raise ValidationError("Tool path is required when the tool is active.")

    def save(self, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(**kwargs)