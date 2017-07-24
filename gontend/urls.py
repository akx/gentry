from django.conf.urls import url

from gontend.views import dashboard

urlpatterns = [
    url(r'^$', dashboard),
]
