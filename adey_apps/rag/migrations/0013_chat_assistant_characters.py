# Generated by Django 4.2.8 on 2024-01-06 15:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rag', '0012_assistantcharacter'),
    ]

    operations = [
        migrations.AddField(
            model_name='chat',
            name='assistant_characters',
            field=models.ManyToManyField(blank=True, to='rag.assistantcharacter', verbose_name='Assistant Characters'),
        ),
    ]