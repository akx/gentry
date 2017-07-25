from gentry.utils import set_detected_url_root


def url_root_middleware(get_response):
    def middleware(request):
        set_detected_url_root('{scheme}://{host}'.format(scheme=request.scheme, host=request.get_host()))
        return get_response(request)
    return middleware
