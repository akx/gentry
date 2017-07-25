import json

from django.core.mail import send_mail
from django.db import models

from gotify.models.notifier import Notifier


class EmailNotifier(Notifier):
    emails = models.TextField()

    @property
    def recipient_list(self):
        return set(
            address
                for address
                in (line.strip() for line in self.emails.splitlines())
                if address and '@' in address
        )

    def do_send(self, event):
        recipient_list = self.recipient_list
        if not recipient_list:
            raise ValueError('no valid recipients')
        subject = '[%s] - %s - %s' % (event.project.name, event.timestamp, event.message)
        message = json.dumps(event.data_dict, indent=2, sort_keys=True)  # yolo :)
        return send_mail(
            subject=subject,
            message=message,
            from_email=None,
            recipient_list=recipient_list,
            fail_silently=False,
        )
