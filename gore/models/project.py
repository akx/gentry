from django.db import models
from django.utils import timezone

from gentry.utils import make_absolute_uri


class Project(models.Model):
    slug = models.SlugField()
    name = models.CharField(max_length=128)
    date_added = models.DateTimeField(default=timezone.now, editable=False)

    def __str__(self):
        return self.name

    @property
    def dsn(self):
        key = self.key_set.first()
        if not key:
            return None
        return make_absolute_uri('/%s' % self.id).replace('://', '://%s:%s@' % (key.key, key.secret))
