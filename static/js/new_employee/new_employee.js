/* --- UI Elements Initialization --- */

// Sidebar
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");

// Tab Buttons
const newEmpTabBtn = document.getElementById("newEmpTabBtn");
const posChangeTabBtn = document.getElementById("posChangeTabBtn");

// Applicant View Modal (Applications Management)
const viewModal = document.getElementById("viewModal");
const closeModal = document.getElementById("modalClose");
const nextBtn = document.getElementById("nextSlide");
const prevBtn = document.getElementById("prevSlide");
const slide1 = document.getElementById("slide1");
const slide2 = document.getElementById("slide2");

// Log New Request Modal (Position Change Request)
const posModal = document.getElementById("positionChangeModal");
const posClose = document.getElementById("posClose"); 
const cancelReq = document.getElementById("cancelRequest");
const posForm = document.getElementById("positionChangeForm");

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

/* --- Search Functionality --- */
if (searchInput) {
    searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase().trim();
        tableRows.forEach((row) => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(searchTerm) ? "" : "none";
        });
    });
}

/* --- Modal Navigation & Logic --- */

const closeAllModals = () => {
    if (viewModal) viewModal.style.display = "none";
    if (posModal) posModal.style.display = "none";
};

// Applicant View Slide Control 
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

/* --- Tab Switching & Log Request Logic --- */

/**
 * Handles the visual "active" state swap and opens the modal if needed.
 */
function setActiveTab(clickedBtn, otherBtn) {
    // Set clicked button to Maroon (Active)
    clickedBtn.classList.add("active");
    clickedBtn.classList.remove("secondary");
    
    // Set other button to Gray (Secondary)
    otherBtn.classList.add("secondary");
    otherBtn.classList.remove("active");
}

const openPosModal = () => {
    if (posModal) {
        posModal.style.display = "flex";
    }
};

// Listener for Position Change Request Tab
if (posChangeTabBtn) {
    posChangeTabBtn.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveTab(posChangeTabBtn, newEmpTabBtn);
        openPosModal();
    });
}

// Listener for New Employee Applications Tab
if (newEmpTabBtn) {
    newEmpTabBtn.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveTab(newEmpTabBtn, posChangeTabBtn);
    });
}

/* --- Form & Modal Close Logic --- */

if (closeModal) closeModal.addEventListener("click", closeAllModals);
if (posClose) posClose.addEventListener("click", closeAllModals);
if (cancelReq) cancelReq.addEventListener("click", closeAllModals);

if (posForm) {
    posForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Success: The position change request has been logged.");
        closeAllModals();
        posForm.reset();
    });
}

/* --- Global Listeners --- */

window.addEventListener("click", (e) => {
    if (e.target === viewModal || e.target === posModal) {
        closeAllModals();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeAllModals();
    }
});