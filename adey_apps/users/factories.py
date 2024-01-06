import factory
from adey_apps.users.models import User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Faker("email")
    password = factory.django.Password('superstrongpassword')
