/* --- UI Elements Initialization --- */
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");

const viewModal = document.getElementById("viewModal");
const posModal = document.getElementById("positionChangeModal");
const posForm = document.getElementById("positionChangeForm");

// Target specific IDs for the Status update
const positionSelect = document.getElementById("requestedPositionSelect");
const statusBanner = document.getElementById("modalStatusBanner");
const timelineList = document.getElementById("modalTimelineList");

/* --- Sidebar Logic --- */
closeBtn?.addEventListener("click", () => sidebar.classList.add("collapsed"));
logoToggle?.addEventListener("click", () => sidebar.classList.remove("collapsed"));

/* --- Position Change & Timeline Logic --- */
if (positionSelect) {
    positionSelect.addEventListener('change', function() {
        const selectedRole = this.value; // "Dean" or "Department Head"

        // 1. Update the Banner
        if (statusBanner) {
            statusBanner.innerHTML = `<i class="fas fa-exclamation-circle"></i> Pending - For ${selectedRole} Approval`;
        }

        // 2. Update the Timeline List
        if (timelineList) {
            timelineList.innerHTML = `
                <div class="timeline-item">
                    <span>HR Evaluator</span> 
                    <span class="status-ok"><i class="fas fa-check-square"></i> Approved - Feb 18</span>
                </div>
                <div class="timeline-item">
                    <span>${selectedRole}</span> 
                    <span class="status-pending"><i class="fas fa-hourglass-half"></i> Pending</span>
                </div>
                <div class="timeline-item">
                    <span>HR Head</span> 
                    <span>-</span>
                </div>
                <div class="timeline-item">
                    <span>SD</span> 
                    <span>-</span>
                </div>
            `;
        }
    });
}

/* --- Modal Logic --- */
const closeAllModals = () => {
    viewModal.style.display = "none";
    posModal.style.display = "none";
};

document.getElementById("modalClose")?.addEventListener("click", closeAllModals);
document.getElementById("posClose")?.addEventListener("click", closeAllModals);
document.getElementById("cancelRequest")?.addEventListener("click", closeAllModals);

// Open View Modal
document.querySelectorAll(".view-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        viewModal.style.display = "flex";
    });
});

// Open Position Request Modal via Tab
document.getElementById("posChangeTabBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    posModal.style.display = "flex";
});

// Form Submission
posForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Position change request logged successfully!");
    closeAllModals();
    posForm.reset();
});

// Close on background click
window.addEventListener("click", (e) => {
    if (e.target === viewModal || e.target === posModal) closeAllModals();
});