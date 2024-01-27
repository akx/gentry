from functools import lru_cache

from django.contrib.staticfiles import finders
from whitenoise.middleware import WhiteNoiseMiddleware
from whitenoise.responders import IsDirectoryError

from gentry.utils import set_detected_url_root


def url_root_middleware(get_response):
    def middleware(request):
        set_detected_url_root(f'{request.scheme}://{request.get_host()}')
        return get_response(request)

    return middleware


class GentryWhiteNoiseMiddleware(WhiteNoiseMiddleware):
    def find_file(self, url):
        if url.startswith(self.static_prefix):
            path = finders.find(url[len(self.static_prefix) :])
            if path:
                try:
                    return self.get_static_file(path, url)
                except IsDirectoryError:
                    return None

    @lru_cache()
    def cached_find_file(self, url):
        return self.find_file(url)
