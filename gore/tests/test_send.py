import logging

import pytest
from django.utils.crypto import get_random_string
from raven.handlers.logging import SentryHandler


@pytest.mark.django_db
def test_no_project(projectless_raven):
    projectless_raven.captureMessage('just a message really')
    response = projectless_raven.response_list[-1]['response']
    assert response.status_code == 401
    assert response.content == b'{"error": "Given key/secret not found"}'


@pytest.mark.django_db
def test_message_capture(raven_with_project):
    message = get_random_string(15, 'iaeoi  ')
    raven_with_project.captureMessage(message)
    response = raven_with_project.response_list[-1]['response']
    assert response.status_code == 201
    event = raven_with_project.project.event_set.first()
    assert event.message == message
    assert event.type == 'message'


@pytest.mark.django_db
def test_exception_capture(raven_with_project):
    message = get_random_string(15, 'iaeoi  ')
    with pytest.raises(ValueError):
        with raven_with_project.capture_exceptions():
            raise ValueError(message)
    event = raven_with_project.project.event_set.first()
    assert event.message.endswith(message)
    assert event.type == 'exception'


@pytest.mark.django_db
def test_log_capture(raven_with_project):
    logger_id = get_random_string()
    logger = logging.getLogger(logger_id)
    logger.setLevel(logging.WARN)
    logger.addHandler(SentryHandler(client=raven_with_project))
    logger.warning('Oh no!')
    event = raven_with_project.project.event_set.first()
    assert event.message == 'Oh no!'
    assert event.type == 'log'


@pytest.mark.django_db
def test_grouping(raven_with_project):
    project = raven_with_project.project
    message = get_random_string(15, 'iaeoi  ')
    for x in range(5):
        with pytest.raises(ValueError):
            with raven_with_project.capture_exceptions():
                raise ValueError(message)
    group = project.eventgroup_set.get()  # will fail if != 1 group
    assert project.event_set.count() == 5
    for event in project.event_set.all():
        assert event.group == group
    message = 'x' + message
    with pytest.raises(ValueError):
        with raven_with_project.capture_exceptions():
            raise ValueError(message)
    assert project.eventgroup_set.count() == 2
    assert project.event_set.last().group != group  # Must be a new group
