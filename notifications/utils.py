import logging
from .models import Notification, NotificationPreference

logger = logging.getLogger(__name__)

def send_notification(user, message, notification_type):
    # Mapping notification types to their preference field names
    type_to_preference_map = {
        'Leave Update': 'receive_leave_updates',
        'Pending Approval': 'receive_approvals',
        'Evaluation Reminder': 'receive_evaluation_reminders',
        'System Announcement': 'receive_system_announcements',
    }

    # Ensure the provided notification_type is valid
    if notification_type not in type_to_preference_map:
        logger.error(f"Failed to send notification: Invalid type '{notification_type}'")
        return

    try:
        # Get or create the user's notification preferences
        preference, _ = NotificationPreference.objects.get_or_create(user=user)

        # Check the user's preference for this specific notification type
        preference_field = type_to_preference_map[notification_type]
        should_send = getattr(preference, preference_field, True)

        # Only create the notification if the user has not toggled it to False
        if should_send:
            Notification.objects.create(
                user=user,
                message=message,
                notification_type=notification_type
            )
    except Exception as e:
        # Log the error but don't crash the main process
        logger.error(f"Error creating notification for user {user.id}: {str(e)}")
