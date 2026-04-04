from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.dispatch import receiver
from audit.models import LoginLog

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    LoginLog.objects.create(
        user=user,
        username=user.username,
        ip_address=get_client_ip(request),
        status='Success'
    )

@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    LoginLog.objects.create(
        username=credentials.get('username', 'Unknown'),
        ip_address=get_client_ip(request),
        status='Failed'
    )