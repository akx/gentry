from django.db import models
from django.utils import timezone


class Project(models.Model):
    slug = models.SlugField()
    name = models.CharField(max_length=128)
    date_added = models.DateTimeField(default=timezone.now, editable=False)

    def __str__(self):
        return self.name
