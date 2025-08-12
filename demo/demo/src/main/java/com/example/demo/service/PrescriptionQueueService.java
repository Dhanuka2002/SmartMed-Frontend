package com.example.demo.service; // change to your package name

import com.example.demo.model.PrescriptionQueue;
import com.example.demo.repository.PrescriptionQueueRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrescriptionQueueService {

    private final PrescriptionQueueRepository repo;

    public PrescriptionQueueService(PrescriptionQueueRepository repo) {
        this.repo = repo;
    }

    // Add prescription to queue
    public PrescriptionQueue addToQueue(PrescriptionQueue prescription) {
        prescription.setStatus("Pending");
        return repo.save(prescription);
    }

    // Get all prescriptions in the queue
    public List<PrescriptionQueue> getAll() {
        return repo.findAll();
    }

    // Optional: Update prescription status (e.g., when pharmacist completes it)
    public PrescriptionQueue updateStatus(Long id, String status) {
        PrescriptionQueue p = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        p.setStatus(status);
        return repo.save(p);
    }
}
