from django.db import models
from django.utils import timezone


class Key(models.Model):
    project = models.ForeignKey('gore.Project')
    date_added = models.DateTimeField(default=timezone.now, editable=False)
    key = models.CharField(db_index=True, max_length=64)
    secret = models.CharField(db_index=True, max_length=64)

    def __str__(self):
        return self.key
