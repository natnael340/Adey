import os

from django.db.models.signals import post_delete
from django.dispatch import receiver

from adey_apps.rag.models import Resource

@receiver(post_delete, sender=Resource)
def delete_resource_file_on_delete(sender, instance: Resource, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `Resource` object is deleted.
    """
    instance.document.delete(save=False)