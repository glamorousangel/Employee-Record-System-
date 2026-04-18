document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const leaveForm = document.getElementById('leaveRequestForm');
    const menuItems = document.querySelectorAll(".menu-item");

    // --- Sidebar Logic ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add('collapsed');
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle('collapsed');

    // --- Leave Type Selection ---
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Pass the selected leave type to the Django form
            const hiddenType = document.getElementById('hiddenLeaveType');
            if (hiddenType) hiddenType.value = btn.innerText;
        });
    });

    // --- File Upload ---
    if (dropZone && fileInput) {
        dropZone.onclick = () => fileInput.click();
        fileInput.onchange = () => {
            if (fileInput.files.length > 0) {
                dropZone.innerHTML = `
                    <i class="fas fa-file-alt" style="color: #4a1d1d; font-size: 24px;"></i>
                    <p>Selected: <b>${fileInput.files[0].name}</b></p>
                `;
            }
        };
    }

    // --- Submit & Credits Calculation ---
    if (leaveForm) {
        // Form intercepts removed to ensure standard Django native database save occurs.
    }
});