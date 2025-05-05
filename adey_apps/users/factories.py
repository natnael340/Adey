import factory
from django.db.models.signals import post_save
from adey_apps.users.models import User


@factory.django.mute_signals(post_save)
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Faker("email")
