# Appointment Booking System

A simple full stack application for booking and managing appointments.

## Tech Stack
- Backend: Spring Boot, Java, MySQL
- Frontend: HTML, CSS, JavaScript

## Database Setup
1. Start MySQL and create the database and table:

```sql
CREATE DATABASE appointment_db;
USE appointment_db;
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING'
);
```

2. Update `src/main/resources/application.properties` with your MySQL username and password.

## Backend Setup
1. Navigate to the `backend` directory.
2. Build and run the Spring Boot application:
   ```
   mvn spring-boot:run
   ```

## Frontend Setup
1. Navigate to the `frontend` directory.
2. Open `index.html` in your browser (or use a simple HTTP server like Live Server in VSCode).

## Usage
- Book appointments using the form.
- View, approve, or delete appointments in the admin table. 