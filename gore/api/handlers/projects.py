from gore.api.utils import check_authenticated
from gore.models import Project


def get_project_list(request):
    check_authenticated(request)
    return list(Project.objects.all().values('id', 'name'))
