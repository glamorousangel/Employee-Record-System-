from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    # Your existing custom fields (role, profile_pic, etc.)
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('HR', 'HR Staff'),
        ('HEAD', 'Department Head'),
        ('EMP', 'Employee'), 
        ('SD', 'Software Developer'), # Added 'SD' role
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='EMP')
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    # New fields for account management
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True) # Added department FK
    is_locked = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    must_change_password = models.BooleanField(default=True) # Enforce password change on first login
    last_password_change = models.DateTimeField(null=True, blank=True)
    groups = models.ManyToManyField(
        Group,
        related_name="accounts_user_groups",  # Unique name
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="accounts_user_permissions",  # Unique name
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    def save(self, *args, **kwargs):
        if not self.pk: # Only on creation
            self.last_password_change = timezone.now()
        super().save(*args, **kwargs)

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    college = models.CharField(max_length=100, null=True, blank=True)
    head = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_department')
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return self.name