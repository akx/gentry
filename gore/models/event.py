from __future__ import annotations

import json
from typing import Any, Dict, Optional

from django.db import models
from django.utils import timezone
from django.utils.timezone import now

from gentry.utils import make_absolute_uri
from gore.models import Envelope


def determine_type(body):
    type = 'unknown'
    if 'exception' in body:
        type = 'exception'
    if 'sentry.interfaces.Message' in body:
        type = 'message'  # May be overridden by loggeriness
    if 'logger' in body:
        type = 'log'
    if body.get('level') == "info":
        type = 'message'
    return type


def get_message_from_body(body: Dict[str, Any]) -> Optional[str]:
    if 'message' in body:
        return str(body['message'])

    if 'exception' in body:  # sentry-sdk
        for exception_info in body['exception'].get('values', []):
            type = exception_info.get('type', 'Error')
            value = exception_info.get('value', '')
            return f'{type}: {value}'

    return None


class EventManager(models.Manager):
    def create_from_raven(
        self,
        *,
        project_id,
        body: Dict[str, Any],
        timestamp=None,
        envelope: Envelope | None = None,
    ):
        message = get_message_from_body(body) or ''
        culprit = str(body.get('culprit', ''))
        return self.create(
            data=json.dumps(body),
            event_id=body['event_id'],
            message=message[:128],
            culprit=culprit[:128],
            level=body.get('level', ''),
            project_id=project_id,
            timestamp=(timestamp or now()),
            type=determine_type(body),
            envelope=envelope,
        )


class Event(models.Model):
    project = models.ForeignKey('gore.Project', on_delete=models.CASCADE)
    event_id = models.CharField(max_length=64)
    type = models.CharField(max_length=32, default='unknown')
    message = models.CharField(max_length=128, blank=True)
    culprit = models.CharField(max_length=128, blank=True)
    level = models.CharField(max_length=32, blank=True)
    date_added = models.DateTimeField(default=timezone.now, editable=False)
    timestamp = models.DateTimeField(db_index=True, editable=False)
    data = models.TextField(blank=True, editable=False)
    archived = models.BooleanField(default=False, db_index=True)
    group = models.ForeignKey('gore.EventGroup', blank=True, null=True, on_delete=models.CASCADE)
    envelope = models.ForeignKey('gore.Envelope', blank=True, null=True, on_delete=models.SET_NULL)

    objects = EventManager()

    def __str__(self):
        return f'[{self.project}] - {self.message}'

    @property
    def data_dict(self):
        return json.loads(self.data)

    def get_display_url(self):
        return make_absolute_uri(f'/#/event/{self.id}')
