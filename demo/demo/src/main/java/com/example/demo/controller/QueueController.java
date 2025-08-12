package com.example.demo.controller;

import com.example.demo.model.QueueEntry;
import com.example.demo.model.DoctorQueueEntry;
import com.example.demo.repository.QueueRepository;
import com.example.demo.repository.DoctorQueueRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "http://localhost:5173")  // Allow your React frontend
public class QueueController {

    private final QueueRepository repository;
    private final DoctorQueueRepository doctorQueueRepository;

    public QueueController(QueueRepository repository, DoctorQueueRepository doctorQueueRepository) {
        this.repository = repository;
        this.doctorQueueRepository = doctorQueueRepository;
    }

    // Get all queue entries
    @GetMapping
    public List<QueueEntry> getAllQueueEntries() {
        return repository.findAll();
    }

    // Add new student to queue
    @PostMapping
    public QueueEntry addStudentToQueue(@RequestBody QueueEntry entry) {
        // Generate queueNo if missing
        if (entry.getQueueNo() == null || entry.getQueueNo().isEmpty()) {
            long count = repository.count() + 1;
            entry.setQueueNo(String.valueOf(count));
        }

        // Set defaults
        if (entry.getStatus() == null || entry.getStatus().isEmpty()) {
            entry.setStatus("Waiting");
        }

        return repository.save(entry);
    }

    // Update existing queue entry by ID
    @PutMapping("/{id}")
    public QueueEntry updateQueueEntry(@PathVariable Long id, @RequestBody QueueEntry updatedEntry) {
        QueueEntry entry = repository.findById(id).orElseThrow(() -> new RuntimeException("Entry not found with id " + id));

        // Update fields
        if (updatedEntry.getQueueNo() != null) entry.setQueueNo(updatedEntry.getQueueNo());
        if (updatedEntry.getStudentName() != null) entry.setStudentName(updatedEntry.getStudentName());
        if (updatedEntry.getStatus() != null) entry.setStatus(updatedEntry.getStatus());
        if (updatedEntry.getPriority() != null) entry.setPriority(updatedEntry.getPriority());

        QueueEntry saved = repository.save(entry);

        // ✅ Move to doctor queue if status is "Completed"
        if ("Completed".equalsIgnoreCase(updatedEntry.getStatus())) {
            DoctorQueueEntry doctorEntry = new DoctorQueueEntry();
            doctorEntry.setStudentName(entry.getStudentName());
            doctorEntry.setQueueNo(entry.getQueueNo());
            doctorEntry.setStatus("Waiting");
            doctorEntry.setPriority(entry.getPriority());

            doctorQueueRepository.save(doctorEntry);
        }

        return saved;
    }

    // Delete entry
    @DeleteMapping("/{id}")
    public void deleteEntry(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
