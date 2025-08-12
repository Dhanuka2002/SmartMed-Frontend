package com.example.demo.controller; // Change to your package name

import com.example.demo.model.PrescriptionQueue;
import com.example.demo.service.PrescriptionQueueService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:5173") // Your React port
public class PrescriptionQueueController {

    private final PrescriptionQueueService service;

    public PrescriptionQueueController(PrescriptionQueueService service) {
        this.service = service;
    }

    // Add a prescription to the queue
    @PostMapping("/add")
    public PrescriptionQueue addPrescription(@RequestBody PrescriptionQueue prescription) {
        return service.addToQueue(prescription);
    }

    // Get all prescriptions in the queue
    @GetMapping("/all")
    public List<PrescriptionQueue> getAll() {
        return service.getAll();
    }

    // Optional: Update prescription status
    @PutMapping("/{id}/status")
    public PrescriptionQueue updateStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateStatus(id, status);
    }
}
