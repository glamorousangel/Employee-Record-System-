document.addEventListener("DOMContentLoaded", () => {
    // Select core elements
    const applicantForm = document.getElementById("applicantForm");
    const cvInput = document.getElementById("cv-upload");
    const fileNameDisplay = document.getElementById("file-name");
    const dropZone = document.getElementById("drop-zone");
    
    // Success Modal elements
    const successModal = document.getElementById("successModal");
    const modalOkBtn = document.getElementById("modalOkBtn");

    // Cancel Modal elements
    const cancelBtn = document.getElementById("cancelBtn");
    const cancelModal = document.getElementById("cancelModal");
    const confirmCancelBtn = document.getElementById("confirmCancelBtn");
    const stayBtn = document.getElementById("stayBtn");

    /**
     * 1. Drag and Drop & File Upload Logic
     */
    if (dropZone && cvInput) {
        dropZone.addEventListener("click", () => cvInput.click());

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("over");
        });

        ["dragleave", "dragend"].forEach(type => {
            dropZone.addEventListener(type, () => dropZone.classList.remove("over"));
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("over");
            if (e.dataTransfer.files.length) {
                cvInput.files = e.dataTransfer.files;
                displayFileName(e.dataTransfer.files[0]);
            }
        });

        cvInput.addEventListener("change", (e) => {
            if (e.target.files.length) {
                displayFileName(e.target.files[0]);
            }
        });
    }

    function displayFileName(file) {
        if (file) {
            fileNameDisplay.textContent = `Selected: ${file.name}`;
            fileNameDisplay.style.display = "block";
        } else {
            fileNameDisplay.textContent = "No file chosen";
        }
    }

    /**
     * 2. Submission Logic
     */
    if (applicantForm) {
        applicantForm.addEventListener("submit", (e) => {
            e.preventDefault();
            successModal.style.display = "flex";
        });
    }

    if (modalOkBtn) {
        modalOkBtn.addEventListener("click", () => {
            window.location.href = "../dashboard/dashboard.html"; 
        });
    }

    /**
     * 3. Custom Cancel Modal Logic
     */
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            cancelModal.style.display = "flex";
        });
    }

    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener("click", () => {
            window.location.href = "../dashboard/dashboard.html";
        });
    }

    if (stayBtn) {
        stayBtn.addEventListener("click", () => {
            cancelModal.style.display = "none";
        });
    }

    // Close modals if clicking on the darkened backdrop
    window.addEventListener("click", (e) => {
        if (e.target === successModal) successModal.style.display = "none";
        if (e.target === cancelModal) cancelModal.style.display = "none";
    });
});