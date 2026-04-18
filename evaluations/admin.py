from django.contrib import admin
from .models import EvaluationRecord


@admin.register(EvaluationRecord)
class EvaluationRecordAdmin(admin.ModelAdmin):
	list_display = ('employee', 'evaluation_period', 'score', 'rating', 'status', 'evaluated_at')
	list_filter = ('status', 'evaluated_at')
	search_fields = ('employee__username', 'employee__first_name', 'employee__last_name', 'evaluation_period')
