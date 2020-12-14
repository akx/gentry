from functools import lru_cache

from django.contrib.staticfiles import finders
from whitenoise.middleware import WhiteNoiseMiddleware
from whitenoise.responders import IsDirectoryError

from gentry import settings
from gentry.utils import set_detected_url_root


def url_root_middleware(get_response):
    def middleware(request):
        set_detected_url_root('{scheme}://{host}'.format(scheme=request.scheme, host=request.get_host()))
        return get_response(request)

    return middleware


class GentryWhiteNoiseMiddleware(WhiteNoiseMiddleware):
    def find_file(self, url):
        if url.startswith(self.static_prefix):
            path = finders.find(url[len(self.static_prefix):])
            if path:
                try:
                    return self.get_static_file(path, url)
                except IsDirectoryError:
                    return None

    @lru_cache()
    def cached_find_file(self, url):
        return self.find_file(url)

    def process_request(self, request):
        if settings.DEBUG:
            static_file = self.find_file(request.path_info)
        else:
            static_file = self.cached_find_file(request.path_info)

        if static_file is not None:
            return self.serve(static_file, request)
