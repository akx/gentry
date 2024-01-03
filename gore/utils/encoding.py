import base64
import gzip
import zlib
from typing import Any, Dict


def decode_body(request, auth_header: Dict[str, Any]):
    body = request.body
    if auth_header.get('sentry_version') == '5':  # Support older versions of Raven
        return zlib.decompress(base64.b64decode(body)).decode('utf8')

    content_encoding = request.META.get('HTTP_CONTENT_ENCODING')
    if content_encoding == 'deflate':
        return zlib.decompress(body)
    if content_encoding == 'gzip':
        return gzip.decompress(body)
    return body
