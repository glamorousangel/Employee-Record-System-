from datetime import date, time

from django.test import TestCase
from django.urls import reverse

from accounts.models import Department, ReportExportHistory, User
from attendance.models import AttendanceLog


class HeadAttendanceExportTests(TestCase):
	def setUp(self):
		self.department = Department.objects.create(name='IT')
		self.head_user = User.objects.create_user(
			username='head_attendance',
			password='pass12345',
			role='HEAD',
			department=self.department,
			must_change_password=False,
		)
		self.employee = User.objects.create_user(
			username='employee_attendance',
			password='pass12345',
			role='EMP',
			department=self.department,
			must_change_password=False,
		)
		AttendanceLog.objects.create(
			employee=self.employee,
			date=date(2026, 4, 10),
			time_in=time(8, 5),
			time_out=time(17, 0),
			status=AttendanceLog.Status.LATE,
		)

	def _login(self, username, password='pass12345'):
		response = self.client.post(
			reverse('login'),
			{'username': username, 'password': password},
			REMOTE_ADDR='127.0.0.1',
		)
		self.assertIn(response.status_code, [200, 302])

	def test_head_export_excel_creates_department_scoped_report_history(self):
		self._login('head_attendance')

		response = self.client.get(reverse('attendance:head_export_attendance_excel'))

		self.assertEqual(response.status_code, 200)
		self.assertEqual(
			response['Content-Type'],
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		)

		export_log = ReportExportHistory.objects.first()
		self.assertIsNotNone(export_log)
		self.assertEqual(export_log.report_type, 'Attendance Report')
		self.assertEqual(export_log.export_format, ReportExportHistory.ExportFormat.EXCEL)
		self.assertIn('Department:', export_log.scope)
