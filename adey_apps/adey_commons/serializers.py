from rest_framework import serializers

class ManyToManyListField(serializers.ListField):
    def __init__(self, bf_name, **kwargs):
        self.bf_name = bf_name
        super().__init__(**kwargs)

    
    def to_representation(self, data):
        return [self.child.to_representation(getattr(item, self.bf_name)) for item in data.all()]
    