from django.urls import path
from . import views

urlpatterns = [
    # Example route - adjust 'timeline' to match a function in your views.py
    path('timeline/', views.timeline, name='timeline'), 
]