const sidebar = document.getElementById('sidebar');
const logoToggle = document.getElementById('logoToggle');
const closeBtn = document.getElementById('closeBtn');
const deleteUserBtn = document.getElementById('deleteUserBtn');
const menuItems = document.querySelectorAll('.menu-item');

// --- Sidebar Tooltip Initialization ---
menuItems.forEach(item => {
    const span = item.querySelector('span');
    if (span) {
        item.setAttribute('data-text', span.innerText.trim());
    }
});

// --- Sidebar Toggle Logic ---
if (logoToggle) {
    logoToggle.addEventListener('click', () => sidebar.classList.toggle('close'));
}
if (closeBtn) {
    closeBtn.addEventListener('click', () => sidebar.classList.add('close'));
}

// --- Delete User functionality ---
if (deleteUserBtn) {
    deleteUserBtn.addEventListener('click', function() {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to delete this user? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#800000', // Maroon
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete user',
            cancelButtonText: 'No, keep user',
            width: '400px',
            customClass: {
                title: 'small-swal-title',
                htmlContainer: 'small-swal-text'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The user has been successfully removed.',
                    icon: 'success',
                    confirmButtonColor: '#4a1d1d'
                }).then(() => {
                    window.location.href = 'hr_employeelist.html';
                });
            }
        });
    });
}

// --- Update Profile Logic ---
function updateHRProfile() {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
        width: '450px',
        background: '#fff',
        color: '#4a1d1d',
        iconColor: '#4a1d1d',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    Toast.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Employee profile has been updated.'
    }).then(() => {
        window.location.href = 'hr_employee_view.html';
    });
}

// --- Cancel Edit Logic ---
function cancelHREdit() {
    Swal.fire({
        title: 'Discard changes?',
        text: "Any unsaved information will be lost.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4a1d1d',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, discard',
        cancelButtonText: 'No',
        width: '400px',
        padding: '1rem',
        customClass: {
            title: 'small-swal-title',
            htmlContainer: 'small-swal-text'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'hr_employee_view.html';
        }
    });
}

// --- Add Event Modal Logic ---
function openEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) modal.style.display = 'flex';
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) modal.style.display = 'none';
}

// --- File Upload Logic (View/Download Actual File) ---
function triggerFileUpload() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.click();
}

function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileURL = URL.createObjectURL(file); // Direct link to the file data
        const display = document.getElementById('fileDisplayArea');

        if (display) {
            display.innerHTML = `
                <div class="file-row" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 10px; border-radius: 8px; margin-top: 10px;">
                    <span><i class="fas fa-file"></i> ${file.name}</span>
                    <div class="file-actions">
                        <a href="${fileURL}" target="_blank" style="margin-left: 10px; color: #4a1d1d;"><i class="fas fa-eye" title="View"></i></a>
                        <a href="${fileURL}" download="${file.name}" style="margin-left: 10px; color: #4a1d1d;"><i class="fas fa-download" title="Download"></i></a>
                    </div>
                </div>
            `;
        }
    }
}