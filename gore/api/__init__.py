from __future__ import annotations

import json
import logging
import random

from django.conf import settings
from django.db.models import Q
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils.encoding import force_str
from ninja import NinjaAPI
from ninja.errors import HttpError

from gore.api.schemata import (
    EventDetailSchema,
    EventGroupDetailSchema,
    EventsListResponse,
    GroupsListResponse,
    ProjectSchema,
)
from gore.api.utils import _get_event_if_allowed, _get_group_if_allowed, check_authenticated, store_event_from_data
from gore.auth import get_header_timestamp, validate_auth_header
from gore.excs import InvalidAuth
from gore.models import Envelope, Event, EventGroup, Project
from gore.utils.encoding import decode_body

logger = logging.getLogger(__name__)
api = NinjaAPI(csrf=False)


@api.get("/events/", response=EventsListResponse)
def get_event_list(
    request,
    limit: int = 10,
    offset: int = 0,
    project: str | None = None,
    search: str | None = None,
    type: str | None = None,
    archived: bool | None = None,
    group: str | None = None,
):
    check_authenticated(request)
    qs = Event.objects.all().defer('data').prefetch_related('group').order_by('-id')
    if project:
        qs = qs.filter(project_id=project)
    if type:
        qs = qs.filter(type=type)
    if search:
        qs = qs.filter(Q(message__icontains=search) | Q(culprit__icontains=search))
    if archived is not None:
        qs = qs.filter(archived=archived)
    if group is not None:
        qs = qs.filter(group_id=group)

    total = qs.count()
    return {
        'total': total,
        'offset': offset,
        'limit': limit,
        'events': qs[offset : offset + limit],
    }


@api.get("/event-types/", response=list[str])
def get_event_type_list(request):
    return ['unknown', 'exception', 'message', 'log']


@api.get("/event/{id}/", response=EventDetailSchema)
def get_event_detail(request: HttpRequest, id: str):
    return _get_event_if_allowed(request, id)


@api.post("/event/{id}/archive/", response=EventDetailSchema)
def archive_event(request: HttpRequest, id):
    event = _get_event_if_allowed(request, id)
    event.archived = True
    event.save()
    return event


@api.get("/groups/", response=GroupsListResponse)
def get_group_list(
    request: HttpRequest,
    limit=10,
    offset=0,
    project=None,
    search=None,
    type=None,
    archived=None,
    order=None,
):
    check_authenticated(request)
    qs = EventGroup.objects.all().prefetch_related('first_event')
    if project:
        qs = qs.filter(project_id=project)
    if type:
        qs = qs.filter(first_event__type=type)
    if search:
        qs = qs.filter(Q(first_event__message__icontains=search) | Q(first_event__culprit__icontains=search))
    if archived is not None:
        qs = qs.filter(archived=archived)

    if order == 'earliest':
        qs = qs.order_by('first_event_time')
    elif order == 'most_common':
        qs = qs.order_by('-n_events')
    else:  # aka "latest"
        qs = qs.order_by('-last_event_time')

    total = qs.count()
    return {
        'total': total,
        'offset': offset,
        'limit': limit,
        'groups': qs[offset : offset + limit],
    }


@api.get("/group/{id}/", response=EventGroupDetailSchema)
def get_group_detail(request: HttpRequest, id: str):
    return _get_group_if_allowed(request, id, for_detail=True)


@api.post("/group/{id}/archive/", response=EventGroupDetailSchema)
def archive_group(request: HttpRequest, id):
    group = _get_group_if_allowed(request, id)
    group.archive()
    return group


@api.get("/projects/", response=list[ProjectSchema])
def get_project_list(request: HttpRequest):
    check_authenticated(request)
    return Project.objects.all()


@api.post("/{project}/store/", response={201: dict})
def store_event(request: HttpRequest, project: str):
    try:
        auth_header = validate_auth_header(request, project)
    except InvalidAuth as ia:
        return JsonResponse({'error': str(ia)}, status=401)

    body = decode_body(request, auth_header)
    body = json.loads(force_str(body))
    timestamp = get_header_timestamp(auth_header)
    event = store_event_from_data(project=project, timestamp=timestamp, body=body)
    return (201, {'id': event.id})


@api.post("/{project}/envelope/")
def store_envelope(request: HttpRequest, response: HttpResponse, project: str):
    try:
        auth_header = validate_auth_header(request, project)
    except InvalidAuth as ia:
        return JsonResponse({'error': str(ia)}, status=401)
    save_envelope = random.random() < settings.GORE_STORE_ENVELOPE_PROBABILITY
    timestamp = get_header_timestamp(auth_header)
    body = decode_body(request, auth_header)
    envelope = Envelope(project_id=project, raw_data=body)
    n_events = 0
    try:
        for line in envelope.parse():
            if "message" in line or "exception" in line:
                if save_envelope and not envelope.pk:
                    envelope.save()
                store_event_from_data(
                    project=project,
                    timestamp=timestamp,
                    body=line,
                    envelope=(envelope if envelope.pk else None),
                )
                n_events += 1
        if not save_envelope:
            return {"message": f"dropped, but stored {n_events:d} events"}
        if not envelope.pk:
            envelope.save()
        return {"message": f"stored, and stored {n_events:d} events"}
    except Exception:
        raise HttpError(400, "invalid envelope")
