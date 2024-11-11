from __future__ import annotations

import datetime
import logging

from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch
from ninja.errors import AuthenticationError

from gore.models import Envelope, Event, EventGroup
from gore.signals import event_received
from gore.utils.event_grouper import group_event

logger = logging.getLogger(__name__)


def check_authenticated(request):
    if not request.user.is_authenticated:
        raise AuthenticationError()


def _get_event_if_allowed(request, id):
    check_authenticated(request)
    return Event.objects.get(pk=id)


def _get_group_if_allowed(request, id, for_detail=False):
    check_authenticated(request)
    qs = EventGroup.objects.select_related('first_event')
    if for_detail:
        qs = qs.prefetch_related(
            Prefetch(
                'event_set',
                queryset=Event.objects.select_related('project').defer('data'),
            ),
        )

    return qs.get(pk=id)


def store_event_from_data(
    *,
    project: str,
    timestamp: datetime.datetime,
    body: dict,
    envelope: Envelope | None = None,
) -> Event:
    with transaction.atomic():
        event = Event.objects.create_from_raven(
            project_id=project,
            body=body,
            timestamp=timestamp,
            envelope=envelope,
        )
    try:
        with transaction.atomic():
            group = group_event(event.project, event)
            group.archived = False
            group.cache_values()
            group.save()
    except:  # pragma: no cover
        logger.warning(f'event with ID {event.id} could not be grouped', exc_info=True)
    try:
        event_received.send(sender=event)
    except:  # pragma: no cover
        logger.warning('event_received signal handling failed', exc_info=True)
        if settings.DEBUG:
            raise
    return event
