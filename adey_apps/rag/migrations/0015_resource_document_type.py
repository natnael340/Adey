# Generated by Django 4.2.8 on 2024-01-11 14:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rag', '0014_chat_assistant_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='document_type',
            field=models.CharField(choices=[('PDF', 'PDF'), ('TXT', 'TXT'), ('CSV', 'CSV'), ('HTML', 'HTML'), ('JSON', 'JSON'), ('MD', 'MD')], default='TXT', max_length=5),
        ),
    ]
