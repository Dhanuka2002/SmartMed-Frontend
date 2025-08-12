package com.example.demo.controller;

import com.example.demo.model.MedicalRecord;
import com.example.demo.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    // Create a new medical record
    @PostMapping
    public ResponseEntity<Map<String, Object>> createMedicalRecord(@RequestBody MedicalRecord medicalRecord) {
        Map<String, Object> response = new HashMap<>();

        try {
            MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);
            response.put("status", "success");
            response.put("message", "Medical record created successfully");
            response.put("data", savedRecord);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to create medical record: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get all medical records
    @GetMapping
    public ResponseEntity<List<MedicalRecord>> getAllMedicalRecords() {
        List<MedicalRecord> records = medicalRecordRepository.findAll();
        return ResponseEntity.ok(records);
    }

    // Get medical record by ID
    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecord> getMedicalRecordById(@PathVariable Long id) {
        Optional<MedicalRecord> record = medicalRecordRepository.findById(id);
        return record.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update medical record
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateMedicalRecord(
            @PathVariable Long id, @RequestBody MedicalRecord medicalRecord) {
        Map<String, Object> response = new HashMap<>();

        Optional<MedicalRecord> existingRecord = medicalRecordRepository.findById(id);
        if (existingRecord.isPresent()) {
            medicalRecord.setId(id);
            MedicalRecord updatedRecord = medicalRecordRepository.save(medicalRecord);

            response.put("status", "success");
            response.put("message", "Medical record updated successfully");
            response.put("data", updatedRecord);
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "error");
            response.put("message", "Medical record not found");
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMedicalRecord(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        if (medicalRecordRepository.existsById(id)) {
            medicalRecordRepository.deleteById(id);
            response.put("status", "success");
            response.put("message", "Medical record deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "error");
            response.put("message", "Medical record not found");
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<MedicalRecord>> searchByStudentName(@RequestParam String name) {
        List<MedicalRecord> records = medicalRecordRepository.findByStudentNameContainingIgnoreCase(name);
        return ResponseEntity.ok(records);
    }

    // Get records by fitness status
    @GetMapping("/fitness/{status}")
    public ResponseEntity<List<MedicalRecord>> getRecordsByFitnessStatus(@PathVariable String status) {
        List<MedicalRecord> records = medicalRecordRepository.findByFitForStudies(status);
        return ResponseEntity.ok(records);
    }

    // Get records by blood group
    @GetMapping("/blood-group/{group}")
    public ResponseEntity<List<MedicalRecord>> getRecordsByBloodGroup(@PathVariable String group) {
        List<MedicalRecord> records = medicalRecordRepository.findByBloodGroup(group);
        return ResponseEntity.ok(records);
    }

    // Get dashboard statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalRecords = medicalRecordRepository.count();
        List<MedicalRecord> allRecords = medicalRecordRepository.findAll();

        long fitStudents = allRecords.stream()
                .filter(record -> "Fit".equalsIgnoreCase(record.getFitForStudies()))
                .count();

        long unfitStudents = totalRecords - fitStudents;

        // Blood group distribution
        Map<String, Long> bloodGroupStats = new HashMap<>();
        allRecords.stream()
                .filter(record -> record.getBloodGroup() != null)
                .forEach(record -> {
                    String bloodGroup = record.getBloodGroup();
                    bloodGroupStats.put(bloodGroup,
                            bloodGroupStats.getOrDefault(bloodGroup, 0L) + 1);
                });

        stats.put("totalRecords", totalRecords);
        stats.put("fitStudents", fitStudents);
        stats.put("unfitStudents", unfitStudents);
        stats.put("bloodGroupDistribution", bloodGroupStats);

        return ResponseEntity.ok(stats);
    }
}