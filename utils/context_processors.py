import random
from notifications.models import Notification

QUOTES = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Act as if what you do makes a difference. It does. - William James",
    "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
]

def notification_context(request):
    context = {
        'global_unread_count': 0,
        'global_recent_notifications': [],
        'unread_notifications_count': 0,
        'unread_notifications': [],
        'global_user_role': None,
        'global_quote': random.choice(QUOTES)
    }
    
    if request.user.is_authenticated:
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        recent_notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:5]
        
        context['global_unread_count'] = unread_count
        context['global_recent_notifications'] = recent_notifications
        context['unread_notifications_count'] = unread_count
        context['unread_notifications'] = recent_notifications
        
        # Determine the user's role display name
        role = getattr(request.user, 'role', None)
        if hasattr(request.user, 'get_role_display') and request.user.get_role_display():
            role_display = request.user.get_role_display()
        else:
            role_display = role
            
        context['global_user_role'] = role_display
        
    return context
