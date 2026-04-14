from __future__ import annotations

from io import BytesIO
from typing import Any, Mapping

from django.template.loader import render_to_string
from xhtml2pdf import pisa

REPORT_TEMPLATE = "pdf/report_template.html"

SUPPORTED_REPORT_TYPES = {
	"employee list": "Employee List",
	"attendance report": "Attendance Report",
	"leave report": "Leave Report",
	"evaluation summary": "Evaluation Summary",
}


def _normalize_report_type(report_type: str) -> str:
	normalized_key = " ".join(str(report_type or "").split()).strip().lower()
	if normalized_key in SUPPORTED_REPORT_TYPES:
		return SUPPORTED_REPORT_TYPES[normalized_key]
	raise ValueError(
		f"Unsupported report type: {report_type}. "
		f"Supported types are: {', '.join(SUPPORTED_REPORT_TYPES.values())}."
	)


def generate_pdf(report_type: str, queryset: Any, filters: Mapping[str, Any] | None = None) -> BytesIO:
	"""Generate a PDF report and return a response-ready byte buffer."""
	canonical_report_type = _normalize_report_type(report_type)
	safe_filters = filters or {}

	context = {
		"report_type": canonical_report_type,
		"queryset": queryset,
		"filters": safe_filters,
	}

	html_content = render_to_string(REPORT_TEMPLATE, context)
	output_buffer = BytesIO()

	pisa_status = pisa.CreatePDF(html_content, dest=output_buffer)
	if pisa_status.err:
		raise ValueError("Failed to generate PDF using xhtml2pdf.")

	output_buffer.seek(0)
	return output_buffer
