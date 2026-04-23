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
            // Capture the selected leave type in the hidden field
            document.getElementById('leave_type_hidden').value = btn.textContent.trim();
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
        leaveForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const startDateVal = document.getElementsByName('start_date')[0].value;
            const endDateVal = document.getElementsByName('end_date')[0].value;
            const reasonVal = document.getElementById('leaveReason').value;

            if (!startDateVal || !endDateVal || !reasonVal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Missing Info',
                    text: 'Please fill in all required fields.',
                    confirmButtonColor: '#4a1d1d'
                });
                return false;
            }

            const submitBtn = leaveForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            // Use FormData to handle file upload and other fields
            const formData = new FormData(leaveForm);
            
            try {
                const response = await fetch(leaveForm.action || '{% url "leaves:hr_apply_leave" %}', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Your leave request has been submitted successfully!',
                        confirmButtonColor: '#4a1d1d'
                    }).then(() => {
                        // Redirect to history page
                        window.location.href = result.redirect || result.redirect_url;
                    });
                } else {
                    let errorMsg = result.message || 'Submission failed. Please review the form for errors.';
                    if (result.errors) {
                        const errorFields = Object.entries(result.errors)
                            .map(([field, errs]) => `${field}: ${errs.join(', ')}`)
                            .join('\n');
                        errorMsg = `Submission failed:\n${errorFields}`;
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Submission Failed',
                        text: errorMsg,
                        confirmButtonColor: '#4a1d1d'
                    });
                    if (submitBtn) submitBtn.disabled = false;
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Network Error',
                    text: 'An error occurred while submitting your request. Please try again.',
                    confirmButtonColor: '#4a1d1d'
                });
                if (submitBtn) submitBtn.disabled = false;
                console.error('Form submission error:', error);
            }
        };
    }
});