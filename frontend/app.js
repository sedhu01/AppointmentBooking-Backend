const API_URL = "http://localhost:8081/appointments";

document.getElementById('appointmentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        reason: document.getElementById('reason').value
    };
    await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    this.reset();
    loadAppointments();
});

async function loadAppointments() {
    const res = await fetch(API_URL);
    const appointments = await res.json();
    const tbody = document.querySelector('#appointmentsTable tbody');
    tbody.innerHTML = '';
    appointments.forEach(appt => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${appt.name}</td>
            <td>${appt.date}</td>
            <td>${appt.time}</td>
            <td>${appt.reason}</td>
            <td>${appt.status}</td>
            <td>
                ${appt.status === 'PENDING' ? `<button onclick="approveAppointment(${appt.id})">Approve</button>` : ''}
                <button onclick="deleteAppointment(${appt.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.approveAppointment = async function(id) {
    await fetch(`${API_URL}/${id}/approve`, {method: 'PUT'});
    loadAppointments();
}

window.deleteAppointment = async function(id) {
    await fetch(`${API_URL}/${id}`, {method: 'DELETE'});
    loadAppointments();
}

loadAppointments(); 