import re

from django.db import models

from gotify.utils import is_valid_regex


class Exclude(models.Model):
    notifier = models.ForeignKey('Notifier', related_name='excludes', on_delete=models.CASCADE)
    pattern = models.CharField(max_length=255, validators=[is_valid_regex])

    def test(self, message):
        return re.search(self.pattern, message) is not None
