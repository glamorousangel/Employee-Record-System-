document.addEventListener("DOMContentLoaded", () => {
    // 1. SELECT ELEMENTS
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");
    
    
    // Select CV Elements
    const cvInput = document.getElementById("cv-upload");
    const fileNameDisplay = document.getElementById("file-name");

    console.log("Dashboard Script: Initialized");

    // 2. SIDEBAR LOGIC
    if (sidebar && closeBtn && logoToggle) {
        // Collapses the sidebar when clicking the chevron left
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            console.log("Sidebar Status: Collapsed");
        });

        // Expands the sidebar when clicking the logo wrapper while collapsed
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
                console.log("Sidebar Status: Expanded");
            }
        });
    }

    // 3. UPLOAD CV LOGIC
    // Since we used the <label for="cv-upload"> method in the HTML, 
    // the browser handles the click automatically. We just need to update the text.
    if (cvInput && fileNameDisplay) {
        cvInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const name = e.target.files[0].name;
                fileNameDisplay.textContent = name;
                console.log("File Selected:", name);
            } else {
                fileNameDisplay.textContent = "File_Name.pdf";
            }
        });
    } else {
        console.error("CV Upload elements missing. Check IDs: cv-upload, file-name");
    }

    // 4. MENU ACTIVE STATES & TOOLTIPS
    menuItems.forEach(item => {
        // Set up tooltip text from the span content
        const spanText = item.querySelector("span")?.innerText;
        if (spanText) {
            item.setAttribute("data-text", spanText);
        }

        item.addEventListener("click", (e) => {
            // Remove active class from previous item
            const currentActive = document.querySelector(".menu-item.active");
            if (currentActive) {
                currentActive.classList.remove("active");
            }
            
            // Add active class to clicked item
            item.classList.add("active");
        });
    });

    // 5. FORM SUBMISSION PREVENTER (Optional)
    const applicantForm = document.getElementById("applicantForm");
    if (applicantForm) {
        applicantForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Application Saved Successfully!");
        });
    }
});