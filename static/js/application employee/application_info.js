document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");

    // Sidebar Toggling
    closeBtn.addEventListener("click", () => sidebar.classList.add("collapsed"));
    logoToggle.addEventListener("click", () => sidebar.classList.remove("collapsed"));

    // Form CV logic
    const uploadBtn = document.getElementById('uploadBtn');
    const cvInput = document.getElementById('cvInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    uploadBtn.addEventListener('click', () => cvInput.click());
    cvInput.addEventListener('change', () => {
        fileNameDisplay.textContent = cvInput.files[0]?.name || "File_Name.pdf";
    });
});