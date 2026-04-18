from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Department, EmployeeProfile, ReportExportHistory # 

# This allows you to edit Profile fields (like can_self_upload) 
# directly on the User admin page.
class EmployeeProfileInline(admin.StackedInline):
    model = EmployeeProfile
    can_delete = False
    verbose_name_plural = 'Employee Profile Settings'
    fields = ('employee_id', 'employment_type', 'can_self_upload', 'is_active')

class CustomUserAdmin(UserAdmin):
    model = User
    inlines = (EmployeeProfileInline, ) # Attach the profile to the User admin
    
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Role & Security', {'fields': (
            'role', 
            'department', 
            'profile_pic', 
            'is_locked', 
            'failed_login_attempts', 
            'must_change_password', 
            'last_password_change'
        )}),
    )
    list_display = ['username', 'last_name', 'first_name', 'role', 'department', 'is_locked']
    list_filter = ['role', 'department', 'is_locked', 'is_staff']

# Registering models
admin.site.register(User, CustomUserAdmin)
admin.site.register(Department)
# Optionally register it separately if you want a dedicated list view
admin.site.register(EmployeeProfile)


@admin.register(ReportExportHistory)
class ReportExportHistoryAdmin(admin.ModelAdmin):
    list_display = ('report_type', 'export_format', 'scope', 'role', 'exported_by', 'created_at')
    list_filter = ('export_format', 'role', 'created_at')
    search_fields = ('report_type', 'scope', 'exported_by__username', 'exported_by__first_name', 'exported_by__last_name')