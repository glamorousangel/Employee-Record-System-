let activeRowId = null;

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const handleToggle = () => { if (sidebar) sidebar.classList.toggle('close'); };
    if (closeBtn) closeBtn.addEventListener('click', handleToggle);
    if (logoToggle) logoToggle.addEventListener('click', handleToggle);
});

function openViewModal(rowId) { 
    activeRowId = rowId;
    const row = document.getElementById(rowId);
    const currentStatus = row.querySelector('.status-cell .status-pill').textContent.trim();
    if (currentStatus === "Approved" || currentStatus === "Rejected") {
        showFinalStateInModal(currentStatus);
    } else { resetModal(); }
    document.getElementById('viewModal').style.display = 'flex'; 
}

function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }

function processRequest(status, rowId = null) {
    const targetRowId = rowId || activeRowId;
    const row = document.getElementById(targetRowId);
    showFinalStateInModal(status);
    if (row) {
        const statusCell = row.querySelector('.status-cell');
        const reviewerCell = row.querySelector('.reviewer-cell');
        const decisionGroup = row.querySelector('.decision-group');
        
        // High Contrast updates with Icons
        if (status === 'Approved') {
            statusCell.innerHTML = `<span class="status-pill approved"><i class="fas fa-check-circle"></i> Approved</span>`;
            decisionGroup.innerHTML = `<button class="reject-link" onclick="processRequest('Rejected', '${targetRowId}')">Reject</button>`;
        } else {
            statusCell.innerHTML = `<span class="status-pill rejected"><i class="fas fa-times-circle"></i> Rejected</span>`;
            decisionGroup.innerHTML = `<button class="approve-link" onclick="processRequest('Approved', '${targetRowId}')">Approve</button>`;
        }
        reviewerCell.innerText = "Juan Dela Cruz";
    }
}

function showFinalStateInModal(status) {
    const label = document.getElementById('modalStatusLabel');
    const banner = document.getElementById('decisionBanner');
    const pill = document.getElementById('decisionPill');
    label.className = `status-pill ${status.toLowerCase()}`;
    
    // Icon integration from Image D0DCB3
    if (status === 'Approved') {
        label.innerHTML = `<i class="fas fa-check-circle"></i> Approved`;
        pill.className = `banner-pill approved-banner`;
    } else {
        label.innerHTML = `<i class="fas fa-times-circle"></i> Rejected`;
        pill.className = `banner-pill rejected-banner`;
    }
    document.getElementById('reviewerDetails').innerHTML = `<small>Reviewed by: Juan Dela Cruz</small><br><small>Date Reviewed: April 03, 2026</small>`;
    pill.innerText = status;
    document.getElementById('modalActions').style.display = 'none';
    banner.style.display = 'block';
}

function resetModal() {
    document.getElementById('modalActions').style.display = 'flex';
    document.getElementById('decisionBanner').style.display = 'none';
    const label = document.getElementById('modalStatusLabel');
    label.className = 'status-pill pending';
    label.innerHTML = '<i class="fas fa-exclamation-circle"></i> Pending';
    document.getElementById('reviewerDetails').innerHTML = `<small>Reviewed by: ---</small><br><small>Date Reviewed: ---</small>`;
}