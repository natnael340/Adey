# Generated by Django 4.2.8 on 2024-01-06 15:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rag', '0007_remove_message_inquiry_remove_message_response_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='chat',
            name='assistant_picture',
            field=models.ImageField(blank=True, null=True, upload_to='', verbose_name='Assistant picture'),
        ),
    ]