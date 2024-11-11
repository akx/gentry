import logging
import random

from django.conf import settings
from django.http import JsonResponse

from gore.api.handlers.store import store_event_from_data
from gore.auth import get_header_timestamp, validate_auth_header
from gore.excs import InvalidAuth
from gore.models.envelope import Envelope
from gore.utils.encoding import decode_body

logger = logging.getLogger(__name__)


def store_envelope(request, project):
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
            return JsonResponse({"message": f"dropped, but stored {n_events:d} events"}, status=200)
        if not envelope.pk:
            envelope.save()
        return JsonResponse({"message": f"stored, and stored {n_events:d} events"}, status=200)
    except Exception:
        return JsonResponse({"error": "invalid envelope"}, status=400)
