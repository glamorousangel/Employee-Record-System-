document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const leaveManagementLink = document.getElementById('leaveManagementLink');
    const modal = document.getElementById('leaveModal');
    const modalClose = document.getElementById('modalClose');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // --- 1. Sidebar Toggle & Card Stretch ---
    // Controls the width and the 1-inch (96px/110px) gap proportion
    const handleToggle = () => {
        if (sidebar) sidebar.classList.toggle('close');
    };
    if (closeBtn) closeBtn.addEventListener('click', handleToggle);
    if (logoToggle) logoToggle.addEventListener('click', handleToggle);

    // --- 2. Modal Choice Logic ---
    // Shows the modal instead of navigating
    if (leaveManagementLink) {
        leaveManagementLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (modal) modal.style.display = 'flex';
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Close if user clicks the dark background
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // --- 3. Leave Type Selection ---
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // --- 4. File Upload & Filename Display ---
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                // Display the selected filename inside the box
                dropZone.innerHTML = `
                    <i class="fas fa-check-circle" style="color: #28a745; font-size: 24px;"></i>
                    <p style="margin-top: 10px;">Selected: <span style="color: #4a1d1d; font-weight: bold;">${fileName}</span></p>
                    <small style="color: #666;">Click to change file</small>
                `;
            }
        });
    }

    // --- 5. Form Submission ---
    const form = document.getElementById('leaveRequestForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Leave request submitted successfully!');
        });
    }
});