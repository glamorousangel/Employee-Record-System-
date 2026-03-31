document.addEventListener("DOMContentLoaded", () => {
    // Select core elements
    const applicantForm = document.getElementById("applicantForm");
    const cvInput = document.getElementById("cv-upload");
    const fileNameDisplay = document.getElementById("file-name");
    const dropZone = document.getElementById("drop-zone");
    
    // Select Modal elements
    const successModal = document.getElementById("successModal");
    const modalOkBtn = document.getElementById("modalOkBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    /**
     * 1. Drag and Drop & File Upload Logic
     * Matches the dashed zone requirement from the layout drawing
     */
    if (dropZone && cvInput) {
        // Click zone to open file explorer
        dropZone.addEventListener("click", () => cvInput.click());

        // Visual states for dragging
        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("over");
        });

        ["dragleave", "dragend"].forEach(type => {
            dropZone.addEventListener(type, () => dropZone.classList.remove("over"));
        });

        // Handle dropped files
        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("over");
            if (e.dataTransfer.files.length) {
                cvInput.files = e.dataTransfer.files;
                displayFileName(e.dataTransfer.files[0]);
            }
        });

        // Handle selected files
        cvInput.addEventListener("change", (e) => {
            if (e.target.files.length) {
                displayFileName(e.target.files[0]);
            }
        });
    }

    // Helper to show file name in the UI
    function displayFileName(file) {
        if (file) {
            fileNameDisplay.textContent = `Selected: ${file.name}`;
            fileNameDisplay.style.display = "block";
        } else {
            fileNameDisplay.textContent = "No file chosen";
        }
    }

    /**
     * 2. Submission & Success Notification
     * Triggers the "Application Sent" modal instead of a simple alert
     */
    if (applicantForm) {
        applicantForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Show the custom success modal
            successModal.style.display = "flex";
        });
    }

    /**
     * 3. Navigation & Redirection
     * Handles routing after the application process
     */
    
    // OK button inside the modal leads to another page (Dashboard)
    if (modalOkBtn) {
        modalOkBtn.addEventListener("click", () => {
            window.location.href = "../dashboard/dashboard.html"; 
        });
    }

    // Cancel button leads back to the dashboard/previous page
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to cancel? Progress will be lost.")) {
                window.location.href = "../dashboard/dashboard.html";
            }
        });
    }
});