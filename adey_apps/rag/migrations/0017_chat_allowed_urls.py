# Generated by Django 4.2.8 on 2024-01-21 12:06

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rag', '0016_resource_unique_together_slug_and_chat'),
    ]

    operations = [
        migrations.AddField(
            model_name='chat',
            name='allowed_urls',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.URLField(max_length=255), blank=True, default=list, size=None),
        ),
    ]