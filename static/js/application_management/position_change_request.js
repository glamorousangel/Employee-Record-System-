/* position_change_request.js */
const empInfo = { name: "John Smith" };

// ── Mock employee directory ──
const employeeDirectory = {
    'dela cruz, juan': { id: 'EMP-001', position: 'Instructor', dept: 'CCS' },
    'santos, maria': { id: 'EMP-002', position: 'Professor', dept: 'CBA' },
    'reyes, ricardo': { id: 'EMP-003', position: 'Registrar', dept: 'COE' },
    'gomez, patricia': { id: 'EMP-004', position: 'Assistant Professor', dept: 'CAS' },
    'torres, miguel': { id: 'EMP-005', position: 'Clinical Instructor', dept: 'CON' },
    'johnson, alice': { id: 'EMP-006', position: 'Senior Instructor', dept: 'CAS' }
};

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");
    const empNameInput = document.getElementById('empName');
    const cancelBtn = document.getElementById('cancelBtn');
    const submitBtn = document.getElementById('submitBtn');

    // Initialize Tooltip Labels
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) { item.setAttribute("data-text", span.innerText); }
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // Auto-fill employee details
    empNameInput.addEventListener('blur', () => {
        const key = empNameInput.value.trim().toLowerCase();
        const emp = employeeDirectory[key];
        
        if (emp) {
            document.getElementById('empId').value = emp.id;
            document.getElementById('currentPos').value = emp.position;
            document.getElementById('currentDept').value = emp.dept;
        } else {
            document.getElementById('empId').value = '';
            document.getElementById('currentPos').value = '';
            document.getElementById('currentDept').value = '';
        }
    });

    // Cancel button - Show confirmation dialog
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            showConfirmDialog('Cancel Progress?', 'Are you sure you want to cancel? All unsaved progress will be lost.', () => {
                document.getElementById('positionForm').reset();
                document.getElementById('empId').value = '';
                document.getElementById('currentPos').value = '';
                document.getElementById('currentDept').value = '';
            });
        });
    }

    // Submit button - Show success notification
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const empName = document.getElementById('empName').value.trim();
            const requestedPos = document.getElementById('requestedPos').value;
            const effectiveDate = document.getElementById('effectiveDate').value;
            const reason = document.getElementById('reason').value.trim();

            // Validation
            if (!empName || !requestedPos || !effectiveDate || !reason) {
                showToast('Please fill in all required fields.');
                return;
            }

            const empId = document.getElementById('empId').value;
            const currentPos = document.getElementById('currentPos').value;
            const currentDept = document.getElementById('currentDept').value;

            // Show success notification
            showSuccessNotification(`${empName}'s position change request has been successfully submitted.`);

            // Reset form after notification
            setTimeout(() => {
                document.getElementById('positionForm').reset();
                document.getElementById('empId').value = '';
                document.getElementById('currentPos').value = '';
                document.getElementById('currentDept').value = '';
            }, 1500);
        });
    }
});

// ── Confirmation Dialog ──
function showConfirmDialog(title, message, onConfirm) {
    let modal = document.getElementById('confirmModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirmModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="warning-icon">
                    <i class="fa-solid fa-circle-exclamation"></i>
                </div>
                <h2 class="modal-warning-title" id="confirmTitle"></h2>
                <p id="confirmMessage"></p>
                <div class="modal-footer">
                    <button class="btn-cancel btn-flex" id="confirmCancel">YES, CANCEL</button>
                    <button class="btn-save btn-flex" id="confirmStay">NO, STAY</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('confirmCancel').addEventListener('click', () => {
            modal.classList.remove('active');
            onConfirm();
        });

        document.getElementById('confirmStay').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    modal.classList.add('active');
}

// ── Success Notification ──
function showSuccessNotification(message) {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
        <i class="fas fa-check-circle toast-icon"></i>
        <div class="toast-content">
            <h4>Position Change Request Submitted</h4>
            <p>${message}</p>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'toastExit 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
        toast.style.animation = 'toastExit 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ── Simple Toast for Errors ──
function showToast(message) {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = '#ef4444';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle toast-icon" style="color: #ef4444;"></i>
        <div class="toast-content">
            <h4>Validation Error</h4>
            <p>${message}</p>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'toastExit 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
        toast.style.animation = 'toastExit 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}