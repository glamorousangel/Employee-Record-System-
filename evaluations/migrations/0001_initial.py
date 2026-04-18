from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='EvaluationRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('evaluation_period', models.CharField(max_length=100)),
                ('period_start', models.DateField(blank=True, null=True)),
                ('period_end', models.DateField(blank=True, null=True)),
                ('score', models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ('rating', models.CharField(blank=True, max_length=50)),
                ('status', models.CharField(choices=[('DRAFT', 'Draft'), ('COMPLETED', 'Completed')], default='DRAFT', max_length=20)),
                ('remarks', models.TextField(blank=True)),
                ('evaluated_at', models.DateField(default=django.utils.timezone.now)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evaluation_records', to=settings.AUTH_USER_MODEL)),
                ('evaluated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='submitted_evaluations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-evaluated_at', '-created_at'],
            },
        ),
    ]
