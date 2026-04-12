/* =================================
   Admin Dashboard JavaScript
   ================================= */

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    const dashboardData = getDashboardData();

    // Initialize charts
    initializeLoginChart(dashboardData.login_chart_data || {});
    initializeRoleChart(dashboardData.role_summary || []);
    
    // Add event listeners
    addEventListeners();
}

function getDashboardData() {
    const dataElement = document.getElementById('adminDashboardData');
    if (!dataElement) {
        return {};
    }

    try {
        return JSON.parse(dataElement.textContent || '{}');
    } catch (error) {
        console.warn('Invalid admin dashboard payload', error);
        return {};
    }
}

// Initialize Login Activity Chart
function initializeLoginChart(loginChartData) {
    const ctx = document.getElementById('loginChart');
    if (!ctx) return;

    const labels = loginChartData.labels || [];
    const successData = loginChartData.success || [];
    const failedData = loginChartData.failed || [];

    if (!labels.length) {
        return;
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Successful Logins',
                data: successData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.35,
                borderWidth: 2,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            },
            {
                label: 'Failed Logins',
                data: failedData,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.35,
                borderWidth: 2,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }
        ]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Initialize Role Distribution Chart
function initializeRoleChart(roleSummary) {
    const ctx = document.getElementById('roleChart');
    if (!ctx) return;

    const labels = roleSummary.map((item) => item.label || item.role);
    const values = roleSummary.map((item) => Number(item.count || 0));

    if (!labels.length) {
        return;
    }

    const data = {
        labels: labels,
        datasets: [{
            data: values,
            backgroundColor: [
                '#2563eb',
                '#8b5cf6',
                '#06b6d4',
                '#64748b',
                '#f59e0b'
            ],
            borderColor: '#fff',
            borderWidth: 2
        }]
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function addEventListeners() {
    // Add any additional event listeners for dashboard interactions
    console.log('Dashboard initialized');
}
