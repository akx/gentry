from queue import Queue
from urllib.parse import urlparse

import django.test
import sentry_sdk
from django.http import HttpResponse
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.transport import HttpTransport


class MockTransport(HttpTransport):
    response_queue: Queue
    django_client: django.test.Client

    def _make_pool(self, parsed_dsn, http_proxy, https_proxy, ca_certs):
        return self  # this is weird, but allows us to use this same object for `request`

    def request(self, method, url, body, headers):
        request_info = locals().copy()
        response: HttpResponse = self.django_client.post(
            path=urlparse(url).path,
            data=body,
            content_type=headers['Content-Type'],
            **{f"HTTP_{name.upper().replace('-', '_')}": value for (name, value) in headers.items()},
        )
        self.response_queue.put((request_info, response))
        return response


def _get_mock_sentry_sdk_client(dsn, django_client):
    response_queue = Queue()
    sentry_sdk_client = sentry_sdk.Client(
        dsn=dsn,
        integrations=[LoggingIntegration()],
    )
    sentry_sdk_client.transport = transport = MockTransport(sentry_sdk_client.options)
    transport.django_client = django_client
    transport.response_queue = sentry_sdk_client.response_queue = response_queue
    return sentry_sdk_client
