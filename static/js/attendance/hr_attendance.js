// ─── Sidebar Toggle ───────────────────────────────────────────────────────────
const sidebar    = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn   = document.getElementById("closeBtn");
const menuItems  = document.querySelectorAll(".menu-item");

closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
    }
});

menuItems.forEach(item => {
    const text = item.querySelector("span")?.innerText || "";
    item.setAttribute("data-text", text);

    item.addEventListener("click", () => {
        document.querySelector(".menu-item.active")?.classList.remove("active");
        item.classList.add("active");
    });
});

// ─── Filter Chip Removal ──────────────────────────────────────────────────────
function removeFilter(btn) {
    btn.closest(".filter-chip").remove();
}

// ─── Week Navigation ──────────────────────────────────────────────────────────
let currentWeek    = 5;
const weekLabel    = document.getElementById("weekLabel");

document.getElementById("prevWeek").addEventListener("click", () => {
    currentWeek = Math.max(1, currentWeek - 1);
    weekLabel.textContent = `Week ${currentWeek}`;
    renderTable();
});

document.getElementById("nextWeek").addEventListener("click", () => {
    currentWeek++;
    weekLabel.textContent = `Week ${currentWeek}`;
    renderTable();
});

// ─── Sample Data ──────────────────────────────────────────────────────────────
const employees = [
    { name: "Juan Dela Cruz", role: "Instructor", dept: "CCS" },
    { name: "Maria Santos",   role: "Instructor", dept: "CCS" },
    { name: "Jose Reyes",     role: "Instructor", dept: "CCS" },
    { name: "Ana Bautista",   role: "Instructor", dept: "CCS" },
];

// Each row: [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
// t = type: "present" | "late" | "leave" | "absent" | "active" | null (rest day)
// h = hours label (used for present / late)
const dayTemplates = [
    [null, { t: "present", h: "8 hours"  }, { t: "late",    h: "4h 36m" }, { t: "leave"   }, { t: "present", h: "8h 39m" }, { t: "active"  }, null],
    [null, { t: "late",    h: "6h 24m"   }, { t: "present", h: "8 hours" }, { t: "present", h: "8 hours"  }, { t: "absent"  }, { t: "active"  }, null],
    [null, { t: "present", h: "8 hours"  }, { t: "late",    h: "8h 12m" }, { t: "late",    h: "3h 45m"   }, { t: "present", h: "8 hours"  }, { t: "leave"   }, null],
    [null, { t: "present", h: "8h 15m"   }, { t: "present", h: "8 hours" }, { t: "present", h: "8h 23m"  }, { t: "late",    h: "7h 24m"   }, { t: "active"  }, null],
];

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekDates(week) {
    const base = (week - 1) * 7;
    return dayNames.map((_, i) => base + i + 1);
}

function badgeHTML(day) {
    if (!day) return `<span class="day-num" style="color:#cbd5e0">—</span>`;

    switch (day.t) {
        case "present": return `<span class="badge badge-present"><i class="fas fa-check-circle"></i>${day.h}</span>`;
        case "late":    return `<span class="badge badge-late"><i class="fas fa-clock"></i>${day.h}</span>`;
        case "leave":   return `<span class="badge badge-leave"><i class="fas fa-umbrella-beach"></i>Leave</span>`;
        case "absent":  return `<span class="badge badge-absent"><i class="fas fa-times-circle"></i>Absent</span>`;
        case "active":  return `<span class="badge badge-active"><i class="fas fa-circle" style="font-size:8px;color:#38b2ac"></i>Active</span>`;
        default:        return "";
    }
}

// ─── Render Table ─────────────────────────────────────────────────────────────
function renderTable() {
    const dates = getWeekDates(currentWeek);
    const tbody = document.getElementById("attendanceBody");
    tbody.innerHTML = "";

    employees.forEach((emp, i) => {
        const days = dayTemplates[i];
        const tr   = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <div class="emp-cell">
                    <div class="emp-avatar"><i class="fas fa-user"></i></div>
                    <div>
                        <div class="emp-name">${emp.name}</div>
                        <div class="emp-role">${emp.role}</div>
                        <span class="emp-tag">${emp.dept}</span>
                    </div>
                </div>
            </td>
            ${days.map((day, di) => {
                const isWeekend = (di === 0 || di === 6);
                return `
                    <td class="${isWeekend ? "weekend" : ""}">
                        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">
                            <span class="day-num">${dates[di]}</span>
                            ${badgeHTML(day)}
                        </div>
                    </td>`;
            }).join("")}
        `;

        tbody.appendChild(tr);
    });

    updateStats();
}

// ─── Update Stat Cards ────────────────────────────────────────────────────────
function updateStats() {
    let present = 0, absent = 0, leave = 0, late = 0;

    dayTemplates.forEach(days => {
        const friday = days[5]; // column index 5 = Friday (today)
        if (!friday) return;
        if (friday.t === "present" || friday.t === "active") present++;
        if (friday.t === "absent") absent++;
        if (friday.t === "leave")  leave++;
        if (friday.t === "late")   late++;
    });

    countUp("totalEmp",     employees.length);
    countUp("presentToday", present);
    countUp("absentToday",  absent);
    countUp("onLeave",      leave);
    countUp("lateArrivals", late);
}

// ─── Count-Up Animation ───────────────────────────────────────────────────────
function countUp(id, target) {
    const el   = document.getElementById(id);
    let start  = 0;
    const step = Math.max(1, Math.ceil(target / 20));

    const interval = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = start;
        if (start >= target) clearInterval(interval);
    }, 30);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
renderTable();