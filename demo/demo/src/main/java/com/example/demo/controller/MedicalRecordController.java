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
            // Create comprehensive mock medical record data that matches frontend expectations
            Map<String, Object> medicalRecord = createComprehensiveMockRecord(recordId);
            
            response.put("success", true);
            response.put("medicalRecord", medicalRecord);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to retrieve medical record: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Helper method to create comprehensive mock medical record
    private Map<String, Object> createComprehensiveMockRecord(String recordId) {
        Map<String, Object> medicalRecord = new HashMap<>();
        
        // Generate unique student data based on record ID
        String idSuffix = recordId.substring(Math.max(0, recordId.length() - 3));
        
        medicalRecord.put("id", recordId);
        medicalRecord.put("timestamp", new Date().toString());
        
        // Comprehensive student information
        Map<String, Object> student = new HashMap<>();
        student.put("fullName", "Alex Johnson Student " + idSuffix);
        student.put("nic", "1996012345" + idSuffix + "V");
        student.put("studentRegistrationNumber", "MED/2024/" + idSuffix);
        student.put("email", "alex.johnson" + idSuffix + "@university.edu");
        student.put("telephoneNumber", "0771234" + String.format("%03d", Integer.parseInt(idSuffix)));
        student.put("academicDivision", "Faculty of Medicine");
        student.put("dateOfBirth", "1996-03-15");
        student.put("age", "28");
        student.put("gender", Integer.parseInt(idSuffix) % 2 == 0 ? "Male" : "Female");
        student.put("nationality", "Sri Lankan");
        student.put("homeAddress", "456 University Avenue, Colombo 07, Sri Lanka");
        student.put("religion", "Buddhism");
        
        // Emergency contact
        Map<String, Object> emergencyContact = new HashMap<>();
        emergencyContact.put("name", "Sarah Johnson");
        emergencyContact.put("telephone", "0777654" + String.format("%03d", Integer.parseInt(idSuffix)));
        emergencyContact.put("relationship", "Mother");
        emergencyContact.put("address", "456 University Avenue, Colombo 07");
        student.put("emergencyContact", emergencyContact);
        
        // Student medical history
        Map<String, Object> studentMedicalHistory = new HashMap<>();
        
        Map<String, Object> allergicHistory = new HashMap<>();
        allergicHistory.put("status", Integer.parseInt(idSuffix) % 3 == 0 ? "yes" : "no");
        allergicHistory.put("details", Integer.parseInt(idSuffix) % 3 == 0 ? "Penicillin allergy" : "");
        studentMedicalHistory.put("allergicHistory", allergicHistory);
        
        Map<String, Object> significantMedicalHistory = new HashMap<>();
        significantMedicalHistory.put("status", "no");
        significantMedicalHistory.put("details", "");
        studentMedicalHistory.put("significantMedicalHistory", significantMedicalHistory);
        
        Map<String, Object> chronicIllness = new HashMap<>();
        chronicIllness.put("status", Integer.parseInt(idSuffix) % 5 == 0 ? "yes" : "no");
        chronicIllness.put("details", Integer.parseInt(idSuffix) % 5 == 0 ? "Mild asthma" : "");
        studentMedicalHistory.put("chronicIllness", chronicIllness);
        
        Map<String, Object> surgicalHistory = new HashMap<>();
        surgicalHistory.put("status", "no");
        surgicalHistory.put("details", "");
        studentMedicalHistory.put("surgicalHistory", surgicalHistory);
        
        student.put("studentMedicalHistory", studentMedicalHistory);
        medicalRecord.put("student", student);
        
        // Comprehensive examination data
        Map<String, Object> examination = new HashMap<>();
        
        // Physical measurements
        Map<String, Object> physicalMeasurements = new HashMap<>();
        physicalMeasurements.put("weight", String.valueOf(65 + Integer.parseInt(idSuffix) % 20));
        physicalMeasurements.put("height", String.valueOf(160 + Integer.parseInt(idSuffix) % 25));
        physicalMeasurements.put("chestInspiration", "85");
        physicalMeasurements.put("chestExpiration", "82");
        examination.put("physicalMeasurements", physicalMeasurements);
        
        examination.put("vaccinationStatus", "yes");
        
        // Detailed examination results
        Map<String, Object> examinationDetails = new HashMap<>();
        
        // Circulation
        Map<String, Object> circulation = new HashMap<>();
        circulation.put("bloodPressure", "118/75");
        circulation.put("pulse", String.valueOf(68 + Integer.parseInt(idSuffix) % 15));
        circulation.put("heartDisease", "no");
        circulation.put("heartSound", "normal");
        circulation.put("murmurs", "no");
        examinationDetails.put("circulation", circulation);
        
        // Clinical tests
        Map<String, Object> clinicalTests = new HashMap<>();
        String[] bloodGroups = {"A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"};
        clinicalTests.put("bloodGroup", bloodGroups[Integer.parseInt(idSuffix) % bloodGroups.length]);
        clinicalTests.put("hemoglobin", String.valueOf(12.5 + (Integer.parseInt(idSuffix) % 30) / 10.0));
        examinationDetails.put("clinicalTests", clinicalTests);
        
        // Vision
        Map<String, Object> vision = new HashMap<>();
        vision.put("rightWithoutGlasses", "6/6");
        vision.put("leftWithoutGlasses", "6/6");
        vision.put("rightWithGlasses", "6/6");
        vision.put("leftWithGlasses", "6/6");
        
        Map<String, Object> colorVision = new HashMap<>();
        colorVision.put("normal", "yes");
        colorVision.put("red", "no");
        colorVision.put("green", "no");
        vision.put("colorVision", colorVision);
        examinationDetails.put("vision", vision);
        
        // Hearing
        Map<String, Object> hearing = new HashMap<>();
        hearing.put("rightEar", "normal");
        hearing.put("leftEar", "normal");
        hearing.put("speech", "normal");
        examinationDetails.put("hearing", hearing);
        
        // Teeth
        Map<String, Object> teeth = new HashMap<>();
        teeth.put("decayed", String.valueOf(Integer.parseInt(idSuffix) % 3));
        teeth.put("missing", "0");
        teeth.put("dentures", "no");
        teeth.put("gingivitis", Integer.parseInt(idSuffix) % 4 == 0 ? "mild" : "no");
        examinationDetails.put("teeth", teeth);
        
        // Nervous system
        Map<String, Object> nervous = new HashMap<>();
        nervous.put("convulsion", "no");
        nervous.put("kneeJerks", "normal");
        examinationDetails.put("nervous", nervous);
        
        // Abdomen
        Map<String, Object> abdomen = new HashMap<>();
        abdomen.put("liverSpleen", "normal");
        abdomen.put("hemorrhoids", "no");
        abdomen.put("hernialOrifices", "no");
        examinationDetails.put("abdomen", abdomen);
        
        // Extremities
        Map<String, Object> extremities = new HashMap<>();
        extremities.put("scarsOperations", "no");
        extremities.put("varicoseVeins", "no");
        extremities.put("boneJoint", "normal");
        examinationDetails.put("extremities", extremities);
        
        // Respiration
        Map<String, Object> respiration = new HashMap<>();
        respiration.put("tuberculosis", "no");
        respiration.put("tuberculosisTest", "negative");
        
        Map<String, Object> xray = new HashMap<>();
        xray.put("chest", "normal");
        xray.put("number", "XR" + idSuffix);
        xray.put("findings", "Normal chest X-ray, clear lung fields");
        xray.put("date", new Date().toString());
        respiration.put("xray", xray);
        examinationDetails.put("respiration", respiration);
        
        examination.put("examination", examinationDetails);
        
        // Assessment
        Map<String, Object> assessment = new HashMap<>();
        assessment.put("specialistReferral", Integer.parseInt(idSuffix) % 7 == 0 ? "yes" : "no");
        assessment.put("medicalCondition", "healthy");
        assessment.put("fitForStudies", "fit");
        assessment.put("reason", Integer.parseInt(idSuffix) % 7 == 0 ? 
            "Recommend follow-up for chronic condition monitoring" : 
            "Student is medically fit for academic studies");
        examination.put("assessment", assessment);
        
        // Certification
        Map<String, Object> certification = new HashMap<>();
        certification.put("date1", new Date().toString());
        certification.put("date2", new Date().toString());
        certification.put("medicalOfficerSignature", "Dr. Sarah Williams");
        certification.put("itumMedicalOfficerSignature", "Dr. Michael Brown");
        examination.put("certification", certification);
        
        medicalRecord.put("examination", examination);
        
        return medicalRecord;
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