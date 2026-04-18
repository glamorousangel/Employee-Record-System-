from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Count, Q
from django.utils import timezone
from django.contrib import messages
from django.utils.dateparse import parse_date
import calendar
import csv
from django.http import HttpResponse, HttpResponseForbidden
from datetime import datetime

from .models import AttendanceLog
from .forms import AttendanceEditForm
from accounts.models import User, Department, ReportExportHistory
from utils.pdf_generator import generate_pdf
from utils.excel_generator import generate_excel

# Create your views here.

# --- Role Check Helpers ---
def is_head(user):
    return user.is_authenticated and user.role == 'HEAD'

def is_hr(user):
    return user.is_authenticated and user.role == 'HR'

def is_sd(user):
    return user.is_authenticated and user.role in ['SD', 'ADMIN']


@login_required
@user_passes_test(is_hr)
def hr_attendance(request):
    """
    Displays all attendance logs for HR and Admins with filtering.
    """
    logs = AttendanceLog.objects.select_related('employee__department', 'edited_by').order_by('-date', 'employee__last_name')

    # Filtering
    employee_id = request.GET.get('employee')
    department_id = request.GET.get('department')
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if employee_id:
        logs = logs.filter(employee_id=employee_id)
    if department_id:
        logs = logs.filter(employee__department_id=department_id)
    if start_date_str and (start_date := parse_date(start_date_str)):
        logs = logs.filter(date__gte=start_date)
    if end_date_str and (end_date := parse_date(end_date_str)):
        logs = logs.filter(date__lte=end_date)

    context = {
        'attendance_logs': logs,
        'all_employees': User.objects.filter(is_active=True).order_by('last_name', 'first_name'),
        'all_departments': Department.objects.filter(is_active=True).order_by('name'),
        'filter_values': request.GET,
        'page_title': 'Master Attendance Log'
    }
    return render(request, 'hr/hr_attendance.html', context)

@login_required
@user_passes_test(is_hr)
def hr_attendance_monitoring(request):
    """
    Displays the attendance monitoring grid view for HR.
    """
    context = {'page_title': 'Attendance Monitoring'}
    return render(request, 'hr/hr_attendancemonitoring.html', context)

@login_required
def emp_attendance(request):
    """
    Displays attendance logs for the currently logged-in employee.
    Displays attendance logs for the currently logged-in employee with date filtering.
    """
    employee = request.user
    logs = AttendanceLog.objects.filter(employee=employee).order_by('-date')
    
    # Date range filtering
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if start_date_str and (start_date := parse_date(start_date_str)):
        logs = logs.filter(date__gte=start_date)
    if end_date_str and (end_date := parse_date(end_date_str)):
        logs = logs.filter(date__lte=end_date)

    context = {
        'attendance_logs': logs,
        'filter_values': request.GET,
        'page_title': 'My Attendance Records'
    }
    return render(request, 'employee/emp_attendance.html', context)

@login_required
@user_passes_test(is_head)
def head_attendance(request):
    """
    Displays attendance logs for employees in the department of the logged-in Head.
    """
    department = _get_head_department(request.user)

    if department:
        logs = (
            AttendanceLog.objects
            .filter(employee__department_id=department.id)
            .select_related('employee', 'employee__department')
            .order_by('-date', 'employee__last_name')
        )
    else:
        logs = AttendanceLog.objects.none()

    attendance_history_data = []
    for log in logs[:120]:
        duration = '--'
        if log.time_in and log.time_out:
            start_dt = datetime.combine(log.date, log.time_in)
            end_dt = datetime.combine(log.date, log.time_out)
            if end_dt > start_dt:
                duration_seconds = int((end_dt - start_dt).total_seconds())
                duration_hours = duration_seconds // 3600
                duration_minutes = (duration_seconds % 3600) // 60
                duration = f'{duration_hours}h {duration_minutes:02d}m'

        attendance_history_data.append(
            {
                'date': log.date.strftime('%Y-%m-%d'),
                'day': log.date.strftime('%A'),
                'employee_name': log.employee.get_full_name() or log.employee.username,
                'time_in': log.time_in.strftime('%H:%M:%S') if log.time_in else '--',
                'time_out': log.time_out.strftime('%H:%M:%S') if log.time_out else '--',
                'hours': duration,
                'status': (log.status or '').lower(),
                'status_display': log.get_status_display(),
            }
        )

    department_employee_count = 0
    if department:
        department_employee_count = (
            User.objects
            .filter(department=department)
            .exclude(role__in=['ADMIN', 'HR', 'SD'])
            .count()
        )
    
    context = {
        'attendance_logs': logs,
        'department': department,
        'page_title': f'{department.name} Department Attendance' if department else 'Department Attendance',
        'attendance_history_data': attendance_history_data,
        'department_employee_count': department_employee_count,
    }
    return render(request, 'head/head_attendance.html', context)

@login_required
@user_passes_test(is_head)
def head_attendance_monitoring(request):
    """
    Displays the attendance monitoring grid view for Department Heads.
    """
    context = {'page_title': 'Attendance Monitoring'}
    return render(request, 'head/head_attendancemonitoring.html', context)


def _get_head_department_attendance_logs(request):
    """Return attendance logs strictly scoped to the logged-in Head's department."""
    department = _get_head_department(request.user)
    if not department:
        return None, AttendanceLog.objects.none()

    department_id = department.id

    logs = (
        AttendanceLog.objects
        .filter(employee__department_id=department_id)
        .select_related('employee', 'employee__department')
        .order_by('-date', 'employee__last_name')
    )
    return department, logs


def _get_head_department(user):
    """Resolve the department a Head controls.

    Supports both direct user.department assignment and Department.head linkage.
    """
    if getattr(user, 'department_id', None):
        return user.department
    return Department.objects.filter(head=user).first()


@login_required
@user_passes_test(is_head)
def head_export_attendance_pdf(request):
    """Export department-scoped attendance report as PDF for Department Heads."""
    department, logs = _get_head_department_attendance_logs(request)
    if not department:
        return HttpResponse('You are not currently assigned as the head of any department.', status=400)

    filters = {
        'department': department.name,
        'status': request.GET.get('status', 'All Statuses'),
    }
    pdf_buffer = generate_pdf('Attendance Report', logs, filters)

    ReportExportHistory.objects.create(
        exported_by=request.user,
        role=getattr(request.user, 'role', ''),
        report_type='Attendance Report',
        export_format=ReportExportHistory.ExportFormat.PDF,
        scope=f'Department: {department.name}',
        filters=filters,
    )

    safe_department_name = department.name.lower().replace(' ', '_')
    filename = f'head_attendance_{safe_department_name}.pdf'

    response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@login_required
@user_passes_test(is_head)
def head_export_attendance_excel(request):
    """Export department-scoped attendance report as Excel for Department Heads."""
    department, logs = _get_head_department_attendance_logs(request)
    if not department:
        return HttpResponse('You are not currently assigned as the head of any department.', status=400)

    filters = {
        'department': department.name,
        'status': request.GET.get('status', 'All Statuses'),
    }
    excel_buffer = generate_excel('Attendance Report', logs, filters)

    ReportExportHistory.objects.create(
        exported_by=request.user,
        role=getattr(request.user, 'role', ''),
        report_type='Attendance Report',
        export_format=ReportExportHistory.ExportFormat.EXCEL,
        scope=f'Department: {department.name}',
        filters=filters,
    )

    safe_department_name = department.name.lower().replace(' ', '_')
    filename = f'head_attendance_{safe_department_name}.xlsx'

    response = HttpResponse(
        excel_buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

@login_required
@user_passes_test(is_sd)
def sd_attendance(request):
    """
    Displays an aggregated summary of attendance for a given month and year.
    """
    today = timezone.now()
    try:
        year = int(request.GET.get('year', today.year))
        month = int(request.GET.get('month', today.month))
    except (ValueError, TypeError):
        year = today.year
        month = today.month

    summary = AttendanceLog.objects.filter(date__year=year, date__month=month).aggregate(
        present_count=Count('id', filter=Q(status='PRESENT')),
        absent_count=Count('id', filter=Q(status='ABSENT')),
        late_count=Count('id', filter=Q(status='LATE')),
        undertime_count=Count('id', filter=Q(status='UNDERTIME')),
    )
    context = {
        'summary': summary,
        'total_employees': User.objects.filter(is_active=True).count(),
        'selected_year': year,
        'selected_month': month,
        'years': range(today.year - 5, today.year + 2),
        'months': [(i, calendar.month_name[i]) for i in range(1, 13)],
        'page_title': 'Monthly Attendance Summary'
    }
    return render(request, 'sd/sd_attendance.html', context)

@login_required
@user_passes_test(is_sd)
def sd_attendance_monitoring(request):
    """
    Displays the attendance monitoring grid view for the School Director.
    """
    context = {'page_title': 'Attendance Monitoring'}
    return render(request, 'sd/sd_attendancemonitoring.html', context)

@login_required
@user_passes_test(is_hr)
def edit_log(request, log_id):
    """
    Handles the editing of a specific attendance log by HR/Admin.
    """
    log_instance = get_object_or_404(AttendanceLog, id=log_id)
    
    if request.method == 'POST':
        form = AttendanceEditForm(request.POST, instance=log_instance)
        if form.is_valid():
            log = form.save(commit=False)
            log.edited_by = request.user
            log.save()
            messages.success(request, f"Attendance log for {log_instance.employee.get_full_name()} on {log_instance.date} has been updated.")
            return redirect('attendance:hr_attendance')
    else:
        form = AttendanceEditForm(instance=log_instance)
        
    context = {
        'form': form,
        'log': log_instance,
        'page_title': f'Edit Log for {log_instance.employee.get_full_name()}'
    }
    return render(request, 'attendance/edit_log.html', context)

@login_required
@user_passes_test(is_sd)
def sd_export_attendance(request):
    """
    Allows the SD to export attendance logs as a CSV file.
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="institution_attendance.csv"'
    writer = csv.writer(response)
    writer.writerow(['Date', 'Employee', 'Department', 'Time In', 'Time Out', 'Status'])
    
    logs = AttendanceLog.objects.all().select_related('employee', 'employee__department').order_by('-date')
    for log in logs:
        department_name = log.employee.department.name if log.employee.department else 'N/A'
        writer.writerow([log.date, log.employee.get_full_name(), department_name, log.time_in, log.time_out, log.get_status_display()])
        
    return response
