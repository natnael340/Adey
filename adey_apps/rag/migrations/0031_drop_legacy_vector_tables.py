import sqlalchemy
from django.db import migrations

from adey_apps.rag.db import get_vector_engine

LEGACY_TABLES = (
    "langchain_pg_embedding", "langchain_pg_collection",
    "checkpoints", "checkpoint_blobs", "checkpoint_writes", "checkpoint_migrations",
)


def drop_legacy_tables(apps, schema_editor):
    with get_vector_engine().begin() as connection:
        connection.execute(sqlalchemy.text(f"DROP TABLE IF EXISTS {', '.join(LEGACY_TABLES)}"))


class Migration(migrations.Migration):

    dependencies = [
        ('rag', '0030_chatskill'),
    ]

    operations = [
        migrations.RunPython(drop_legacy_tables, reverse_code=migrations.RunPython.noop),
    ]
