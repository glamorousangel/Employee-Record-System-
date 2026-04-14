from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test

def is_sd(user):
    return user.is_authenticated and user.role == 'ADMIN'
    return user.is_authenticated and user.role in ['SD', 'ADMIN']

@login_required
@user_passes_test(is_sd)
def sd_application_overview(request):
    """Read-only view for the SD to see the application pipeline across all departments."""
    return render(request, 'application_management/sd_appmanagement.html')

@login_required
def application_list(request):
    """View to list applications."""
    role = (request.user.role or '').upper()

    if role == 'HR':
        template_name = 'hr/hr_appmanagement.html'
    elif role == 'HEAD':
        template_name = 'head/head_appmanagement.html'
    elif role == 'SD':
        template_name = 'sd/sd_appmanagement.html'
    else:
        template_name = 'hr/hr_appmanagement.html'

    return render(request, template_name, {'applications': []})

@login_required
def application_detail(request, pk):
    """View to see application details."""
    # Placeholder context
    return render(request, 'application_management/application_detail.html', {})

@login_required
def process_application_action(request, pk):
    """Process approve/reject actions for an application."""
    # Placeholder logic
    from django.http import HttpResponse
    return HttpResponse(f"Action processed for application {pk}")

@login_required
def create_position_change(request):
    """View to create a position change request."""
    return render(request, 'employee/emp_position_change_request.html')