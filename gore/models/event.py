import json

from django.db import models
from django.utils import timezone


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

    def __str__(self):
        return self.name

    @property
    def data_dict(self):
        return json.loads(self.data)
