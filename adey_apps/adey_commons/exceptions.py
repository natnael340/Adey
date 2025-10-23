from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None and hasattr(exc, 'get_full_details'):
        response.data = exc.get_full_details()
    return response