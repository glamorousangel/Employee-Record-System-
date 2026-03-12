/**
 * 1. UI ELEMENT SELECTORS
 */
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");
const menuItems = document.querySelectorAll(".menu-item");

// Dashboard Elements
const clockBtn = document.getElementById("clockBtn");
const workingTimeDisplay = document.getElementById("workingTime");
const timeInDisplay = document.getElementById("timeInDisplay");

// History Modal Elements
const historyModal = document.getElementById("historyModal");
const openHistoryBtn = document.getElementById("openHistory");
const closeHistoryBtn = document.getElementById("closeHistoryBtn"); // Updated ID
const weeklyViewBtn = document.getElementById("weeklyViewBtn");
const monthlyViewBtn = document.getElementById("monthlyViewBtn");
const historyDateRange = document.getElementById("historyDateRange");
const totalHoursCount = document.getElementById("totalHoursCount");

/**
 * 2. SIDEBAR NAVIGATION
 */
closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
    }
});

/**
 * 3. REAL-TIME CLOCK LOGIC
 */
let timerInterval = null;
let totalSeconds = 0;
let isClockedIn = false;

function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        totalSeconds++;
        workingTimeDisplay.innerText = `Working for: ${formatDuration(totalSeconds)}`;
    }, 1000);
}

clockBtn.addEventListener("click", () => {
    if (!isClockedIn) {
        isClockedIn = true;
        clockBtn.innerText = "Clock out";
        clockBtn.style.background = "#8b0000"; // Active Maroon
        
        const now = new Date();
        timeInDisplay.innerText = `Time In: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        startTimer();
    } else {
        if (confirm("Are you sure you want to clock out?")) {
            isClockedIn = false;
            clearInterval(timerInterval);
            clockBtn.innerText = "Clock in";
            clockBtn.style.background = "#2d5a27"; // Original Green
            alert(`Shift completed! Total time: ${formatDuration(totalSeconds)}`);
        }
    }
});

/**
 * 4. FULL HISTORY MODAL LOGIC
 */
// Open Modal
openHistoryBtn.addEventListener("click", () => {
    historyModal.style.display = "block";
    updateTotalHoursDisplay(); // Calculate hours when opened
});

// Close Modal
closeHistoryBtn.addEventListener("click", () => {
    historyModal.style.display = "none";
});

// Close when clicking outside content
window.addEventListener("click", (event) => {
    if (event.target === historyModal) {
        historyModal.style.display = "none";
    }
});

/**
 * 5. VIEW SWITCHING (Weekly vs Monthly)
 */
function switchHistoryView(view) {
    if (view === "weekly") {
        weeklyViewBtn.classList.add("active");
        monthlyViewBtn.classList.remove("active");
        historyDateRange.innerText = "February 4 - 10, 2026";
        // Update the footer text to match the view
        document.querySelector(".hours-summary-box").childNodes[0].textContent = "Total Hours This Week: ";
    } else {
        monthlyViewBtn.classList.add("active");
        weeklyViewBtn.classList.remove("active");
        historyDateRange.innerText = "February 2026";
        document.querySelector(".hours-summary-box").childNodes[0].textContent = "Total Hours This Month: ";
    }
    // In a real app, you would fetch new data here
}

weeklyViewBtn.addEventListener("click", () => switchHistoryView("weekly"));
monthlyViewBtn.addEventListener("click", () => switchHistoryView("monthly"));

/**
 * 6. DYNAMIC CALCULATIONS
 */
function updateTotalHoursDisplay() {
    // This looks at the "Total Hours" column in the history table and sums it up
    const rows = document.querySelectorAll("#historyTableBody tr:not(.empty-row)");
    let totalMins = 0;

    rows.forEach(row => {
        const durationText = row.cells[4].innerText; // Column index 4 is "Total Hours"
        if (durationText.includes('h')) {
            const parts = durationText.split(' ');
            const h = parseInt(parts[0]);
            const m = parseInt(parts[1]);
            totalMins += (h * 60) + m;
        }
    });

    const finalH = Math.floor(totalMins / 60);
    const finalM = totalMins % 60;
    
    // Updates the "XX" in your gray summary box
    totalHoursCount.innerText = `${finalH}h ${finalM}m`;
}

/**
 * 7. DATE & TIME UPDATER (Header)
 */
function updateHeader() {
    const dateElement = document.querySelector(".date-now");
    if (dateElement) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        dateElement.innerText = `${dateStr} | ${timeStr}`;
    }
}

// Initialize
setInterval(updateHeader, 60000);
updateHeader();