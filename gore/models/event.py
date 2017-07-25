import json

from django.db import models
from django.utils import timezone
from django.utils.encoding import force_text
from django.utils.timezone import now

from gentry.utils import make_absolute_uri


def determine_type(body):
    type = 'unknown'
    if 'exception' in body:
        type = 'exception'
    if 'sentry.interfaces.Message' in body:
        type = 'message'  # May be overridden by loggeriness
    if 'logger' in body:
        type = 'log'
    return type


class EventManager(models.Manager):
    def create_from_raven(self, project_id, body, timestamp=None):
        return self.create(
            data=json.dumps(body),
            event_id=body['event_id'],
            message=force_text(body.get('message', ''))[:128],
            culprit=force_text(body.get('culprit', ''))[:128],
            level=body.get('level', ''),
            project_id=project_id,
            timestamp=(timestamp or now()),
            type=determine_type(body),
        )


class Event(models.Model):
    project = models.ForeignKey('gore.Project')
    event_id = models.CharField(max_length=64)
    type = models.CharField(max_length=32, default='unknown')
    message = models.CharField(max_length=128, blank=True)
    culprit = models.CharField(max_length=128, blank=True)
    level = models.CharField(max_length=32, blank=True)
    date_added = models.DateTimeField(default=timezone.now, editable=False)
    timestamp = models.DateTimeField(db_index=True, editable=False)
    data = models.TextField(blank=True, editable=False)

    objects = EventManager()

    def __str__(self):
        return '[%s] - %s' % (self.project, self.message)

    @property
    def data_dict(self):
        return json.loads(self.data)

    def get_display_url(self):
        return make_absolute_uri('/#/event/{id}'.format(id=self.id))
