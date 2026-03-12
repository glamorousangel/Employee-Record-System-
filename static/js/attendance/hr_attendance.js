document.addEventListener("DOMContentLoaded", () => {
    // Select elements from the DOM
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");

    /**
     * SIDEBAR INTERACTION
     * Manages the open/close state of the navigation menu
     */
    
    // Collapse the sidebar when clicking the chevron icon
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
        });
    }

    // Expand the sidebar when clicking the logo while collapsed
    if (logoToggle) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
            }
        });
    }

    /**
     * MENU MANAGEMENT
     * Handles active highlighting and tooltips for collapsed mode
     */

    menuItems.forEach(item => {
        // Automatically set tooltip text from the link's span text
        const span = item.querySelector("span");
        if (span) {
            const text = span.innerText;
            // Matches the 'attr(data-text)' used in your CSS
            item.setAttribute("data-text", text);
        }

        // Handle clicking menu items
        item.addEventListener("click", function() {
            // Remove active class from any other item
            const currentActive = document.querySelector(".menu-item.active");
            if (currentActive) {
                currentActive.classList.remove("active");
            }
            
            // Apply active class to the clicked item
            this.classList.add("active");
        });
    });

    /**
     * OPTIONAL: SEARCH FILTER INTERACTION
     * Allows the 'Sample Filter' tag to be dismissed
     */
    const filterTag = document.querySelector(".filter-tag");
    if (filterTag) {
        const closeIcon = filterTag.querySelector(".fa-times");
        if (closeIcon) {
            closeIcon.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevents triggering filter button logic
                filterTag.style.display = "none";
            });
        }
    }
});