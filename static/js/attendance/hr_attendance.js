document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");

    // Close sidebar when clicking the chevron
    closeBtn.addEventListener("click", () => {
        sidebar.classList.add("collapsed");
    });

    // Expand sidebar when clicking the logo wrapper while collapsed
    logoToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
        }
    });

    // Handle Active Menu States
    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove("active"));
            
            // Add active class to clicked item
            this.classList.add("active");
        });

        // Set tooltips for collapsed mode using HTML attributes
        const spanText = item.querySelector("span").innerText;
        item.setAttribute("title", spanText);
    });
});