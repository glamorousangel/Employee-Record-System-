from django import forms
from .models import Application

class ApplicationActionForm(forms.Form):
    DECISION_CHOICES = (
        ('Approve', 'Approve'),
        ('Reject', 'Reject'),
        ('Forward', 'Forward'),
    )
    decision = forms.ChoiceField(
        choices=DECISION_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    remarks = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
        required=False
    )

class PositionChangeRequestForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = ['target_position', 'target_department', 'applicant_info', 'attached_documents']
