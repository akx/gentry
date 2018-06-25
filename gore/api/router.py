import os

from lepo.router import Router
from lepo.validate import validate_router
from .handlers import events, projects, store


def make_router():
    router = Router.from_file(os.path.join(os.path.dirname(__file__), 'swagger.yaml'))
    router.add_handlers(events)
    router.add_handlers(store)
    router.add_handlers(projects)
    validate_router(router)
    return router
