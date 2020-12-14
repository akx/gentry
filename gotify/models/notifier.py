from django.db import models
from polymorphic.models import PolymorphicModel


class Notifier(PolymorphicModel):
    projects = models.ManyToManyField('gore.Project', blank=True)
    enabled = models.BooleanField(default=True)

    def __str__(self):
        return '{} for {}'.format(
            self.get_real_instance_class()._meta.verbose_name.title(),
            ', '.join(self.projects.values_list('name', flat=True)),
        )

    def send(self, event):
        if not self.enabled:
            return False
        if self.event_logs.filter(event=event).exists():
            return False
        try:
            self.do_send(event)
        except Exception as exc:
            self.event_logs.create(event=event, success=False, error=str(exc))
            raise
        else:
            self.event_logs.create(event=event, success=True)

    def do_send(self, event):
        raise NotImplementedError('...')  # pragma: no cover


class NotifierEventLog(models.Model):
    notifier = models.ForeignKey(Notifier, related_name='event_logs', on_delete=models.CASCADE)
    event = models.ForeignKey('gore.event', on_delete=models.CASCADE)
    success = models.BooleanField()
    error = models.CharField(max_length=128, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (('notifier', 'event',),)
