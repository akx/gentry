from django.http import JsonResponse

from lepo.excs import ExceptionalResponse


def check_authenticated(request):
    if not request.user.is_authenticated:
        raise ExceptionalResponse(JsonResponse({'error': 'not authenticated'}, status=401))
