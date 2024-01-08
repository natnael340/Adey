from collections.abc import Iterable
from django.db import models
from django.template.defaultfilters import slugify
from uuid import uuid4
from adey_apps.adey_commons.models import BaseModel

# Create your models here.
class MessageTypeChoices(models.TextChoices):
    AI = "AI", "AI"
    HUMAN = "HUMAN", "HUMAN"


class Resource(BaseModel):
    name = models.CharField(max_length=256)
    document = models.FileField()
    slug = models.SlugField(max_length=256, blank=True)
    chat = models.ForeignKey(to="rag.Chat", on_delete=models.CASCADE)

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
    user = models.ForeignKey(to="users.User", on_delete=models.CASCADE)

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
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.username} - {self.session_id}"