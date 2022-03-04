from gore.api.schemata import ProjectSchema
from gore.api.utils import check_authenticated
from gore.models import Project


def get_project_list(request):
    check_authenticated(request)
    projects = Project.objects.all()
    return list(ProjectSchema().dump(projects, many=True))
