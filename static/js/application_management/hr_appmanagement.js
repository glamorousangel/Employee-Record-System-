document.addEventListener("DOMContentLoaded", () => {

    // 1. DATA
    const newEmployeeData = [
        { id: "001", name: "Dela Cruz, Juan", department: "CCS", position: "Instructor", submitted: "02/12/2026", progress: "Stage 2 of 4", status: "pending-hr", statusLabel: "Pending - HR Evaluator" },
        { id: "002", name: "Santos, Maria", department: "CBA", position: "Professor", submitted: "02/15/2026", progress: "Stage 1 of 4", status: "pending-hr", statusLabel: "Pending - Dept. Head" },
        { id: "003", name: "Reyes, Ricardo", department: "COE", position: "Registrar", submitted: "02/10/2026", progress: "Completed", status: "approved", statusLabel: "Approved" },
        { id: "004", name: "Garcia, Ana", department: "CON", position: "Clinical Instructor", submitted: "03/01/2026", progress: "Stage 3 of 4", status: "rejected", statusLabel: "Rejected" }
    ];

    const positionChangeData = [
        { id: "PC-001", name: "Bautista, Carlo", department: "CCS", position: "Dean", submitted: "03/10/2026", progress: "Stage 1 of 2", status: "pending-hr", statusLabel: "Pending - HR Evaluator" }
    ];

    // 2. SELECTORS
    const tableBody = document.getElementById("applicationTableBody");
    const viewModal = document.getElementById("viewModal");
    const closeViewModal = document.getElementById("closeViewModal");
    
    let activeData = newEmployeeData;
    let activeRecord = null;

    // 3. TOAST NOTIFICATION LOGIC
    function showNotification(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-times-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // 4. RENDER TABLE
    function renderTable(data) {
        tableBody.innerHTML = "";
        data.forEach(record => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${record.id}</td>
                <td>${record.name}</td>
                <td>${record.department}</td>
                <td>${record.position}</td>
                <td>${record.submitted}</td>
                <td>${record.progress}</td>
                <td><span class="status-pill ${record.status}">${record.statusLabel}</span></td>
                <td class="actions-cell">
                    <a href="#" class="view-link" data-id="${record.id}">View</a>
                    ${record.status === "pending-hr" ? `
                    <div class="dropdown">
                        <button class="update-link">Update <i class="fas fa-caret-down"></i></button>
                        <div class="dropdown-content">
                            <a href="#" class="approve-option" data-id="${record.id}">Approve</a>
                            <a href="#" class="reject-option" data-id="${record.id}">Reject</a>
                        </div>
                    </div>` : ""}
                </td>
            `;
            tableBody.appendChild(tr);
        });
        attachEvents();
    }

    // 5. UPDATE STATUS LOGIC
    function updateRecordStatus(id, newStatus, newLabel) {
        const record = activeData.find(r => r.id === id);
        if (record) {
            record.status = newStatus;
            record.statusLabel = newLabel;
            record.progress = "Completed";
            
            renderTable(activeData);
            
            // Trigger Notification
            if (newStatus === 'approved') {
                showNotification(`Application ${id} (${record.name}) Accepted!`, 'success');
            } else {
                showNotification(`Application ${id} (${record.name}) Rejected.`, 'error');
            }
            
            viewModal.style.display = "none"; // Close modal if open
        }
    }

    // 6. EVENT LISTENERS
    function attachEvents() {
        // Table Actions
        document.querySelectorAll(".approve-option").forEach(btn => {
            btn.onclick = (e) => updateRecordStatus(e.target.dataset.id, "approved", "Approved");
        });
        document.querySelectorAll(".reject-option").forEach(btn => {
            btn.onclick = (e) => updateRecordStatus(e.target.dataset.id, "rejected", "Rejected");
        });
        
        // Open View Modal
        document.querySelectorAll(".view-link").forEach(link => {
            link.onclick = (e) => {
                const id = e.target.dataset.id;
                activeRecord = activeData.find(r => r.id === id);
                
                // Fill modal info
                document.getElementById("modalDepartment").innerText = activeRecord.department;
                document.getElementById("modalPosition").innerText = activeRecord.position;
                document.getElementById("modalSubmitDate").innerText = activeRecord.submitted;
                document.getElementById("modalProgress").innerText = activeRecord.progress;
                
                // Hide/Show footer buttons based on status
                const footer = document.getElementById("modalActions");
                footer.style.display = activeRecord.status === "pending-hr" ? "flex" : "none";
                
                viewModal.style.display = "flex";
            };
        });
    }

    // Modal Action Buttons
    document.querySelector(".btn-approve").onclick = () => {
        if(activeRecord) updateRecordStatus(activeRecord.id, "approved", "Approved");
    };

    document.querySelector(".btn-reject").onclick = () => {
        if(activeRecord) updateRecordStatus(activeRecord.id, "rejected", "Rejected");
    };

    closeViewModal.onclick = () => viewModal.style.display = "none";

    // Initialize
    renderTable(activeData);
});