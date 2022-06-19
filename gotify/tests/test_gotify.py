import json
import time

import pytest
import requests_mock
from django.core import mail
from django.core.management import call_command
from django.utils.crypto import get_random_string
from django.utils.encoding import force_str

from gore.models import Event
from gore.tests.conftest import project, raven_with_project  # noqa: F401
from gore.tests.data import exc_payload
from gotify.models import SlackNotifier
from gotify.models.email_notifier import EmailNotifier


@pytest.mark.django_db  # noqa: F811
def test_email_notifier(project, settings):  # noqa: F811
    settings.GOTIFY_IMMEDIATE = False
    en = EmailNotifier.objects.create(emails='test@example.com')
    en.projects.add(project)
    event = Event.objects.create_from_raven(project_id=project.id, body=json.loads(exc_payload))
    call_command('gotify_send')
    message = mail.outbox[-1]
    assert event.message in message.subject
    assert event.project.name in message.subject


@pytest.mark.django_db  # noqa: F811
def test_slack_notifier(project, settings):  # noqa: F811
    settings.GOTIFY_IMMEDIATE = False
    sn = SlackNotifier.objects.create(
        webhook_url='http://example.com',
        message_header_suffix=get_random_string(12),
    )
    sn.projects.add(project)
    event = Event.objects.create_from_raven(project_id=project.id, body=json.loads(exc_payload))
    with requests_mock.mock() as m:
        m.post('http://example.com', text='ok')
        call_command('gotify_send')
    assert m.called
    req = m.request_history[0]
    assert req.method == 'POST'
    payload = json.loads(force_str(req.body))
    assert event.message in payload['text']
    assert event.project.name in payload['text']
    assert sn.message_header_suffix in payload['text']


@pytest.mark.django_db(transaction=True)
@pytest.mark.parametrize('thread', [True, False])
def test_immediate_notify(raven_with_project, settings, thread):  # noqa: F811
    settings.GOTIFY_IMMEDIATE = True
    settings.GOTIFY_IMMEDIATE_THREAD = thread
    project = raven_with_project.project  # noqa: F811
    en = EmailNotifier.objects.create(emails='test@example.com')
    en.projects.add(project)
    raven_with_project.captureMessage('hello world')
    if thread:
        time.sleep(1)
    assert len(mail.outbox) == 1


@pytest.mark.django_db  # noqa: F811
def test_exclude(raven_with_project, settings):  # noqa: F811
    settings.GOTIFY_IMMEDIATE = True
    project = raven_with_project.project  # noqa: F811
    en = EmailNotifier.objects.create(emails='test@example.com')
    en.excludes.create(pattern='hello')
    en.projects.add(project)
    raven_with_project.captureMessage('hello world')
    assert len(mail.outbox) == 0
