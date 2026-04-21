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
            if (hiddenType) hiddenType.value = btn.innerText.trim();
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
        leaveForm.addEventListener('submit', (e) => {
            const hiddenType = document.getElementById('hiddenLeaveType');
            // Only intercept the submission if the user forgot to select a leave type
            if (!hiddenType || !hiddenType.value.trim()) {
                e.preventDefault(); 
                alert("Please select a Leave Type before submitting your request.");
                return;
            }
            
            // Disable the submit button to prevent duplicate submissions while Django processes the POST request
            const submitBtn = leaveForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
        });
    }
});