from django.urls import path
from . import views  # The dot means "look in the current folder"

urlpatterns = [
    # Based on your last error, make sure this matches your views.py function name
    path('trails/', views.audit_trail_view, name='audit_trails'), 
]