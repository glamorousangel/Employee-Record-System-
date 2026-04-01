from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    # Your existing custom fields (role, profile_pic, etc.)
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('HR', 'HR Staff'),
        ('HEAD', 'Department Head'),
        ('EMP', 'Employee'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='EMP')
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    # ADD THESE TWO BLOCKS TO FIX THE ERROR:
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