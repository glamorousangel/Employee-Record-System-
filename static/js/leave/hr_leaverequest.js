/* hr_leaverequest.js */
let leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
let activeRowId = null;

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) {
            item.setAttribute("data-text", span.textContent.trim());
        }
    });

    renderHRTable("Active");

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    document.getElementById('tab-requests').onclick = () => {
        document.getElementById('tab-requests').classList.add('active');
        document.getElementById('tab-history').classList.remove('active');
        renderHRTable("Active");
    };

    document.getElementById('tab-history').onclick = () => {
        document.getElementById('tab-history').classList.add('active');
        document.getElementById('tab-requests').classList.remove('active');
        renderHRTable("History");
    };
});

function getCredits(name) {
    const credits = JSON.parse(localStorage.getItem('userCredits')) || {};
    return credits[name] !== undefined ? credits[name] : 15;
}

function renderHRTable(mode) {
    const body = document.getElementById('leaveTableBody');
    if (!body) return;
    body.innerHTML = "";
    leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];

    leaveData.forEach((leave) => {
        const isFinal = leave.status === "Approved" || leave.status === "Rejected";
        if ((mode === "Active" && !isFinal) || (mode === "History" && isFinal)) {
            const statusClass = leave.status.toLowerCase().replace(/\s+/g, '-');
            body.innerHTML += `<tr>
                <td><strong>${leave.name}</strong><br><small>${leave.role}</small></td>
                <td>${leave.leaveType}</td>
                <td>${leave.startDate}</td>
                <td>${leave.endDate}</td>
                <td>${leave.numDays}</td>
                <td><span class="status-pill ${statusClass}">${leave.status}</span></td>
                <td>${leave.reviewedBy}</td>
                <td><span class="action-link" onclick="openHRModal(${leave.id})">View Details</span></td>
            </tr>`;
        }
    });
}

function openHRModal(id) {
    activeRowId = id;
    const data = leaveData.find(l => l.id === id);
    if (!data) return;

    document.getElementById('modalFileName').innerText = data.fileName;
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${data.status.toLowerCase().replace(/\s+/g, '-')}">${data.status}</span>`;
    document.getElementById('modalReviewer').innerHTML = `<small>Reviewed by: ${data.reviewedBy}</small>`;
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime}`;

    const remarksParagraph = document.getElementById('modalRemarks');
    let modalHTML = `<div class="info-item"><label>REASON</label><p class="modal-text-unified">${data.reason}</p></div>`;
    
    if (data.leaveType === "Sick Leave") {
        modalHTML += `<div class="info-item" style="margin-top: 15px;"><label>SICK LEAVE CREDITS</label><p class="modal-text-unified">${getCredits(data.name)} Days Remaining</p></div>`;
    }

    modalHTML += `<div class="info-item" style="margin-top: 15px;"><label>REVIEW REMARKS</label><p class="modal-text-unified">${data.reviewRemarks || 'Awaiting initial review.'}</p></div>`;
    remarksParagraph.parentElement.innerHTML = `<div id="modalRemarks">${modalHTML}</div>`;

    const preview = document.querySelector('.pdf-placeholder');
    if (data.fileData) {
        if (data.fileData.includes("image")) {
            preview.innerHTML = `<img src="${data.fileData}" style="width:100%; height:100%; object-fit:contain; border-radius:10px;">`;
        } else {
            preview.innerHTML = `<embed src="${data.fileData}" width="100%" height="100%" style="border-radius:10px;">`;
        }
    } else {
        preview.innerHTML = `<i class="fas fa-file-alt"></i><p>No document uploaded</p>`;
    }

    const isFinal = data.status === "Approved" || data.status === "Rejected";
    document.getElementById('modalActions').style.display = isFinal ? "none" : "flex";
    document.getElementById('viewModal').style.display = 'flex';
}

function processRequest(status) {
    const index = leaveData.findIndex(l => l.id === activeRowId);
    if (index !== -1) {
        const request = leaveData[index];
        const isHeadRequest = (request.role === "Department Head");

        if (status === "Approved") {
            if (isHeadRequest) {
                // If HR approves a Head, it's NOT final. Updates status for School Director to see.
                request.status = "Approved - By HR";
                request.reviewedBy = "HR Manager";
                request.reviewRemarks = "HR Manager has reviewed and approved. Waiting for final review by School Director.";
            } else {
                // Finalize for normal employees
                if (request.leaveType === "Sick Leave") {
                    let credits = JSON.parse(localStorage.getItem('userCredits')) || {};
                    credits[request.name] = getCredits(request.name) - request.numDays;
                    localStorage.setItem('userCredits', JSON.stringify(credits));
                }
                request.status = "Approved"; 
                request.reviewedBy = "HR Manager";
                request.reviewRemarks = "This request has been finalized by HR Manager.";
            }
        } else {
            // Rejection is final for everyone
            request.status = "Rejected"; 
            request.reviewedBy = "HR Manager";
            request.reviewRemarks = "This request has been rejected by HR Manager.";
        }
        
        localStorage.setItem('allLeaveRequests', JSON.stringify(leaveData));
        location.reload();
    }
}

function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }