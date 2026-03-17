document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // Sidebar Toggle Logic
    const handleToggle = () => sidebar.classList.toggle('collapsed');
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add('collapsed');
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.remove('collapsed');

    // Generate tooltips for collapsed state
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector('span');
        if (span) item.setAttribute('data-text', span.innerText);
    });

    // Leave Type selection highlighting
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // File Drag & Drop / Browse
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                dropZone.innerHTML = `
                    <i class="fas fa-check-circle" style="color: #28a745; font-size: 24px;"></i>
                    <p>Selected: <b>${fileName}</b></p>
                    <small style="color: #666; cursor: pointer;">Click to change file</small>`;
            }
        });
    }

    // Optional: Form Submission logic
    const leaveForm = document.getElementById('leaveRequestForm');
    if (leaveForm) {
        leaveForm.onsubmit = (e) => {
            e.preventDefault();
            alert("Leave Request Submitted Successfully!");
            window.location.href = 'head_leaveselect.html';
        };
    }
});