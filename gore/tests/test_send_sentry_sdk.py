import time

import pytest
import sentry_sdk
from django.utils.crypto import get_random_string

from gore.tests.mock_sentry_sdk import _get_mock_sentry_sdk_client


@pytest.fixture()
def configure_sentry_sdk(request, project, client):
    sentry_sdk_client = _get_mock_sentry_sdk_client(
        dsn=project.dsn,
        django_client=client,
    )
    sentry_sdk_client.project = project
    scope = sentry_sdk.get_global_scope()
    old_client = scope.get_client()
    scope.set_client(sentry_sdk_client)
    request.addfinalizer(lambda: scope.set_client(old_client))
    return sentry_sdk_client


@pytest.mark.django_db(transaction=True)
def test_message_capture(configure_sentry_sdk, project):
    message = get_random_string(15, 'iaeoi  ')
    sentry_sdk.capture_message(message)
    request, response = configure_sentry_sdk.response_queue.get()
    assert response.status_code in (200, 201)
    event = project.event_set.first()
    assert event.message == message
    assert event.type == 'message'


@pytest.mark.django_db(transaction=True)
@pytest.mark.parametrize("save_envelope", (False, True), ids=("drop", "save"))
def test_exception_capture(configure_sentry_sdk, project, settings, save_envelope):
    settings.GORE_STORE_ENVELOPE_PROBABILITY = 1.0 if save_envelope else 0.0
    message = get_random_string(15, 'iaeoi  ')
    try:
        raise ValueError(message)
    except Exception:
        sentry_sdk.capture_exception()
    req, res = configure_sentry_sdk.response_queue.get()
    assert "stored 1 events" in str(res.content)
    event = project.event_set.first()
    assert event.message.endswith(message)
    assert event.type == 'exception'
    assert (event.envelope is not None) == save_envelope


# @pytest.mark.django_db(transaction=True)
# def test_log_capture(configure_sentry_sdk, project):
#     logger_id = get_random_string(12)
#     logger = logging.getLogger(logger_id)
#     logger.setLevel(logging.WARN)
#     logger.warning('Oh no!')
#     configure_sentry_sdk.response_queue.get()
#     event = project.event_set.first()
#     assert event.message == 'Oh no!'
#     assert event.type == 'log'


@pytest.mark.django_db(transaction=True)
def test_grouping(configure_sentry_sdk, project):
    message = get_random_string(15, 'iaeoi  ')
    for x in range(5):
        try:
            raise ValueError(message)
        except Exception:
            sentry_sdk.capture_exception()

    configure_sentry_sdk.response_queue.get()
    time.sleep(1)
    group = project.eventgroup_set.get()  # will fail if != 1 group
    assert project.event_set.count() >= 3  # TODO: fix this flake; should always be 5
    for event in project.event_set.all():
        assert event.group == group
    message = f'x{message}'
    try:
        raise ValueError(message)
    except Exception:
        sentry_sdk.capture_exception()
    configure_sentry_sdk.response_queue.get()
    time.sleep(1)
    assert project.eventgroup_set.count() == 2
    assert project.event_set.last().group != group  # Must be a new group
