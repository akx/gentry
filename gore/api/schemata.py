from marshmallow import Schema, fields


class EventGroupSubSchema(Schema):
    class Meta:
        fields = ('id', 'group_hash', 'first_event_time', 'last_event_time', 'n_events', 'archived')


class EventSchema(Schema):
    group = fields.Nested(EventGroupSubSchema)

    class Meta:
        fields = ('id', 'message', 'culprit', 'level', 'type', 'timestamp', 'project_id', 'archived', 'group')


class EventGroupListSchema(EventGroupSubSchema):
    first_event = fields.Nested(EventSchema, exclude=('group',))

    class Meta:
        fields = EventGroupSubSchema.Meta.fields + ('first_event',)


class EventGroupDetailSchema(EventGroupListSchema):
    events = fields.Nested(EventSchema, exclude=('group',), many=True)

    class Meta:
        fields = EventGroupListSchema.Meta.fields + ('events',)


class ProjectSchema(Schema):
    class Meta:
        fields = ('id', 'slug', 'name')


class EventDetailSchema(Schema):
    project = fields.Nested(ProjectSchema)
    group = fields.Nested(EventGroupSubSchema)
    data = fields.Method(serialize='get_data')

    class Meta:
        fields = EventSchema.Meta.fields + ('project', 'data')

    def get_data(self, instance):
        return instance.data_dict
