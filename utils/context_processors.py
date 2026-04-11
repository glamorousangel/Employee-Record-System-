from notifications.models import Notification

def notification_context(request):
    if request.user.is_authenticated:
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        recent_notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:5]
        return {
            'global_unread_count': unread_count,
            'global_recent_notifications': recent_notifications
        }
    return {
        'global_unread_count': 0,
        'global_recent_notifications': []
    }
