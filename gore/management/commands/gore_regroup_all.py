from django.core.management import BaseCommand
from django.db import transaction

from gore.models import Event, EventGroup
from gore.utils.event_grouper import group_all_events


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('-c', '--clear-first', action='store_true')

    def handle(self, clear_first, **options):
        with transaction.atomic():
            if clear_first:
                n_events_cleared = Event.objects.filter(group__isnull=False).update(group=None)
                if n_events_cleared:
                    self.stdout.write('Cleared {n} groups from events'.format(n=n_events_cleared))
                n_events = Event.objects.count()
                n_groups_deleted, _ = EventGroup.objects.all().delete()
                if n_groups_deleted:
                    self.stdout.write('Deleted {n} groups'.format(n=n_groups_deleted))
                if Event.objects.count() != n_events:
                    raise RuntimeError('Group deletion deleted events, this will not do')
            n_events_updated = group_all_events()
            self.stdout.write('{n} events updated.'.format(n=n_events_updated))
