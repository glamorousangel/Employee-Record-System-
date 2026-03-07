/* --- UI Elements Initialization --- */
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");

// Applicant View Modal Elements
const viewModal = document.getElementById("viewModal");
const closeModal = document.getElementById("modalClose");
const nextBtn = document.getElementById("nextSlide");
const prevBtn = document.getElementById("prevSlide");
const slide1 = document.getElementById("slide1");
const slide2 = document.getElementById("slide2");
const docImg = document.querySelector(".doc-image");

// Position Change Modal Elements
const posModal = document.getElementById("positionChangeModal");
const posBtn = document.getElementById("posRequestBtn");
const posClose = document.getElementById("posClose");
const cancelReq = document.getElementById("cancelRequest");

// Table & Search
const searchInput = document.querySelector('.search-input-wrapper input');
const tableRows = document.querySelectorAll('tbody tr');

/* --- Sidebar Logic --- */
if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        sidebar.classList.add("collapsed");
    });
}

if (logoToggle) {
    logoToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
        }
    });
}

// Tooltips for collapsed state
document.querySelectorAll(".menu-item").forEach(item => {
    const spanText = item.querySelector("span")?.innerText || "";
    item.setAttribute("data-text", spanText);
});

/* --- Search Functionality --- */
if (searchInput) {
    searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase().trim();
        let visibleCount = 0;

        tableRows.forEach((row) => {
            const id = row.cells[0]?.innerText.toLowerCase() || "";
            const name = row.cells[1]?.innerText.toLowerCase() || "";
            const dept = row.cells[2]?.innerText.toLowerCase() || "";
            const pos = row.cells[3]?.innerText.toLowerCase() || "";

            if (id.includes(searchTerm) || name.includes(searchTerm) || 
                dept.includes(searchTerm) || pos.includes(searchTerm)) {
                
                row.style.display = ""; 
                row.style.backgroundColor = (visibleCount % 2 === 0) ? "#ffffff" : "#f0f0f0";
                visibleCount++;
            } else {
                row.style.display = "none";
            }
        });
    });
}

/* --- Applicant View Modal Logic --- */
function showSlide(slideNumber) {
    if (slideNumber === 1) {
        slide1.classList.add("active");
        slide2.classList.remove("active");
    } else {
        slide1.classList.remove("active");
        slide2.classList.add("active");
    }
}

if (nextBtn) nextBtn.addEventListener("click", () => showSlide(2));
if (prevBtn) prevBtn.addEventListener("click", () => showSlide(1));

document.querySelectorAll(".view-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        showSlide(1); 
        viewModal.style.display = "flex";
    });
});

const closeAllModals = () => {
    if (viewModal) viewModal.style.display = "none";
    if (posModal) posModal.style.display = "none";
};

if (closeModal) closeModal.addEventListener("click", closeAllModals);

/* --- Position Change Request Logic --- */
if (posBtn) {
    posBtn.addEventListener("click", (e) => {
        e.preventDefault();
        posModal.style.display = "flex";
    });
}

if (posClose) posClose.addEventListener("click", closeAllModals);
if (cancelReq) cancelReq.addEventListener("click", closeAllModals);

/* --- Global Event Listeners --- */

// Close on outside click
window.addEventListener("click", (e) => {
    if (e.target === viewModal || e.target === posModal) {
        closeAllModals();
    }
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeAllModals();
    }
});

/* --- Form Actions --- */
document.querySelector(".modal-approve")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to approve this application?")) {
        alert("Application has been approved.");
        closeAllModals();
    }
});

document.querySelector(".modal-reject")?.addEventListener("click", () => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason !== null && reason.trim() !== "") {
        alert("Application has been rejected.");
        closeAllModals();
    }
});

// Position Change Form Submit
document.getElementById("positionChangeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Position change request logged successfully!");
    closeAllModals();
});