# Generated by Django 4.2.8 on 2024-02-09 22:02

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_populate_identifier_field'),
    ]

    operations = [
        migrations.AlterField(
            model_name='plan',
            name='identifier',
            field=models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True, verbose_name='Identifier'),
        ),
    ]
