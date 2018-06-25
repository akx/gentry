import hashlib

from django.utils.encoding import force_bytes

from gore.models import EventGroup


def compute_group_hash(event):
    return hashlib.sha256(b'\x00'.join(
        force_bytes(s or '') for s in (event.type, event.message, event.culprit, event.level)
    )).hexdigest()


def group_events(project, events):
    group_cache = {}
    for event in events:
        if event.group_id:
            continue
        group_event(project, event, group_cache)
    for group in group_cache.values():
        group.cache_values()
        group.save()


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
