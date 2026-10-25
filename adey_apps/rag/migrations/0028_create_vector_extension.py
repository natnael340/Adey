from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('rag', '0027_create_humanhandoff_model'),
    ]

    operations = [
        # PGVector is created with create_extension=False, so the extension must exist up front.
        migrations.RunSQL(
            "CREATE EXTENSION IF NOT EXISTS vector;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
