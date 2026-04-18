/* hr_leaverequest.js */
const hrName = "Tatsu"; 
let activeRowId = null;

let leaveData = [];

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');

    // Sidebar Tooltips Initialization
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.textContent.trim());
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // Tab Navigation
    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        renderHRTable("Active");
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        renderHRTable("History");
    };

    // Fetch real data from Django Backend
    const table = document.getElementById('employeeTable');
    const dataSourceUrl = table && table.dataset.sourceUrl ? table.dataset.sourceUrl : '/leaves/hr/history/?format=json';

    fetch(dataSourceUrl, { headers: { 'Accept': 'application/json' }, cache: 'no-store' })
        .then(response => response.json())
        .then(data => {
            leaveData = (data.history || []).map(item => ({
                id: item.id,
                name: item.name || "Unknown", 
                role: item.user__role || "Employee",
                dateFiled: item.dateFiled || "---",
                submitTime: item.submitTime || "---",
                leaveType: item.leave_type__name || "General Leave",
                startDate: item.start_date,
                endDate: item.end_date,
                numDays: item.days_requested,
                status: item.status.includes('PENDING') ? 'Pending' : item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase(),
                reviewedBy: "---", 
                reason: item.reason,
                fileName: item.attachment ? "Document Attached" : "No Document Attached",
                reviewRemarks: "Awaiting response"
            }));
            renderHRTable("Active");
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            renderHRTable("Active");
        });

    // Real-time Search
    document.getElementById('tableSearch').addEventListener('keyup', (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
        });
    });
});

function renderHRTable(mode) {
    const body = document.getElementById('leaveTableBody');
    const template = document.getElementById('hrRowTemplate');
    if (!body || !template) return;
    body.innerHTML = "";

    leaveData.forEach((leave) => {
        const isFinal = leave.status === "Approved" || leave.status === "Rejected";
        let shouldShow = (mode === "Active") ? !isFinal : isFinal;

        if (shouldShow) {
            const clone = template.content.cloneNode(true);
            const statusClass = leave.status.toLowerCase().replace(/\s+/g, '-');
            
            clone.querySelector('.col-emp').innerHTML = `<strong>${leave.name}</strong><br><small>${leave.role}</small>`;
            clone.querySelector('.col-type').innerText = leave.leaveType;
            clone.querySelector('.col-start').innerText = leave.startDate;
            clone.querySelector('.col-end').innerText = leave.endDate;
            clone.querySelector('.col-days').innerText = leave.numDays;
            clone.querySelector('.col-status').innerHTML = `<span class="status-pill ${statusClass}">${leave.status}</span>`;
            clone.querySelector('.col-reviewer').innerText = leave.reviewedBy || '---';
            
            clone.querySelector('.action-link').onclick = () => openHRModal(leave.id);
            body.appendChild(clone);
        }
    });

    if (body.innerHTML === "") {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#888; padding:40px;">No records found.</td></tr>`;
    }
}

function openHRModal(id) {
    activeRowId = id;
    const data = leaveData.find(l => l.id === id);
    if (!data) return;

    const isOwnRequest = (data.name === hrName);
    const isSDRequest = (data.role === "School Director");
    const isFinal = (data.status === "Approved" || data.status === "Rejected");
    const statusClass = data.status.toLowerCase().replace(/\s+/g, '-');

    document.getElementById('modalFileName').innerText = data.fileName;
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime}`;
    document.getElementById('modalReason').innerText = data.reason;
    document.getElementById('modalRemarks').innerText = data.reviewRemarks;
    document.getElementById('modalReviewerText').innerHTML = `<small>Reviewed by: ${data.reviewedBy}</small>`;
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${data.status}</span>`;

    // --- UPDATED CREDITS LOGIC ---
    const creditsBlock = document.getElementById('creditsBlock');
    if (data.leaveType === "Sick Leave") {
        creditsBlock.style.display = "block";
        // Dynamically calculate based on the 15 baseline
        const remaining = 15 - data.numDays;
        document.getElementById('modalCredits').innerText = `${remaining} Days Remaining`;
    } else {
        creditsBlock.style.display = "none";
    }

    // Toggle Action Buttons
    const actions = document.getElementById('modalActions');
    if (isFinal || isOwnRequest || isSDRequest) {
        actions.style.display = "none";
    } else {
        actions.style.display = "flex";
    }

    const preview = document.querySelector('.pdf-placeholder');
    preview.innerHTML = `<i class="fas fa-file-pdf"></i><p>Preview for ${data.fileName}</p>`;

    document.getElementById('viewModal').style.display = 'flex';
}

function processRequest(status) {
    if (!activeRowId) return;

    // Map status "Approved" or "Rejected" to the expected backend action
    let actionStr = status.trim().toUpperCase(); 
    if (actionStr === 'APPROVED') actionStr = 'APPROVE';
    if (actionStr === 'REJECTED') actionStr = 'REJECT';

    // Build a form dynamically to submit to the Django backend
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/leaves/hr/approve/${activeRowId}/`;

    // Grab CSRF Token from the hidden input in the main template
    const csrfTokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (!csrfTokenInput || !csrfTokenInput.value) {
        console.error("CSRF token not found on the page. Make sure {% csrf_token %} is in your template.");
        Swal.fire({
            icon: 'error',
            title: 'Security Error',
            text: 'Could not find the required security token to process the request.',
            confirmButtonColor: '#4a1d1d',
        });
        return;
    }
    const csrfToken = csrfTokenInput.value;

    // Append required fields (csrf_token, action, and remarks) to the form
    form.innerHTML = `
        <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
        <input type="hidden" name="action" value="${actionStr}">
        <input type="hidden" name="remarks" value="Processed by HR via Dashboard">
    `;

    document.body.appendChild(form);

    // Show the notification, then actually submit to the database!
    Swal.fire({
        icon: 'success',
        title: `Request ${status}`,
        text: `Saving decision to database...`,
        confirmButtonColor: '#4a1d1d',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        form.submit();
    });
}

function closeViewModal() { 
    document.getElementById('viewModal').style.display = 'none'; 
}