/* --- Sidebar & UI Initialization --- */
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");
const modal = document.getElementById("viewModal");
const closeModal = document.getElementById("modalClose");

/**
 * Sidebar Toggle Logic
 * Handles collapsing the sidebar and showing/hiding icons
 */
closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

logoToggle.addEventListener("click", () => {
    // Only expands if it is currently collapsed
    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
    }
});

/**
 * Menu Item Active State & Tooltips
 * Sets the active class and creates data-text attributes for collapsed tooltips
 */
document.querySelectorAll(".menu-item").forEach(item => {
    const spanText = item.querySelector("span") ? item.querySelector("span").innerText : "";
    item.setAttribute("data-text", spanText);
    
    item.addEventListener("click", function() {
        document.querySelector(".menu-item.active")?.classList.remove("active");
        this.classList.add("active");
    });
});

/* --- Modal (Frame View) Logic --- */

/**
 * Open Modal
 * Triggered by clicking any "View" link in the table
 */
document.querySelectorAll(".view-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent page jump
        
        // Optional: You can add logic here to grab the ID from the row 
        // and update the modal content dynamically before showing it.
        
        modal.style.display = "flex";
    });
});

/**
 * Close Modal
 * Handles clicking the 'X', clicking the background overlay, or pressing 'Esc'
 */
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
    }
});

/* --- Table Dropdown Logic --- */

/**
 * Quick Action Buttons (Approve/Reject)
 * Simple feedback for the modal buttons
 */
document.querySelector(".modal-approve")?.addEventListener("click", () => {
    if(confirm("Are you sure you want to approve this application?")) {
        alert("Application Approved!");
        modal.style.display = "none";
    }
});

document.querySelector(".modal-reject")?.addEventListener("click", () => {
    if(confirm("Are you sure you want to reject this application?")) {
        const reason = prompt("Please provide a reason for rejection:");
        if (reason) {
            alert("Application Rejected.");
            modal.style.display = "none";
        }
    }
});