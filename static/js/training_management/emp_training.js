document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const mainContent = document.getElementById("mainContent");
    const menuItems = document.querySelectorAll(".menu-item");

    // --- Sidebar Toggle ---
    if (closeBtn && sidebar) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            if (mainContent) mainContent.style.marginLeft = "100px";
        });
    }

    if (logoToggle && sidebar) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
                if (mainContent) mainContent.style.marginLeft = "340px";
            }
        });
    }

    // --- Tooltip text for collapsed sidebar ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });

    // --- Register Button Alert ---
    document.querySelectorAll(".btn-register").forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".training-card");
            const name = card.querySelector(".training-card-title").textContent.replace(/\n/g, ' ').trim();
            alert(`Registered for: ${name}`);
        });
    });
});