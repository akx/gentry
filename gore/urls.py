import os

from django.conf.urls import url, include
from lepo.router import Router
from lepo.validate import validate_router

import gore.handlers.events
import gore.handlers.store
import gore.handlers.projects

router = Router.from_file(os.path.join(os.path.dirname(__file__), 'swagger.yaml'))
router.add_handlers(gore.handlers.events)
router.add_handlers(gore.handlers.store)
router.add_handlers(gore.handlers.projects)
validate_router(router)

urls = router.get_urls()

for u in urls:  # TODO: This shouldn't be necessary :(
    u.callback.csrf_exempt = True

urlpatterns = [
    url(r'^api/', include(urls)),
]
