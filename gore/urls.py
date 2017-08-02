import os

from django.conf.urls import include, url

from lepo.decorators import csrf_exempt
from lepo.router import Router
from lepo.validate import validate_router

import gore.handlers.events
import gore.handlers.projects
import gore.handlers.store

router = Router.from_file(os.path.join(os.path.dirname(__file__), 'swagger.yaml'))
router.add_handlers(gore.handlers.events)
router.add_handlers(gore.handlers.store)
router.add_handlers(gore.handlers.projects)
validate_router(router)

urls = router.get_urls(
    optional_trailing_slash=True,
    decorate=(csrf_exempt,),
)

urlpatterns = [
    url(r'^api/', include(urls)),
]
