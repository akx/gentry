import json

import pytest
from django.utils.encoding import force_text

from gore.models import Event
from gore.tests.data import exc_payload


@pytest.mark.django_db
def test_events_api(project, admin_client):
    events = [
        Event.objects.create_from_raven(project_id=project.id, body=json.loads(exc_payload))
        for i
        in range(10)
    ]
    list_resp = json.loads(force_text(admin_client.get('/api/events/').content))
    event_list = list_resp['events']
    assert len(event_list) == len(events)
    assert event_list[0]['id'] == events[-1].id

    for event in events:
        detail_resp = json.loads(force_text(admin_client.get('/api/event/{id}/'.format(id=event.id)).content))
        assert detail_resp['id'] == event.id


def test_events_api_auth(client):
    assert client.get('/api/events/').status_code >= 400
