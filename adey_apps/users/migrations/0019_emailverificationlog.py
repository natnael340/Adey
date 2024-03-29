# Generated by Django 4.2.8 on 2024-03-18 21:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_user_is_verified'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailVerificationLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField()),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
