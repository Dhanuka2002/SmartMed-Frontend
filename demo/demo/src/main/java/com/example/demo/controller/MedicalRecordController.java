package com.example.demo.controller;

import com.example.demo.model.MedicalRecord;
import com.example.demo.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "*")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveMedicalRecord(@RequestBody MedicalRecord medicalRecord) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate required fields
            if (medicalRecord.getStudentName() == null || medicalRecord.getStudentName().trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Student name is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate signatures
            if (medicalRecord.getMedicalOfficerSignature() == null || 
                medicalRecord.getMedicalOfficerSignature().trim().isEmpty() ||
                medicalRecord.getItumMedicalOfficerSignature() == null || 
                medicalRecord.getItumMedicalOfficerSignature().trim().isEmpty()) {
                
                response.put("status", "error");
                response.put("message", "Both digital signatures are required");
                return ResponseEntity.badRequest().body(response);
            }

            // Save the medical record
            MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);
            
            response.put("status", "success");
            response.put("message", "Medical record saved successfully");
            response.put("recordId", savedRecord.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to save medical record: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<MedicalRecord>> getAllMedicalRecords() {
        try {
            List<MedicalRecord> records = medicalRecordRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @GetMapping("/student/{studentName}")
    public ResponseEntity<List<MedicalRecord>> getMedicalRecordsByStudent(@PathVariable String studentName) {
        try {
            List<MedicalRecord> records = medicalRecordRepository.findByStudentName(studentName);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecord> getMedicalRecordById(@PathVariable Long id) {
        try {
            Optional<MedicalRecord> record = medicalRecordRepository.findById(id);
            if (record.isPresent()) {
                return ResponseEntity.ok(record.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateMedicalRecord(
            @PathVariable Long id, 
            @RequestBody MedicalRecord medicalRecord) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<MedicalRecord> existingRecord = medicalRecordRepository.findById(id);
            
            if (!existingRecord.isPresent()) {
                response.put("status", "error");
                response.put("message", "Medical record not found");
                return ResponseEntity.notFound().build();
            }
            
            medicalRecord.setId(id);
            medicalRecord.setCreatedAt(existingRecord.get().getCreatedAt()); // Preserve creation time
            
            MedicalRecord updatedRecord = medicalRecordRepository.save(medicalRecord);
            
            response.put("status", "success");
            response.put("message", "Medical record updated successfully");
            response.put("recordId", updatedRecord.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to update medical record: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/by-record-id/{recordId}")
    public ResponseEntity<Map<String, Object>> getMedicalRecordByStringId(@PathVariable String recordId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // For now, we'll simulate getting medical record data from localStorage-style storage
            // This would normally query a database table that stores the merged medical records
            
            // Create a mock response with the structure the frontend expects
            Map<String, Object> medicalRecord = new HashMap<>();
            medicalRecord.put("id", recordId);
            medicalRecord.put("timestamp", new Date().toString());
            
            // Create student object
            Map<String, Object> student = new HashMap<>();
            student.put("fullName", "John Doe Student"); // This would come from database
            student.put("nic", "199601234568V");
            student.put("studentRegistrationNumber", "MED/2024/002");
            student.put("email", "john@student.com");
            student.put("telephoneNumber", "0771234568");
            student.put("academicDivision", "Medical Faculty");
            student.put("dateOfBirth", "1996-01-23");
            student.put("age", "28");
            student.put("gender", "Male");
            student.put("homeAddress", "123 Main Street, Colombo");
            
            // Emergency contact
            Map<String, Object> emergencyContact = new HashMap<>();
            emergencyContact.put("name", "Jane Doe");
            emergencyContact.put("telephone", "0777654321");
            emergencyContact.put("relationship", "Mother");
            student.put("emergencyContact", emergencyContact);
            
            medicalRecord.put("student", student);
            
            // Create examination object
            Map<String, Object> examination = new HashMap<>();
            
            // Physical measurements
            Map<String, Object> physicalMeasurements = new HashMap<>();
            physicalMeasurements.put("weight", "70");
            physicalMeasurements.put("height", "175");
            examination.put("physicalMeasurements", physicalMeasurements);
            
            examination.put("vaccinationStatus", "yes");
            
            // Detailed examination
            Map<String, Object> examinationDetails = new HashMap<>();
            
            Map<String, Object> circulation = new HashMap<>();
            circulation.put("bloodPressure", "120/80");
            examinationDetails.put("circulation", circulation);
            
            Map<String, Object> clinicalTests = new HashMap<>();
            clinicalTests.put("bloodGroup", "O+");
            clinicalTests.put("hemoglobin", "14.5");
            examinationDetails.put("clinicalTests", clinicalTests);
            
            examination.put("examination", examinationDetails);
            
            // Assessment
            Map<String, Object> assessment = new HashMap<>();
            assessment.put("fitForStudies", "fit");
            assessment.put("specialistReferral", "no");
            examination.put("assessment", assessment);
            
            medicalRecord.put("examination", examination);
            
            response.put("status", "success");
            response.put("medicalRecord", medicalRecord);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to retrieve medical record: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMedicalRecord(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<MedicalRecord> existingRecord = medicalRecordRepository.findById(id);
            
            if (!existingRecord.isPresent()) {
                response.put("status", "error");
                response.put("message", "Medical record not found");
                return ResponseEntity.notFound().build();
            }
            
            medicalRecordRepository.deleteById(id);
            
            response.put("status", "success");
            response.put("message", "Medical record deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to delete medical record: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}