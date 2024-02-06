from django.db.models.signals import post_save
from django.dispatch import receiver
from adey_apps.users.models import User, Subscription, Plan


@receiver(post_save, sender=User)
def create_basic_subscription(sender, instance, created, **kwargs):
    if created:
        plan = Plan.objects.get(name="Basic", period=Plan.YEARLY)
        Subscription.objects.create(user=instance, plan=plan)