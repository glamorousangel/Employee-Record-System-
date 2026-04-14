from __future__ import annotations

from datetime import date, datetime, time
from io import BytesIO
from typing import Any, Iterable, Mapping, Sequence

from openpyxl import Workbook
from openpyxl.styles import Font

SUPPORTED_REPORT_TYPES = {
	"employee list": "Employee List",
	"attendance report": "Attendance Report",
	"leave report": "Leave Report",
	"evaluation summary": "Evaluation Summary",
}

REPORT_COLUMN_CANDIDATES = {
	"Employee List": [
		{"header": "Employee ID", "candidates": ["employee_id", "profile__employee_id"]},
		{
			"header": "Employee Name",
			"candidates": [
				"get_full_name",
				"user__get_full_name",
				"full_name",
				"username",
				"user__username",
			],
		},
		{"header": "Department", "candidates": ["department__name", "user__department__name", "department"]},
		{"header": "Employment Type", "candidates": ["employment_type", "profile__employment_type"]},
		{"header": "Date Hired", "candidates": ["date_hired", "profile__date_hired"]},
		{"header": "Status", "candidates": ["is_active", "profile__is_active", "status"]},
	],
	"Attendance Report": [
		{"header": "Employee", "candidates": ["employee__get_full_name", "employee__username", "employee"]},
		{"header": "Date", "candidates": ["date"]},
		{"header": "Time In", "candidates": ["time_in"]},
		{"header": "Time Out", "candidates": ["time_out"]},
		{"header": "Status", "candidates": ["status"]},
	],
	"Leave Report": [
		{"header": "Employee", "candidates": ["user__get_full_name", "user__username", "user"]},
		{"header": "Leave Type", "candidates": ["leave_type__name", "leave_type"]},
		{"header": "Start Date", "candidates": ["start_date"]},
		{"header": "End Date", "candidates": ["end_date"]},
		{"header": "Days Requested", "candidates": ["days_requested"]},
		{"header": "Status", "candidates": ["status"]},
		{"header": "Submitted On", "candidates": ["created_at"]},
	],
	"Evaluation Summary": [
		{
			"header": "Employee",
			"candidates": ["employee__get_full_name", "user__get_full_name", "employee", "user"],
		},
		{"header": "Evaluation Period", "candidates": ["evaluation_period", "period", "cycle", "year"]},
		{"header": "Score", "candidates": ["score", "total_score", "overall_score"]},
		{"header": "Rating", "candidates": ["rating", "final_rating"]},
		{"header": "Status", "candidates": ["status"]},
		{"header": "Evaluated On", "candidates": ["evaluated_at", "date", "created_at"]},
	],
}


def _normalize_report_type(report_type: str) -> str:
	normalized_key = " ".join(str(report_type or "").split()).strip().lower()
	if normalized_key in SUPPORTED_REPORT_TYPES:
		return SUPPORTED_REPORT_TYPES[normalized_key]
	raise ValueError(
		f"Unsupported report type: {report_type}. "
		f"Supported types are: {', '.join(SUPPORTED_REPORT_TYPES.values())}."
	)


def _get_queryset_model(queryset: Any) -> Any | None:
	return getattr(queryset, "model", None)


def _get_sample_row(queryset: Any) -> Any | None:
	if hasattr(queryset, "first") and callable(queryset.first):
		return queryset.first()
	if isinstance(queryset, Sequence):
		return queryset[0] if queryset else None
	return None


def _path_supported_by_model(model: Any, path: str) -> bool:
	if not model or not hasattr(model, "_meta"):
		return False

	current_model = model
	for part in path.split("__"):
		if not hasattr(current_model, "_meta"):
			return False
		try:
			field = current_model._meta.get_field(part)
		except Exception:
			return False
		if getattr(field, "is_relation", False) and getattr(field, "related_model", None):
			current_model = field.related_model
		else:
			current_model = None
	return True


def _resolve_attr(obj: Any, path: str) -> Any:
	current = obj
	for part in path.split("__"):
		if current is None:
			return None
		if isinstance(current, Mapping):
			current = current.get(part)
		else:
			current = getattr(current, part, None)
		if callable(current):
			try:
				current = current()
			except TypeError:
				return None
	return current


def _path_supported_by_sample(sample: Any, path: str) -> bool:
	if sample is None:
		return False
	return _resolve_attr(sample, path) is not None


def _pick_column_path(candidates: list[str], model: Any | None, sample: Any | None) -> str:
	for candidate in candidates:
		if _path_supported_by_model(model, candidate) or _path_supported_by_sample(sample, candidate):
			return candidate
	return candidates[0]


def _fallback_columns(model: Any | None) -> list[dict[str, str]]:
	if model is None or not hasattr(model, "_meta"):
		return [{"header": "Record", "path": "__str__"}]

	columns: list[dict[str, str]] = []
	for field in model._meta.fields:
		columns.append({"header": field.verbose_name.title(), "path": field.name})
	return columns[:10]


def _resolve_columns(report_type: str, queryset: Any) -> list[dict[str, str]]:
	model = _get_queryset_model(queryset)
	sample = _get_sample_row(queryset)
	definitions = REPORT_COLUMN_CANDIDATES.get(report_type, [])

	columns: list[dict[str, str]] = []
	for definition in definitions:
		path = _pick_column_path(definition["candidates"], model, sample)
		columns.append({"header": definition["header"], "path": path})

	return columns or _fallback_columns(model)


def _format_value(record: Any, path: str, value: Any) -> Any:
	if path == "__str__":
		return str(record)

	if value is None:
		return ""

	if "status" in path:
		display_method_name = f"get_{path.split('__')[-1]}_display"
		display_method = getattr(record, display_method_name, None)
		if callable(display_method):
			return display_method()

	if isinstance(value, datetime):
		return value.strftime("%Y-%m-%d %H:%M:%S")
	if isinstance(value, date):
		return value.strftime("%Y-%m-%d")
	if isinstance(value, time):
		return value.strftime("%H:%M:%S")
	if isinstance(value, bool):
		return "Active" if value else "Inactive"

	return value


def _iter_records(queryset: Any) -> Iterable[Any]:
	return queryset if queryset is not None else []


def _auto_fit_columns(worksheet: Any) -> None:
	for column_cells in worksheet.columns:
		max_length = 0
		column_letter = column_cells[0].column_letter
		for cell in column_cells:
			cell_length = len(str(cell.value or ""))
			if cell_length > max_length:
				max_length = cell_length
		worksheet.column_dimensions[column_letter].width = min(max_length + 2, 60)


def generate_excel(report_type: str, queryset: Any, filters: Mapping[str, Any] | None = None) -> BytesIO:
	"""Generate an Excel report and return a response-ready byte buffer."""
	canonical_report_type = _normalize_report_type(report_type)
	columns = _resolve_columns(canonical_report_type, queryset)
	_ = filters or {}

	workbook = Workbook()
	worksheet = workbook.active
	worksheet.title = canonical_report_type[:31]

	headers = [column["header"] for column in columns]
	worksheet.append(headers)
	for cell in worksheet[1]:
		cell.font = Font(bold=True)

	for record in _iter_records(queryset):
		row = []
		for column in columns:
			raw_value = _resolve_attr(record, column["path"])
			row.append(_format_value(record, column["path"], raw_value))
		worksheet.append(row)

	_auto_fit_columns(worksheet)

	output_buffer = BytesIO()
	workbook.save(output_buffer)
	output_buffer.seek(0)
	return output_buffer
