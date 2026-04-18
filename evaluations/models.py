from django.conf import settings
from django.db import models
from django.utils import timezone


class EvaluationRecord(models.Model):
	class Status(models.TextChoices):
		DRAFT = 'DRAFT', 'Draft'
		COMPLETED = 'COMPLETED', 'Completed'

	employee = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='evaluation_records',
	)
	evaluated_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='submitted_evaluations',
	)
	evaluation_period = models.CharField(max_length=100)
	period_start = models.DateField(null=True, blank=True)
	period_end = models.DateField(null=True, blank=True)
	score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
	rating = models.CharField(max_length=50, blank=True)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
	remarks = models.TextField(blank=True)
	evaluated_at = models.DateField(default=timezone.now)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-evaluated_at', '-created_at']

	def __str__(self):
		return f"{self.employee.get_full_name()} - {self.evaluation_period}"
