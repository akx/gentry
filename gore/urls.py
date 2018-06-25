from django.conf.urls import include, url

from gore.api.router import make_router
from lepo.decorators import csrf_exempt

router = make_router()
urls = router.get_urls(
    optional_trailing_slash=True,
    decorate=(csrf_exempt,),
)

urlpatterns = [
    url(r'^api/', include(urls)),
]
