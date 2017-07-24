import json
import zlib
from datetime import datetime

from django.http import JsonResponse
from django.utils.encoding import force_text
from django.utils.timezone import make_aware
from pytz import UTC

from gore.auth import validate_auth_header
from gore.excs import InvalidAuth
from gore.models import Event


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
    event = Event.objects.create_from_raven(project_id=project, body=body, timestamp=timestamp)
    return JsonResponse({'id': event.id}, status=201)
