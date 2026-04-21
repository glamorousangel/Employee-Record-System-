document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const leaveForm = document.getElementById('leaveRequestForm');

    // --- Sidebar Logic ---
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add('collapsed');
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.remove('collapsed');

    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector('span');
        if (span) item.setAttribute('data-text', span.innerText);
    });

    // --- Leave Type Selection ---
    typeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent accidental form submission
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            let hiddenInput = document.querySelector('input[name="leave_type"]');
            if (!hiddenInput && leaveForm) {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'leave_type';
                leaveForm.appendChild(hiddenInput);
            }
            if (hiddenInput) {
                hiddenInput.value = btn.innerText.trim();
            }
        });
    });

    // --- File Upload UI ---
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                dropZone.innerHTML = `
                    <i class="fas fa-check-circle" style="color: #28a745; font-size: 24px;"></i>
                    <p>Selected: <b>${fileName}</b></p>
                    <small style="color: #666; cursor: pointer;">Click to change file</small>
                `;
            }
        });
    }

    // --- Submit Logic (Notification with Credits) ---
    if (leaveForm) {
        leaveForm.addEventListener('submit', (e) => {
            const activeBtn = document.querySelector('.type-btn.active');
            if (activeBtn) {
                let hiddenInput = document.querySelector('input[name="leave_type"]');
                if (!hiddenInput) {
                    hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = 'leave_type';
                    hiddenInput.value = activeBtn.innerText.trim();
                    leaveForm.appendChild(hiddenInput);
                }
            } else {
                e.preventDefault();
                alert('Please select a leave type.');
            }
        });
    }
});