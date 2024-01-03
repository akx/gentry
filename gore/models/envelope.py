import json
from typing import Any, List

from django.db import models
from django.utils import timezone
from django.utils.encoding import force_str


class Envelope(models.Model):
    project = models.ForeignKey('gore.Project', on_delete=models.CASCADE)
    date_added = models.DateTimeField(default=timezone.now, editable=False)
    raw_data = models.TextField(blank=True, editable=False)

    def parse(self) -> List[Any]:
        # According to sentry-sdk source, envelopes are basically JSONL, with the first line being a header
        body_lines = force_str(self.raw_data).splitlines()
        return [json.loads(line.strip()) for line in body_lines if line.strip()]
