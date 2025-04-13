import factory
import factory.fuzzy as random_argument
from adey_apps.rag.models import Chat, Message, AssistantCharacter, Resource


class AssistantCharacterFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AssistantCharacter
        
    name = factory.Faker("word")

class ChatFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Chat
        django_get_or_create = ("slug", "user")
    
    name = factory.Sequence(lambda i: f"Customer Support {i}")
    slug = factory.Sequence(lambda i: f"customer-support-{i}")
    business_name = factory.Faker("company")
    business_description = factory.Faker("paragraph")
    assistant_name = factory.Faker("name")
    assistant_picture = factory.django.ImageField()
    user = factory.SubFactory("adey_apps.users.factories.UserFactory")

    @factory.post_generation
    def assistant_characters(obj, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            obj.assistant_characters.add(**extracted)
        else:
            obj.assistant_characters.set(AssistantCharacterFactory.create_batch(3))


class ResourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Resource
    
    name = factory.Sequence(lambda n: f"Resource {n}")
    slug = factory.Sequence(lambda n: f"resource-{n}")
    document = factory.django.FileField()
    document_type = random_argument.FuzzyChoice(choices=Resource.DocumentTypeChoices.values)
    chat = factory.SubFactory(ChatFactory)