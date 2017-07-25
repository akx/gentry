from django.conf import settings

detected_url_root = None


def make_absolute_uri(relative_uri):
    assert relative_uri.startswith('/')
    url_root = (detected_url_root or settings.URL_BASE or 'http://example.com')
    return '%s%s' % (url_root, relative_uri)


def set_detected_url_root(url_root):
    global detected_url_root
    if detected_url_root != url_root:
        detected_url_root = url_root
