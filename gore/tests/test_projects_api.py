import json

import pytest
from django.utils.encoding import force_str


@pytest.mark.django_db
def test_projects_api(project, admin_client):
    list_resp = json.loads(force_str(admin_client.get('/api/projects/').content))
    assert len(list_resp) == 1
    proj_obj = list_resp[0]
    assert set(proj_obj.keys()) == {'id', 'name', 'slug'}
    assert proj_obj['id'] == project.id


def test_projects_api_auth(client):
    assert client.get('/api/projects/').status_code >= 400
