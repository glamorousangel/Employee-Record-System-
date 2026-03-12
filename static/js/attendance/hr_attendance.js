/* ============================================================
   hr_attendance.js
   Save to: static/js/attendance/hr_attendance.js
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    // --- 1. DOM ELEMENTS ---
    const sidebar    = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn   = document.getElementById("closeBtn");
    const menuItems  = document.querySelectorAll(".menu-item");

    const modal      = document.getElementById("employeeModal");
    const closeSpan  = document.querySelector(".close-modal");
    const tableRows  = document.querySelectorAll(".attendance-table tbody tr");
    const weeklyBtn  = document.getElementById("weeklyViewBtn");
    const monthlyBtn = document.getElementById("monthlyViewBtn");


    // --- 2. SIDEBAR LOGIC ---
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
        });
    }

    if (logoToggle) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
            }
        });
    }

    // Attach tooltip text and active-state switching
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText.trim());

        item.addEventListener("click", function () {
            document.querySelector(".menu-item.active")?.classList.remove("active");
            this.classList.add("active");
        });
    });


    // --- 3. ATTENDANCE MODAL ---

    // Open modal on row click
    tableRows.forEach(row => {
        row.style.cursor = "pointer";
        row.addEventListener("click", () => {
            const name     = row.querySelector(".name").innerText;
            const position = row.querySelector(".title").innerText;
            const dept     = row.querySelector(".dept-badge").innerText;

            document.getElementById("modalEmployeeName").innerText = name;
            document.getElementById("detPos").innerText            = position;
            document.getElementById("detDept").innerText           = dept;

            switchAttendanceView("weekly");
            modal.style.display = "block";
        });
    });

    // Close modal
    if (closeSpan) {
        closeSpan.onclick = () => (modal.style.display = "none");
    }

    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };

    // Weekly / Monthly toggle
    if (weeklyBtn && monthlyBtn) {
        weeklyBtn.addEventListener("click",  (e) => { e.stopPropagation(); switchAttendanceView("weekly"); });
        monthlyBtn.addEventListener("click", (e) => { e.stopPropagation(); switchAttendanceView("monthly"); });
    }

    /**
     * Switches modal between Weekly and Monthly views.
     * @param {"weekly"|"monthly"} type
     */
    function switchAttendanceView(type) {
        const rangeText  = document.getElementById("dateRangeText");
        const periodText = document.getElementById("periodText");
        const totalValue = document.getElementById("totalHoursValue");

        if (type === "weekly") {
            weeklyBtn.classList.add("active");
            monthlyBtn.classList.remove("active");
            rangeText.innerText  = "February 4 - 10, 2026";
            periodText.innerText = "Week";
            totalValue.innerText = "42h 15m";
            renderModalTableRows(7);
        } else {
            monthlyBtn.classList.add("active");
            weeklyBtn.classList.remove("active");
            rangeText.innerText  = "February 2026";
            periodText.innerText = "Month";
            totalValue.innerText = "160h 00m";
            renderModalTableRows(20);
        }
    }

    /**
     * Populates the modal table with sample attendance rows.
     * @param {number} rowCount
     */
    function renderModalTableRows(rowCount) {
        const tbody = document.getElementById("modalTableBody");
        if (!tbody) return;

        tbody.innerHTML = "";
        for (let i = 1; i <= rowCount; i++) {
            const dayNum = i + 3; // Starts from Feb 4
            tbody.innerHTML += `
                <tr>
                    <td>February ${dayNum}, 2026</td>
                    <td>${getDayName(dayNum)}</td>
                    <td>8:03 AM</td>
                    <td>5:02 PM</td>
                    <td>8h 59m</td>
                    <td><span class="pill pill-green">Present</span></td>
                </tr>
            `;
        }
    }

    /**
     * Returns the day name for a given day number.
     * Feb 4, 2026 = Wednesday (offset 3).
     * @param {number} day
     * @returns {string}
     */
    function getDayName(day) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[(day + 1) % 7];
    }


    // --- 4. FILTER TAG DISMISS ---
    const filterTag = document.querySelector(".filter-tag");
    if (filterTag) {
        filterTag.querySelector(".fa-times")?.addEventListener("click", (e) => {
            e.stopPropagation();
            filterTag.style.display = "none";
        });
    }


    // --- 5. RESPONSIVE SIDEBAR ---
    const handleResize = () => {
        if (window.innerWidth <= 1100) {
            sidebar.classList.add("collapsed");
        } else {
            sidebar.classList.remove("collapsed");
        }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // run on load
});