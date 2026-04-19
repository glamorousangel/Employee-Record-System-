from .models import ActivityLog

def log_activity(actor, action, target_user=None, details="", ip_address=None):
    # This creates the variable so Pylance stops yelling
    safe_ip = ip_address if ip_address else "0.0.0.0"

    ActivityLog.objects.create(
        actor=actor,
        action=action,
        target_user=target_user,
        details=details,
        ip_address=safe_ip  # Now it knows what safe_ip is!
    )