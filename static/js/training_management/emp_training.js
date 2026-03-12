document.addEventListener("DOMContentLoaded", () => {

    // --- Elements ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const mainContent = document.getElementById("mainContent");
    const menuItems = document.querySelectorAll(".menu-item");

    const searchInput = document.getElementById("trainingSearch");
    const cards = document.querySelectorAll(".training-card");

    const modal = document.getElementById("trainingModal");
    const closeModalBtn = document.getElementById("closeModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");

    // --- 1. Sidebar Toggle Logic ---
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            if (mainContent) mainContent.style.marginLeft = "100px";
        });
    }

    if (logoToggle) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
                if (mainContent) mainContent.style.marginLeft = "340px";
            }
        });
    }

    // Set tooltip text for collapsed sidebar
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });


    // --- 2. Search / Filter Logic ---
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const filter = searchInput.value.toLowerCase();
            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(filter) ? "" : "none";
            });
        });
    }


    // --- 3. Registration Button Logic ---
    // We use stopPropagation so clicking "Register" doesn't also open the "View" modal
    document.querySelectorAll(".btn-register:not(.btn-register--disabled)").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevents the card click event from firing
            const card = btn.closest(".training-card");
            const name = card.querySelector(".training-card-title").textContent;
            alert(`Registration request sent for: ${name}`);
        });
    });


    // --- 4. Modal (View Training) Logic ---
    
    // Function to open modal and populate data
    const openTrainingModal = (card) => {
        const title = card.querySelector(".training-card-title").innerText;
        const category = card.querySelector(".training-card-category").innerText;
        const date = card.querySelector(".training-card-date").innerText;

        // Update Modal Header text based on clicked card
        if (modalTitle) modalTitle.innerText = title;
        if (modalSubtitle) modalSubtitle.innerText = `${category} | ${date}`;

        modal.classList.add("active");
    };

    // Click event for the cards
    cards.forEach(card => {
        card.addEventListener("click", () => {
            openTrainingModal(card);
        });
    });

    // Close Modal via Button
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            modal.classList.remove("active");
        });
    }

    // Close Modal by clicking the darkened background
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    // Handle "Esc" key to close modal
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            modal.classList.remove("active");
        }
    });

});