/* head_leaverequest.js */
let activeRowId = null; 

let headSampleData = []; // Will be populated dynamically from the database
let currentUserId = null;

document.addEventListener('DOMContentLoaded', () => {
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');
    const menuItems = document.querySelectorAll('.menu-item');

    // --- TOOLTIP LABEL INITIALIZATION ---
    menuItems.forEach(item => {
        const span = item.querySelector('span');
        if (span) {
            item.setAttribute('data-text', span.innerText);
        }
    });

    // Sidebar Toggles
    document.getElementById('closeBtn').onclick = () => document.getElementById('sidebar').classList.add("collapsed");
    document.getElementById('logoToggle').onclick = () => document.getElementById('sidebar').classList.toggle("collapsed");

    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        renderHeadTable("Active");
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        renderHeadTable("History");
    };

    // Search Logic
    const tableSearch = document.getElementById('tableSearch');
    if (tableSearch) {
        tableSearch.addEventListener('keyup', (e) => {
            const val = e.target.value.toLowerCase();
            document.querySelectorAll('#leaveTableBody tr').forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
            });
        });
    }

    // Fetch real data from Django Backend
    const table = document.getElementById('employeeTable');
    const dataSourceUrl = table && table.dataset.sourceUrl ? table.dataset.sourceUrl : '/leaves/head/history/?format=json';

    fetch(dataSourceUrl, { headers: { 'Accept': 'application/json' }, cache: 'no-store' })
        .then(response => response.json())
        .then(data => {
            if (data.current_user_id) {
                currentUserId = data.current_user_id;
            }
            // Map Django's JSON format to match our table logic (handle both Array and Object responses)
            const rawList = Array.isArray(data) ? data : (data.history || []);
            headSampleData = rawList.map(item => {
                let rawStatusUpper = (item.status || "").toUpperCase().replace(/_/g, ' ');
                let displayStatus = item.status;
                
                if (rawStatusUpper === 'APPROVED') displayStatus = 'Approved';
                else if (rawStatusUpper === 'REJECTED') displayStatus = 'Rejected';
                else if (rawStatusUpper === 'CANCELLED') displayStatus = 'Cancelled';
                else if (rawStatusUpper.includes('PENDING HR')) displayStatus = 'Pending HR Approval';
                else if (rawStatusUpper.includes('PENDING SD')) displayStatus = 'Pending SD Approval';
                else if (rawStatusUpper.includes('PENDING HEAD')) displayStatus = 'Pending Head Approval';
                else displayStatus = 'Pending';
                
                let dynamicRemarks = item.head_remarks;
                if (!dynamicRemarks) {
                    if (rawStatusUpper.includes('PENDING HEAD')) dynamicRemarks = "Awaiting Department Head review";
                    else if (rawStatusUpper.includes('PENDING HR')) dynamicRemarks = "Awaiting HR review";
                    else if (rawStatusUpper.includes('PENDING SD')) dynamicRemarks = "Awaiting School Director review";
                    else dynamicRemarks = "Awaiting response";
                }
                
                return {
                    id: item.id,
                    userId: item.user__id,
                    name: item.name || "Unknown", 
                    role: item.user__role || "Employee",
                    dateFiled: item.dateFiled || "---",
                    submitTime: item.submitTime || "---",
                    leaveType: item.leave_type__name || "General Leave",
                    startDate: item.start_date,
                    endDate: item.end_date,
                    numDays: item.days_requested,
                    status: displayStatus,
                    rawStatus: rawStatusUpper,
                    reviewedBy: item.reviewed_by_head__first_name ? `${item.reviewed_by_head__first_name} ${item.reviewed_by_head__last_name}` : "---",
                    reason: item.reason,
                    fileName: item.attachment ? "Document Attached" : "No Document Attached",
                    reviewRemarks: dynamicRemarks
                };
            });
            renderHeadTable("Active");
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            renderHeadTable("Active");
        });
});

function renderHeadTable(mode) {
    const body = document.getElementById('leaveTableBody');
    const template = document.getElementById('headRowTemplate');

    if (!body || !template) {
        console.error("Critical rendering error: Required HTML structure is missing.");
        return;
    }

    body.innerHTML = "";

    headSampleData.forEach((leave) => {
        const isActionable = leave.rawStatus && leave.rawStatus.includes("PENDING HEAD");
        let shouldShow = (mode === "Active") ? isActionable : !isActionable;

        if (shouldShow) {
            const clone = template.content.cloneNode(true);
            let statusClass = leave.status.toLowerCase().replace(/\s+/g, '-');
            if (statusClass.includes('pending')) statusClass = 'pending';

            // Safe injection to prevent silent JS crashes if HTML template classes are missing
            const setEl = (sel, val, isHTML) => {
                const el = clone.querySelector(sel);
                if (el) isHTML ? el.innerHTML = val : el.innerText = val;
            };

            setEl('.col-emp', `<strong>${leave.name}</strong><br><small>${leave.role}</small>`, true);
            setEl('.col-type', leave.leaveType, false);
            setEl('.col-start', leave.startDate, false);
            setEl('.col-end', leave.endDate, false);
            setEl('.col-days', leave.numDays, false);
            setEl('.col-status', `<span class="status-pill ${statusClass}">${leave.status}</span>`, true);
            setEl('.col-reviewer', leave.reviewedBy || '---', false);
            
            const actionBtn = clone.querySelector('.action-link') || clone.querySelector('button') || clone.querySelector('a');
            if (actionBtn) {
                actionBtn.onclick = (e) => { e.preventDefault(); openHeadModal(leave.id); };
            }
            body.appendChild(clone);
        }
    });

    if (body.innerHTML === "") {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#888; padding:40px;">No leave records found.</td></tr>`;
    }
}

function openHeadModal(id) {
    activeRowId = id; 
    const data = headSampleData.find(l => l.id === id);
    if (!data) return;

    const isActionable = data.rawStatus && data.rawStatus.includes("PENDING HEAD");
    
    const fileNameEl = document.getElementById('modalFileName');
    if (fileNameEl) fileNameEl.innerText = data.fileName;
    
    const submitDateEl = document.getElementById('modalSubmitDate');
    if (submitDateEl) submitDateEl.innerText = `${data.dateFiled} at ${data.submitTime}`;
    
    const reasonEl = document.getElementById('modalReason');
    if (reasonEl) reasonEl.innerText = data.reason;
    
    const remarksEl = document.getElementById('modalRemarks');
    if (remarksEl) remarksEl.innerText = data.reviewRemarks;
    
    let statusClass = data.status.toLowerCase().replace(/\s+/g, '-');
    if (statusClass.includes('pending')) statusClass = 'pending';
    
    const statusContainerEl = document.getElementById('modalStatusContainer');
    if (statusContainerEl) statusContainerEl.innerHTML = `<span class="status-pill ${statusClass}">${data.status}</span>`;
    
    const reviewerTextEl = document.getElementById('modalReviewerText');
    if (reviewerTextEl) reviewerTextEl.innerHTML = `<small>Reviewed by: ${data.reviewedBy}</small>`;

    // Toggle Action Buttons
    const actions = document.getElementById('modalActions');
    if (actions) {
        actions.style.display = "flex"; // Ensure container is visible for the Close button
        
        let acceptBtn = document.getElementById('headAcceptBtn') || document.querySelector('.btn-approve');
        let rejectBtn = document.getElementById('headRejectBtn') || document.querySelector('.btn-reject');
        
        if (!acceptBtn) {
            actions.insertAdjacentHTML('afterbegin', `
                <button type="button" id="headAcceptBtn" class="btn btn-success btn-approve" style="margin-left: 10px; background-color: #28a745; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Accept</button>
                <button type="button" id="headRejectBtn" class="btn btn-danger btn-reject" style="margin-left: 10px; background-color: #dc3545; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Reject</button>
            `);
            acceptBtn = document.getElementById('headAcceptBtn');
            rejectBtn = document.getElementById('headRejectBtn');
        }

        // Force prevent default HTML behaviors and assign click cleanly
        acceptBtn.onclick = (e) => { e.preventDefault(); processHeadRequest('APPROVED'); };
        rejectBtn.onclick = (e) => { e.preventDefault(); processHeadRequest('REJECTED'); };

        if (isActionable) {
            acceptBtn.style.display = 'inline-block';
            rejectBtn.style.display = 'inline-block';
        } else {
            acceptBtn.style.setProperty('display', 'none', 'important');
            rejectBtn.style.setProperty('display', 'none', 'important');
        }
    }
    const viewModal = document.getElementById('viewModal');
    if (viewModal) viewModal.style.display = 'flex';
}

function processHeadRequest(decision) {
    if (!activeRowId) return;

    let actionStr = decision.trim().toUpperCase(); 
    if (actionStr === 'APPROVED') actionStr = 'Approve';
    if (actionStr === 'REJECTED') actionStr = 'Reject';

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
        Swal.fire({ icon: 'error', title: 'Security Error', text: 'CSRF token missing.', confirmButtonColor: '#4a1d1d' });
        return;
    }

    const executeFetch = (remarks) => {
        const acceptBtn = document.querySelector('.btn-approve');
        const rejectBtn = document.querySelector('.btn-reject');
        if (acceptBtn) acceptBtn.disabled = true;
        if (rejectBtn) rejectBtn.disabled = true;

        fetch(`/leaves/api/process-action/${activeRowId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ action: actionStr, remarks: remarks })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Success!', `Request has been ${decision.toLowerCase()}.`, 'success').then(() => {
                        window.location.reload(); // Instantly update the table
                    });
                } else {
                    alert(`Success! Request has been ${decision.toLowerCase()}.`);
                    window.location.reload();
                }
            } else {
                if (typeof Swal !== 'undefined') Swal.fire('Error', `Action Failed: ${data.error}`, 'error');
                else alert(`Action Failed: ${data.error}`);
                
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
            title: `Confirm ${decision}`,
            input: 'textarea',
            inputLabel: 'Review Remarks (Optional)',
            inputPlaceholder: 'Type your remarks here...',
            showCancelButton: true,
            confirmButtonColor: '#4a1d1d',
            confirmButtonText: 'Submit Decision'
        }).then((result) => {
            if (result.isConfirmed) {
                executeFetch(result.value || "Processed by Head via Dashboard");
            }
        });
    } else {
        const userRemarks = prompt(`Confirm ${decision}\n\nReview Remarks (Optional):`, 'Processed by Head via Dashboard');
        if (userRemarks !== null) {
            executeFetch(userRemarks);
        }
    }
}

function closeViewModal() { 
    const viewModal = document.getElementById('viewModal');
    if (viewModal) viewModal.style.display = 'none'; 
}