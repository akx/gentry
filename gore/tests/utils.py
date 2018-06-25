import json

from gore.models import Event
from gore.tests.data import exc_payload


def create_events(project, n):
    events = [
        Event.objects.create_from_raven(project_id=project.id, body=json.loads(exc_payload))
        for i
        in range(n)
    ]
    return events
