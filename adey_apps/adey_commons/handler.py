from typing import Any
from django.contrib.staticfiles import handlers
from django.core.handlers.wsgi import WSGIRequest
from django.contrib.staticfiles.views import serve

class ChatBotStaticFilesHandler(handlers.StaticFilesHandler):
    def serve(self, request: WSGIRequest) -> Any:
        response =  super().serve(request)
        print("here")
        if request.path.endswith("chatbot/index.js") or request.path.endswith("chatbot/index.css"):
            response["Access-Control-Allow-Origin"] = "*"

        return response


def cors_serve(request, path, insecure=False, **kwargs):
    # kwargs.pop('document_root')
    response = serve(request, path, insecure=insecure, **kwargs)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response