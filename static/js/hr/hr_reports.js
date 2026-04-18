document.addEventListener('DOMContentLoaded', function () {
    setupSidebar();
    setupReportForm();
});

const STATUS_OPTIONS_BY_REPORT = {
    'Employee List': [
        { value: '', label: 'All Statuses' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'ON_LEAVE', label: 'On Leave' }
    ],
    'Attendance Report': [
        { value: '', label: 'All Statuses' },
        { value: 'PRESENT', label: 'Present' },
        { value: 'ABSENT', label: 'Absent' },
        { value: 'LATE', label: 'Late' },
        { value: 'UNDERTIME', label: 'Undertime' }
    ],
    'Leave Report': [
        { value: '', label: 'All Statuses' },
        { value: 'PENDING_HEAD', label: 'Pending Head Approval' },
        { value: 'PENDING_HR', label: 'Pending HR Approval' },
        { value: 'PENDING_SD', label: 'Pending SD Approval' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ],
    'Evaluation Summary': [
        { value: '', label: 'All Statuses' },
        { value: 'DRAFT', label: 'Draft' },
        { value: 'COMPLETED', label: 'Completed' }
    ]
};

function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const logoToggle = document.getElementById('logoToggle');
    const closeBtn = document.getElementById('closeBtn');
    const menuItems = document.querySelectorAll('.menu-item');
    const comingSoonLinks = document.querySelectorAll('.coming-soon-link');

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

    comingSoonLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
        });
    });
}

function setupReportForm() {
    const form = document.getElementById('reportGeneratorForm');
    const pdfButton = document.getElementById('exportPdfBtn');
    const excelButton = document.getElementById('exportExcelBtn');
    const reportTypeInput = form ? form.elements.report_type : null;
    const statusInput = form ? form.elements.status : null;

    if (!form || !pdfButton || !excelButton) {
        return;
    }

    if (reportTypeInput && statusInput) {
        syncStatusOptions(reportTypeInput, statusInput);
        reportTypeInput.addEventListener('change', function () {
            syncStatusOptions(reportTypeInput, statusInput);
        });
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
    });

    pdfButton.addEventListener('click', function () {
        submitExport(form, 'pdf');
    });

    excelButton.addEventListener('click', function () {
        submitExport(form, 'excel');
    });
}

function syncStatusOptions(reportTypeInput, statusInput) {
    const reportType = reportTypeInput ? reportTypeInput.value : '';
    const options = STATUS_OPTIONS_BY_REPORT[reportType] || [{ value: '', label: 'All Statuses' }];
    const currentValue = statusInput.value;

    statusInput.innerHTML = options
        .map(function (option) {
            return '<option value="' + option.value + '">' + option.label + '</option>';
        })
        .join('');

    const hasCurrentOption = options.some(function (option) {
        return option.value === currentValue;
    });
    statusInput.value = hasCurrentOption ? currentValue : '';
}

function submitExport(form, format) {
    const reportType = form.elements.report_type ? form.elements.report_type.value : '';
    const startDate = form.elements.start_date ? form.elements.start_date.value : '';
    const endDate = form.elements.end_date ? form.elements.end_date.value : '';

    if (!reportType) {
        window.alert('Please select a report type.');
        return;
    }

    if (startDate && endDate && startDate > endDate) {
        window.alert('Start Date cannot be after End Date.');
        return;
    }

    const endpoint = format === 'excel' ? form.dataset.excelEndpoint : form.dataset.pdfEndpoint;
    if (!endpoint) {
        window.alert('Export endpoint is not configured.');
        return;
    }

    const params = new URLSearchParams();
    Array.from(form.elements).forEach(function (element) {
        if (!element.name) {
            return;
        }
        const value = (element.value || '').trim();
        if (value) {
            params.append(element.name, value);
        }
    });

    const separator = endpoint.includes('?') ? '&' : '?';
    const targetUrl = params.toString() ? endpoint + separator + params.toString() : endpoint;
    window.location.href = targetUrl;
}
