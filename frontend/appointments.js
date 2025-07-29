const API_URL = "http://localhost:8081/appointments";
let allAppointments = [];
let editModal;

async function loadAppointments() {
    try {
        const res = await fetch(API_URL);
        allAppointments = await res.json();
        renderAppointments(allAppointments);
    } catch (err) {
        showTableAlert('Error loading appointments. Please try again later.', 'danger');
    }
}

function renderAppointments(appointments) {
    const tbody = document.querySelector('#appointmentsTable tbody');
    tbody.innerHTML = '';
    appointments.forEach(appt => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${appt.name}</td>
            <td>${appt.date}</td>
            <td>${appt.time}</td>
            <td>${appt.reason}</td>
            <td><span class="badge ${appt.status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}">${appt.status || 'PENDING'}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm me-2" onclick="editAppointment(${appt.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${appt.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showTableAlert(message, type) {
    let alertDiv = document.getElementById('tableAlertBox');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.id = 'tableAlertBox';
        document.querySelector('.container').prepend(alertDiv);
    }
    alertDiv.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

window.deleteAppointment = async function(id) {
    const btn = event.target;
    btn.disabled = true;
    try {
        await fetch(`${API_URL}/${id}`, {method: 'DELETE'});
        loadAppointments();
    } catch (err) {
        showTableAlert('Error deleting appointment. Please try again.', 'danger');
    }
    btn.disabled = false;
}

window.editAppointment = function(id) {
    const appt = allAppointments.find(a => a.id === id);
    if (!appt) return;
    document.getElementById('editId').value = appt.id;
    document.getElementById('editName').value = appt.name;
    document.getElementById('editDate').value = appt.date;
    document.getElementById('editTime').value = appt.time;
    const reasonSelect = document.getElementById('editReason');
    const otherReasonDiv = document.getElementById('editOtherReasonDiv');
    const otherReasonInput = document.getElementById('editOtherReason');
    // Set min date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('editDate').min = `${yyyy}-${mm}-${dd}`;
    // Handle reason/other
    if (["Haircut","Facial","Manicure","Pedicure","Coloring"].includes(appt.reason)) {
        reasonSelect.value = appt.reason;
        otherReasonDiv.classList.add('d-none');
        otherReasonInput.required = false;
        otherReasonInput.value = '';
    } else {
        reasonSelect.value = 'Other';
        otherReasonDiv.classList.remove('d-none');
        otherReasonInput.required = true;
        otherReasonInput.value = appt.reason;
    }
    document.getElementById('editAlertBox').innerHTML = '';
    if (!editModal) {
        editModal = new bootstrap.Modal(document.getElementById('editModal'));
    }
    editModal.show();
}

document.getElementById('editReason').addEventListener('change', function() {
    const otherReasonDiv = document.getElementById('editOtherReasonDiv');
    const otherReasonInput = document.getElementById('editOtherReason');
    if (this.value === 'Other') {
        otherReasonDiv.classList.remove('d-none');
        otherReasonInput.required = true;
    } else {
        otherReasonDiv.classList.add('d-none');
        otherReasonInput.required = false;
    }
});

document.getElementById('editForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value;
    const date = document.getElementById('editDate').value;
    const time = document.getElementById('editTime').value;
    let reason = document.getElementById('editReason').value;
    const otherReasonInput = document.getElementById('editOtherReason');
    const alertBox = document.getElementById('editAlertBox');
    if (time < '09:00' || time > '19:00') {
        showEditAlert('Please select a time between 09:00 and 19:00.', 'danger');
        return;
    }
    if (reason === 'Other') {
        reason = otherReasonInput.value.trim();
        if (!reason) {
            showEditAlert('Please specify the service.', 'danger');
            return;
        }
    }
    const data = { name, date, time, reason };
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (res.ok) {
            showEditAlert('Appointment updated successfully!', 'success');
            setTimeout(() => {
                editModal.hide();
                loadAppointments();
            }, 800);
        } else {
            showEditAlert('Failed to update appointment. Please try again.', 'danger');
        }
    } catch (err) {
        showEditAlert('Error connecting to server.', 'danger');
    }
});

function showEditAlert(message, type) {
    document.getElementById('editAlertBox').innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

// Search/filter functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const filtered = allAppointments.filter(appt =>
        appt.name.toLowerCase().includes(query) ||
        appt.date.includes(query) ||
        appt.reason.toLowerCase().includes(query)
    );
    renderAppointments(filtered);
});

loadAppointments(); 