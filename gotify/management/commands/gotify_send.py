from collections import defaultdict

from django.core.management import BaseCommand
from django.utils.timezone import now

from gore.models import Event
from gotify.models import Notifier
from gotify.utils import parse_relative_delta


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--since', default='60m')

    def handle(self, since, **options):
        delta = parse_relative_delta(since)
        cutoff = now() - delta
        notifiers_per_project_id = defaultdict(set)
        for notifier in Notifier.objects.filter(enabled=True).prefetch_related('projects'):
            for project in notifier.projects.all():
                notifiers_per_project_id[project.id].add(notifier)

        for event in Event.objects.select_related('project').filter(timestamp__gte=cutoff).iterator():
            for notifier in notifiers_per_project_id[event.project_id]:
                try:
                    notifier.send(event=event)
                except Exception as exc:
                    self.stderr.write('%s failed for %s: %s' % (notifier, event, exc))
