from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # We use 'pass' as a placeholder while the import is commented out
        import audit.signals
        pass