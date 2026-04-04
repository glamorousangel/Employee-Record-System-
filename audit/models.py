from django.db import models
from django.conf import settings

class LoginLog(models.Model):
    # Foreign Key to your custom accounts.User
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    username = models.CharField(max_length=150)
    ip_address = models.GenericIPAddressField()
    datetime = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20) # Success/Failed

    def __str__(self):
        return f"{self.username} - {self.status}"

class ActivityLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    module = models.CharField(max_length=100)
    details = models.TextField()
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)