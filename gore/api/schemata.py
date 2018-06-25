from marshmallow import Schema, fields


class EventSchema(Schema):
    class Meta:
        fields = ('id', 'message', 'culprit', 'level', 'type', 'timestamp', 'project_id', 'archived')


class ProjectSchema(Schema):
    class Meta:
        fields = ('id', 'slug', 'name')


class EventDetailSchema(Schema):
    project = fields.Nested(ProjectSchema)
    data = fields.Method(serialize='get_data')

    class Meta:
        fields = ('id', 'message', 'culprit', 'level', 'type', 'timestamp', 'project', 'data', 'archived')

    def get_data(self, instance):
        return instance.data_dict
