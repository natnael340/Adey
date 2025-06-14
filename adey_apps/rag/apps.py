from django.apps import AppConfig


class RagConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'adey_apps.rag'

    def ready(self) -> None:
        from adey_apps.rag import handlers, signals
