import threading

from django.apps import AppConfig
from django.conf import settings
from django.db.models.signals import post_save


def maybe_send_notifications(instance, created, **kwargs):
    from gotify.api import send_notifications

    if settings.GOTIFY_IMMEDIATE and created:
        send_args = dict(event=instance)
        if settings.GOTIFY_IMMEDIATE_THREAD:
            threading.Thread(target=send_notifications, kwargs=send_args).start()
        else:
            send_notifications(**send_args)


class GotifyConfig(AppConfig):
    name = 'gotify'
    verbose_name = 'Gentry Notifications'

    def ready(self):
        from gore.models import Event

        post_save.connect(maybe_send_notifications, sender=Event, weak=False)
