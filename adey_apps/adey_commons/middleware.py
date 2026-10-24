import logging

from django.db import connection, DatabaseError
from django.http import HttpResponse

logger = logging.getLogger(__name__)


class HealthCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == '/health':
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
            except DatabaseError:
                logger.exception("health check failed: database unavailable")
                return HttpResponse('unavailable', status=503)
            return HttpResponse('ok')
        return self.get_response(request)
