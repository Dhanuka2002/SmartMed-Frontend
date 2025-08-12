package com.example.demo.controller;

import com.example.demo.model.DoctorQueueEntry;
import com.example.demo.repository.DoctorQueueRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor-queue")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class DoctorQueueController {

    private final DoctorQueueRepository doctorQueueRepository;

    public DoctorQueueController(DoctorQueueRepository doctorQueueRepository) {
        this.doctorQueueRepository = doctorQueueRepository;
    }

    // Get all entries in doctor queue
    @GetMapping
    public List<DoctorQueueEntry> getAllDoctorQueueEntries() {
        return doctorQueueRepository.findAll();
    }

    // Add manually to doctor queue (optional - for testing)
    @PostMapping
    public DoctorQueueEntry addToDoctorQueue(@RequestBody DoctorQueueEntry entry) {
        return doctorQueueRepository.save(entry);
    }

    // Update doctor queue entry (optional)
    @PutMapping("/{id}")
    public DoctorQueueEntry updateDoctorQueueEntry(@PathVariable Long id, @RequestBody DoctorQueueEntry updated) {
        DoctorQueueEntry existing = doctorQueueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DoctorQueueEntry not found with id " + id));

        existing.setStudentName(updated.getStudentName());
        existing.setQueueNo(updated.getQueueNo());
        existing.setStatus(updated.getStatus());
        existing.setPriority(updated.getPriority());

        return doctorQueueRepository.save(existing);
    }

    // Delete doctor queue entry (optional)
    @DeleteMapping("/{id}")
    public void deleteDoctorQueueEntry(@PathVariable Long id) {
        doctorQueueRepository.deleteById(id);
    }
}
