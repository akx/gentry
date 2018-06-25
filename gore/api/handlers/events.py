from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.http import JsonResponse

from gore.models import Event
from gore.api.schemata import EventSchema, EventDetailSchema
from lepo.excs import ExceptionalResponse


def get_event_list(request, limit=10, offset=0, project=None, search=None, type=None, archived=None, group=None):
    if not request.user.is_authenticated():
        return JsonResponse({'error': 'not authenticated'}, status=401)
    qs = Event.objects.all().defer('data').prefetch_related('group').order_by('-id')
    if project:
        qs = qs.filter(project_id=project)
    if type:
        qs = qs.filter(type=type)
    if search:
        qs = qs.filter(Q(message__icontains=search) | Q(culprit__icontains=search))
    if archived is not None:
        qs = qs.filter(archived=archived)
    if group is not None:
        qs = qs.filter(group_id=group)

    total = qs.count()
    qs = qs[offset:offset + limit]
    return {
        'total': total,
        'offset': offset,
        'limit': limit,
        'events': list(EventSchema().dump(qs, many=True).data),
    }


def get_event_type_list(request):
    return ['unknown', 'exception', 'message', 'log']


def _get_event_if_allowed(request, id):
    if not request.user.is_authenticated():
        raise ExceptionalResponse(JsonResponse({'error': 'not authenticated'}, status=401))
    try:
        return Event.objects.get(pk=id)
    except ObjectDoesNotExist:  # pragma: no cover
        raise ExceptionalResponse(JsonResponse({'error': 'no such event'}, status=404))


def get_event_detail(request, id):
    event = _get_event_if_allowed(request, id)
    return EventDetailSchema().dump(event).data


def archive_event(request, id):
    event = _get_event_if_allowed(request, id)
    event.archived = True
    event.save()
    return EventDetailSchema().dump(event).data
