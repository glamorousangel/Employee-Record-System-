/* hr_leaverequest.js */
let currentLeaveId = null;

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');
    const searchInput = document.getElementById('tableSearch');
    const rows = document.querySelectorAll('.leave-row');

    // Sidebar Tooltips Initialization
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.textContent.trim());
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    function filterTable() {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const showHistory = tabHistory && tabHistory.classList.contains('active');

        rows.forEach(row => {
            const status = row.getAttribute('data-status') || '';
            const searchData = row.getAttribute('data-search') || '';
            
            const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
            const isPending = normalizedStatus.includes('PENDING_HR');
            
            let tabMatch = false;
            if (showHistory) {
                tabMatch = !isPending;
            } else {
                tabMatch = isPending;
            }

            const searchMatch = searchData.includes(query);

            if (tabMatch && searchMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    if (tabRequests) {
        tabRequests.addEventListener('click', () => {
            tabRequests.classList.add('active');
            if (tabHistory) tabHistory.classList.remove('active');
            filterTable();
        });
    }

    if (tabHistory) {
        tabHistory.addEventListener('click', () => {
            tabHistory.classList.add('active');
            if (tabRequests) tabRequests.classList.remove('active');
            filterTable();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterTable);
    }

    filterTable();
});

window.openHRModal = function(id, status, statusDisplay, dateFiled, submitTime, reason, remarks, fileName, reviewer, leaveType, numDays, applicantId, currentUserId, applicantRole) {
    currentLeaveId = id;
    
    // Safely normalize variables to prevent "undefined" === "undefined" bugs and formatting mismatches
    const safeApplicantId = String(applicantId || '').trim();
    const safeCurrentUserId = String(currentUserId || '').trim();
    const safeStatus = String(status || '').toUpperCase().replace(/\s+/g, '_');
    const safeRole = String(applicantRole || '').toUpperCase().trim();

    const isOwnRequest = (safeApplicantId !== '' && safeApplicantId === safeCurrentUserId);
    const isSDRequest = (safeRole === "SD" || safeRole === "SCHOOL DIRECTOR");
    
    // Check if the status is pending HR approval, matching raw DB or display strings robustly
    // Enforce strict workflow: HR can only action requests that are 'PENDING_HR'
    const safeStatusDisplay = String(statusDisplay || '').toUpperCase().replace(/\s+/g, '_');
    const isActionable = safeStatus.includes('PENDING_HR') || safeStatusDisplay.includes('PENDING_HR');

    document.getElementById('modalFileName').innerText = fileName || 'No Document Attached';
    document.getElementById('modalSubmitDate').innerText = `${dateFiled} at ${submitTime}`;
    document.getElementById('modalReason').innerText = reason || '---';
    document.getElementById('modalRemarks').innerText = remarks || '---';
    
    const reviewerText = document.getElementById('modalReviewerText');
    if (reviewer && reviewer.trim() !== '') {
        reviewerText.innerHTML = `<small>Reviewed by: ${reviewer}</small>`;
    } else {
        reviewerText.innerHTML = `<small>Reviewed by: ---</small>`;
    }

    let statusClass = statusDisplay.toLowerCase().replace(/\s+/g, '-');
    if (statusClass.includes('pending')) statusClass = 'pending';
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${statusDisplay}</span>`;

    const creditsBlock = document.getElementById('creditsBlock');
    if (leaveType === "Sick Leave") {
        creditsBlock.style.display = "block";
        const remaining = 15 - parseFloat(numDays);
        document.getElementById('modalCredits').innerText = `${remaining} Days Remaining`;
    } else {
        creditsBlock.style.display = "none";
    }

    // --- BUTTON TOGGLE LOGIC (Copied from Head side) ---
    const actions = document.getElementById('modalActions');
    if (actions) {
        actions.style.display = "flex"; // Ensure container is visible for the Close button
        
        let acceptBtn = document.getElementById('hrAcceptBtn') || actions.querySelector('.btn-approve');
        let rejectBtn = document.getElementById('hrRejectBtn') || actions.querySelector('.btn-reject');
        
        if (!acceptBtn) {
            actions.insertAdjacentHTML('afterbegin', `
                <button type="button" id="hrAcceptBtn" class="btn btn-success btn-approve" style="margin-left: 10px; background-color: #28a745; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Accept</button>
                <button type="button" id="hrRejectBtn" class="btn btn-danger btn-reject" style="margin-left: 10px; background-color: #dc3545; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Reject</button>
            `);
            acceptBtn = document.getElementById('hrAcceptBtn');
            rejectBtn = document.getElementById('hrRejectBtn');
        }

        // Force prevent default HTML behaviors and assign click cleanly
        acceptBtn.onclick = (e) => { e.preventDefault(); processRequest('APPROVE'); };
        rejectBtn.onclick = (e) => { e.preventDefault(); processRequest('REJECT'); };

        if (isActionable && !isOwnRequest && !isSDRequest) {
            acceptBtn.style.setProperty('display', 'inline-block', 'important');
            rejectBtn.style.setProperty('display', 'inline-block', 'important');
        } else {
            acceptBtn.style.setProperty('display', 'none', 'important');
            rejectBtn.style.setProperty('display', 'none', 'important');
        }
    }

    document.getElementById('viewModal').style.display = 'flex';
}

window.processRequest = function(decision) {
    if (!currentLeaveId) return;

    let actionStr = decision.trim().toUpperCase(); 

    let csrfToken = '';
    const csrfTokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (csrfTokenInput && csrfTokenInput.value) {
        csrfToken = csrfTokenInput.value;
    } else {
        const name = 'csrftoken';
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    csrfToken = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
    }

    if (!csrfToken) {
        console.error("CSRF token not found.");
        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Security Error', text: 'CSRF token missing.', confirmButtonColor: '#4a1d1d' });
        return;
    }

    const executeFetch = (remarks) => {
        const acceptBtn = document.querySelector('.btn-approve');
        const rejectBtn = document.querySelector('.btn-reject');
        if (acceptBtn) acceptBtn.disabled = true;
        if (rejectBtn) rejectBtn.disabled = true;

        const modal = document.getElementById('viewModal');
        let approveUrl = modal.getAttribute('data-approve-url').replace('0', currentLeaveId);
        
        fetch(approveUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                action: actionStr === 'APPROVE' ? 'Approve' : 'Reject',
                remarks: remarks
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Success!', `Request has been ${actionStr === 'APPROVE' ? 'approved' : 'rejected'}.`, 'success').then(() => {
                        window.location.reload();
                    });
                } else {
                    alert(`Success! Request has been ${actionStr === 'APPROVE' ? 'approved' : 'rejected'}.`);
                    window.location.reload();
                }
            } else {
                const errorMsg = data.error || 'Failed to process request.';
                if (typeof Swal !== 'undefined') Swal.fire('Error', errorMsg, 'error');
                else alert('Error: ' + errorMsg);
                
                if (acceptBtn) acceptBtn.disabled = false;
                if (rejectBtn) rejectBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            if (typeof Swal !== 'undefined') Swal.fire('Error', 'A network error occurred.', 'error');
            else alert('A network error occurred.');
            
            if (acceptBtn) acceptBtn.disabled = false;
            if (rejectBtn) rejectBtn.disabled = false;
        });
    };

    // Safe Fallback if SweetAlert library fails to load
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: `Confirm ${actionStr === 'APPROVE' ? 'Approval' : 'Rejection'}`,
            input: 'textarea',
            inputLabel: 'Review Remarks (Optional)',
            inputPlaceholder: 'Type your remarks here...',
            showCancelButton: true,
            confirmButtonColor: actionStr === 'APPROVE' ? '#28a745' : '#dc3545',
            confirmButtonText: 'Submit Decision'
        }).then((result) => {
            if (result.isConfirmed) {
                executeFetch(result.value || "Processed by HR via Dashboard");
            }
        });
    } else {
        const userRemarks = prompt(`Confirm ${actionStr === 'APPROVE' ? 'Approval' : 'Rejection'}\n\nReview Remarks (Optional):`, 'Processed by HR via Dashboard');
        if (userRemarks !== null) {
            executeFetch(userRemarks);
        }
    }
};

window.closeViewModal = function() {
    document.getElementById('viewModal').style.display = 'none';
};