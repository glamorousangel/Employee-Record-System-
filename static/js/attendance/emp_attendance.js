/**
 * 1. UI ELEMENT SELECTORS
 */
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");
const menuItems = document.querySelectorAll(".menu-item");

// Dashboard Clock Components
const clockBtn = document.getElementById("clockBtn");
const workingTimeDisplay = document.getElementById("workingTime");
const timeInDisplay = document.getElementById("timeInDisplay");

// History Modal Components
const historyModal = document.getElementById("historyModal");
const openHistoryBtn = document.getElementById("openHistory");
const closeHistoryBtn = document.getElementById("closeHistory");
const weeklyViewBtn = document.getElementById("weeklyViewBtn");
const monthlyViewBtn = document.getElementById("monthlyViewBtn");
const historyDateRange = document.getElementById("historyDateRange");

/**
 * 2. SIDEBAR LOGIC
 */
closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
    }
});

// Handle Active Menu State
menuItems.forEach(item => {
    item.addEventListener("click", () => {
        document.querySelector(".menu-item.active")?.classList.remove("active");
        item.classList.add("active");
    });
});

/**
 * 3. LIVE ATTENDANCE CLOCK LOGIC
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
        // --- CLOCK IN ---
        isClockedIn = true;
        clockBtn.innerText = "Clock out";
        clockBtn.style.background = "#8b0000"; // Deep Red active state
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeInDisplay.innerText = `Time In: ${timeStr}`;
        
        startTimer();
    } else {
        // --- CLOCK OUT ---
        if (confirm("Are you sure you want to clock out?")) {
            isClockedIn = false;
            clearInterval(timerInterval);
            clockBtn.innerText = "Clock in";
            clockBtn.style.background = "#2d5a27"; // Back to Green
            alert(`Shift ended. Total time worked: ${formatDuration(totalSeconds)}`);
        }
    }
});

/**
 * 4. FULL HISTORY MODAL LOGIC
 */

// Open Modal
openHistoryBtn.onclick = () => {
    historyModal.style.display = "block";
};

// Close Modal
closeHistoryBtn.onclick = () => {
    historyModal.style.display = "none";
};

// Close on background click
window.onclick = (event) => {
    if (event.target == historyModal) {
        historyModal.style.display = "none";
    }
};

// Weekly vs Monthly Toggle Logic
function updateView(view) {
    if (view === "weekly") {
        weeklyViewBtn.classList.add("active");
        monthlyViewBtn.classList.remove("active");
        historyDateRange.innerText = "February 4 - 10";
        // To do: Add function here to fetch/render weekly rows
    } else {
        monthlyViewBtn.classList.add("active");
        weeklyViewBtn.classList.remove("active");
        historyDateRange.innerText = "February 2026";
        // To do: Add function here to fetch/render monthly rows
    }
}

weeklyViewBtn.onclick = () => updateView("weekly");
monthlyViewBtn.onclick = () => updateView("monthly");

/**
 * 5. HEADER REAL-TIME DATE
 */
function updateHeaderDate() {
    const dateHeader = document.querySelector(".date-now");
    if (dateHeader) {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        dateHeader.innerText = `${now.toLocaleDateString('en-US', options)} | ${now.toLocaleTimeString([], timeOptions)}`;
    }
}

setInterval(updateHeaderDate, 60000);
updateHeaderDate();