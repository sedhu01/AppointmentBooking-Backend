const API_URL = "http://localhost:8081/appointments";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

const loginSection = document.getElementById('adminLoginSection');
const dashboardSection = document.getElementById('adminDashboardSection');
const loginForm = document.getElementById('adminLoginForm');
const loginAlert = document.getElementById('adminLoginAlert');
const logoutBtn = document.getElementById('adminLogoutBtn');

function isAdminLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}
function setAdminLoggedIn(val) {
    localStorage.setItem('adminLoggedIn', val ? 'true' : 'false');
}
function showLogin() {
    loginSection.classList.remove('d-none');
    dashboardSection.classList.add('d-none');
}
function showDashboard() {
    loginSection.classList.add('d-none');
    dashboardSection.classList.remove('d-none');
    loadAdminAppointments();
}
if (isAdminLoggedIn()) showDashboard(); else showLogin();

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('adminUsername').value;
    const pass = document.getElementById('adminPassword').value;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        setAdminLoggedIn(true);
        showDashboard();
    } else {
        loginAlert.innerHTML = `<div class="alert alert-danger">Invalid credentials</div>`;
    }
});
logoutBtn.addEventListener('click', function() {
    setAdminLoggedIn(false);
    showLogin();
});

// --- Booking Form ---
const bookForm = document.getElementById('adminBookForm');
const bookAlert = document.getElementById('adminBookAlert');
const bookDateInput = document.getElementById('adminBookDate');
const bookReasonSelect = document.getElementById('adminBookReason');
const bookOtherReasonDiv = document.getElementById('adminBookOtherReasonDiv');
const bookOtherReasonInput = document.getElementById('adminBookOtherReason');
// Set min date to today
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
bookDateInput.min = `${yyyy}-${mm}-${dd}`;
bookDateInput.value = bookDateInput.min;
bookReasonSelect.addEventListener('change', function() {
    if (this.value === 'Other') {
        bookOtherReasonDiv.classList.remove('d-none');
        bookOtherReasonInput.required = true;
    } else {
        bookOtherReasonDiv.classList.add('d-none');
        bookOtherReasonInput.required = false;
    }
});
bookForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const time = document.getElementById('adminBookTime').value;
    if (time < '09:00' || time > '19:00') {
        showBookAlert('Please select a time between 09:00 and 19:00.', 'danger');
        return;
    }
    let reason = bookReasonSelect.value;
    if (reason === 'Other') {
        reason = bookOtherReasonInput.value.trim();
        if (!reason) {
            showBookAlert('Please specify the service.', 'danger');
            return;
        }
    }
    const data = {
        name: document.getElementById('adminBookName').value,
        date: bookDateInput.value,
        time: time,
        reason: reason
    };
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (res.ok) {
            showBookAlert('Appointment booked successfully!', 'success');
            bookForm.reset();
            bookDateInput.value = bookDateInput.min;
            bookOtherReasonDiv.classList.add('d-none');
            loadAdminAppointments();
        } else {
            showBookAlert('Failed to book appointment. Please try again.', 'danger');
        }
    } catch (err) {
        showBookAlert('Error connecting to server.', 'danger');
    }
});
function showBookAlert(message, type) {
    bookAlert.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

// --- Appointments Table ---
let adminAppointments = [];
async function loadAdminAppointments() {
    const res = await fetch(API_URL);
    adminAppointments = await res.json();
    renderAdminAppointments(adminAppointments);
}
function renderAdminAppointments(appointments) {
    const tbody = document.querySelector('#adminAppointmentsTable tbody');
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
                ${(!appt.status || appt.status === 'PENDING') ? `<button class="btn btn-success btn-sm me-2" onclick="adminApproveAppointment(${appt.id})">Approve</button>` : ''}
                <button class="btn btn-secondary btn-sm me-2" onclick="adminEditAppointment(${appt.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="adminDeleteAppointment(${appt.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
window.adminApproveAppointment = async function(id) {
    await fetch(`${API_URL}/${id}/approve`, {method: 'PUT'});
    loadAdminAppointments();
}
window.adminDeleteAppointment = async function(id) {
    await fetch(`${API_URL}/${id}`, {method: 'DELETE'});
    loadAdminAppointments();
}
// --- Edit Modal ---
let adminEditModal;
let adminEditModalHtml = `
<div class="modal fade" id="adminEditModal" tabindex="-1" aria-labelledby="adminEditModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="adminEditModalLabel">Edit Appointment</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="adminEditForm">
          <input type="hidden" id="adminEditId">
          <div class="mb-3">
            <label for="adminEditName" class="form-label">Your Name</label>
            <input type="text" class="form-control" id="adminEditName" required>
          </div>
          <div class="mb-3">
            <label for="adminEditDate" class="form-label">Date</label>
            <input type="date" class="form-control" id="adminEditDate" required min="">
          </div>
          <div class="mb-3">
            <label for="adminEditTime" class="form-label">Time</label>
            <input type="time" class="form-control" id="adminEditTime" required min="09:00" max="19:00">
            <div class="form-text">Salon hours: 09:00 to 19:00</div>
          </div>
          <div class="mb-3">
            <label for="adminEditReason" class="form-label">Service</label>
            <select class="form-select" id="adminEditReason" required>
              <option value="Haircut">Haircut</option>
              <option value="Facial">Facial</option>
              <option value="Manicure">Manicure</option>
              <option value="Pedicure">Pedicure</option>
              <option value="Coloring">Coloring</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="mb-3 d-none" id="adminEditOtherReasonDiv">
            <label for="adminEditOtherReason" class="form-label">Other Reason</label>
            <input type="text" class="form-control" id="adminEditOtherReason">
          </div>
          <div id="adminEditAlertBox"></div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      </div>
    </div>
  </div>
</div>
`;
document.getElementById('adminEditModalContainer').innerHTML = adminEditModalHtml;
function getTodayStr() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
window.adminEditAppointment = function(id) {
    const appt = adminAppointments.find(a => a.id === id);
    if (!appt) return;
    document.getElementById('adminEditId').value = appt.id;
    document.getElementById('adminEditName').value = appt.name;
    document.getElementById('adminEditDate').value = appt.date;
    document.getElementById('adminEditTime').value = appt.time;
    const reasonSelect = document.getElementById('adminEditReason');
    const otherReasonDiv = document.getElementById('adminEditOtherReasonDiv');
    const otherReasonInput = document.getElementById('adminEditOtherReason');
    document.getElementById('adminEditDate').min = getTodayStr();
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
    document.getElementById('adminEditAlertBox').innerHTML = '';
    if (!adminEditModal) {
        adminEditModal = new bootstrap.Modal(document.getElementById('adminEditModal'));
    }
    adminEditModal.show();
}
document.getElementById('adminEditReason').addEventListener('change', function() {
    const otherReasonDiv = document.getElementById('adminEditOtherReasonDiv');
    const otherReasonInput = document.getElementById('adminEditOtherReason');
    if (this.value === 'Other') {
        otherReasonDiv.classList.remove('d-none');
        otherReasonInput.required = true;
    } else {
        otherReasonDiv.classList.add('d-none');
        otherReasonInput.required = false;
    }
});
document.getElementById('adminEditForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('adminEditId').value;
    const name = document.getElementById('adminEditName').value;
    const date = document.getElementById('adminEditDate').value;
    const time = document.getElementById('adminEditTime').value;
    let reason = document.getElementById('adminEditReason').value;
    const otherReasonInput = document.getElementById('adminEditOtherReason');
    if (time < '09:00' || time > '19:00') {
        showAdminEditAlert('Please select a time between 09:00 and 19:00.', 'danger');
        return;
    }
    if (reason === 'Other') {
        reason = otherReasonInput.value.trim();
        if (!reason) {
            showAdminEditAlert('Please specify the service.', 'danger');
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
            showAdminEditAlert('Appointment updated successfully!', 'success');
            setTimeout(() => {
                adminEditModal.hide();
                loadAdminAppointments();
            }, 800);
        } else {
            showAdminEditAlert('Failed to update appointment. Please try again.', 'danger');
        }
    } catch (err) {
        showAdminEditAlert('Error connecting to server.', 'danger');
    }
});
function showAdminEditAlert(message, type) {
    document.getElementById('adminEditAlertBox').innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}
// --- Search ---
document.getElementById('adminSearchInput').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const filtered = adminAppointments.filter(appt =>
        appt.name.toLowerCase().includes(query) ||
        appt.date.includes(query) ||
        appt.reason.toLowerCase().includes(query)
    );
    renderAdminAppointments(filtered);
}); 