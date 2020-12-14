import json

import pytest
from django.utils.encoding import force_str

from gore.tests.utils import create_events
from gore.utils.event_grouper import group_events


@pytest.mark.django_db
def test_groups_api(project, admin_client):
    events = create_events(project, 10)
    group_events(project, events)
    list_resp = json.loads(force_str(admin_client.get('/api/groups/').content))
    group_list = list_resp['groups']
    assert len(group_list) == 1
    assert group_list[0]['n_events'] == len(events)
    detail_resp = json.loads(force_str(admin_client.get('/api/group/{id}/'.format(id=group_list[0]['id'])).content))
    assert len(detail_resp['events']) == len(events)
    assert {e['id'] for e in detail_resp['events']} == {e.id for e in events}


def test_groups_api_auth(client):
    assert client.get('/api/groups/').status_code >= 400
