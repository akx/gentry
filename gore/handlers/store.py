import json
import zlib
from datetime import datetime

import logging
from django.conf import settings
from django.db import transaction
from django.http import JsonResponse
from django.utils.encoding import force_text
from django.utils.timezone import make_aware
from pytz import UTC

from gore.auth import validate_auth_header
from gore.excs import InvalidAuth
from gore.models import Event
from gore.signals import event_received

logger = logging.getLogger(__name__)


def store_event(request, project):
    try:
        auth_header = validate_auth_header(request, project)
    except InvalidAuth as ia:
        return JsonResponse({'error': str(ia)}, status=401)

    body = request.body
    if request.META.get('HTTP_CONTENT_ENCODING') == 'deflate':
        body = zlib.decompress(body)
    body = json.loads(force_text(body))
    timestamp = make_aware(datetime.fromtimestamp(float(auth_header['sentry_timestamp'])), timezone=UTC)
    with transaction.atomic():
        event = Event.objects.create_from_raven(project_id=project, body=body, timestamp=timestamp)
    try:
        event_received.send(sender=event)
    except:  # pragma: no cover
        logger.warning('event_received signal handling failed', exc_info=True)
        if settings.DEBUG:
            raise
    return JsonResponse({'id': event.id}, status=201)
