from collections.abc import Iterable
from django.db import models
from django.template.defaultfilters import slugify
from uuid import uuid4

# Create your models here.


class Resource(models.Model):
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


class Chat(models.Model):
    identifier = models.UUIDField(
        "Identifier", unique=True, db_index=True, editable=False, default=uuid4
    )
    name = models.CharField("Chat name", max_length=255)
    slug = models.SlugField("Slug", blank=True)
    assistant_name = models.CharField("Assistant name", max_length=256)
    assistant_description = models.TextField("Assistant description")
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


class Message(models.Model):
    ANONYMOUS = "Anonymous"
    session_id = models.CharField("Session ID", max_length=256)
    username = models.CharField("Username", max_length=128, default=ANONYMOUS)
    inquiry = models.TextField("User inquiry")
    response = models.TextField("AI response")
    chat = models.ForeignKey(to=Chat, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.username} - {self.session_id}"