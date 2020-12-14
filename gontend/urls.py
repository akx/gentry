from django.urls import path

from gontend.views import dashboard

urlpatterns = [
    path('', dashboard, name='dashboard'),
]
