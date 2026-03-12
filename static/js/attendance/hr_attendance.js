document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");

    // --- 1. SIDEBAR TOGGLE LOGIC ---
    
    // Collapse sidebar when the left chevron is clicked
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
        });
    }

    // Expand sidebar when the logo is clicked (only if it's currently collapsed)
    if (logoToggle) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
            }
        });
    }

    // --- 2. MENU ITEM LOGIC (Active States & Tooltips) ---
    
    menuItems.forEach(item => {
        // Setup Tooltips: Extract text from the span and set it as a data attribute.
        // The CSS uses this 'data-text' attribute to show tooltips in collapsed mode.
        const span = item.querySelector("span");
        if (span) {
            item.setAttribute("data-text", span.innerText.trim());
        }

        // Handle Active State: Highlight the clicked menu item
        item.addEventListener("click", function() {
            // Find the currently active item and remove the class
            const currentActive = document.querySelector(".menu-item.active");
            if (currentActive) {
                currentActive.classList.remove("active");
            }
            
            // Add the active class to the item that was just clicked
            this.classList.add("active");
        });
    });

    // --- 3. FILTER TAG LOGIC ---
    
    // Allows the user to dismiss the "Sample Filter [X]" button
    const filterTag = document.querySelector(".filter-tag");
    if (filterTag) {
        const closeIcon = filterTag.querySelector(".fa-times");
        if (closeIcon) {
            closeIcon.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevents clicking the text from firing too
                filterTag.style.display = "none";
            });
        }
    }

    // --- 4. RESPONSIVE BEHAVIOR ---
    
    // Automatically collapse the sidebar on smaller screens (like tablets or small laptops)
    // to ensure the white attendance dashboard has enough room.
    const handleResize = () => {
        if (window.innerWidth <= 1100) {
            sidebar.classList.add("collapsed");
        } else {
            sidebar.classList.remove("collapsed");
        }
    };

    // Listen for screen size changes
    window.addEventListener("resize", handleResize);
    
    // Run the check once immediately when the page loads
    handleResize();
});