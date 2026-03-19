const empInfo = { name: "John Smith" };

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');
    const menuItems = document.querySelectorAll(".menu-item"); // ADDED

    // --- ADDED: INITIALIZE TOOLTIP LABELS ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) {
            item.setAttribute("data-text", span.innerText);
        }
    });

    renderLeaveTable("Active");

    closeBtn.onclick = () => sidebar.classList.add("collapsed");
    logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        renderLeaveTable("Active");
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        renderLeaveTable("History");
    };

    document.getElementById('tableSearch').addEventListener('keyup', (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
        });
    });
});

function renderLeaveTable(filter) {
    const body = document.getElementById('leaveTableBody');
    body.innerHTML = "";
    
    // Refresh data from shared storage
    const leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
    const myLeaves = leaveData.filter(l => l.name === empInfo.name);

    myLeaves.forEach((leave) => {
        const isFinal = leave.status === "Approved" || leave.status === "Rejected";
        
        let displayStatus = leave.status;
        let displayReviewer = leave.reviewedBy;

        if (displayStatus.includes("- By Head")) {
            displayStatus = "Pending";
            displayReviewer = "---"; 
        }

        if ((filter === "Active" && !isFinal) || (filter === "History" && isFinal)) {
            const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-');
            body.innerHTML += `<tr>
                <td>${leave.dateFiled}</td>
                <td><strong>${leave.leaveType}</strong></td>
                <td>${leave.startDate}</td>
                <td>${leave.endDate}</td>
                <td>${leave.numDays}</td>
                <td><span class="status-pill ${statusClass}">${displayStatus}</span></td>
                <td>${displayReviewer}</td>
                <td><span class="action-link" onclick="openViewModalByID(${leave.id})">View Details</span></td>
            </tr>`;
        }
    });
}

function openViewModalByID(id) {
    const leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
    const data = leaveData.find(l => l.id === id);
    
    document.getElementById('modalFileName').innerText = data.fileName || (data.leaveType + ".pdf");
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime}`;
    
    let displayStatus = data.status;
    let remarks = "";

    if (displayStatus.includes("- By Head")) {
        displayStatus = "Pending";
        remarks = "Your application is currently being reviewed by the Department Head and HR.";
    } else if (displayStatus === "Pending") {
        remarks = "Awaiting initial review.";
    } else {
        remarks = `This request has been finalized by ${data.reviewedBy}.`;
    }

    const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-');
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${displayStatus}</span>`;
    document.getElementById('modalRemarks').innerText = remarks;
    
    const preview = document.querySelector('.pdf-placeholder');
    if (data.fileData) {
        preview.innerHTML = data.fileData.includes("image") 
            ? `<img src="${data.fileData}" style="width:100%; height:100%; object-fit:contain;">` 
            : `<embed src="${data.fileData}" width="100%" height="100%">`;
    } else {
        preview.innerHTML = `<i class="fas fa-file-pdf"></i><p>No document attached</p>`;
    }

    document.getElementById('viewModal').style.display = 'flex';
}

function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }