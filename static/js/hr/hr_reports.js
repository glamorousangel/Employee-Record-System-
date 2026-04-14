document.addEventListener('DOMContentLoaded', function () {
    setupSidebar();
    setupReportForm();
});

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

    if (!form || !pdfButton || !excelButton) {
        return;
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
