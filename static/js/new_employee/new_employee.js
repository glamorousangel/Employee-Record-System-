document.addEventListener("DOMContentLoaded", () => {
    // --- UI Elements ---
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent"); // Target for expansion
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");

    const searchInput = document.getElementById("tableSearch");
    const tableBody = document.getElementById("applicationTableBody");
    const noResultsRow = document.getElementById("noResultsRow");
    const rows = tableBody.querySelectorAll("tr:not(#noResultsRow)");

    const viewModal = document.getElementById("viewModal");
    const posModal = document.getElementById("positionChangeModal");
    const posForm = document.getElementById("positionChangeForm");

    const newEmpTabBtn = document.getElementById("newEmpTabBtn");
    const posChangeTabBtn = document.getElementById("posChangeTabBtn");

    const statusBanner = document.getElementById("statusBanner");
    const statusTimelineBox = document.getElementById("statusTimelineBox");
    const submissionTimestamp = document.getElementById("submissionTimestamp");

    // --- Sidebar Logic (Expansion/Collapse) ---
    const toggleSidebar = (isCollapsed) => {
        if (isCollapsed) {
            sidebar.classList.add("collapsed");
            // If you used the CSS sibling selector (+), the margin updates automatically.
            // But we can add a class to mainContent for explicit control if needed:
            mainContent.classList.add("expanded");
        } else {
            sidebar.classList.remove("collapsed");
            mainContent.classList.remove("expanded");
        }
    };

    if (closeBtn) {
        closeBtn.addEventListener("click", () => toggleSidebar(true));
    }

    if (logoToggle) {
        logoToggle.addEventListener("click", () => {
            // Only toggle if currently collapsed (acting as an 'open' trigger)
            if (sidebar.classList.contains("collapsed")) {
                toggleSidebar(false);
            }
        });
    }

    // --- Search Functionality ---
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const filter = searchInput.value.toLowerCase();
            let visibleCount = 0;

            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                if (text.includes(filter)) {
                    row.style.display = "";
                    visibleCount++;
                } else {
                    row.style.display = "none";
                }
            });

            if (noResultsRow) {
                noResultsRow.style.display = visibleCount === 0 ? "" : "none";
            }
        });
    }

    // --- Modal Management ---
    const openModal = (modal) => {
        if (modal) {
            modal.style.display = "flex";
            document.body.style.overflow = "hidden"; // Prevent background scroll
        }
    };

    const closeAllModals = () => {
        [viewModal, posModal].forEach(m => { 
            if (m) m.style.display = "none"; 
        });
        document.body.style.overflow = "auto";
    };

    // View Modal Trigger
    document.querySelectorAll(".view-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            showSlide(1);
            openModal(viewModal);
        });
    });

    // Close Buttons
    document.querySelectorAll(".modal-close, #cancelRequest").forEach(btn => {
        btn.addEventListener("click", closeAllModals);
    });

    // --- Tab Switching & Logical Redirects ---
    const setActiveTab = (clicked, other) => {
        clicked.classList.add("active");
        clicked.classList.remove("secondary");
        other.classList.add("secondary");
        other.classList.remove("active");
    };

    if (newEmpTabBtn && posChangeTabBtn) {
        newEmpTabBtn.addEventListener("click", () => {
            setActiveTab(newEmpTabBtn, posChangeTabBtn);
            // Logic to show New Employee table content if separate
        });

        posChangeTabBtn.addEventListener("click", () => {
            setActiveTab(posChangeTabBtn, newEmpTabBtn);
            openModal(posModal);
        });
    }

    // --- Slide Control (View Modal) ---
    function showSlide(n) {
        const s1 = document.getElementById("slide1");
        const s2 = document.getElementById("slide2");
        if (n === 1) {
            if(s1) s1.classList.add("active");
            if(s2) s2.classList.remove("active");
        } else {
            if(s1) s1.classList.remove("active");
            if(s2) s2.classList.add("active");
        }
    }

    document.getElementById("nextSlide")?.addEventListener("click", () => showSlide(2));
    document.getElementById("prevSlide")?.addEventListener("click", () => showSlide(1));

    // --- Form Submission (Position Change) ---
    if (posForm) {
        posForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            
            if (submissionTimestamp) submissionTimestamp.innerText = `${dateStr} - ${timeStr}`;
            if (statusTimelineBox) statusTimelineBox.style.display = "block";

            const selectEl = posForm.querySelector('select');
            const selectedPos = selectEl ? selectEl.value : "Position";
            
            if (statusBanner) {
                statusBanner.innerHTML = `<i class="fas fa-exclamation-circle"></i> Pending - For ${selectedPos} Approval`;
            }

            alert("Success: Position change request logged.");
            closeAllModals();
            posForm.reset();
        });
    }

    // Global Close (Click Outside or Esc Key)
    window.addEventListener("click", (e) => {
        if (e.target === viewModal || e.target === posModal) closeAllModals();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllModals();
    });
});