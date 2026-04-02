document.addEventListener("DOMContentLoaded", () => {

    /* --- UI Elements --- */
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const mainContent = document.getElementById("mainContent");
    const menuItems = document.querySelectorAll(".menu-item");

    const searchInput = document.getElementById("tableSearch");
    const tableBody = document.getElementById("trainingTableBody");
    const noResultsRow = document.getElementById("noResultsRow");

    const modal = document.getElementById("addTrainingModal");
    const addTrainingBtn = document.getElementById("addTrainingBtn");
    const modalClose = document.getElementById("modalClose");
    const cancelBtn = document.getElementById("cancelBtn");
    const addTrainingForm = document.getElementById("addTrainingForm");

    const viewModal = document.getElementById("viewTrainingModal");
    const viewModalCancel = document.getElementById("viewModalCancel");
    const viewModalCloseStatus = document.getElementById("viewModalCloseStatus");

    /* --- Sidebar & Layout Logic --- */
    // This handles the "gap" transition between the sidebar and content card
    const collapseSidebar = () => {
        sidebar.classList.add("collapsed");
    };

    const expandSidebar = () => {
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
        }
    };

    closeBtn.addEventListener("click", collapseSidebar);
    logoToggle.addEventListener("click", expandSidebar);

    // Set tooltip text for when the sidebar is collapsed
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });

    /* --- Table Search / Filter --- */
    searchInput.addEventListener("keyup", () => {
        const filter = searchInput.value.toLowerCase();
        const rows = tableBody.querySelectorAll("tr:not(#noResultsRow)");
        let visibleCount = 0;

        rows.forEach(row => {
            const match = row.innerText.toLowerCase().includes(filter);
            row.style.display = match ? "" : "none";
            if (match) visibleCount++;
        });

        noResultsRow.style.display = visibleCount === 0 ? "" : "none";
    });

    /* --- Training Data Store --- */
    const trainingData = {
        "001": {
            name: "Outcomes-Based Education Workshop",
            meta: "Teaching | Onsite | March 12, 2026",
            status: "open",
            statusLabel: "Open",
            description: "College of Computer Studies curriculum alignment.",
            trainer: "CCS - 201",
            location: "Main building 2nd floor",
            maxSlots: "30",
            slotsFilled: "25 / 30"
        },
        "002": {
            name: "Research Writing Seminar",
            meta: "Research | Online | March 20, 2026",
            status: "full",
            statusLabel: "Full",
            description: "Advanced techniques for research publication.",
            trainer: "Dr. Santos",
            location: "Zoom / Online",
            maxSlots: "30",
            slotsFilled: "30 / 30"
        },
        "003": {
            name: "Faculty Development Program",
            meta: "Development | Onsite | Feb. 28, 2026",
            status: "completed",
            statusLabel: "Completed",
            description: "Annual faculty development and ethics seminar.",
            trainer: "External Agency",
            location: "Auditorium",
            maxSlots: "20",
            slotsFilled: "20 / 20"
        },
        "004": {
            name: "Safety & Emergency Response Training",
            meta: "Safety | Onsite | March 5, 2026",
            status: "cancelled",
            statusLabel: "Cancelled",
            description: "Emergency procedures and first aid protocols.",
            trainer: "Safety Officer",
            location: "Gymnasium",
            maxSlots: "25",
            slotsFilled: "15 / 25"
        }
    };

    /* --- Modal Handlers (Add Training) --- */
    const openAddModal = () => modal.style.display = "flex";
    const closeAddModal = () => modal.style.display = "none";

    addTrainingBtn.addEventListener("click", openAddModal);
    modalClose.addEventListener("click", closeAddModal);
    cancelBtn.addEventListener("click", closeAddModal);

    /* --- Modal Handlers (View Training) --- */
    const openViewModal = (id) => {
        const data = trainingData[id];
        if (!data) return;

        document.getElementById("viewTrainingName").textContent = data.name;
        document.getElementById("viewTrainingMeta").innerHTML = data.meta;
        document.getElementById("viewDescription").textContent = data.description;
        document.getElementById("viewTrainer").textContent = data.trainer;
        document.getElementById("viewLocation").textContent = data.location;
        document.getElementById("viewMaxSlots").textContent = data.maxSlots;
        document.getElementById("viewSlotsFilled").textContent = data.slotsFilled;

        const statusBadge = document.getElementById("viewTrainingStatus");
        statusBadge.className = `status-badge ${data.status} view-status-badge`;
        statusBadge.textContent = data.statusLabel;

        viewModal.style.display = "flex";
    };

    const closeViewModal = () => viewModal.style.display = "none";

    // Bind click events to "View" links in the table
    tableBody.addEventListener("click", (e) => {
        const viewBtn = e.target.closest(".action-links a:first-child");
        if (viewBtn) {
            e.preventDefault();
            const row = viewBtn.closest("tr");
            const id = row.querySelector("td:first-child").textContent.trim();
            openViewModal(id);
        }
    });

    viewModalCancel.addEventListener("click", closeViewModal);
    viewModalCloseStatus.addEventListener("click", closeViewModal);

    /* --- Global Click/Key Listeners --- */
    window.addEventListener("click", (e) => {
        if (e.target === modal) closeAddModal();
        if (e.target === viewModal) closeViewModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAddModal();
            closeViewModal();
        }
    });

    /* --- Form Submission --- */
    addTrainingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Training data has been updated successfully.");
        closeAddModal();
    });

});