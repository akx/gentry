from gore.excs import InvalidAuth
from gore.models import Key


def validate_auth_header(request, project):
    try:
        auth_header = request.META['HTTP_X_SENTRY_AUTH']
    except KeyError:
        raise InvalidAuth('No X-Sentry-Auth header')
    if not auth_header.startswith('Sentry '):
        raise InvalidAuth('Not a Sentry auth header')

    auth_header = {key: value for (key, value) in (kv.split('=') for kv in auth_header[7:].split(', '))}
    try:
        if not Key.objects.filter(
            project_id=project,
            key=auth_header['sentry_key'],
            secret=auth_header['sentry_secret'],
        ).exists():
            raise InvalidAuth('Given key/secret not found')
    except KeyError:
        raise InvalidAuth('Missing sentry_key or sentry_secret in auth header')
    return auth_header
