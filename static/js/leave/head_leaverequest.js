/* head_leaverequest.js */
let leaveData = [];
let activeRowId = null;
const loggedHeadName = "Jose Brian Dela Peña"; 

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");

    // --- 1. SIDEBAR LABEL INITIALIZATION ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) {
            item.setAttribute("data-text", span.textContent.trim());
        }
    });

    // --- 2. SIDEBAR TOGGLE LOGIC ---
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) {
        logoToggle.onclick = () => sidebar.classList.toggle("collapsed");
    }

    // --- 3. TAB LOGIC ---
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

    // --- 4. INITIAL RENDER (FIXED) ---
    // Ensure data is pulled before calling the render
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
    // Re-sync data from storage
    leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];

    leaveData.forEach((leave) => {
        const isOwnRequest = leave.name === loggedHeadName;
        const isActionedByHead = leave.status.includes("- By Head");
        const isFinal = leave.status === "Approved" || leave.status === "Rejected";

        let displayStatus = leave.status;
        if (isOwnRequest && displayStatus.includes("- By HR")) displayStatus = "Pending";

        // Logic check for tabs
        const inActive = (mode === "Active" && !isActionedByHead && !isFinal && !isOwnRequest);
        const inHistory = (mode === "History" && (isActionedByHead || isFinal || (isOwnRequest && isFinal)));

        if (inActive || inHistory) {
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

    let displayStatus = data.status;
    if (data.name === loggedHeadName && displayStatus.includes("- By HR")) displayStatus = "Pending";

    document.getElementById('modalFileName').innerText = data.fileName;
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${displayStatus.toLowerCase().replace(/\s+/g, '-')}">${displayStatus}</span>`;
    document.getElementById('modalReviewer').innerHTML = `<small>Reviewed by: ${data.reviewedBy}</small>`;
    document.getElementById('modalSubmitDate').innerText = `${data.submitDate || data.dateFiled} at ${data.submitTime}`;

    const remarksParagraph = document.getElementById('modalRemarks');
    
    let modalHTML = `
        <div class="info-item">
            <label>REASON</label>
            <p class="modal-text-unified">${data.reason}</p>
        </div>`;
    
    if (data.leaveType === "Sick Leave") {
        modalHTML += `
        <div class="info-item" style="margin-top: 15px;">
            <label>SICK LEAVE CREDITS</label>
            <p class="modal-text-unified">${getCredits(data.name)} Days Remaining</p>
        </div>`;
    }

    modalHTML += `
        <div class="info-item" style="margin-top: 15px;">
            <label>REVIEW REMARKS</label>
            <p class="modal-text-unified">${data.reviewRemarks}</p>
        </div>`;

    remarksParagraph.parentElement.innerHTML = `<div id="modalRemarks">${modalHTML}</div>`;

    const preview = document.querySelector('.pdf-placeholder');
    if (data.fileData) {
        preview.innerHTML = data.fileData.includes("image") 
            ? `<img src="${data.fileData}" style="width:100%; height:100%; object-fit:contain; border-radius:10px;">` 
            : `<embed src="${data.fileData}" width="100%" height="100%" style="border-radius:10px;">`;
    }

    const actions = document.getElementById('modalActions');
    const isActioned = data.status.includes("- By Head") || data.status === "Approved" || data.status === "Rejected";
    actions.style.display = (!isActioned && data.name !== loggedHeadName) ? "flex" : "none";
    
    document.getElementById('viewModal').style.display = 'flex';
}

function processHeadRequest(decision) {
    const index = leaveData.findIndex(l => l.id === activeRowId);
    if (index !== -1) {
        leaveData[index].status = decision + " - By Head";
        leaveData[index].reviewedBy = loggedHeadName; 
        const headStatus = decision === "Approved" ? "approved" : "rejected";
        leaveData[index].reviewRemarks = `${loggedHeadName} (Dept. Head) has ${headStatus}. Awaiting final review by HR.`;

        localStorage.setItem('allLeaveRequests', JSON.stringify(leaveData));
        location.reload();
    }
}

function closeViewModal() { 
    document.getElementById('viewModal').style.display = 'none'; 
}
