// --- SIDEBAR LOGIC ---
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");

closeBtn.addEventListener("click", () => sidebar.classList.add("collapsed"));
logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) sidebar.classList.remove("collapsed");
});

// --- ADD TRAINING MODAL LOGIC ---
const modal = document.getElementById("trainingModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModal = document.querySelector(".close-modal");
const addForm = document.getElementById("addTrainingForm");
const trainingTableBody = document.querySelector("#trainingTable tbody");

// Open Modal
openModalBtn.onclick = () => modal.style.display = "block";

// Close Modal
closeModal.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };

// Form Submission
addForm.onsubmit = (e) => {
    e.preventDefault();

    // Generate basic incremental ID (for demo)
    const id = "00" + (trainingTableBody.rows.length + 1);
    const name = document.getElementById("tName").value;
    const category = document.getElementById("tCategory").value;
    const date = document.getElementById("tDate").value;
    const mode = document.getElementById("tMode").value;
    const slots = document.getElementById("tSlots").value;

    // Create New Row Template
    const newRow = `
        <tr>
            <td>${id}</td>
            <td>${name}</td>
            <td>${category}</td>
            <td>${date}</td>
            <td>${mode}</td>
            <td>0 / ${slots}</td>
            <td><span class="status-badge open">Open</span></td>
            <td class="actions">
                <a href="#" class="view">View</a>
                <a href="#" class="edit">Edit</a>
                <a href="#" class="close-row">Close</a>
            </td>
        </tr>
    `;

    // Append to Table
    trainingTableBody.insertAdjacentHTML('beforeend', newRow);

    // Reset and Close
    addForm.reset();
    modal.style.display = "none";
};