from logging import getLogger

from gotify.models import Notifier

logger = getLogger(__name__)


def send_notifications(event):
    for notifier in Notifier.objects.filter(enabled=True, projects=event.project):
        try:
            notifier.send(event)
        except:
            logger.warning(f'{notifier} failed for {event}', exc_info=True)
