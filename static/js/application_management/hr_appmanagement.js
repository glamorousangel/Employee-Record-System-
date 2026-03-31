// ================= GLOBAL =================
let activeRow = null;

document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");

    const searchInput = document.getElementById("tableSearch");
    const tableBody = document.getElementById("applicationTableBody");

    const viewModal = document.getElementById("viewModal");
    const posModal = document.getElementById("positionChangeModal");

    const tabNew = document.getElementById("tab-new");
    const tabPosition = document.getElementById("tab-position");

    // ================= SIDEBAR TOOLTIP =================
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.textContent.trim());
    });

    // ================= SIDEBAR TOGGLE =================
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // ================= SEARCH =================
    if (searchInput && tableBody) {
        searchInput.addEventListener("keyup", () => {
            const val = searchInput.value.toLowerCase();

            tableBody.querySelectorAll("tr").forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
            });
        });
    }

    // ================= TAB SWITCH =================
    if (tabNew && tabPosition) {
        tabNew.onclick = () => {
            tabNew.classList.add("active");
            tabPosition.classList.remove("active");
        };

        tabPosition.onclick = () => {
            tabPosition.classList.add("active");
            tabNew.classList.remove("active");

            openModal(posModal);
        };
    }

    // ================= VIEW CLICK (DELEGATION) =================
    document.addEventListener("click", (e) => {

        // VIEW BUTTON
        if (e.target.classList.contains("view-link")) {
            e.preventDefault();

            const row = e.target.closest("tr");
            activeRow = row;

            populateModal(row);
            openModal(viewModal);
        }

        // APPROVE
        if (e.target.classList.contains("approve-option")) {
            e.preventDefault();
            const row = e.target.closest("tr");
            updateRowStatus(row, "Approved");
        }

        // REJECT
        if (e.target.classList.contains("reject-option")) {
            e.preventDefault();
            const row = e.target.closest("tr");
            updateRowStatus(row, "Rejected");
        }
    });

    // ================= MODAL BUTTONS =================
    document.querySelector(".btn-approve")?.addEventListener("click", () => {
        if (!activeRow) return;

        updateRowStatus(activeRow, "Approved");
        updateModalStatus("Approved");
    });

    document.querySelector(".btn-reject")?.addEventListener("click", () => {
        if (!activeRow) return;

        updateRowStatus(activeRow, "Rejected");
        updateModalStatus("Rejected");
    });

    // ================= CLOSE MODAL =================
    document.getElementById("closeViewModal")?.addEventListener("click", closeAllModals);
    document.getElementById("cancelRequest")?.addEventListener("click", closeAllModals);

    // BACKDROP CLICK
    window.addEventListener("click", (e) => {
        if (e.target === viewModal || e.target === posModal) {
            closeAllModals();
        }
    });

    // ESC KEY
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllModals();
    });
});

/* ================= FUNCTIONS ================= */

// OPEN MODAL
function openModal(modal) {
    if (modal) modal.style.display = "flex";
}

// CLOSE MODALS
function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.style.display = "none");
}

// POPULATE MODAL DATA
function populateModal(row) {

    const cells = row.querySelectorAll("td");

    document.getElementById("modalSubmitDate").innerText = cells[4]?.innerText || "---";
    document.getElementById("modalDepartment").innerText = cells[2]?.innerText || "---";
    document.getElementById("modalPosition").innerText = cells[3]?.innerText || "---";
    document.getElementById("modalProgress").innerText = cells[5]?.innerText || "---";

    document.getElementById("modalFileName").innerText = "Document.pdf";
    document.getElementById("modalRemarks").innerText = "Awaiting HR evaluation.";

    const statusPill = cells[6]?.querySelector(".status-pill");

    document.getElementById("modalStatusContainer").innerHTML =
        statusPill ? statusPill.outerHTML : "---";

    document.getElementById("modalReviewerText").innerHTML =
        "<small>Reviewed by: HR Department</small>";

    // Hide buttons if already final
    const statusText = statusPill?.innerText || "";
    const isFinal = statusText === "Approved" || statusText === "Rejected";

    document.getElementById("modalActions").style.display = isFinal ? "none" : "flex";
}

// UPDATE TABLE STATUS
function updateRowStatus(row, status) {

    const statusCell = row.querySelector("td:nth-child(7)");

    let className = "approved";
    if (status === "Rejected") className = "rejected";

    statusCell.innerHTML = `<span class="status-pill ${className}">${status}</span>`;
}

// UPDATE MODAL STATUS
function updateModalStatus(status) {

    let className = "approved";
    if (status === "Rejected") className = "rejected";

    document.getElementById("modalStatusContainer").innerHTML =
        `<span class="status-pill ${className}">${status}</span>`;

    document.getElementById("modalActions").style.display = "none";

    document.getElementById("modalRemarks").innerText =
        `${status} by HR on ${new Date().toLocaleDateString()}`;
}