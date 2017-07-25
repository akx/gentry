import requests
from django.db import models

from gotify.models.notifier import Notifier
from gotify.utils import format_timestamp

type_emoji_map = {
    'log': ':notebook:',
    'exception': ':no_entry:',
    'message': ':speech_balloon:',
    'unknown': ':white_circle:',
}


class SlackNotifier(Notifier):
    webhook_url = models.URLField()
    message_header_suffix = models.CharField(max_length=128, blank=True)

    class Meta:
        verbose_name = 'Slack notifier'
        verbose_name_plural = 'Slack notifiers'

    def do_send(self, event):
        emoji = type_emoji_map.get(event.type, None)
        text = '*[{project} \u2013 {timestamp}]* (<{url}|#{id}>) {message_header_suffix}\n{message}'.format(
            project=event.project.name,
            timestamp=format_timestamp(event.timestamp),
            id=event.id,
            url=event.get_display_url(),
            message_header_suffix=self.message_header_suffix,
            message=event.message,
        )
        if event.culprit:
            text += '\n:point_right: %s' % event.culprit
        if emoji:
            text = '%s %s' % (emoji, text)

        payload = {'text': text}
        resp = requests.post(
            url=self.webhook_url,
            json={key: value for (key, value) in payload.items() if key and value}
        )
        resp.raise_for_status()

