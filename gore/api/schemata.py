import datetime
from typing import List, Optional

import pydantic
from ninja import Schema


class ProjectSchema(Schema):
    id: int
    slug: str
    name: str


class EventGroupSubSchema(Schema):
    id: int
    group_hash: str
    first_event_time: datetime.datetime
    last_event_time: datetime.datetime
    project_id: int
    n_events: int
    archived: bool


class EventSchema(Schema):
    id: int
    message: str
    culprit: str
    level: str
    type: str
    timestamp: datetime.datetime
    project_id: int
    archived: bool
    group: Optional[EventGroupSubSchema]


class EventGroupListSchema(EventGroupSubSchema):
    first_event: Optional[EventSchema]


class EventGroupDetailSchema(EventGroupListSchema):
    events: List[EventSchema]
    project: ProjectSchema


class EventDetailSchema(Schema):
    id: int
    message: str
    culprit: str
    level: str
    type: str
    timestamp: datetime.datetime
    project_id: int
    archived: bool
    group: Optional[EventGroupSubSchema]
    project: ProjectSchema
    data: dict = pydantic.Field(alias='data_dict')


class EventsListResponse(Schema):
    total: int
    offset: int
    limit: int
    events: List[EventSchema]


class GroupsListResponse(Schema):
    total: int
    offset: int
    limit: int
    groups: List[EventGroupListSchema]
