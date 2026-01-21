from rest_framework import serializers

class ManyToManyListField(serializers.ListField):
    def __init__(self, bf_name, **kwargs):
        self.bf_name = bf_name
        super().__init__(**kwargs)

    
    def to_representation(self, data):
        return [self.child.to_representation(getattr(item, self.bf_name)) for item in data.all()]
    

class BotDefault:
    requires_context = True

    def __call__(self, serializer_field):
        request = serializer_field.context.get("request", None)
        if not request:
            return None
        return request.chat

    def __repr__(self):
        return "%s()" % self.__class__.__name__
    

class SessionDefault:
    requires_context = True

    def __call__(self, serializer_field):
        request = serializer_field.context.get("request", None)
        if not request:
            return None

        return request.resolver_match.kwargs.get("session_id", None)

    def __repr__(self):
        return "%s()" % self.__class__.__name__