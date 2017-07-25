from gotify.models import Notifier
from logging import getLogger

logger = getLogger(__name__)


def send_notifications(event):
    for notifier in Notifier.objects.filter(enabled=True, projects=event.project):
        try:
            notifier.send(event)
        except:
            logger.warning('%s failed for %s' % (notifier, event), exc_info=True)
