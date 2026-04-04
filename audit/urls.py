from django.urls import path
from . import views

urlpatterns = [
    # The 'name' here MUST match the '{% url 'audit_trails' %}' in your sidebar
    path('trails/', views.audit_trail_view, name='audit_trails'),
]