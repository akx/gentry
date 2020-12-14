from django.core.management import BaseCommand
from django.db import transaction

from gore.utils.event_grouper import update_all_group_archival


class Command(BaseCommand):
    def handle(self, **options):
        with transaction.atomic():
            n_groups_updated = update_all_group_archival()
        self.stdout.write(f'{n_groups_updated} groups updated.')
