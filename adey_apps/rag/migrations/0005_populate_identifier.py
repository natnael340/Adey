# Generated by Django 4.2.8 on 2023-12-25 00:28

from django.db import migrations
import uuid


def gen_uuid(apps, schema_editor):
    Chat = apps.get_model("rag", "Chat")
    for chat in Chat.objects.all():
        chat.identifier = uuid.uuid4()
        chat.save(update_fields=['identifier'])


class Migration(migrations.Migration):

    dependencies = [
        ('rag', '0004_chat_identifier'),
    ]

    operations = [
        migrations.RunPython(gen_uuid, reverse_code=migrations.RunPython.noop)
    ]
