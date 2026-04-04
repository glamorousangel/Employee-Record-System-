from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import LoginLog, ActivityLog

@login_required
def audit_trail_view(request):
    # Fetch all logs, newest first
    login_logs = LoginLog.objects.all().order_by('-datetime')
    activity_logs = ActivityLog.objects.all().order_by('-timestamp')
    
    context = {
        'login_logs': login_logs,
        'activity_logs': activity_logs,
    }
    return render(request, 'admin/audit_trails.html', context)