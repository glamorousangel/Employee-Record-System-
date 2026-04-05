document.addEventListener("DOMContentLoaded", () => {
    // 1. SIDEBAR LOGIC
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");

    logoToggle.addEventListener("click", () => sidebar.classList.toggle("collapsed"));
    closeBtn.addEventListener("click", () => sidebar.classList.add("collapsed"));

    // 2. SEARCH LOGIC
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("keyup", () => {
        const filter = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll("#monitoringTable tbody tr");
        
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(filter) ? "" : "none";
        });
    });

    // 3. MODAL LOGIC
    const modal = document.getElementById("employeeModal");
    const closeModal = document.getElementById("closeModal");
    const tableRows = document.querySelectorAll("#monitoringTable tbody tr");

    tableRows.forEach(row => {
        row.style.cursor = "pointer";
        row.addEventListener("click", () => {
            const empId = row.getAttribute("data-emp-id");
            const name = row.querySelector(".name").innerText;
            const pos = row.querySelector(".title").innerText;
            const dept = row.querySelector(".dept-badge").innerText;

            document.getElementById("modalEmployeeName").innerText = name;
            document.getElementById("detID").innerText = empId;
            document.getElementById("detPos").innerText = pos;
            document.getElementById("detDept").innerText = dept;

            switchView("weekly"); // Default to weekly view
            modal.style.display = "block";
        });
    });

    closeModal.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

    // 4. MODAL VIEW TOGGLES
    const weeklyBtn = document.getElementById("weeklyViewBtn");
    const monthlyBtn = document.getElementById("monthlyViewBtn");

    weeklyBtn.onclick = () => switchView("weekly");
    monthlyBtn.onclick = () => switchView("monthly");

    function switchView(type) {
        const tbody = document.getElementById("modalTableBody");
        const rangeText = document.getElementById("dateRangeText");
        const periodText = document.getElementById("periodText");
        const totalValue = document.getElementById("totalHoursValue");

        weeklyBtn.classList.toggle("active", type === "weekly");
        monthlyBtn.classList.toggle("active", type === "monthly");

        if (type === "weekly") {
            rangeText.innerText = "February 4 - 10, 2026";
            periodText.innerText = "Week";
            totalValue.innerText = "42h 15m";
            renderDummyRows(7);
        } else {
            rangeText.innerText = "February 2026";
            periodText.innerText = "Month";
            totalValue.innerText = "168h 30m";
            renderDummyRows(20);
        }
    }

    function renderDummyRows(count) {
        const tbody = document.getElementById("modalTableBody");
        tbody.innerHTML = "";
        for (let i = 1; i <= count; i++) {
            tbody.innerHTML += `
                <tr>
                    <td>Feb ${i + 3}, 2026</td>
                    <td>Weekday</td>
                    <td>08:00 AM</td>
                    <td>05:00 PM</td>
                    <td>9h 00m</td>
                    <td><span class="pill pill-green">Present</span></td>
                </tr>
            `;
        }
    }
});