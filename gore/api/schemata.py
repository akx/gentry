from marshmallow import Schema, fields


class ProjectSchema(Schema):
    class Meta:
        fields = ('id', 'slug', 'name')


class EventGroupSubSchema(Schema):
    class Meta:
        fields = (
            'id',
            'group_hash',
            'first_event_time',
            'last_event_time',
            'project_id',
            'n_events',
            'archived',
        )


class EventSchema(Schema):
    group = fields.Nested(EventGroupSubSchema)

    class Meta:
        fields = (
            'id',
            'message',
            'culprit',
            'level',
            'type',
            'timestamp',
            'project_id',
            'archived',
            'group',
        )


class EventGroupListSchema(EventGroupSubSchema):
    first_event = fields.Nested(EventSchema, exclude=('group',))

    class Meta:
        fields = EventGroupSubSchema.Meta.fields + ('first_event',)


class EventGroupDetailSchema(EventGroupListSchema):
    events = fields.Nested(EventSchema, exclude=('group',), many=True)
    project = fields.Nested(ProjectSchema)

    class Meta:
        fields = EventGroupListSchema.Meta.fields + ('events', 'project')


class EventDetailSchema(Schema):
    project = fields.Nested(ProjectSchema)
    group = fields.Nested(EventGroupSubSchema)
    data = fields.Method(serialize='get_data')

    class Meta:
        fields = EventSchema.Meta.fields + ('project', 'data')

    def get_data(self, instance):
        return instance.data_dict
