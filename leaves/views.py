from django.shortcuts import render
from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db import transaction
from django.urls import reverse
from django.utils.timezone import localtime
from datetime import datetime
from django.db.models import Q

from .models import LeaveRequest, LeaveBalance
from .forms import LeaveRequestForm, LeaveActionForm
from accounts.models import Department
from notifications.utils import send_notification
from utils.decorators import sd_elevated_required

# Create your views here.

# --- Role Check Helpers ---
def is_head(user):
    return user.is_authenticated and user.role == 'HEAD'

def is_hr(user):
    return user.is_authenticated and user.role == 'HR'

ADMINISTRATIVE_LEAVE_ROLES = {'ADMIN', 'HR', 'HEAD'}
User = get_user_model()

def _inject_days_requested(post_data):
    """Calculates days_requested if missing to prevent Django form validation bypass."""
    if not post_data.get('days_requested') and post_data.get('start_date') and post_data.get('end_date'):
        try:
            start = datetime.strptime(post_data['start_date'], '%Y-%m-%d').date()
            end = datetime.strptime(post_data['end_date'], '%Y-%m-%d').date()
            post_data['days_requested'] = max((end - start).days + 1, 1)
        except ValueError:
            pass
    return post_data


def _notify_recipients(recipients, message, notification_type, target_url=None):
    for recipient in recipients:
        if recipient and recipient.is_active:
            send_notification(recipient, message, notification_type, target_url=target_url)


def _notify_pending_leave_approval(leave_request):
    requester_name = leave_request.user.get_full_name() or leave_request.user.username
    leave_label = leave_request.leave_type.name
    message = f"Pending approval: {requester_name} requested {leave_label} leave."

    if leave_request.status == LeaveRequest.Status.PENDING_HEAD_APPROVAL:
        target_url = reverse('leaves:head_leave_history')
        department = getattr(leave_request.user, 'department', None)
        head_user = getattr(department, 'head', None) if department else None
        if head_user and head_user != leave_request.user:
            _notify_recipients([head_user], message, 'Pending Approval', target_url=target_url)
            return
        hr_users = User.objects.filter(role='HR', is_active=True)
        _notify_recipients(hr_users, message, 'Pending Approval', target_url=target_url)
        return

    if leave_request.status == LeaveRequest.Status.PENDING_HR_APPROVAL:
        target_url = reverse('leaves:hr_leave_history')
        hr_users = User.objects.filter(role='HR', is_active=True)
        _notify_recipients(hr_users, message, 'Pending Approval', target_url=target_url)
        return

    if leave_request.status == LeaveRequest.Status.PENDING_SD_APPROVAL:
        target_url = reverse('leaves:sd_leave_overview')
        sd_users = User.objects.filter(role='SD', is_active=True)
        _notify_recipients(sd_users, message, 'Pending Approval', target_url=target_url)


def _notify_leave_status_update(leave_request):
    target_url = reverse('leaves:leave_history')
    if leave_request.status == LeaveRequest.Status.APPROVED:
        send_notification(
            leave_request.user,
            f"Your leave request ({leave_request.leave_type.name}) has been approved.",
            'Leave Update',
            target_url=target_url,
        )
    elif leave_request.status == LeaveRequest.Status.REJECTED:
        send_notification(
            leave_request.user,
            f"Your leave request ({leave_request.leave_type.name}) has been rejected.",
            'Leave Update',
            target_url=target_url,
        )


def _requires_sd_final_review(leave_request):
    return (leave_request.user.role or '').upper() in ADMINISTRATIVE_LEAVE_ROLES


def _get_head_department_scope_ids(user):
    department_ids = set()

    if getattr(user, 'department_id', None):
        department_ids.add(user.department_id)

    # Ensure we explicitly catch departments assigned via the related_name
    if hasattr(user, 'headed_department'):
        department_ids.update(user.headed_department.values_list('id', flat=True))

    headed_department_ids = Department.objects.filter(head=user).values_list('id', flat=True)
    department_ids.update(headed_department_ids)

    return list(department_ids)

@login_required
def leave_select_view(request):
    """Renders the main leave selection page for employees."""
    return render(request, 'employee/emp_leaveselect.html')


# --- Employee Views ---

@login_required
def apply_leave(request):
    """View for an employee to apply for leave."""
    if request.method == 'POST':
        # Secure injection to guarantee `days_requested` saves successfully
        post_data = _inject_days_requested(request.POST.copy())
        form = LeaveRequestForm(post_data, request.FILES, user=request.user)
        if form.is_valid():
            leave_request = form.save(commit=False)
            leave_request.user = request.user
            leave_request.days_requested = form.cleaned_data['days_requested']
            leave_request.status = LeaveRequest.Status.PENDING_HEAD_APPROVAL
            leave_request.save()
            _notify_pending_leave_approval(leave_request)
            messages.success(request, "Your leave request has been submitted successfully.")
            return redirect('leaves:leave_history')
        else:
            messages.error(request, "Submission failed. Please review the form for errors.")
    else:
        form = LeaveRequestForm(user=request.user)

    return render(request, 'employee/emp_applicationleave.html', {'form': form})


@login_required
def leave_history(request):
    """View for an employee to see their leave history."""
    leave_requests = LeaveRequest.objects.filter(user=request.user).order_by('-created_at')
    
    is_json = (
        'application/json' in request.headers.get('Accept', '') or
        request.GET.get('format') == 'json' or
        request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    )
    if is_json:
        history_data = list(leave_requests.values(
            'id', 'user__id', 'user__username', 'user__first_name', 'user__last_name', 'user__role', 'leave_type__name', 
            'start_date', 'end_date', 'days_requested', 'status', 'reason', 'created_at', 'attachment',
            'reviewed_by_head__first_name', 'reviewed_by_head__last_name', 'head_remarks',
            'reviewed_by_hr__first_name', 'reviewed_by_hr__last_name', 'hr_remarks',
            'reviewed_by_sd__first_name', 'reviewed_by_sd__last_name', 'sd_remarks'
        ))
        for item in history_data:
            if item.get('created_at'):
                local_dt = localtime(item['created_at'])
                item['dateFiled'] = local_dt.strftime('%B %d, %Y')
                item['submitTime'] = local_dt.strftime('%I:%M %p')
            fname = item.get('user__first_name', '') or ''
            lname = item.get('user__last_name', '') or ''
            full_name = f"{fname.strip()} {lname.strip()}".strip()
            item['name'] = full_name if full_name else item.get('user__username', 'Unknown')
        return JsonResponse({'history': history_data, 'current_user_id': request.user.id})
        
    return render(request, 'employee/emp_leaverequest.html', {'leave_requests': leave_requests})


@login_required
def leave_balance(request):
    """View for an employee to see their leave balances."""
    balances = LeaveBalance.objects.filter(user=request.user).select_related('leave_type')
    balance_data = list(balances.values('leave_type__name', 'remaining_days'))
    return JsonResponse({'balances': balance_data})


# --- Head Views (Personal Leave) ---

@login_required
@user_passes_test(is_head)
def head_leave_select(request):
    """Renders the main leave selection page for Department Heads."""
    return render(request, 'head/head_leaveselect.html')


@login_required
@user_passes_test(is_head)
def head_apply_leave(request):
    """View for a Department Head to apply for personal leave."""
    if request.method == 'POST':
        post_data = _inject_days_requested(request.POST.copy())
        form = LeaveRequestForm(post_data, request.FILES, user=request.user)
        if form.is_valid():
            leave_request = form.save(commit=False)
            leave_request.user = request.user
            leave_request.days_requested = form.cleaned_data['days_requested']
            leave_request.status = LeaveRequest.Status.PENDING_HEAD_APPROVAL
            leave_request.save()
            _notify_pending_leave_approval(leave_request)
            messages.success(request, "Your leave request has been submitted successfully.")
            return redirect('leaves:head_leave_history')
        else:
            messages.error(request, "Submission failed. Please review the form for errors.")
    else:
        form = LeaveRequestForm(user=request.user)

    return render(request, 'head/head_applicationleave.html', {'form': form})


@login_required
@user_passes_test(is_head)
def head_leave_history(request):
    """View for a Department Head to see leave requests within their approval scope."""
    department_scope_ids = _get_head_department_scope_ids(request.user)
    queue_mode = str(request.GET.get('queue', '')).lower() in {'1', 'true', 'yes'}

    # Always include the head's own requests, plus any requests from their department scope
    if department_scope_ids:
        leave_requests = LeaveRequest.objects.filter(
            Q(user__department_id__in=department_scope_ids) | Q(user=request.user)
        ).select_related('user', 'leave_type').order_by('-created_at')
    else:
        leave_requests = LeaveRequest.objects.filter(
            user=request.user
        ).select_related('user', 'leave_type').order_by('-created_at')

    if queue_mode:
        leave_requests = leave_requests.filter(
            status=LeaveRequest.Status.PENDING_HEAD_APPROVAL
        ).exclude(user=request.user)

    is_json = (
        'application/json' in request.headers.get('Accept', '') or
        request.GET.get('format') == 'json' or
        request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    )
    if is_json:
        history_data = list(leave_requests.values(
            'id', 'user__id', 'user__username', 'user__first_name', 'user__last_name', 'user__role', 'leave_type__name', 
            'start_date', 'end_date', 'days_requested', 'status', 'reason', 'created_at', 'attachment',
            'reviewed_by_head__first_name', 'reviewed_by_head__last_name', 'head_remarks',
            'reviewed_by_hr__first_name', 'reviewed_by_hr__last_name', 'hr_remarks',
            'reviewed_by_sd__first_name', 'reviewed_by_sd__last_name', 'sd_remarks'
        ))
        for item in history_data:
            if item.get('created_at'):
                local_dt = localtime(item['created_at'])
                item['dateFiled'] = local_dt.strftime('%B %d, %Y')
                item['submitTime'] = local_dt.strftime('%I:%M %p')
                
            fname = item.get('user__first_name', '') or ''
            lname = item.get('user__last_name', '') or ''
            full_name = f"{fname.strip()} {lname.strip()}".strip()
            item['name'] = full_name if full_name else item.get('user__username', 'Unknown')
        return JsonResponse({'history': history_data, 'current_user_id': request.user.id})

    return render(request, 'head/head_leaverequest.html', {'leave_requests': leave_requests})


# --- HR Views (Management & Personal) ---

@login_required
@user_passes_test(is_hr)
def hr_leave_select(request):
    """Renders the main leave selection page for HR."""
    return render(request, 'hr/hr_leaveselect.html')


@login_required
@user_passes_test(is_hr)
def hr_apply_leave(request):
    """View for HR to apply for personal leave."""
    if request.method == 'POST':
        post_data = _inject_days_requested(request.POST.copy())
        form = LeaveRequestForm(post_data, request.FILES, user=request.user)
        if form.is_valid():
            leave_request = form.save(commit=False)
            leave_request.user = request.user
            leave_request.days_requested = form.cleaned_data['days_requested']
            leave_request.status = LeaveRequest.Status.PENDING_HEAD_APPROVAL
            leave_request.save()
            _notify_pending_leave_approval(leave_request)
            messages.success(request, "Your leave request has been submitted successfully.")
            return redirect('leaves:hr_leave_history')
        else:
            messages.error(request, "Submission failed. Please review the form for errors.")
    else:
        form = LeaveRequestForm(user=request.user)
    return render(request, 'hr/hr_applicationleave.html', {'form': form})


@login_required
@user_passes_test(is_hr)
def hr_leave_history(request):
    """View for HR to see all leave requests for approval and history."""
    queue_mode = str(request.GET.get('queue', '')).lower() in {'1', 'true', 'yes'}
    
    leave_requests = LeaveRequest.objects.all().select_related('user', 'leave_type').order_by('-created_at')
    
    if queue_mode:
        leave_requests = leave_requests.filter(
            status=LeaveRequest.Status.PENDING_HR_APPROVAL
        ).exclude(user=request.user)
    
    is_json = (
        'application/json' in request.headers.get('Accept', '') or
        request.GET.get('format') == 'json' or
        request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    )
    if is_json:
        history_data = list(leave_requests.values(
            'id', 'user__id', 'user__username', 'user__first_name', 'user__last_name', 'user__role', 'leave_type__name', 
            'start_date', 'end_date', 'days_requested', 'status', 'reason', 'created_at', 'attachment',
            'reviewed_by_head__first_name', 'reviewed_by_head__last_name', 'head_remarks',
            'reviewed_by_hr__first_name', 'reviewed_by_hr__last_name', 'hr_remarks',
            'reviewed_by_sd__first_name', 'reviewed_by_sd__last_name', 'sd_remarks'
        ))
        for item in history_data:
            if item.get('created_at'):
                local_dt = localtime(item['created_at'])
                item['dateFiled'] = local_dt.strftime('%B %d, %Y')
                item['submitTime'] = local_dt.strftime('%I:%M %p')
                
            fname = item.get('user__first_name', '') or ''
            lname = item.get('user__last_name', '') or ''
            full_name = f"{fname.strip()} {lname.strip()}".strip()
            item['name'] = full_name if full_name else item.get('user__username', 'Unknown')
        return JsonResponse({'history': history_data, 'current_user_id': request.user.id})

    return render(request, 'hr/hr_leaverequest.html', {'leave_requests': leave_requests})


# --- SD Views (Management & Personal) ---

@login_required
@sd_elevated_required
def sd_leave_select(request):
    """Renders the main leave selection page for the School Director."""
    return render(request, 'sd/sd_leaveselect.html')


@login_required
@sd_elevated_required
def sd_apply_leave(request):
    """View for SD to apply for personal leave."""
    if request.method == 'POST':
        post_data = _inject_days_requested(request.POST.copy())
        form = LeaveRequestForm(post_data, request.FILES, user=request.user)
        if form.is_valid():
            leave_request = form.save(commit=False)
            leave_request.user = request.user
            leave_request.days_requested = form.cleaned_data['days_requested']
            leave_request.status = LeaveRequest.Status.PENDING_HEAD_APPROVAL
            leave_request.save()
            _notify_pending_leave_approval(leave_request)
            messages.success(request, "Your leave request has been submitted successfully.")
            return redirect('leaves:sd_leave_history')
        else:
            messages.error(request, "Submission failed. Please review the form for errors.")
    else:
        form = LeaveRequestForm(user=request.user)
    return render(request, 'sd/sd_applicationleave.html', {'form': form})


@login_required
@sd_elevated_required
def sd_leave_history(request):
    """Legacy route maintained for compatibility; redirects to SD approval overview."""
    return redirect('leaves:sd_leave_overview')

@login_required
@sd_elevated_required
def sd_leave_overview(request):
    """SD final-approval queue for leave requests from administrative roles."""

    # B-2: SD should see all leave requests, not just from administrative roles.
    leave_requests = LeaveRequest.objects.all().select_related(
        'user', 'leave_type', 'reviewed_by_head', 'reviewed_by_hr', 'reviewed_by_sd'
    ).order_by('-created_at')

    is_json = (
        'application/json' in request.headers.get('Accept', '') or
        request.GET.get('format') == 'json' or
        request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    )
    if is_json:
        history_data = list(leave_requests.values(
            'id', 'user__id', 'user__username', 'user__first_name', 'user__last_name', 'user__role', 'leave_type__name', 
            'start_date', 'end_date', 'days_requested', 'status', 'reason', 'created_at', 'attachment',
            'reviewed_by_head__first_name', 'reviewed_by_head__last_name', 'head_remarks',
            'reviewed_by_hr__first_name', 'reviewed_by_hr__last_name', 'hr_remarks',
            'reviewed_by_sd__first_name', 'reviewed_by_sd__last_name', 'sd_remarks'
        ))
        for item in history_data:
            if item.get('created_at'):
                local_dt = localtime(item['created_at'])
                item['dateFiled'] = local_dt.strftime('%B %d, %Y')
                item['submitTime'] = local_dt.strftime('%I:%M %p')
                
            fname = item.get('user__first_name', '') or ''
            lname = item.get('user__last_name', '') or ''
            full_name = f"{fname.strip()} {lname.strip()}".strip()
            item['name'] = full_name if full_name else item.get('user__username', 'Unknown')
        return JsonResponse({'history': history_data, 'current_user_id': request.user.id})

    pending_requests = leave_requests.filter(status=LeaveRequest.Status.PENDING_SD_APPROVAL)
    reviewed_requests = leave_requests.exclude(status=LeaveRequest.Status.PENDING_SD_APPROVAL)

    return render(
        request,
        'sd/sd_leaverequest.html',
        {
            'pending_requests': pending_requests,
            'reviewed_requests': reviewed_requests,
        },
    )

@login_required
@sd_elevated_required
@require_POST
def sd_forward_leave(request, request_id):
    """View for SD to forward a leave request (read-only approval exception)."""
    leave_request = get_object_or_404(LeaveRequest, id=request_id)
    leave_request.status = LeaveRequest.Status.PENDING_SD_APPROVAL
    leave_request.save()
    _notify_pending_leave_approval(leave_request)
    messages.success(request, f"Leave request for {leave_request.user.get_full_name()} has been forwarded.")
    return redirect('leaves:sd_leave_overview')

# --- Approval Views ---

@login_required
@user_passes_test(is_head)
@require_POST
@transaction.atomic
def head_approve(request, request_id):
    """View for a Department Head to approve or reject a leave request."""
    department_scope_ids = _get_head_department_scope_ids(request.user)
    leave_request = get_object_or_404(
        LeaveRequest, 
        id=request_id, 
        status=LeaveRequest.Status.PENDING_HEAD_APPROVAL,
        user__department_id__in=department_scope_ids
    )
    form = LeaveActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        
        leave_request.reviewed_by_head = request.user
        leave_request.head_remarks = form.cleaned_data['remarks']
        leave_request.status = LeaveRequest.Status.PENDING_HR_APPROVAL if action == 'APPROVE' else LeaveRequest.Status.REJECTED
        leave_request.save() # Persist Head action
        
        if action == 'APPROVE':
            _notify_pending_leave_approval(leave_request)
            messages.success(request, f"Leave request for {leave_request.user.get_full_name()} approved. Status updated to Pending HR Approval.")
        else:
            _notify_leave_status_update(leave_request)
            messages.success(request, f"Leave request for {leave_request.user.get_full_name()} has been Rejected by Head.")
    else:
        messages.error(request, "Failed to process request: Invalid action submitted.")
    return redirect('leaves:head_leave_history')


@login_required
@user_passes_test(is_hr)
@require_POST
@transaction.atomic
def hr_final_approve(request, request_id):
    """View for HR to approve/reject and route leave requests for SD final approval."""
    leave_request = get_object_or_404(LeaveRequest, id=request_id)
    
    # Strictly enforce workflow sequence: HR sees the request only after the Head has approved it
    if leave_request.status != LeaveRequest.Status.PENDING_HR_APPROVAL:
        messages.error(request, f"Failed to process request: Application is already marked as {leave_request.get_status_display()}.")
        return redirect('leaves:hr_leave_history')
        
    form = LeaveActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        
        # Ensure HR cannot approve a leave if the balance is insufficient
        if action == 'APPROVE':
            try:
                balance = LeaveBalance.objects.get(
                    user=leave_request.user,
                    leave_type=leave_request.leave_type
                )
                if balance.remaining_days < leave_request.days_requested:
                    messages.error(
                        request, 
                        f"Failed to process request: Insufficient leave balance. "
                        f"Remaining: {balance.remaining_days} days. Requested: {leave_request.days_requested} days."
                    )
                    return redirect('leaves:hr_leave_history')
            except LeaveBalance.DoesNotExist:
                messages.error(request, "Failed to process request: Leave balance not found.")
                return redirect('leaves:hr_leave_history')
                
        leave_request.reviewed_by_hr = request.user
        leave_request.hr_remarks = form.cleaned_data['remarks']
        if action == 'APPROVE':
            leave_request.status = (
                LeaveRequest.Status.PENDING_SD_APPROVAL
                if _requires_sd_final_review(leave_request)
                else LeaveRequest.Status.APPROVED
            )
            messages.success(request, f"Leave request for {leave_request.user.get_full_name() or leave_request.user.username} has been Approved.")
        else:
            leave_request.status = LeaveRequest.Status.REJECTED
            messages.success(request, f"Leave request for {leave_request.user.get_full_name() or leave_request.user.username} has been Rejected by HR.")
        
        leave_request.save() # Persist to DB -> triggers post_save deduction signal in leaves/signals.py if status is APPROVED
        
        if leave_request.status in {LeaveRequest.Status.PENDING_SD_APPROVAL, LeaveRequest.Status.PENDING_HR_APPROVAL, LeaveRequest.Status.PENDING_HEAD_APPROVAL}:
            _notify_pending_leave_approval(leave_request)
        else:
            _notify_leave_status_update(leave_request)
    else:
        # Surface exact form errors so HR knows if a field (like remarks) was missing
        messages.error(request, f"Failed to process request: {form.errors.as_text()}")
    return redirect('leaves:hr_leave_history')


# --- SD Approve View ---
@login_required
@sd_elevated_required
@require_POST
@transaction.atomic
def sd_approve(request, request_id):
    """View for the School Director to approve or reject a leave request."""
    leave_request = get_object_or_404(
        LeaveRequest,
        id=request_id,
        status=LeaveRequest.Status.PENDING_SD_APPROVAL,
    )
    form = LeaveActionForm(request.POST)
    if form.is_valid():
        action = form.cleaned_data['action']
        leave_request.reviewed_by_sd = request.user
        leave_request.sd_remarks = form.cleaned_data['remarks']
        leave_request.status = (
            LeaveRequest.Status.APPROVED
            if action == 'APPROVE'
            else LeaveRequest.Status.REJECTED
        )
        leave_request.save()
        _notify_leave_status_update(leave_request)
        messages.success(
            request,
            f"Leave request for {leave_request.user.get_full_name()} was {'approved' if action == 'APPROVE' else 'rejected'} by SD.",
        )
    else:
        messages.error(request, "Invalid action submitted.")
    return redirect('leaves:sd_leave_overview')

# --- SD View ---
@login_required
@sd_elevated_required
def leave_summary(request):
    """A view-only summary for the School Director."""
    all_requests = LeaveRequest.objects.all().order_by('-created_at')
    summary_data = list(all_requests.values(
        'id', 'user__first_name', 'user__last_name', 'leave_type__name', 
        'start_date', 'end_date', 'status'
    ))
    return JsonResponse({'summary': summary_data})

@login_required
@require_POST
@transaction.atomic
def process_leave_action(request, leave_id):
    """
    Unified API endpoint for processing multi-step leave approvals via Fetch API.
    Handles Employee -> Head -> HR workflow.
    """
    import json
    try:
        data = json.loads(request.body)
        action = data.get('action')
        remarks = data.get('remarks', '')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data payload.'}, status=400)

    leave_request = get_object_or_404(LeaveRequest, id=leave_id)
    role = (request.user.role or '').upper()
    reviewer_name = request.user.get_full_name() or request.user.username

    if role == 'HEAD':
        if leave_request.status != LeaveRequest.Status.PENDING_HEAD_APPROVAL:
            return JsonResponse({'error': 'Application is not pending Head approval.'}, status=400)
        
        if action == 'Approve':
            leave_request.status = LeaveRequest.Status.PENDING_HR_APPROVAL
            leave_request.head_remarks = remarks or 'Approved by Head'
        elif action == 'Reject':
            leave_request.status = LeaveRequest.Status.REJECTED
            leave_request.head_remarks = remarks or 'Rejected by Head'
        else:
            return JsonResponse({'error': 'Invalid action.'}, status=400)
            
        leave_request.reviewed_by_head = request.user
        leave_request.save()
        
        # Trigger notifications based on decision
        if action == 'Approve':
            _notify_pending_leave_approval(leave_request)
        else:
            _notify_leave_status_update(leave_request)

    elif role in ['HR', 'ADMIN']:
        if leave_request.status != LeaveRequest.Status.PENDING_HR_APPROVAL:
            return JsonResponse({'error': 'Application is not pending HR approval.'}, status=400)
            
        if action == 'Approve':
            # Pre-check balance to prevent the transaction from failing silently
            try:
                balance = LeaveBalance.objects.get(user=leave_request.user, leave_type=leave_request.leave_type)
                if balance.remaining_days < leave_request.days_requested:
                    return JsonResponse({'error': f'Insufficient leave balance. Remaining: {balance.remaining_days} days.'}, status=400)
            except LeaveBalance.DoesNotExist:
                pass
                
            leave_request.status = LeaveRequest.Status.PENDING_SD_APPROVAL if _requires_sd_final_review(leave_request) else LeaveRequest.Status.APPROVED
            leave_request.hr_remarks = remarks or 'Approved by HR'
        elif action == 'Reject':
            leave_request.status = LeaveRequest.Status.REJECTED
            leave_request.hr_remarks = remarks or 'Rejected by HR'
        else:
            return JsonResponse({'error': 'Invalid action.'}, status=400)
            
        leave_request.reviewed_by_hr = request.user
        leave_request.save()
        
        # Trigger notifications based on decision
        if leave_request.status in {LeaveRequest.Status.PENDING_SD_APPROVAL}:
            _notify_pending_leave_approval(leave_request)
        else:
            _notify_leave_status_update(leave_request)
            
    else:
        return JsonResponse({'error': 'Unauthorized role for this action.'}, status=403)

    return JsonResponse({
        'success': True,
        'new_status': leave_request.get_status_display() if hasattr(leave_request, 'get_status_display') else leave_request.status,
        'reviewed_by': reviewer_name
    })

@login_required
@require_POST
@transaction.atomic
def hr_process_leave_action(request, request_id):
    """
    Specific API endpoint for processing HR leave approvals via Fetch API.
    Only accepts POST requests from HR or Superusers.
    """
    if request.user.role not in ['HR', 'ADMIN'] and not request.user.is_superuser:
        return JsonResponse({'error': 'Forbidden. Only HR and Admins can perform this action.'}, status=403)
        
    leave_request = get_object_or_404(LeaveRequest, id=request_id)
    
    if leave_request.status != LeaveRequest.Status.PENDING_HR_APPROVAL:
        return JsonResponse({'error': f'Application is currently {leave_request.get_status_display()} and cannot be modified.'}, status=400)
    
    import json
    try:
        data = json.loads(request.body)
        action = data.get('action')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data payload.'}, status=400)

    if action == 'Approve':
        leave_request.status = LeaveRequest.Status.APPROVED
        leave_request.hr_remarks = data.get('remarks', 'Approved by HR')
    elif action == 'Reject':
        leave_request.status = LeaveRequest.Status.REJECTED
        leave_request.hr_remarks = data.get('remarks', 'Rejected by HR')
    else:
        return JsonResponse({'error': 'Invalid action.'}, status=400)

    leave_request.reviewed_by_hr = request.user
    leave_request.save()

    reviewer_name = request.user.get_full_name() or request.user.username
    return JsonResponse({'success': True, 'new_status': leave_request.get_status_display() if hasattr(leave_request, 'get_status_display') else leave_request.status, 'reviewed_by': reviewer_name})