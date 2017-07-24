import os

from django.conf.urls import url, include
from lepo.router import Router
from lepo.validate import validate_router

import gore.handlers.store
router = Router.from_file(os.path.join(os.path.dirname(__file__), 'swagger.yaml'))
router.add_handlers(gore.handlers.store)
validate_router(router)

urls = router.get_urls()

for u in urls:  # TODO: This shouldn't be necessary :(
    u.callback.csrf_exempt = True

urlpatterns = [
    url(r'^api/', include(urls)),
]
