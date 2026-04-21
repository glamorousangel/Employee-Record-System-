/* emp_leaverequest.js */
let leaveData = [];

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');
    const menuItems = document.querySelectorAll(".menu-item");

    // Initialize Tooltip Labels
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) { item.setAttribute("data-text", span.innerText); }
    });

    // Fetch real data from Django Backend
    const table = document.getElementById('leaveTable');
    const dataSourceUrl = table && table.dataset.sourceUrl ? table.dataset.sourceUrl : '/leaves/employee/history/?format=json';

    fetch(dataSourceUrl, { headers: { 'Accept': 'application/json' }, cache: 'no-store' })
        .then(response => response.json())
        .then(data => {
            console.log("Database Response:", data); // Check your browser console!
            // The backend API should be responsible for providing clean, display-ready data.
            // The frontend mapping logic should be as simple as possible.
            leaveData = (data.history || []).map(item => {
                let rawStatusUpper = (item.status || "").toUpperCase().replace(/_/g, ' ');
                let displayStatus = item.status;
                
                if (rawStatusUpper === 'APPROVED') displayStatus = 'Approved';
                else if (rawStatusUpper === 'REJECTED') displayStatus = 'Rejected';
                else if (rawStatusUpper === 'CANCELLED') displayStatus = 'Cancelled';
                else if (rawStatusUpper.includes('PENDING HR')) displayStatus = 'Pending HR Approval';
                else if (rawStatusUpper.includes('PENDING SD')) displayStatus = 'Pending SD Approval';
                else if (rawStatusUpper.includes('PENDING HEAD')) displayStatus = 'Pending Head Approval';
                else displayStatus = 'Pending';

                let reviewer = "---";
                if (item.reviewed_by_sd__first_name) {
                    reviewer = `${item.reviewed_by_sd__first_name} ${item.reviewed_by_sd__last_name}`;
                } else if (item.reviewed_by_hr__first_name) {
                    reviewer = `${item.reviewed_by_hr__first_name} ${item.reviewed_by_hr__last_name}`;
                } else if (item.reviewed_by_head__first_name) {
                    reviewer = `${item.reviewed_by_head__first_name} ${item.reviewed_by_head__last_name}`;
                }

                let remarks = "Awaiting response";
                if (item.sd_remarks) remarks = item.sd_remarks;
                else if (item.hr_remarks) remarks = item.hr_remarks;
                else if (item.head_remarks) remarks = item.head_remarks;
                else if (rawStatusUpper.includes('PENDING HEAD')) remarks = "Awaiting Department Head review";
                else if (rawStatusUpper.includes('PENDING HR')) remarks = "Awaiting HR review";
                else if (rawStatusUpper.includes('PENDING SD')) remarks = "Awaiting School Director review";

                return {
                    id: item.id,
                    dateFiled: item.dateFiled || "---",
                    submitTime: item.submitTime || "---",
                    leaveType: item.leave_type__name || "General Leave",
                    startDate: item.start_date,
                    endDate: item.end_date,
                    numDays: item.days_requested,
                    status: displayStatus,
                    reviewedBy: reviewer,
                    reason: item.reason,
                    fileName: item.attachment ? "Document Attached" : "No Document Attached",
                    reviewRemarks: remarks
                };
            });
            renderLeaveTable("Active");
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            renderLeaveTable("Active");
        });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // Tab Switching
    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); 
        tabHistory.classList.remove('active');
        renderLeaveTable("Active");
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); 
        tabRequests.classList.remove('active');
        renderLeaveTable("History");
    };

    // Search Logic
    document.getElementById('tableSearch').addEventListener('keyup', (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
        });
    });
});

function renderLeaveTable(filter) {
    const body = document.getElementById('leaveTableBody');
    const template = document.getElementById('leaveRowTemplate');
    body.innerHTML = "";
    
    leaveData.forEach((leave) => {
        const isFinal = leave.status === "Approved" || leave.status === "Rejected";
        
        // Logic: Active tab shows Pending. History tab shows Approved/Rejected.
        if ((filter === "Active" && !isFinal) || (filter === "History" && isFinal)) {
            const clone = template.content.cloneNode(true);
            let statusClass = leave.status.toLowerCase().replace(/\s+/g, '-');
            if (statusClass.includes('pending')) statusClass = 'pending';

            clone.querySelector('.col-filed').innerText = leave.dateFiled;
            clone.querySelector('.col-type').innerHTML = `<strong>${leave.leaveType}</strong>`;
            clone.querySelector('.col-start').innerText = leave.startDate;
            clone.querySelector('.col-end').innerText = leave.endDate;
            clone.querySelector('.col-days').innerText = leave.numDays;
            clone.querySelector('.col-status').innerHTML = `<span class="status-pill ${statusClass}">${leave.status}</span>`;
            clone.querySelector('.col-reviewer').innerText = leave.reviewedBy;
            
            // Set action click
            clone.querySelector('.action-link').onclick = () => openViewModalByID(leave.id);

            body.appendChild(clone);
        }
    });

    if (body.innerHTML === "") {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#888; padding:40px;">No leave records found.</td></tr>`;
    }
}

function openViewModalByID(id) {
    const data = leaveData.find(l => l.id === id);
    if (!data) return;
    
    // Fill Modal Data
    document.getElementById('modalFileName').innerText = data.fileName;
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime}`;
    document.getElementById('modalReason').innerText = data.reason;
    document.getElementById('modalRemarks').innerText = data.reviewRemarks;
    
    let statusClass = data.status.toLowerCase().replace(/\s+/g, '-');
    if (statusClass.includes('pending')) statusClass = 'pending';
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${data.status}</span>`;
    
    // Preview Placeholder Logic
    const preview = document.querySelector('.pdf-placeholder');
    preview.innerHTML = `<i class="fas fa-file-pdf"></i><p>Preview for ${data.fileName}</p>`;

    document.getElementById('viewModal').style.display = 'flex';
}

function closeViewModal() { 
    document.getElementById('viewModal').style.display = 'none'; 
}