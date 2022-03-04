import logging

from django.http import JsonResponse

from gore.auth import validate_auth_header
from gore.excs import InvalidAuth
from gore.models.envelope import Envelope
from gore.utils.encoding import decode_body

logger = logging.getLogger(__name__)


def store_envelope(request, project):
    try:
        auth_header = validate_auth_header(request, project)
    except InvalidAuth as ia:
        return JsonResponse({'error': str(ia)}, status=401)

    body = decode_body(request, auth_header)
    envelope = Envelope(project_id=project, raw_data=body)
    try:
        envelope.parse()
        envelope.save()
        return JsonResponse({"message": "stored"}, status=200)
    except Exception:
        return JsonResponse({"error": "invalid envelope"}, status=400)
