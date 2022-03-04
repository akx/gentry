from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Prefetch, Q
from django.http import JsonResponse
from lepo.excs import ExceptionalResponse

from gore.api.schemata import EventGroupDetailSchema, EventGroupListSchema
from gore.api.utils import check_authenticated
from gore.models import Event, EventGroup


def get_group_list(
    request,
    limit=10,
    offset=0,
    project=None,
    search=None,
    type=None,
    archived=None,
    order=None,
):
    check_authenticated(request)
    qs = EventGroup.objects.all().prefetch_related('first_event')
    if project:
        qs = qs.filter(project_id=project)
    if type:
        qs = qs.filter(first_event__type=type)
    if search:
        qs = qs.filter(Q(first_event__message__icontains=search) | Q(first_event__culprit__icontains=search))
    if archived is not None:
        qs = qs.filter(archived=archived)

    if order == 'earliest':
        qs = qs.order_by('first_event_time')
    elif order == 'most_common':
        qs = qs.order_by('-n_events')
    else:  # aka "latest"
        qs = qs.order_by('-last_event_time')

    total = qs.count()
    qs = qs[offset : offset + limit]
    return {
        'total': total,
        'offset': offset,
        'limit': limit,
        'groups': list(EventGroupListSchema().dump(qs, many=True)),
    }


def _get_group_if_allowed(request, id, for_detail=False):
    check_authenticated(request)
    try:
        qs = EventGroup.objects.select_related('first_event')
        if for_detail:
            qs = qs.prefetch_related(
                Prefetch(
                    'event_set',
                    queryset=Event.objects.select_related('project').defer('data'),
                ),
            )

        return qs.get(pk=id)
    except ObjectDoesNotExist:  # pragma: no cover
        raise ExceptionalResponse(JsonResponse({'error': 'no such group'}, status=404))


def get_group_detail(request, id):
    group = _get_group_if_allowed(request, id, for_detail=True)
    return EventGroupDetailSchema().dump(group)


def archive_group(request, id):
    group = _get_group_if_allowed(request, id)
    group.archive()
    return EventGroupDetailSchema().dump(group)
