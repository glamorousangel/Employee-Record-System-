/* hr_appmanagement.js */

document.addEventListener("DOMContentLoaded", () => {
    const sidebar      = document.getElementById("sidebar");
    const logoToggle   = document.getElementById("logoToggle");
    const closeBtn     = document.getElementById("closeBtn");
    const searchInput  = document.getElementById("tableSearch");
    const tableBody    = document.getElementById("applicationTableBody");
    const viewModal    = document.getElementById("viewModal");
    const posModal     = document.getElementById("positionChangeModal");
    const tabNew       = document.getElementById("tab-new");
    const tabPosition  = document.getElementById("tab-position");

    // ── Sidebar tooltips ──────────────────────────────────────────
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.textContent.trim());
    });

    // ── Sidebar toggle ────────────────────────────────────────────
    if (closeBtn)    closeBtn.onclick    = () => sidebar.classList.add("collapsed");
    if (logoToggle)  logoToggle.onclick  = () => sidebar.classList.toggle("collapsed");

    // ── Live search ───────────────────────────────────────────────
    if (searchInput && tableBody) {
        searchInput.addEventListener("keyup", () => {
            const filter = searchInput.value.toLowerCase();
            tableBody.querySelectorAll("tr").forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
            });
        });
    }

    // ── Tab switching ─────────────────────────────────────────────
    tabNew.addEventListener("click", () => {
        tabNew.classList.add("active");
        tabPosition.classList.remove("active");
    });

    tabPosition.addEventListener("click", () => {
        tabPosition.classList.add("active");
        tabNew.classList.remove("active");
        posModal.style.display = "flex";
    });

    // ── Delegated click handler (view / approve / reject) ─────────
    document.addEventListener("click", (e) => {

        // View Details
        if (e.target.classList.contains("view-link")) {
            e.preventDefault();
            const row   = e.target.closest("tr");
            const cells = row.querySelectorAll("td");

            document.getElementById("modalSubmitDate").innerText  = cells[4]?.innerText || "---";
            document.getElementById("modalDepartment").innerText  = cells[2]?.innerText || "---";
            document.getElementById("modalPosition").innerText    = cells[3]?.innerText || "---";
            document.getElementById("modalProgress").innerText    = cells[5]?.innerText || "---";
            document.getElementById("modalRemarks").innerText     = "Awaiting review.";
            document.getElementById("modalFileName").innerText    = "Document.pdf";
            document.getElementById("modalReviewerText").innerHTML = "<small>Reviewed by: ---</small>";

            const statusPill = cells[6]?.querySelector(".status-pill");
            document.getElementById("modalStatusContainer").innerHTML =
                statusPill ? statusPill.outerHTML : "<span>---</span>";

            const isFinal = (statusPill?.innerText || "").includes("Approved") ||
                            (statusPill?.innerText || "").includes("Rejected");
            document.getElementById("modalActions").style.display = isFinal ? "none" : "flex";

            viewModal.style.display = "flex";
        }

        // Dropdown — Approve
        if (e.target.classList.contains("approve-option")) {
            e.preventDefault();
            const row = e.target.closest("tr");
            row.children[6].innerHTML = `<span class="status-pill approved">Approved</span>`;
            row.children[5].innerText = "Completed";
        }

        // Dropdown — Reject
        if (e.target.classList.contains("reject-option")) {
            e.preventDefault();
            const row = e.target.closest("tr");
            row.children[6].innerHTML = `<span class="status-pill rejected">Rejected</span>`;
            row.children[5].innerText = "Completed";
        }
    });

    // ── Modal action buttons ──────────────────────────────────────
    document.getElementById("modalApproveBtn").addEventListener("click", () => {
        document.getElementById("modalStatusContainer").innerHTML =
            `<span class="status-pill approved">Approved</span>`;
        document.getElementById("modalActions").style.display = "none";
        document.getElementById("modalReviewerText").innerHTML = `<small>Reviewed by: HR Manager</small>`;
        document.getElementById("modalRemarks").innerText =
            `Approved on ${new Date().toLocaleDateString()}`;
    });

    document.getElementById("modalRejectBtn").addEventListener("click", () => {
        document.getElementById("modalStatusContainer").innerHTML =
            `<span class="status-pill rejected">Rejected</span>`;
        document.getElementById("modalActions").style.display = "none";
        document.getElementById("modalReviewerText").innerHTML = `<small>Reviewed by: HR Manager</small>`;
        document.getElementById("modalRemarks").innerText =
            `Rejected on ${new Date().toLocaleDateString()}`;
    });

    // ── Cancel position-change modal ──────────────────────────────
    document.getElementById("cancelRequest").addEventListener("click", () => {
        posModal.style.display = "none";
        tabNew.classList.add("active");
        tabPosition.classList.remove("active");
    });

    // ── Click outside modal to close ─────────────────────────────
    window.addEventListener("click", (e) => {
        if (e.target === viewModal) {
            viewModal.style.display = "none";
        }
        if (e.target === posModal) {
            posModal.style.display = "none";
            tabNew.classList.add("active");
            tabPosition.classList.remove("active");
        }
    });

    // ── ESC key to close ─────────────────────────────────────────
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            viewModal.style.display = "none";
            posModal.style.display  = "none";
            tabNew.classList.add("active");
            tabPosition.classList.remove("active");
        }
    });
});

function closeViewModal() {
    document.getElementById("viewModal").style.display = "none";
}