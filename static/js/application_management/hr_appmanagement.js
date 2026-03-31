document.addEventListener("DOMContentLoaded", () => {

    // --------------------------------------------------------
    // 1. DATA OBJECTS
    // --------------------------------------------------------
    let newEmployeeData = [
        {
            id: "001",
            name: "Dela Cruz, Juan",
            department: "CCS",
            position: "Instructor",
            submitted: "02/12/2026",
            progress: "Stage 2 of 4",
            status: "pending-hr",
            statusLabel: "Pending - HR Evaluator",
            reviewedBy: "---",
            remarks: "Awaiting HR evaluation of submitted documents.",
            fileName: "CV_DelaCruz.pdf"
        },
        {
            id: "002",
            name: "Santos, Maria",
            department: "CBA",
            position: "Professor",
            submitted: "02/15/2026",
            progress: "Stage 1 of 4",
            status: "pending-hr",
            statusLabel: "Pending - Dept. Head",
            reviewedBy: "---",
            remarks: "Submitted for department head review.",
            fileName: "CV_Santos.pdf"
        },
        {
            id: "003",
            name: "Reyes, Ricardo",
            department: "COE",
            position: "Registrar",
            submitted: "02/10/2026",
            progress: "Completed",
            status: "approved",
            statusLabel: "Approved",
            reviewedBy: "HR Manager",
            remarks: "All requirements met. Application approved.",
            fileName: "CV_Reyes.pdf"
        }
    ];

    let positionChangeData = [
        {
            id: "PC-001",
            name: "Bautista, Carlo",
            department: "CCS",
            position: "Dean",
            submitted: "03/10/2026",
            progress: "Stage 1 of 2",
            status: "pending-hr",
            statusLabel: "Pending - HR Evaluator",
            reviewedBy: "---",
            remarks: "Pending HR review of position change request.",
            fileName: "Request_Bautista.pdf"
        }
    ];

    // --------------------------------------------------------
    // 2. SELECTORS
    // --------------------------------------------------------
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const searchInput = document.getElementById("tableSearch");
    const tableBody = document.getElementById("applicationTableBody");
    
    const viewModal = document.getElementById("viewModal");
    const posModal = document.getElementById("positionChangeModal");
    const posForm = document.getElementById("positionChangeForm");
    
    const tabNew = document.getElementById("tab-new");
    const tabPosition = document.getElementById("tab-position");

    let activeData = newEmployeeData; 
    let activeRecord = null; 

    // --------------------------------------------------------
    // 3. SIDEBAR LOGIC
    // --------------------------------------------------------
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // --------------------------------------------------------
    // 4. RENDER TABLE
    // --------------------------------------------------------
    function renderTable(data) {
        tableBody.innerHTML = "";

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#888;padding:40px;">No records found.</td></tr>`;
            return;
        }

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
                    ${(record.status !== "approved" && record.status !== "rejected") ? `
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

        attachTableEvents();
    }

    // --------------------------------------------------------
    // 5. EVENT DELEGATION / ATTACHMENT
    // --------------------------------------------------------
    function attachTableEvents() {
        // View Action
        tableBody.querySelectorAll(".view-link").forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const id = link.getAttribute("data-id");
                const record = activeData.find(r => r.id === id);
                if (record) openViewModal(record);
            };
        });

        // Inline Status Update
        tableBody.querySelectorAll(".approve-option").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                updateRecordStatus(btn.getAttribute("data-id"), "approved", "Approved");
            };
        });

        tableBody.querySelectorAll(".reject-option").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                updateRecordStatus(btn.getAttribute("data-id"), "rejected", "Rejected");
            };
        });
    }

    // --------------------------------------------------------
    // 6. STATUS UPDATES
    // --------------------------------------------------------
    function updateRecordStatus(id, statusClass, statusLabel) {
        const record = activeData.find(r => r.id === id);
        if (!record) return;

        record.status = statusClass;
        record.statusLabel = statusLabel;
        record.reviewedBy = "HR Manager";
        record.remarks = `${statusLabel} by HR Manager on ${new Date().toLocaleDateString()}`;
        record.progress = "Completed";

        renderTable(activeData);

        if (activeRecord && activeRecord.id === id) {
            populateModal(record);
        }
    }

    // --------------------------------------------------------
    // 7. MODAL HELPERS
    // --------------------------------------------------------
    function openViewModal(record) {
        activeRecord = record;
        populateModal(record);
        viewModal.style.display = "flex";
    }

    function populateModal(record) {
        document.getElementById("modalFileName").innerText = record.fileName;
        document.getElementById("modalSubmitDate").innerText = record.submitted;
        document.getElementById("modalDepartment").innerText = record.department;
        document.getElementById("modalPosition").innerText = record.position;
        document.getElementById("modalProgress").innerText = record.progress;
        document.getElementById("modalRemarks").innerText = record.remarks;
        document.getElementById("modalReviewerText").innerHTML = `<small>Reviewed by: ${record.reviewedBy}</small>`;
        document.getElementById("modalStatusContainer").innerHTML = `<span class="status-pill ${record.status}">${record.statusLabel}</span>`;

        const isFinal = record.status === "approved" || record.status === "rejected";
        document.getElementById("modalActions").style.display = isFinal ? "none" : "flex";
    }

    function closeAllModals() {
        viewModal.style.display = "none";
        posModal.style.display = "none";
        activeRecord = null;
    }

    // Modal UI Listeners
    document.getElementById("closeViewModal")?.addEventListener("click", closeAllModals);
    document.getElementById("cancelRequest")?.addEventListener("click", closeAllModals);

    document.querySelector(".btn-approve")?.addEventListener("click", () => {
        if (activeRecord) updateRecordStatus(activeRecord.id, "approved", "Approved");
    });

    document.querySelector(".btn-reject")?.addEventListener("click", () => {
        if (activeRecord) updateRecordStatus(activeRecord.id, "rejected", "Rejected");
    });

    // --------------------------------------------------------
    // 8. TAB NAVIGATION
    // --------------------------------------------------------
    tabNew.addEventListener("click", () => {
        tabNew.classList.add("active");
        tabPosition.classList.remove("active");
        activeData = newEmployeeData;
        renderTable(activeData);
    });

    tabPosition.addEventListener("click", () => {
        tabPosition.classList.add("active");
        tabNew.classList.remove("active");
        activeData = positionChangeData;
        renderTable(activeData);
        // Automatically open the form to log a change when switching to this tab
        posModal.style.display = "flex";
    });

    // --------------------------------------------------------
    // 9. SEARCH FILTER
    // --------------------------------------------------------
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filtered = activeData.filter(r => 
            r.name.toLowerCase().includes(query) || 
            r.id.toLowerCase().includes(query) || 
            r.department.toLowerCase().includes(query)
        );
        renderTable(filtered);
    });

    // --------------------------------------------------------
    // 10. POSITION CHANGE FORM SUBMISSION
    // --------------------------------------------------------
    if (posForm) {
        posForm.onsubmit = (e) => {
            e.preventDefault();

            const name = posForm.querySelector("input[type='text']:not([disabled])").value;
            const pos = posForm.querySelector("select").value;
            const remarks = posForm.querySelector("textarea").value;

            const newEntry = {
                id: `PC-0${positionChangeData.length + 10}`,
                name: name || "Unknown Employee",
                department: "Pending Dept",
                position: pos || "Unspecified",
                submitted: new Date().toLocaleDateString(),
                progress: "Stage 1 of 2",
                status: "pending-hr",
                statusLabel: "Pending - HR Evaluator",
                reviewedBy: "---",
                remarks: remarks || "No remarks provided.",
                fileName: "Request_Form.pdf"
            };

            positionChangeData.push(newEntry);
            renderTable(positionChangeData);
            posForm.reset();
            closeAllModals();
        };
    }

    // Global click-to-close modal
    window.onclick = (e) => {
        if (e.target === viewModal || e.target === posModal) closeAllModals();
    };

    // --------------------------------------------------------
    // 11. INIT
    // --------------------------------------------------------
    renderTable(newEmployeeData);
});