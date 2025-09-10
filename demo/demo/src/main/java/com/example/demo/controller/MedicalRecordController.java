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

            if (medicalRecord.getStudentEmail() == null || medicalRecord.getStudentEmail().trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Student email is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Set the email field to the same value as studentEmail for database compatibility
            medicalRecord.setEmail(medicalRecord.getStudentEmail());

            // Validate signature
            if (medicalRecord.getMedicalOfficerSignature() == null || 
                medicalRecord.getMedicalOfficerSignature().trim().isEmpty()) {
                
                response.put("status", "error");
                response.put("message", "Medical officer digital signature is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate and process allergies data
            if (medicalRecord.getHasAllergies() != null && "yes".equals(medicalRecord.getHasAllergies())) {
                // If patient has allergies, ensure allergy details are provided
                if ((medicalRecord.getAllergies() == null || medicalRecord.getAllergies().trim().isEmpty()) &&
                    (medicalRecord.getAllergyDetails() == null || medicalRecord.getAllergyDetails().trim().isEmpty())) {
                    
                    response.put("status", "error");
                    response.put("message", "If patient has allergies, please provide either allergy categories or details");
                    return ResponseEntity.badRequest().body(response);
                }
                
                // Log allergy information for debugging
                System.out.println("Processing medical record with allergies:");
                System.out.println("Has Allergies: " + medicalRecord.getHasAllergies());
                System.out.println("Allergy Categories: " + medicalRecord.getAllergies());
                System.out.println("Allergy Details: " + medicalRecord.getAllergyDetails());
            } else {
                // If no allergies, clear any existing allergy data
                medicalRecord.setAllergies(null);
                medicalRecord.setAllergyDetails(null);
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

    @GetMapping("/student-email/{studentEmail}")
    public ResponseEntity<List<MedicalRecord>> getMedicalRecordsByStudentEmail(@PathVariable String studentEmail) {
        try {
            List<MedicalRecord> records = medicalRecordRepository.findByStudentEmail(studentEmail);
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
        
        // Allergies
        Map<String, Object> allergies = new HashMap<>();
        boolean hasAllergies = Integer.parseInt(idSuffix) % 4 == 0; // 25% chance of having allergies
        allergies.put("hasAllergies", hasAllergies ? "yes" : "no");
        
        if (hasAllergies) {
            // Sample allergy categories based on ID
            Map<String, Boolean> allergyCategories = new HashMap<>();
            String[] possibleAllergies = {
                "Food Allergies", "Drug/Medication Allergies", "Environmental Allergies", 
                "Seasonal Allergies", "Insect Sting Allergies", "Latex Allergies"
            };
            
            // Assign 1-3 random allergies based on ID
            int numAllergies = (Integer.parseInt(idSuffix) % 3) + 1;
            for (int i = 0; i < numAllergies && i < possibleAllergies.length; i++) {
                int allergyIndex = (Integer.parseInt(idSuffix) + i) % possibleAllergies.length;
                allergyCategories.put(possibleAllergies[allergyIndex], true);
            }
            
            allergies.put("categories", allergyCategories);
            
            // Sample allergy details
            String[] allergyDetailsSamples = {
                "Mild reaction to shellfish - swelling and hives. Carries epinephrine.",
                "Penicillin allergy - rash and difficulty breathing. Alternative antibiotics required.",
                "Seasonal pollen allergies - sneezing and congestion during spring. Takes antihistamines.",
                "Latex sensitivity - skin irritation with latex gloves. Uses nitrile alternatives.",
                "Food allergies to peanuts - severe anaphylactic reactions. Strict avoidance required."
            };
            
            allergies.put("details", allergyDetailsSamples[Integer.parseInt(idSuffix) % allergyDetailsSamples.length]);
        } else {
            allergies.put("categories", new HashMap<>());
            allergies.put("details", "");
        }
        
        examination.put("allergies", allergies);
        
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
        certification.put("medicalOfficerSignature", "Dr. Sarah Williams");
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

    @GetMapping("/with-allergies")
    public ResponseEntity<List<MedicalRecord>> getMedicalRecordsWithAllergies() {
        try {
            List<MedicalRecord> records = medicalRecordRepository.findByHasAllergies("yes");
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @GetMapping("/allergies-report")
    public ResponseEntity<Map<String, Object>> getAllergiesReport() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<MedicalRecord> allRecords = medicalRecordRepository.findAll();
            List<MedicalRecord> recordsWithAllergies = medicalRecordRepository.findByHasAllergies("yes");
            
            response.put("totalRecords", allRecords.size());
            response.put("recordsWithAllergies", recordsWithAllergies.size());
            response.put("recordsWithoutAllergies", allRecords.size() - recordsWithAllergies.size());
            response.put("allergyPercentage", allRecords.size() > 0 ? 
                (recordsWithAllergies.size() * 100.0 / allRecords.size()) : 0);
            
            // Count common allergy categories
            Map<String, Integer> categoryCounts = new HashMap<>();
            for (MedicalRecord record : recordsWithAllergies) {
                if (record.getAllergies() != null && !record.getAllergies().trim().isEmpty()) {
                    try {
                        // Parse JSON string to extract categories
                        String allergiesJson = record.getAllergies();
                        // Simple parsing - you might want to use a JSON library for production
                        if (allergiesJson.contains("Food Allergies\":true")) {
                            categoryCounts.merge("Food Allergies", 1, Integer::sum);
                        }
                        if (allergiesJson.contains("Drug/Medication Allergies\":true")) {
                            categoryCounts.merge("Drug/Medication Allergies", 1, Integer::sum);
                        }
                        if (allergiesJson.contains("Environmental Allergies\":true")) {
                            categoryCounts.merge("Environmental Allergies", 1, Integer::sum);
                        }
                        if (allergiesJson.contains("Seasonal Allergies\":true")) {
                            categoryCounts.merge("Seasonal Allergies", 1, Integer::sum);
                        }
                        if (allergiesJson.contains("Insect Sting Allergies\":true")) {
                            categoryCounts.merge("Insect Sting Allergies", 1, Integer::sum);
                        }
                        if (allergiesJson.contains("Latex Allergies\":true")) {
                            categoryCounts.merge("Latex Allergies", 1, Integer::sum);
                        }
                    } catch (Exception e) {
                        System.err.println("Error parsing allergies JSON: " + e.getMessage());
                    }
                }
            }
            
            response.put("commonAllergies", categoryCounts);
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to generate allergies report: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}