import hashlib
import re

from django.utils.encoding import force_bytes, force_text

from gore.models import EventGroup, Project

PYTHON_ADDRESS_RE = re.compile('at 0x[0-9a-f]+', flags=re.I)
MYSQL_DUPLICATE_RE = re.compile("Duplicate entry '(.+?)' for key")


def clean_group_hash_component(s):
    s = force_text(s or '')
    s = PYTHON_ADDRESS_RE.sub('x', s)  # Clean out `at 0xFFFFF`(i.e. Python object addresses)
    s = MYSQL_DUPLICATE_RE.sub('x', s)  # Clean out MySQL's duplicate keys "Duplicate entry '1-3-183' for key ..."
    return s


def compute_group_hash(event):
    return hashlib.sha256(b'\x00'.join(
        force_bytes(clean_group_hash_component(s))
        for s in (
            event.type,
            event.message,
            event.culprit,
            event.level,
        )
    )).hexdigest()


def group_events(project, events):
    group_cache = {}
    events_updated = []
    for event in events:
        if event.group_id:
            continue
        group_event(project, event, group_cache)
        events_updated.append(event)
    for group in group_cache.values():
        group.cache_values()
        group.save()
    return events_updated


def group_event(project, event, group_cache=None):
    group_hash = compute_group_hash(event)
    group = (group_cache.get(group_hash) if group_cache is not None else None)
    if not group:
        group, created = EventGroup.objects.get_or_create(
            project_id=project.id,
            group_hash=group_hash,
            defaults={'first_event': event},
        )
        if group_cache is not None:
            group_cache[group_hash] = group
    event.group = group
    event.save(update_fields=('group',))
    return group


def group_all_events():
    n_events_updated = 0
    for project in Project.objects.all():
        events = project.event_set.filter(group__isnull=True).order_by('timestamp').iterator()
        n_events_updated += len(group_events(project, events))
    return n_events_updated
