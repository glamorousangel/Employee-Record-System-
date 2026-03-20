/* head_leaverequest.js */
let leaveData = [];
let activeRowId = null;
const loggedHeadName = "Jose Brian Dela Peña"; 

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) {
            item.setAttribute("data-text", span.textContent.trim());
        }
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');

    if (tabRequests) {
        tabRequests.onclick = () => {
            tabRequests.classList.add('active');
            tabHistory.classList.remove('active');
            renderHeadTable("Active");
        };
    }

    if (tabHistory) {
        tabHistory.onclick = () => {
            tabHistory.classList.add('active');
            tabRequests.classList.remove('active');
            renderHeadTable("History");
        };
    }

    leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
    renderHeadTable("Active");
});

function getCredits(name) {
    const credits = JSON.parse(localStorage.getItem('userCredits')) || {};
    return credits[name] !== undefined ? credits[name] : 15;
}

function renderHeadTable(mode) {
    const body = document.getElementById('leaveTableBody');
    if (!body) return;
    
    body.innerHTML = "";
    leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];

    leaveData.forEach((leave) => {
        const isOwnRequest = (leave.name.trim() === loggedHeadName.trim());
        const isActionedByHead = leave.status.includes("- By Head");
        const isFinal = (leave.status === "Approved" || leave.status === "Rejected");

        let shouldShow = false;

        if (mode === "Active") {
            // Show staff requests needing action OR Head's own request that isn't finalized
            if ((!isOwnRequest && !isActionedByHead && !isFinal) || (isOwnRequest && !isFinal)) {
                shouldShow = true;
            }
        } else if (mode === "History") {
            // Show staff requests already processed OR Head's own finalized requests
            if ((!isOwnRequest && (isActionedByHead || isFinal)) || (isOwnRequest && isFinal)) {
                shouldShow = true;
            }
        }

        if (shouldShow) {
            let displayStatus = leave.status;
            // Map the status for the Head's view: show as Pending until School Director finishes
            if (isOwnRequest && !isFinal) displayStatus = "Pending";

            const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-');
            
            body.innerHTML += `<tr>
                <td><strong>${leave.name}</strong><br><small>${leave.role}</small></td>
                <td>${leave.leaveType}</td>
                <td>${leave.startDate}</td>
                <td>${leave.endDate}</td>
                <td>${leave.numDays}</td>
                <td><span class="status-pill ${statusClass}">${displayStatus}</span></td>
                <td>${leave.reviewedBy}</td>
                <td><span class="action-link" onclick="openHeadModal(${leave.id})">View Details</span></td>
            </tr>`;
        }
    });
}

function openHeadModal(id) {
    activeRowId = id;
    const data = leaveData.find(l => l.id === id);
    if (!data) return;

    const isOwnRequest = (data.name.trim() === loggedHeadName.trim());
    let displayStatus = data.status;
    if (isOwnRequest && !data.status.includes("Approved") && !data.status.includes("Rejected")) {
        displayStatus = "Pending";
    }

    document.getElementById('modalFileName').innerText = data.fileName;
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${displayStatus.toLowerCase().replace(/\s+/g, '-')}">${displayStatus}</span>`;
    document.getElementById('modalReviewer').innerHTML = `<small>Reviewed by: ${data.reviewedBy}</small>`;
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime || '---'}`;

    const remarksParagraph = document.getElementById('modalRemarks');
    let modalHTML = `<div class="info-item"><label>REASON</label><p class="modal-text-unified">${data.reason}</p></div>`;
    
    if (data.leaveType === "Sick Leave") {
        modalHTML += `<div class="info-item" style="margin-top: 15px;"><label>SICK LEAVE CREDITS</label><p class="modal-text-unified">${getCredits(data.name)} Days Remaining</p></div>`;
    }

    modalHTML += `<div class="info-item" style="margin-top: 15px;"><label>REVIEW REMARKS</label><p class="modal-text-unified">${data.reviewRemarks || 'Awaiting HR review.'}</p></div>`;
    remarksParagraph.parentElement.innerHTML = `<div id="modalRemarks">${modalHTML}</div>`;

    const preview = document.querySelector('.pdf-placeholder');
    if (data.fileData) {
        if (data.fileData.includes("image")) {
            preview.innerHTML = `<img src="${data.fileData}" style="width:100%; height:100%; object-fit:contain; border-radius:10px;">`;
        } else {
            preview.innerHTML = `<embed src="${data.fileData}" width="100%" height="100%" style="border-radius:10px;">`;
        }
    } else {
        preview.innerHTML = `<i class="fas fa-file-pdf"></i><p>No document attached</p>`;
    }

    const actions = document.getElementById('modalActions');
    const isActioned = data.status.includes("- By Head") || data.status === "Approved" || data.status === "Rejected";
    
    // ACTION FIX: No action buttons if it's the Head's own leave
    actions.style.display = (isOwnRequest || isActioned) ? "none" : "flex";
    
    document.getElementById('viewModal').style.display = 'flex';
}

function processHeadRequest(decision) {
    const index = leaveData.findIndex(l => l.id === activeRowId);
    if (index !== -1) {
        leaveData[index].status = decision + " - By Head";
        leaveData[index].reviewedBy = loggedHeadName; 
        const headStatus = decision === "Approved" ? "approved" : "rejected";
        leaveData[index].reviewRemarks = `${loggedHeadName} (Dept. Head) has ${headStatus}. Awaiting HR final review.`;

        localStorage.setItem('allLeaveRequests', JSON.stringify(leaveData));
        location.reload();
    }
}

function closeViewModal() { 
    document.getElementById('viewModal').style.display = 'none'; 
}