from django.conf.urls import url, include
from django.contrib import admin

urlpatterns = [
    url('', include('gore.urls')),
    url('', include('gontend.urls')),
    url(r'^admin/', admin.site.urls),
]
