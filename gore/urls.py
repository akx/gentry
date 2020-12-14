from django.conf.urls import include
from django.urls import path
from lepo.decorators import csrf_exempt

from gore.api.router import make_router

router = make_router()
urls = router.get_urls(
    optional_trailing_slash=True,
    decorate=(csrf_exempt,),
)

urlpatterns = [
    path('api/', include(urls)),
]
