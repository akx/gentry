from django.urls import include
from django.contrib import admin
from django.urls import path, re_path

urlpatterns = [
    re_path('', include('gore.urls')),
    re_path('', include('gontend.urls')),
    path('admin/', admin.site.urls),
]
