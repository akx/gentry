from django.db import models
from django.db.models import Min, Max, Count
from django.utils.timezone import now

from gentry.utils import make_absolute_uri


class EventGroup(models.Model):
    project = models.ForeignKey('gore.Project', on_delete=models.CASCADE)
    group_hash = models.CharField(max_length=64)
    first_event = models.ForeignKey('gore.Event', on_delete=models.CASCADE)
    first_event_time = models.DateTimeField(default=now, editable=False)
    last_event_time = models.DateTimeField(default=now, editable=False)
    n_events = models.IntegerField(default=0, editable=False)
    archived = models.BooleanField(default=False, db_index=True)

    class Meta:
        unique_together = (('project', 'group_hash'),)

    def __str__(self):
        return '[%s] - group of %d events' % (self.project, self.n_events)

    def get_display_url(self):
        return make_absolute_uri('/#/group/{id}'.format(id=self.id))

    def cache_values(self):
        d = self.event_set.aggregate(
            first_event_time=Min('timestamp'),
            last_event_time=Max('timestamp'),
            n_events=Count('id'),
        )
        self.n_events = d['n_events']
        self.first_event_time = d['first_event_time']
        self.last_event_time = d['last_event_time']

    @property
    def events(self):  # For marshmallow.
        return self.event_set.all()

    def archive(self):
        self.archived = True
        self.event_set.update(archived=True)
        self.save(update_fields=('archived',))

    def archive_if_all_events_archived(self):
        if not self.event_set.filter(archived=False).exists():
            self.archive()
            return True
        return False
