package com.example.appointment.controller;

import com.example.appointment.model.Appointment;
import com.example.appointment.repository.AppointmentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "https://courageous-pegasus-d23412.netlify.app")
@RestController
@RequestMapping("/appointments")
public class AppointmentController {
    private final AppointmentRepository repo;

    public AppointmentController(AppointmentRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public Appointment create(@RequestBody Appointment appointment) {
        appointment.setStatus("PENDING");
        return repo.save(appointment);
    }

    @GetMapping
    public List<Appointment> getAll() {
        return repo.findAll();
    }

    @PutMapping("/{id}/approve")
    public Appointment approve(@PathVariable Integer id) {
        Optional<Appointment> opt = repo.findById(id);
        if (opt.isPresent()) {
            Appointment appt = opt.get();
            appt.setStatus("APPROVED");
            return repo.save(appt);
        }
        throw new RuntimeException("Appointment not found");
    }

    @PutMapping("/{id}")
    public Appointment update(@PathVariable Integer id, @RequestBody Appointment updated) {
        return repo.findById(id).map(appt -> {
            appt.setName(updated.getName());
            appt.setDate(updated.getDate());
            appt.setTime(updated.getTime());
            appt.setReason(updated.getReason());
            return repo.save(appt);
        }).orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
} 
