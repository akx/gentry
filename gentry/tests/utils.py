from urllib.parse import urlparse

from raven import Client
from raven.transport import Transport


class MockTransport(Transport):
    def __init__(self, django_client, response_list):
        self.django_client = django_client
        self.response_list = response_list

    def send(self, url, data, headers):
        response = self.django_client.post(
            path=urlparse(url).path,
            data=data,
            content_type=headers['Content-Type'],
            **{'HTTP_%s' % name.upper().replace('-', '_'): value for (name, value) in headers.items()},
        )
        self.response_list.append({
            'url': url,
            'data': data,
            'headers': headers,
            'response': response,
        })
        return response


def _get_mock_raven_client(dsn, django_client):
    response_list = []
    raven_client = Client(
        dsn=dsn,
        transport=lambda: MockTransport(django_client=django_client, response_list=response_list),
    )
    raven_client.response_list = response_list
    raven_client.raise_send_errors = True
    return raven_client
