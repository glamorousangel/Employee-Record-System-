from django.test import TestCase
from django.urls import reverse

from audit.models import LoginLog
from accounts.models import Department, User, ReportExportHistory
from evaluations.models import EvaluationRecord
from notifications.models import Notification


class DashboardIntegrationTests(TestCase):
	def setUp(self):
		self.department = Department.objects.create(name='IT')

	def _create_user(self, username, role, department=None):
		return User.objects.create_user(
			username=username,
			password='pass12345',
			role=role,
			department=department,
			must_change_password=False,
		)

	def _login(self, username, password='pass12345'):
		response = self.client.post(
			reverse('login'),
			{'username': username, 'password': password},
			REMOTE_ADDR='127.0.0.1',
		)
		self.assertIn(response.status_code, [200, 302])

	def test_admin_dashboard_contains_bootstrap_payload_and_dynamic_sections(self):
		admin_user = self._create_user('admin1', 'ADMIN')
		Notification.objects.create(
			user=admin_user,
			message='System check complete',
			notification_type='System Announcement',
		)
		LoginLog.objects.create(
			user=admin_user,
			username=admin_user.username,
			ip_address='127.0.0.1',
			status='Success',
			is_success=True,
		)

		self._login(admin_user.username)
		response = self.client.get(reverse('admin_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, 'adminDashboardData')
		self.assertContains(response, 'FAQ / Help Center')
		self.assertContains(response, reverse('employee_list'))
		self.assertIn('dashboard_payload', response.context)
		self.assertIn('user_account_summary', response.context)

	def test_sd_dashboard_denies_admin_after_policy_hardening(self):
		admin_user = self._create_user('admin2', 'ADMIN')
		self._login(admin_user.username)

		response = self.client.get(reverse('sd_dashboard'))

		self.assertEqual(response.status_code, 302)

	def test_sd_dashboard_includes_shared_chart_dependency(self):
		sd_user = self._create_user('sd1', 'SD')
		self._login(sd_user.username)

		response = self.client.get(reverse('sd_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, "js/charts.js")

	def test_hr_dashboard_clear_notifications_button_has_backend_endpoint(self):
		hr_user = self._create_user('hr1', 'HR')
		self._login(hr_user.username)

		response = self.client.get(reverse('hr_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, reverse('notifications:mark_all_as_read'))

	def test_employee_dashboard_clear_notifications_button_has_backend_endpoint(self):
		emp_user = self._create_user('emp1', 'EMP')
		self._login(emp_user.username)

		response = self.client.get(reverse('employee_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, reverse('notifications:mark_all_as_read'))

	def test_head_dashboard_clear_notifications_button_has_backend_endpoint(self):
		head_user = self._create_user('head1', 'HEAD', department=self.department)
		self._login(head_user.username)

		response = self.client.get(reverse('head_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, reverse('notifications:mark_all_as_read'))

	def test_sd_dashboard_clear_notifications_button_has_backend_endpoint(self):
		sd_user = self._create_user('sd2', 'SD')
		self._login(sd_user.username)

		response = self.client.get(reverse('sd_dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, reverse('notifications:mark_all_as_read'))


class ReportIntegrationTests(TestCase):
	def setUp(self):
		self.department = Department.objects.create(name='IT')
		self.hr_user = User.objects.create_user(
			username='hr_reports',
			password='pass12345',
			role='HR',
			department=self.department,
			must_change_password=False,
		)
		self.sd_user = User.objects.create_user(
			username='sd_reports',
			password='pass12345',
			role='SD',
			must_change_password=False,
		)
		self.employee = User.objects.create_user(
			username='emp_reports',
			password='pass12345',
			role='EMP',
			department=self.department,
			must_change_password=False,
		)

	def _login(self, username, password='pass12345'):
		response = self.client.post(
			reverse('login'),
			{'username': username, 'password': password},
			REMOTE_ADDR='127.0.0.1',
		)
		self.assertIn(response.status_code, [200, 302])

	def test_hr_export_rejects_invalid_status_for_attendance_report(self):
		self._login('hr_reports')

		response = self.client.get(
			reverse('hr_export_excel'),
			{
				'report_type': 'Attendance Report',
				'status': 'ON_LEAVE',
			}
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('Invalid status', response.content.decode('utf-8'))

	def test_hr_evaluation_summary_excel_export_uses_evaluation_records(self):
		EvaluationRecord.objects.create(
			employee=self.employee,
			evaluation_period='Q1 2026',
			score=92,
			rating='Excellent',
			status=EvaluationRecord.Status.COMPLETED,
		)

		self._login('hr_reports')
		response = self.client.get(
			reverse('hr_export_excel'),
			{'report_type': 'Evaluation Summary'}
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(
			response['Content-Type'],
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		)
		self.assertEqual(ReportExportHistory.objects.count(), 1)
		export_log = ReportExportHistory.objects.first()
		self.assertEqual(export_log.report_type, 'Evaluation Summary')
		self.assertEqual(export_log.export_format, ReportExportHistory.ExportFormat.EXCEL)

	def test_sd_summary_api_includes_evaluation_counts_and_recent_reports(self):
		EvaluationRecord.objects.create(
			employee=self.employee,
			evaluation_period='Q1 2026',
			score=88,
			rating='Very Good',
			status=EvaluationRecord.Status.COMPLETED,
		)
		ReportExportHistory.objects.create(
			exported_by=self.hr_user,
			role='HR',
			report_type='Evaluation Summary',
			export_format=ReportExportHistory.ExportFormat.EXCEL,
			scope='HR - IT',
			filters={'department': 'IT'},
		)

		self._login('sd_reports')
		response = self.client.get(reverse('sd_reports_summary'))

		self.assertEqual(response.status_code, 200)
		payload = response.json()
		self.assertEqual(payload['report_counts']['evaluation_summary'], 1)
		self.assertTrue(payload['recent_reports'])
		self.assertEqual(payload['recent_reports'][0]['report_type'], 'Evaluation Summary')
