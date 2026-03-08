document.addEventListener("DOMContentLoaded", () => {

    // --- 1. SELECT ELEMENTS ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");
    const logoutBtn = document.querySelector(".logout");

    // Table & Search Elements
    const searchInput = document.getElementById('searchInput');
    const tableRows = () => document.querySelectorAll('#trainingTable tbody tr');

    // Modal Elements
    const modal = document.getElementById('trainingModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const addForm = document.getElementById('addTrainingForm');

    // CV Upload Elements (if applicable to your page)
    const cvInput = document.getElementById("cv-upload");
    const fileNameDisplay = document.getElementById("file-name");

    console.log("System Initialized: All modules active.");

    // --- 2. SIDEBAR LOGIC ---
    if (sidebar && closeBtn && logoToggle) {
        // Collapse sidebar
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
        });

        // Expand sidebar via logo
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
            }
        });
    }

    // --- 3. MENU INTERACTION (Active States & Tooltips) ---
    menuItems.forEach(item => {
        // Set Tooltip Text for collapsed mode based on the <span> content
        const span = item.querySelector("span");
        if (span) {
            item.setAttribute("data-text", span.innerText);
        }

        item.addEventListener("click", (e) => {
            // Prevent 'active' highlight if it's the logout button
            if (item.classList.contains("logout")) return;

            const currentActive = document.querySelector(".menu-item.active");
            if (currentActive) {
                currentActive.classList.remove("active");
            }
            item.classList.add("active");
        });
    });

    // --- 4. LOGOUT LOGIC (Immediate Redirect) ---
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault(); 
            console.log("Action: Logging out user immediately.");
            // Redirects straight to login page path provided in your HTML
            window.location.href = "../login/login.html";
        });
    }

    // --- 5. SEARCH LOGIC (Training Table) ---
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            tableRows().forEach(row => {
                const text = row.innerText.toLowerCase();
                // Show row if it matches query, otherwise hide it
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // --- 6. MODAL LOGIC (Add Training) ---
    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal if user clicks on the dark background area
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // --- 7. FORM SUBMISSIONS ---
    // Add Training Form Logic
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('newTrainingName')?.value || "New Training";
            alert(`Success: ${name} has been added.`);
            
            // Clear form and close modal after "saving"
            addForm.reset();
            modal.style.display = 'none';
        });
    }

    // CV Upload Module (Used in Employee Profile/Application pages)
    if (cvInput && fileNameDisplay) {
        cvInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length > 0) {
                fileNameDisplay.textContent = e.target.files[0].name;
            } else {
                fileNameDisplay.textContent = "No file chosen";
            }
        });
    }

});