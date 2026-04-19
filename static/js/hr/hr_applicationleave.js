/* hr_applicationleave.js */
document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const dropZoneContent = document.getElementById('dropZoneContent');
    const fileInput = document.getElementById('fileInput');
    const leaveForm = document.getElementById('leaveRequestForm');
    const menuItems = document.querySelectorAll(".menu-item");

    let selectedFileName = "No Document Attached";

    // --- Sidebar & Tooltips ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // --- Leave Type Selection ---
    typeButtons.forEach(btn => {
        btn.onclick = () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });

    // --- File Upload Handling ---
    if (dropZone && fileInput) {
        dropZone.onclick = () => fileInput.click();

        fileInput.onchange = () => {
            if (fileInput.files.length > 0) {
                selectedFileName = fileInput.files[0].name;
                if (dropZoneContent) {
                    dropZoneContent.innerHTML = `
                        <i class="fas fa-check-circle" style="color: #28a745; font-size: 24px;"></i>
                        <p style="margin-top: 10px;">Selected: <span style="color: #4a1d1d; font-weight: bold;">${selectedFileName}</span></p>
                        <small style="color: #666;">Click to change file</small>
                    `;
                }
            }
        };
    }

    // --- Form Submission Logic ---
    if (leaveForm) {
        leaveForm.onsubmit = (e) => {
            const startDateVal = document.getElementsByName('start_date')[0].value;
            const endDateVal = document.getElementsByName('end_date')[0].value;
            const reasonVal = document.getElementById('leaveReason').value;

            if (!startDateVal || !endDateVal || !reasonVal) {
                e.preventDefault();
                Swal.fire({
                    icon: 'error',
                    title: 'Missing Info',
                    text: 'Please fill in all required fields.',
                    confirmButtonColor: '#4a1d1d'
                });
                return false;
            }

            // DO NOT preventDefault if valid. Allow native HTML form to save via Django.
            const submitBtn = leaveForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
        };
    }
});