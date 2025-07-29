const API_URL = "http://localhost:8081/appointments";
const form = document.getElementById('appointmentForm');
const alertBox = document.getElementById('alertBox');
const dateInput = document.getElementById('date');
const reasonSelect = document.getElementById('reason');
const otherReasonDiv = document.getElementById('otherReasonDiv');
const otherReasonInput = document.getElementById('otherReason');
const submitBtn = form.querySelector('button[type="submit"]');

// Set min date to today
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
dateInput.min = `${yyyy}-${mm}-${dd}`;
dateInput.value = dateInput.min;

// Show/hide other reason field
reasonSelect.addEventListener('change', function() {
    if (this.value === 'Other') {
        otherReasonDiv.classList.remove('d-none');
        otherReasonInput.required = true;
    } else {
        otherReasonDiv.classList.add('d-none');
        otherReasonInput.required = false;
    }
});

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    alertBox.innerHTML = '';
    const time = document.getElementById('time').value;
    if (time < '09:00' || time > '19:00') {
        showAlert('Please select a time between 09:00 and 19:00.', 'danger');
        submitBtn.disabled = false;
        return;
    }
    let reason = reasonSelect.value;
    if (reason === 'Other') {
        reason = otherReasonInput.value.trim();
        if (!reason) {
            showAlert('Please specify the service.', 'danger');
            submitBtn.disabled = false;
            return;
        }
    }
    const data = {
        name: document.getElementById('name').value,
        date: dateInput.value,
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
            showAlert('Your booking request has been submitted.', 'success');
            form.reset();
            dateInput.value = dateInput.min;
            otherReasonDiv.classList.add('d-none');
        } else {
            showAlert('Failed to submit booking request. Please try again.', 'danger');
        }
    } catch (err) {
        showAlert('Error connecting to server. Please try again later.', 'danger');
    }
    submitBtn.disabled = false;
});

function showAlert(message, type) {
    alertBox.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
} 