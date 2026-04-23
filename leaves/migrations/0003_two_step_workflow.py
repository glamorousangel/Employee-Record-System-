# Generated migration for 2-step leave approval workflow

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leaves', '0002_sd_final_approval_fields'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Add explicit status fields for HR and SD workflow stages
        migrations.AddField(
            model_name='leaverequest',
            name='hr_status',
            field=models.CharField(
                choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')],
                default='PENDING',
                help_text="HR's decision on the leave request.",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='leaverequest',
            name='sd_status',
            field=models.CharField(
                choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')],
                default='PENDING',
                help_text="SD's decision on the leave request.",
                max_length=20,
            ),
        ),
        # Add timestamp fields for tracking when reviews happened
        migrations.AddField(
            model_name='leaverequest',
            name='hr_reviewed_at',
            field=models.DateTimeField(
                blank=True,
                help_text='Timestamp when HR reviewed.',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='leaverequest',
            name='sd_reviewed_at',
            field=models.DateTimeField(
                blank=True,
                help_text='Timestamp when SD reviewed.',
                null=True,
            ),
        ),
        # Update the main status field default to PENDING_HR (first step in 2-step workflow)
        migrations.AlterField(
            model_name='leaverequest',
            name='status',
            field=models.CharField(
                choices=[
                    ('PENDING_HR', 'Pending HR Approval'),
                    ('PENDING_SD', 'Pending SD Approval (HR Approved)'),
                    ('APPROVED', 'Fully Approved'),
                    ('REJECTED', 'Rejected'),
                    ('CANCELLED', 'Cancelled'),
                ],
                default='PENDING_HR',
                max_length=20,
            ),
        ),
    ]
