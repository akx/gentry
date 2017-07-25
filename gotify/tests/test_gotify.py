import json

import pytest
import requests_mock
from django.core.management import call_command
from django.utils.crypto import get_random_string
from django.utils.encoding import force_text

from gore.models import Event
# noinspection PyUnresolvedReferences
from gore.signals import event_received
from gore.tests.conftest import project, raven_with_project  # noqa
from gore.tests.data import exc_payload
from gotify.models import SlackNotifier
from gotify.models.email_notifier import EmailNotifier
from django.core import mail


@pytest.mark.django_db
def test_email_notifier(project, settings):
    settings.GOTIFY_IMMEDIATE = False
    en = EmailNotifier.objects.create(emails='test@example.com')
    en.projects.add(project)
    event = Event.objects.create_from_raven(project_id=project.id, body=json.loads(exc_payload))
    call_command('gotify_send')
    message = mail.outbox[-1]
    assert event.message in message.subject
    assert event.project.name in message.subject


@pytest.mark.django_db
def test_slack_notifier(project, settings):
    settings.GOTIFY_IMMEDIATE = False
    sn = SlackNotifier.objects.create(
        webhook_url='http://example.com',
        message_header_suffix=get_random_string(),
    )
    sn.projects.add(project)
    event = Event.objects.create_from_raven(project_id=project.id, body=json.loads(exc_payload))
    with requests_mock.mock() as m:
        m.post('http://example.com', text='ok')
        call_command('gotify_send')
    assert m.called
    req = m.request_history[0]
    assert req.method == 'POST'
    payload = json.loads(force_text(req.body))
    assert event.message in payload['text']
    assert event.project.name in payload['text']
    assert sn.message_header_suffix in payload['text']


@pytest.mark.django_db
def test_immediate_notify(raven_with_project, settings):
    settings.GOTIFY_IMMEDIATE = True
    project = raven_with_project.project
    en = EmailNotifier.objects.create(emails='test@example.com')
    en.projects.add(project)
    raven_with_project.captureMessage('hello world')
    assert len(mail.outbox) == 1
