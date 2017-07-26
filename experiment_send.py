import raven
import logging
from raven.handlers.logging import SentryHandler
from raven.conf import setup_logging
from raven.scripts.runner import send_test_message


def a():
    b(8)


def b(num):
    c(num, num)


def c(*args):
    raise ValueError('Oh no') from TypeError(repr(args))


cl = raven.Client('http://aaa:bbb@localhost:8001/1')
cl.raise_send_errors = True
handler = SentryHandler(client=cl)
handler.setLevel(logging.INFO)
setup_logging(handler)

cl.captureMessage('just a message really')

logging.info('nonimportant info')
logging.warning('something spooky')
logging.error('oh dear!')
logging.critical('eee critical')

send_test_message(cl, {})

with cl.capture_exceptions():
    cl.extra_context({'happy': 'cow'})
    cl.user_context({'mu': 'cow'})
    a()
