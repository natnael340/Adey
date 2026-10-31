from django.db import migrations

from adey_apps.rag.db import create_chunk_table, get_pg_engine


def create_rag_chunks_table(apps, schema_editor):
    create_chunk_table(get_pg_engine())


class Migration(migrations.Migration):

    dependencies = [
        ('rag', '0028_create_vector_extension'),
    ]

    operations = [
        migrations.RunPython(create_rag_chunks_table, reverse_code=migrations.RunPython.noop),
    ]
