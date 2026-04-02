from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.conf import settings
from django.utils import timezone
import json # For parsing JSON requests
from django.db.models import Q, Count

from .models import User, Department # Import Department
from .forms import CustomUserCreationForm, CustomUserChangeForm, AssignRoleForm, AccountStatusForm, AdminPasswordResetForm, DepartmentForm

# Helper function for admin check
def is_admin(user):
    return user.is_authenticated and user.role == 'ADMIN'

def login_view(request):
    if request.method == 'POST':
        username_or_email = request.POST.get('username')
        password = request.POST.get('password')
        
        user = None
        # Try authenticating by username
        try:
            user = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            # If not found by username, try by email
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                pass # User not found by username or email

        if user is not None:
            if user.is_locked:
                messages.error(request, "Your account is locked. Please contact an administrator.")
                return render(request, 'login/login.html')

            if not user.is_active:
                messages.error(request, "Your account is inactive. Please contact an administrator.")
                return render(request, 'login/login.html')

            authenticated_user = authenticate(request, username=user.username, password=password)

            if authenticated_user is not None:
                login(request, authenticated_user)
                # Reset failed login attempts on successful login
                authenticated_user.failed_login_attempts = 0
                authenticated_user.save()

                if authenticated_user.must_change_password:
                    messages.info(request, "You must change your password before proceeding.")
                    return redirect('password_change') # Assuming a password change URL exists
                
                if authenticated_user.role == 'ADMIN':
                    return redirect('admin_dashboard')
                else:
                    return redirect('employee_dashboard')
            else:
                # Increment failed login attempts
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= getattr(settings, 'MAX_FAILED_LOGIN_ATTEMPTS', 5):
                    user.is_locked = True
                    messages.error(request, "Too many failed login attempts. Your account has been locked.")
                else:
                    messages.error(request, "Invalid username or password.")
                user.save()
        else:
            messages.error(request, "Invalid username or password.")
            
    return render(request, 'login/login.html')

@login_required
@user_passes_test(is_admin)
def admin_dashboard(request):
    # This view will now serve as the user management list
    users = User.objects.all().order_by('last_name', 'first_name')
    departments = Department.objects.all()
    
    # Apply filters if present in GET request
    search_term = request.GET.get('search', '')
    role_filter = request.GET.get('role', '')
    status_filter = request.GET.get('status', '')
    department_filter = request.GET.get('department', '')

    if search_term:
        users = users.filter(
            Q(first_name__icontains=search_term) |
            Q(last_name__icontains=search_term) |
            Q(email__icontains=search_term) |
            Q(username__icontains=search_term)
        )
    if role_filter:
        users = users.filter(role=role_filter)
    if status_filter:
        if status_filter == 'active':
            users = users.filter(is_active=True, is_locked=False)
        elif status_filter == 'inactive':
            users = users.filter(is_active=False)
        elif status_filter == 'locked':
            users = users.filter(is_locked=True)
    if department_filter:
        try:
            users = users.filter(department__id=int(department_filter))
            department_filter = int(department_filter) # Convert for template comparison
        except ValueError:
            pass

    # Dashboard Statistics
    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True, is_locked=False).count(),
        'total_departments': Department.objects.count(),
    }

    context = {
        'users': users,
        'roles': User.ROLE_CHOICES,
        'departments': departments,
        'current_search': search_term,
        'current_role_filter': role_filter,
        'current_status_filter': status_filter,
        'current_department_filter': department_filter,
        'stats': stats,
    }
    return render(request, 'admin/user_management.html', context) # Changed to user_management.html

@login_required
def employee_dashboard(request):
    return render(request, 'dashboards/emp_dash.html')

@login_required
@user_passes_test(is_admin)
@require_POST
def create_user(request):
    form = CustomUserCreationForm(request.POST, request.FILES)
    if form.is_valid():
        user = form.save()
        messages.success(request, f"User {user.username} created successfully. Password change required on first login.")
        return JsonResponse({'status': 'success', 'message': 'User created successfully.'})
    else:
        errors = form.errors.as_json()
        return JsonResponse({'status': 'error', 'message': 'Error creating user.', 'errors': json.loads(errors)}, status=400)

@login_required
@user_passes_test(is_admin)
def get_user_data(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    data = {
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'username': user.username,
        'role': user.role,
        'department_id': user.department.id if user.department else None,
        'is_active': user.is_active,
        'is_locked': user.is_locked,
        'must_change_password': user.must_change_password,
        'profile_pic_url': user.profile_pic.url if user.profile_pic else None,
    }
    return JsonResponse(data)

@login_required
@user_passes_test(is_admin)
@require_POST
def edit_user(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    form = CustomUserChangeForm(request.POST, request.FILES, instance=user)
    if form.is_valid():
        form.save()
        messages.success(request, f"User {user.username} updated successfully.")
        return JsonResponse({'status': 'success', 'message': 'User updated successfully.'})
    else:
        errors = form.errors.as_json()
        return JsonResponse({'status': 'error', 'message': 'Error updating user.', 'errors': json.loads(errors)}, status=400)

@login_required
@user_passes_test(is_admin)
@require_POST
def assign_role(request):
    form = AssignRoleForm(request.POST)
    if form.is_valid():
        user_id = form.cleaned_data['user_id']
        new_role = form.cleaned_data['role']
        department = form.cleaned_data['department']

        user = get_object_or_404(User, pk=user_id)
        user.role = new_role
        user.department = department if new_role == 'HEAD' else None # Only assign department if role is HEAD
        user.save()
        messages.success(request, f"Role for {user.username} updated to {new_role}.")
        return JsonResponse({'status': 'success', 'message': 'Role assigned successfully.'})
    else:
        errors = form.errors.as_json()
        return JsonResponse({'status': 'error', 'message': 'Error assigning role.', 'errors': json.loads(errors)}, status=400)

@login_required
@user_passes_test(is_admin)
@require_POST
def update_account_status(request):
    form = AccountStatusForm(request.POST)
    if form.is_valid():
        user_ids = request.POST.getlist('user_ids[]') # Expecting a list for bulk actions
        action = form.cleaned_data['action']
        
        users_to_update = User.objects.filter(pk__in=user_ids)
        
        for user in users_to_update:
            if action == 'activate':
                user.is_active = True
                user.is_locked = False # Unlock if activating
                user.failed_login_attempts = 0
            elif action == 'deactivate':
                user.is_active = False
            elif action == 'lock':
                user.is_locked = True
            elif action == 'unlock':
                user.is_locked = False
                user.failed_login_attempts = 0 # Reset attempts on unlock
            user.save()
        
        messages.success(request, f"Selected accounts {action}d successfully.")
        return JsonResponse({'status': 'success', 'message': f"Accounts {action}d successfully."})
    else:
        errors = form.errors.as_json()
        return JsonResponse({'status': 'error', 'message': 'Error updating account status.', 'errors': json.loads(errors)}, status=400)

@login_required
@user_passes_test(is_admin)
@require_POST
def reset_password(request):
    form = AdminPasswordResetForm(request.POST)
    if form.is_valid():
        user_id = form.cleaned_data['user_id']
        new_password = form.cleaned_data['new_password1']
        
        user = get_object_or_404(User, pk=user_id)
        user.set_password(new_password)
        user.must_change_password = True # Enforce password change on next login
        user.last_password_change = timezone.now()
        user.save()
        messages.success(request, f"Password for {user.username} reset successfully. User must change password on next login.")
        return JsonResponse({'status': 'success', 'message': 'Password reset successfully.'})
    else:
        errors = form.errors.as_json()
        return JsonResponse({'status': 'error', 'message': 'Error resetting password.', 'errors': json.loads(errors)}, status=400)

@login_required
@user_passes_test(is_admin)
@require_POST
def delete_user(request):
    user_ids = request.POST.getlist('user_ids[]')
    if not user_ids:
        return JsonResponse({'status': 'error', 'message': 'No users selected for deletion.'}, status=400)

    # Prevent deleting the currently logged-in admin
    if str(request.user.id) in user_ids:
        return JsonResponse({'status': 'error', 'message': 'Cannot delete your own account.'}, status=400)

    users_to_delete = User.objects.filter(pk__in=user_ids)
    deleted_count, _ = users_to_delete.delete()
    messages.success(request, f"{deleted_count} user(s) deleted successfully.")
    return JsonResponse({'status': 'success', 'message': f"{deleted_count} user(s) deleted successfully."})

# Placeholder for password change view if must_change_password is true
@login_required
def password_change(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            # Save the new password first
            updated_user = form.save()
            # Update session hash so the user stays logged in
            update_session_auth_hash(request, updated_user)
            # Explicitly clear the first-login flag
            user = request.user
            user.must_change_password = False
            user.last_password_change = timezone.now()
            user.save()
            messages.success(request, 'Password updated successfully. Welcome back!')
            if user.role == 'ADMIN':
                return redirect('admin_dashboard')
            return redirect('employee_dashboard')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'accounts/password_change.html', {'form': form})

@login_required
@user_passes_test(is_admin)
def department_management(request):
    departments = Department.objects.all().annotate(employee_count=Count('user')).order_by('name')
    users = User.objects.filter(is_active=True).order_by('last_name')
    
    context = {
        'departments': departments,
        'users': users,
    }
    return render(request, 'admin/department_management.html', context)

@login_required
@user_passes_test(is_admin)
@require_POST
def create_department(request):
    form = DepartmentForm(request.POST)
    if form.is_valid():
        form.save()
        return JsonResponse({'status': 'success', 'message': 'Department created successfully.'})
    return JsonResponse({'status': 'error', 'errors': json.loads(form.errors.as_json())}, status=400)

@login_required
@user_passes_test(is_admin)
@require_POST
def edit_department(request, dept_id):
    dept = get_object_or_404(Department, pk=dept_id)
    form = DepartmentForm(request.POST, instance=dept)
    if form.is_valid():
        form.save()
        return JsonResponse({'status': 'success', 'message': 'Department updated successfully.'})
    return JsonResponse({'status': 'error', 'errors': json.loads(form.errors.as_json())}, status=400)

@login_required
@user_passes_test(is_admin)
def get_department_data(request, dept_id):
    dept = get_object_or_404(Department, pk=dept_id)
    return JsonResponse({
        'name': dept.name,
        'college': dept.college,
        'head_id': dept.head.id if dept.head else None,
        'is_active': dept.is_active
    })

@login_required
@user_passes_test(is_admin)
@require_POST
def deactivate_department(request, dept_id):
    dept = get_object_or_404(Department, pk=dept_id)
    dept.is_active = False
    dept.save()
    return JsonResponse({'status': 'success', 'message': 'Department deactivated successfully.'})