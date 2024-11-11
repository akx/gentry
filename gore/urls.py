from django.urls import path

from gore.api import api

urlpatterns = [
    path('api/', api.urls),
]
