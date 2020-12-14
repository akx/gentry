import json

import pytest
from django.utils.encoding import force_str

from gore.tests.utils import create_events


@pytest.mark.django_db
def test_events_api(project, admin_client):
    events = create_events(project, 10)
    list_resp = json.loads(force_str(admin_client.get('/api/events/').content))
    event_list = list_resp['events']
    assert len(event_list) == len(events)
    assert event_list[0]['id'] == events[-1].id

    for event in events:
        detail_resp = json.loads(force_str(admin_client.get(f'/api/event/{event.id}/').content))
        assert detail_resp['id'] == event.id
        assert isinstance(detail_resp['data'], dict)
        assert set(detail_resp.keys()) >= set(event_list[0].keys())


def test_events_api_auth(client):
    assert client.get('/api/events/').status_code >= 400
