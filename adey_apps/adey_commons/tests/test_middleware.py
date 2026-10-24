import pytest
from django.db import DatabaseError

pytestmark = pytest.mark.django_db


def test_health_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.content == b"ok"


def test_health_db_unavailable(client, mocker):
    mocker.patch(
        "adey_apps.adey_commons.middleware.connection.cursor",
        side_effect=DatabaseError,
    )

    response = client.get("/health")

    assert response.status_code == 503
    assert response.content == b"unavailable"
