import pytest

from gore.tests.mock_raven import _get_mock_raven_client
from gore.models import Project


@pytest.fixture()
def projectless_raven(client):
    return _get_mock_raven_client(dsn='http://xzzx:zxzxzx@localhost/4134', django_client=client)


@pytest.fixture()
def project():
    project = Project.objects.create(slug='dummy', name='dummy')
    project.key_set.create(key='aaa', secret='bbb')
    return project


@pytest.fixture()
def raven_with_project(client, project):
    raven_client = _get_mock_raven_client(
        dsn=project.dsn,
        django_client=client,
    )
    raven_client.project = project
    return raven_client
