from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_alter_department_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReportExportHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(blank=True, max_length=10)),
                ('report_type', models.CharField(max_length=100)),
                ('export_format', models.CharField(choices=[('PDF', 'PDF'), ('EXCEL', 'Excel')], max_length=10)),
                ('scope', models.CharField(default='Institution-wide', max_length=100)),
                ('filters', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('exported_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='report_exports', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
