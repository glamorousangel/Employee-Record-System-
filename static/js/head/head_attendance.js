/**
 * emp_attendance.js
 * Place at: static/js/attendance/emp_attendance.js
 * ============================================================
 */

/* ── 1. ELEMENT SELECTORS ────────────────────────────────── */

// Sidebar
const sidebar    = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn   = document.getElementById("closeBtn");
const menuItems  = document.querySelectorAll(".menu-item");

// Tab Switcher (Attendance Log vs Monitoring)
const tabLog     = document.getElementById('tab-log');
const tabMonit   = document.getElementById('tab-monitoring');
// Content Areas (Ensure these IDs exist in your HTML)
const logContent   = document.getElementById('logContent'); 
const monitContent = document.getElementById('monitoringContent');

// Attendance clock
const clockBtn           = document.getElementById("clockBtn");
const workingTimeDisplay = document.getElementById("workingTime");
const timeInDisplay      = document.getElementById("timeInDisplay");

// History modal
const historyModal     = document.getElementById("historyModal");
const openHistoryBtn   = document.getElementById("openHistory");
const closeHistoryBtn  = document.getElementById("closeHistory");
const weeklyViewBtn    = document.getElementById("weeklyViewBtn");
const monthlyViewBtn   = document.getElementById("monthlyViewBtn");
const historyDateRange = document.getElementById("historyDateRange");
const weeklyTable      = document.getElementById("weeklyTable");
const weeklyTableBody  = document.getElementById("weeklyTableBody");
const monthlyGrid      = document.getElementById("monthlyGrid");
const totalHoursCount  = document.getElementById("totalHoursCount");
const prevPeriodBtn    = document.getElementById("prevPeriod");
const nextPeriodBtn    = document.getElementById("nextPeriod");

const clockOutOverlay      = document.getElementById("clockOutOverlay");
const clockOutConfirmStep  = document.getElementById("clockOutConfirmStep");
const clockOutSuccessStep  = document.getElementById("clockOutSuccessStep");
const clockOutCancelBtn    = document.getElementById("clockOutCancel");
const clockOutConfirmBtn   = document.getElementById("clockOutConfirmBtn");
const clockOutDismissBtn   = document.getElementById("clockOutDismiss");
const clockOutDurationText = document.getElementById("clockOutDurationText");

// Export actions
const exportAttendancePdfBtn = document.getElementById("exportAttendancePdf");
const exportAttendanceExcelBtn = document.getElementById("exportAttendanceExcel");


/* ── 2. SIDEBAR NAVIGATION ───────────────────────────────── */

closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

logoToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

menuItems.forEach(item => {
    const spanEl = item.querySelector("span");
    if (spanEl) item.setAttribute("data-text", spanEl.innerText);

    item.addEventListener("click", () => {
        document.querySelector(".menu-item.active")?.classList.remove("active");
        item.classList.add("active");
    });
});


/* ── 3. REAL-TIME ATTENDANCE CLOCK ───────────────────────── */

let timerInterval = null;
let totalSeconds  = 0;
let isClockedIn   = false;

function formatDuration(seconds) {
    const hrs  = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins.toString().padStart(2, "0")}m`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        totalSeconds++;
        workingTimeDisplay.innerText = `Working for: ${formatDuration(totalSeconds)}`;
    }, 1000);
}

function showClockOutOverlay() {
    clockOutConfirmStep.classList.remove("clock-out-step--hidden");
    clockOutSuccessStep.classList.add("clock-out-step--hidden");
    clockOutSuccessStep.setAttribute("hidden", "");
    clockOutOverlay.classList.add("clock-out-overlay--visible");
    clockOutOverlay.setAttribute("aria-hidden", "false");
    clockOutConfirmBtn.focus();
}

function hideClockOutOverlay() {
    clockOutOverlay.classList.remove("clock-out-overlay--visible");
    clockOutOverlay.setAttribute("aria-hidden", "true");
    clockOutConfirmStep.classList.remove("clock-out-step--hidden");
    clockOutSuccessStep.classList.add("clock-out-step--hidden");
    clockOutSuccessStep.setAttribute("hidden", "");
}

function showClockOutSuccess(durationLabel) {
    clockOutDurationText.innerText = `Total time: ${durationLabel}`;
    clockOutConfirmStep.classList.add("clock-out-step--hidden");
    clockOutSuccessStep.classList.remove("clock-out-step--hidden");
    clockOutSuccessStep.removeAttribute("hidden");
    clockOutDismissBtn.focus();
}

function completeClockOut() {
    const durationLabel = formatDuration(totalSeconds);
    isClockedIn = false;
    clearInterval(timerInterval);
    timerInterval = null;
    totalSeconds = 0;
    clockBtn.innerText = "Clock in";
    clockBtn.classList.remove("is-clocked-in");
    workingTimeDisplay.innerText = "Working for: 0h 00m";
    timeInDisplay.innerText = "Time In: --";
    showClockOutSuccess(durationLabel);
}

clockBtn.addEventListener("click", () => {
    if (!isClockedIn) {
        isClockedIn = true;
        clockBtn.innerText = "Clock out";
        clockBtn.classList.add("is-clocked-in");
        const now = new Date();
        timeInDisplay.innerText = `Time In: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        startTimer();
    } else {
        showClockOutOverlay();
    }
});

clockOutCancelBtn.addEventListener("click", hideClockOutOverlay);
clockOutConfirmBtn.addEventListener("click", () => { completeClockOut(); });
clockOutDismissBtn.addEventListener("click", hideClockOutOverlay);

clockOutOverlay.addEventListener("click", (e) => {
    if (e.target === clockOutOverlay) hideClockOutOverlay();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && clockOutOverlay.classList.contains("clock-out-overlay--visible")) {
        hideClockOutOverlay();
    }
});


/* ── 4. HEADER DATE/TIME UPDATER ─────────────────────────── */

function updateHeader() {
    const dateElement = document.querySelector(".date-now");
    if (dateElement) {
        const now     = new Date();
        const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        dateElement.innerText = `${dateStr} | ${timeStr}`;
    }
}
setInterval(updateHeader, 60000);
updateHeader();


/* ── 5. HISTORY MODAL – DATA ─────────────────────────────── */

const historySource = document.getElementById("headAttendanceHistoryData");
let rawHistoryRows = [];

if (historySource) {
    try {
        const parsedData = JSON.parse(historySource.textContent || "[]");
        if (Array.isArray(parsedData)) {
            rawHistoryRows = parsedData;
        }
    } catch (error) {
        console.error("Unable to parse head attendance history data", error);
    }
}

const historyRows = rawHistoryRows.map((row) => ({
    date: row.date || "-",
    day: row.day || "-",
    employeeName: row.employee_name || "-",
    timeIn: row.time_in || "--",
    timeOut: row.time_out || "--",
    hours: row.hours || "--",
    status: normalizeStatus(row.status || "absent"),
    statusDisplay: row.status_display || capitalize(normalizeStatus(row.status || "absent")),
}));

const visibleWeeklyRows = historyRows.slice(0, 14);
const weeklyData = {
    0: {
        label: buildWeeklyLabel(visibleWeeklyRows),
        rows: visibleWeeklyRows,
        total: sumDurationLabel(visibleWeeklyRows),
    }
};

const monthlyData = {
    0: buildMonthlyData(historyRows)
};

let currentView = "weekly";
let weekOffset  = 0;
let monthOffset = 0;


/* ── 6. HISTORY MODAL – RENDER WEEKLY ───────────────────── */

function renderWeekly() {
    const data = weeklyData[weekOffset] ?? weeklyData[0];
    historyDateRange.textContent = data.label;
    totalHoursCount.textContent  = data.total;
    const rows = data.rows.map(r => `
        <tr>
            <td>${r.date}</td>
            <td>${r.day} (${escapeHtml(r.employeeName)})</td>
            <td>${r.timeIn}</td>
            <td>${r.timeOut}</td>
            <td>${r.hours}</td>
            <td><span class="status-badge ${r.status}">${escapeHtml(r.statusDisplay)}</span></td>
        </tr>
    `).join("");
    if (!rows) {
        weeklyTableBody.innerHTML = '<tr><td colspan="6">No attendance records available.</td></tr>';
        return;
    }
    weeklyTableBody.innerHTML = rows + `<tr class="total-row"><td colspan="4">Total</td><td colspan="2">${data.total}</td></tr>`;
}


/* ── 7. HISTORY MODAL – RENDER MONTHLY ──────────────────── */

function renderMonthly() {
    const data = monthlyData[monthOffset] ?? monthlyData[0];
    historyDateRange.textContent = data.label;
    totalHoursCount.textContent  = data.total;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let html = dayNames.map(d => `<div class="month-day-header">${d}</div>`).join("");
    for (let i = 0; i < data.firstDayOfWeek; i++) html += `<div class="month-day-cell empty"></div>`;
    for (let d = 1; d <= data.daysInMonth; d++) {
        const att = data.attendance[d];
        html += `<div class="month-day-cell"><span class="day-num">${d}</span>${att ? `<span class="day-status ${att.status}">${capitalize(att.status)}</span>` : ""}</div>`;
    }
    monthlyGrid.innerHTML = html;
}


/* ── 8. HISTORY MODAL – VIEW SWITCHER ───────────────────── */

function switchView(view) {
    currentView = view;
    if (view === "weekly") {
        weeklyViewBtn.classList.add("active");
        monthlyViewBtn.classList.remove("active");
        weeklyTable.style.display = "table";
        monthlyGrid.classList.remove("active");
        renderWeekly();
    } else {
        monthlyViewBtn.classList.add("active");
        weeklyViewBtn.classList.remove("active");
        weeklyTable.style.display = "none";
        monthlyGrid.classList.add("active");
        renderMonthly();
    }
}

weeklyViewBtn.addEventListener("click",  () => switchView("weekly"));
monthlyViewBtn.addEventListener("click", () => switchView("monthly"));


/* ── 9. HISTORY MODAL – NAVIGATION ──────────────────────── */

prevPeriodBtn.addEventListener("click", () => {
    if (currentView === "weekly") { weekOffset++; renderWeekly(); } 
    else { monthOffset++; renderMonthly(); }
});

nextPeriodBtn.addEventListener("click", () => {
    if (currentView === "weekly") { weekOffset--; renderWeekly(); } 
    else { monthOffset--; renderMonthly(); }
});


/* ── 10. HISTORY MODAL – OPEN / CLOSE ───────────────────── */

openHistoryBtn.addEventListener("click", () => historyModal.classList.add("open"));
closeHistoryBtn.addEventListener("click", () => historyModal.classList.remove("open"));
historyModal.addEventListener("click", (e) => { if (e.target === historyModal) historyModal.classList.remove("open"); });


/* ── 11. EXPORT ACTIONS (HEAD SCOPE) ────────────────────── */

function triggerHeadAttendanceExport(button) {
    if (!button) return;

    const exportUrl = (button.dataset.exportUrl || button.getAttribute("data-export-url") || "").trim();

    if (!exportUrl) {
        console.error("Head attendance export missing required attributes", {
            exportUrl,
            buttonId: button.id,
        });
        window.alert("Unable to export attendance right now.");
        return;
    }

    console.log("Triggering export to:", exportUrl);
    window.location.href = exportUrl;
}

if (exportAttendancePdfBtn) {
    exportAttendancePdfBtn.addEventListener("click", () => triggerHeadAttendanceExport(exportAttendancePdfBtn));
}

if (exportAttendanceExcelBtn) {
    exportAttendanceExcelBtn.addEventListener("click", () => triggerHeadAttendanceExport(exportAttendanceExcelBtn));
}


/* ── 12. TAB SWITCHER (LOG VS MONITORING) ────────────────── */

// This implements the specific request to toggle between Attendance Log and Monitoring
if (tabLog && tabMonit) {
    tabLog.addEventListener('click', function () {
        tabLog.classList.add('active');
        tabMonit.classList.remove('active');
        
        // Show Log, Hide Monitoring (if elements exist)
        if(logContent) logContent.style.display = 'block';
        if(monitContent) monitContent.style.display = 'none';

        console.log("Switching to Attendance Log");
    });

    tabMonit.addEventListener('click', function () {
        tabMonit.classList.add('active');
        tabLog.classList.remove('active');
        
        // Show Monitoring, Hide Log (if elements exist)
        if(monitContent) monitContent.style.display = 'block';
        if(logContent) logContent.style.display = 'none';

        console.log("Switching to Attendance Monitoring");
    });
}


/* ── 12. HELPERS & INIT ──────────────────────────────────── */

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function normalizeStatus(value) {
    const normalized = String(value || '').toLowerCase();
    if (['present', 'absent', 'late', 'undertime'].includes(normalized)) {
        return normalized;
    }
    return 'absent';
}

function sumDurationLabel(rows) {
    const totalMinutes = rows.reduce((acc, row) => {
        const match = String(row.hours || '').match(/^(\d+)h\s+(\d+)m$/);
        if (!match) {
            return acc;
        }
        return acc + (Number(match[1]) * 60) + Number(match[2]);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function buildWeeklyLabel(rows) {
    if (!rows.length) {
        return 'No Attendance Data';
    }
    const firstDate = rows[rows.length - 1].date;
    const lastDate = rows[0].date;
    return `${firstDate} – ${lastDate}`;
}

function buildMonthlyData(rows) {
    const baseDate = rows.length ? new Date(rows[0].date) : new Date();
    const month = baseDate.getMonth();
    const year = baseDate.getFullYear();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const attendance = {};
    rows.forEach((row) => {
        const recordDate = new Date(row.date);
        if (recordDate.getFullYear() !== year || recordDate.getMonth() !== month) {
            return;
        }
        attendance[recordDate.getDate()] = {
            status: row.status,
            hours: row.hours,
        };
    });

    return {
        label: baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        firstDayOfWeek,
        daysInMonth,
        attendance,
        total: sumDurationLabel(rows),
    };
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Initialize
switchView("weekly");