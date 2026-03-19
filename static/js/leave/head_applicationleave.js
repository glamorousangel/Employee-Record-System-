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

    // --- FIXED SUBMISSION LOGIC ---
    const leaveForm = document.getElementById('leaveRequestForm');
    if (leaveForm) {
        leaveForm.onsubmit = (e) => {
            e.preventDefault();

            // Match the 'name' attributes from your HTML
            const selectedType = document.querySelector('.type-btn.active')?.innerText || "General Leave";
            const startDateVal = document.querySelector('input[name="start_date"]').value;
            const endDateVal = document.querySelector('input[name="end_date"]').value;
            const reasonVal = document.querySelector('.form-textarea').value;
            
            // Calculate Days
            const start = new Date(startDateVal);
            const end = new Date(endDateVal);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const newRequest = {
                id: Date.now(),
                name: "Jose Brian Dela Peña", 
                role: "Department Head",
                dateFiled: new Date().toISOString().split('T')[0],
                leaveType: selectedType,
                startDate: startDateVal,
                endDate: endDateVal,
                numDays: diffDays,
                reason: reasonVal,
                status: "Pending", 
                reviewedBy: "---",
                submitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                fileName: fileInput.files[0]?.name || "No Document Attached",
                fileData: null 
            };

            let allRequests = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
            allRequests.push(newRequest);
            localStorage.setItem('allLeaveRequests', JSON.stringify(allRequests));

            alert("Leave Request Submitted Successfully!");
            window.location.href = 'head_leaveselect.html';
        };
    }
});