from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    # This 'name' is what your redirect() uses
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('employee-dashboard/', views.employee_dashboard, name='employee_dashboard'),
]