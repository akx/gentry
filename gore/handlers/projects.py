from django.http import JsonResponse

from gore.models import Project


def get_project_list(request):
    if not request.user.is_authenticated():
        return JsonResponse({'error': 'not authenticated'}, status=401)
    return list(Project.objects.all().values('id', 'name'))
