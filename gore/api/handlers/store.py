import json
import logging

from django.conf import settings
from django.db import transaction
from django.http import JsonResponse
from django.utils.encoding import force_str

from gore.auth import validate_auth_header, get_header_timestamp
from gore.excs import InvalidAuth
from gore.models import Event
from gore.signals import event_received
from gore.utils.encoding import decode_body
from gore.utils.event_grouper import group_event

logger = logging.getLogger(__name__)


def store_event(request, project):
    try:
        auth_header = validate_auth_header(request, project)
    except InvalidAuth as ia:
        return JsonResponse({'error': str(ia)}, status=401)

    body = decode_body(request, auth_header)
    body = json.loads(force_str(body))
    timestamp = get_header_timestamp(auth_header)
    with transaction.atomic():
        event = Event.objects.create_from_raven(project_id=project, body=body, timestamp=timestamp)
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
    return JsonResponse({'id': event.id}, status=201)
