document.addEventListener('DOMContentLoaded', function () {
    setupSidebar();
    setupExportButtons();
    fetchAndRenderReportSummary();
});

function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const logoToggle = document.getElementById('logoToggle');
    const closeBtn = document.getElementById('closeBtn');
    const menuItems = document.querySelectorAll('.menu-item');

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', function () {
            sidebar.classList.add('collapsed');
        });
    }

    if (logoToggle && sidebar) {
        logoToggle.addEventListener('click', function () {
            if (sidebar.classList.contains('collapsed')) {
                sidebar.classList.remove('collapsed');
            }
        });
    }

    menuItems.forEach(function (item) {
        const label = item.querySelector('span');
        if (label) {
            item.setAttribute('data-text', label.textContent.trim());
        }
    });
}

function setupExportButtons() {
    const buttons = document.querySelectorAll('.export-btn');

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            const reportType = button.dataset.reportType || '';
            const format = button.dataset.format || '';
            triggerExport(reportType, format);
        });
    });
}

async function fetchAndRenderReportSummary() {
    const app = document.getElementById('sdReportsApp');
    if (!app) {
        return;
    }

    const summaryEndpoint = app.dataset.summaryEndpoint;
    if (!summaryEndpoint) {
        applySummaryData(getFallbackSummaryData());
        return;
    }

    try {
        const response = await fetch(summaryEndpoint, {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Summary request failed');
        }

        const data = await response.json();
        applySummaryData(normalizeSummaryData(data));
    } catch (error) {
        applySummaryData(getFallbackSummaryData());
    }
}

function normalizeSummaryData(payload) {
    const totals = payload && payload.totals ? payload.totals : {};
    const counts = payload && payload.report_counts ? payload.report_counts : {};
    const recent = payload && Array.isArray(payload.recent_reports) ? payload.recent_reports : [];

    return {
        totals: {
            totalEmployees: safeNumber(totals.total_employees),
            attendanceLogs: safeNumber(totals.attendance_logs),
            leaveRequests: safeNumber(totals.leave_requests)
        },
        reportCounts: {
            employeeList: safeNumber(counts.employee_list),
            attendanceReport: safeNumber(counts.attendance_report),
            leaveReport: safeNumber(counts.leave_report),
            evaluationSummary: safeNumber(counts.evaluation_summary)
        },
        recentReports: recent.map(function (entry) {
            return {
                generatedOn: entry.generated_on || '-',
                reportType: entry.report_type || '-',
                format: (entry.format || '-').toUpperCase(),
                scope: entry.scope || 'Institution-wide'
            };
        })
    };
}

function getFallbackSummaryData() {
    return {
        totals: {
            totalEmployees: 0,
            attendanceLogs: 0,
            leaveRequests: 0
        },
        reportCounts: {
            employeeList: 0,
            attendanceReport: 0,
            leaveReport: 0,
            evaluationSummary: 0
        },
        recentReports: []
    };
}

function applySummaryData(data) {
    setText('kpiTotalEmployees', data.totals.totalEmployees);
    setText('kpiAttendanceLogs', data.totals.attendanceLogs);
    setText('kpiLeaveRequests', data.totals.leaveRequests);

    setText('countEmployeeList', data.reportCounts.employeeList);
    setText('countAttendanceReport', data.reportCounts.attendanceReport);
    setText('countLeaveReport', data.reportCounts.leaveReport);
    setText('countEvaluationSummary', data.reportCounts.evaluationSummary);

    renderRecentReports(data.recentReports);
}

function renderRecentReports(reports) {
    const tableBody = document.getElementById('recentReportsBody');
    if (!tableBody) {
        return;
    }

    if (!reports.length) {
        tableBody.innerHTML = '<tr><td colspan="4" class="empty-state">No generated reports yet.</td></tr>';
        return;
    }

    tableBody.innerHTML = reports
        .map(function (report) {
            return (
                '<tr>' +
                '<td>' + escapeHtml(report.generatedOn) + '</td>' +
                '<td>' + escapeHtml(report.reportType) + '</td>' +
                '<td>' + escapeHtml(report.format) + '</td>' +
                '<td>' + escapeHtml(report.scope) + '</td>' +
                '</tr>'
            );
        })
        .join('');
}

function triggerExport(reportType, format) {
    const app = document.getElementById('sdReportsApp');
    if (!app) {
        return;
    }

    if (!reportType || !format) {
        window.alert('Invalid export request.');
        return;
    }

    const endpoint = format === 'excel' ? app.dataset.excelEndpoint : app.dataset.pdfEndpoint;
    if (!endpoint) {
        window.alert('Export endpoint is not configured.');
        return;
    }

    const params = new URLSearchParams({
        report_type: reportType,
        scope: 'institution'
    });

    const separator = endpoint.includes('?') ? '&' : '?';
    window.location.href = endpoint + separator + params.toString();
}

function setText(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = String(value);
    }
}

function safeNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
