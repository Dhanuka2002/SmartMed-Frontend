package com.example.demo.controller;

import com.example.demo.model.QueueEntry;
import com.example.demo.repository.QueueEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "*")
public class QueueController {

    @Autowired
    private QueueEntryRepository queueEntryRepository;

    private int queueCounter = 1; // Starting queue number from 1

    // Generate unique queue number
    private synchronized String generateQueueNumber() {
        // Check for the highest existing queue number in database to avoid duplicates
        try {
            String maxQueueNo = queueEntryRepository.findMaxQueueNo();
            if (maxQueueNo != null && !maxQueueNo.isEmpty()) {
                int maxNum = Integer.parseInt(maxQueueNo);
                queueCounter = Math.max(queueCounter, maxNum + 1);
            } else {
                // If no entries exist, start from 1
                queueCounter = 1;
            }
        } catch (Exception e) {
            // If there's an error, continue with current counter
            System.err.println("Warning: Could not get max queue number from database: " + e.getMessage());
        }
        
        String queueNo = String.format("%03d", queueCounter);
        queueCounter++;
        return queueNo;
    }

    // Add student to reception queue
    @PostMapping("/add-student")
    public ResponseEntity<Map<String, Object>> addStudentToQueue(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extract medical data from request
            @SuppressWarnings("unchecked")
            Map<String, Object> medicalData = (Map<String, Object>) request.get("medicalData");
            @SuppressWarnings("unchecked")
            Map<String, Object> student = (Map<String, Object>) medicalData.get("student");

            String email = (String) student.get("email");
            String nic = (String) student.get("nic");
            String medicalRecordId = (String) medicalData.get("id");

            // Check for duplicates in reception queue only
            List<QueueEntry> duplicates = queueEntryRepository.findDuplicates(email, nic, medicalRecordId);
            
            if (!duplicates.isEmpty()) {
                QueueEntry existingEntry = duplicates.get(0);
                response.put("isDuplicate", true);
                response.put("message", "Student " + student.get("fullName") + " is already in the reception queue (Queue #" + existingEntry.getQueueNo() + ")");
                response.put("queueEntry", convertToMap(existingEntry));
                return ResponseEntity.ok(response);
            }
            
            // Check if student exists in other stages for informational purposes
            List<QueueEntry> anyExisting = queueEntryRepository.findAnyExistingEntry(email, nic, medicalRecordId);
            String existingStageInfo = "";
            if (!anyExisting.isEmpty()) {
                QueueEntry existingInOtherStage = anyExisting.get(0);
                if (!existingInOtherStage.getStage().equals("reception")) {
                    existingStageInfo = " (Note: Student was previously in " + existingInOtherStage.getStage() + " queue)";
                }
            }

            // Create new queue entry
            String queueNumber = generateQueueNumber();
            QueueEntry queueEntry = new QueueEntry(
                queueNumber,
                (String) student.get("fullName"),
                (String) student.get("studentRegistrationNumber"),
                email,
                nic,
                (String) student.get("telephoneNumber"),
                medicalRecordId,
                request.toString() // Store medical data as JSON string
            );

            // Save to database
            QueueEntry savedEntry = queueEntryRepository.save(queueEntry);

            response.put("isDuplicate", false);
            response.put("success", true);
            response.put("message", "Student added to reception queue successfully" + existingStageInfo);
            response.put("queueEntry", convertToMap(savedEntry));
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to add student to queue: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get reception queue
    @GetMapping("/reception")
    public ResponseEntity<List<Map<String, Object>>> getReceptionQueue() {
        try {
            List<QueueEntry> queue = queueEntryRepository.findByStageOrderByAddedTimeAsc("reception");
            List<Map<String, Object>> responseQueue = new ArrayList<>();
            
            for (QueueEntry entry : queue) {
                responseQueue.add(convertToMap(entry));
            }
            
            return ResponseEntity.ok(responseQueue);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    // Get doctor queue
    @GetMapping("/doctor")
    public ResponseEntity<List<Map<String, Object>>> getDoctorQueue() {
        try {
            List<QueueEntry> queue = queueEntryRepository.findByStageOrderByAddedTimeAsc("doctor");
            List<Map<String, Object>> responseQueue = new ArrayList<>();
            
            for (QueueEntry entry : queue) {
                responseQueue.add(convertToMap(entry));
            }
            
            return ResponseEntity.ok(responseQueue);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    // Get pharmacy queue
    @GetMapping("/pharmacy")
    public ResponseEntity<List<Map<String, Object>>> getPharmacyQueue() {
        try {
            List<QueueEntry> queue = queueEntryRepository.findByStageOrderByAddedTimeAsc("pharmacy");
            List<Map<String, Object>> responseQueue = new ArrayList<>();
            
            for (QueueEntry entry : queue) {
                responseQueue.add(convertToMap(entry));
            }
            
            return ResponseEntity.ok(responseQueue);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    // Move student from reception to doctor
    @PostMapping("/move-to-doctor/{queueNo}")
    public ResponseEntity<Map<String, Object>> moveStudentToDoctor(@PathVariable String queueNo) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<QueueEntry> optionalEntry = queueEntryRepository.findByQueueNo(queueNo);
            
            if (!optionalEntry.isPresent()) {
                response.put("success", false);
                response.put("error", "Student not found in queue");
                return ResponseEntity.notFound().build();
            }

            QueueEntry entry = optionalEntry.get();
            entry.setStage("doctor");
            entry.setStatus("Waiting for Doctor");
            entry.setMovedToDoctorTime(LocalDateTime.now());

            QueueEntry updatedEntry = queueEntryRepository.save(entry);

            response.put("success", true);
            response.put("message", "Student moved to doctor queue successfully");
            response.put("queueEntry", convertToMap(updatedEntry));
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to move student to doctor: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Add prescription and move to pharmacy
    @PostMapping("/move-to-pharmacy/{queueNo}")
    public ResponseEntity<Map<String, Object>> moveStudentToPharmacy(
            @PathVariable String queueNo, 
            @RequestBody Map<String, Object> prescriptionData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<QueueEntry> optionalEntry = queueEntryRepository.findByQueueNo(queueNo);
            
            if (!optionalEntry.isPresent()) {
                response.put("success", false);
                response.put("error", "Student not found in queue");
                return ResponseEntity.notFound().build();
            }

            QueueEntry entry = optionalEntry.get();
            entry.setStage("pharmacy");
            entry.setStatus("Prescription Ready");
            entry.setPrescriptionTime(LocalDateTime.now());
            entry.setPrescription(prescriptionData.toString()); // Store as JSON string
            entry.setPharmacyStatus("Pending");

            QueueEntry updatedEntry = queueEntryRepository.save(entry);

            response.put("success", true);
            response.put("message", "Student moved to pharmacy queue with prescription");
            response.put("queueEntry", convertToMap(updatedEntry));
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to move student to pharmacy: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Complete pharmacy process
    @PostMapping("/complete/{queueNo}")
    public ResponseEntity<Map<String, Object>> completePharmacyProcess(@PathVariable String queueNo) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<QueueEntry> optionalEntry = queueEntryRepository.findByQueueNo(queueNo);
            
            if (!optionalEntry.isPresent()) {
                response.put("success", false);
                response.put("error", "Student not found in queue");
                return ResponseEntity.notFound().build();
            }

            QueueEntry entry = optionalEntry.get();
            entry.setStage("completed");
            entry.setStatus("Completed");
            entry.setCompletedTime(LocalDateTime.now());
            entry.setPharmacyStatus("Dispensed");

            QueueEntry updatedEntry = queueEntryRepository.save(entry);

            response.put("success", true);
            response.put("message", "Student process completed successfully");
            response.put("queueEntry", convertToMap(updatedEntry));
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to complete pharmacy process: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get student by queue number
    @GetMapping("/student/{queueNo}")
    public ResponseEntity<Map<String, Object>> getStudentByQueueNumber(@PathVariable String queueNo) {
        try {
            Optional<QueueEntry> optionalEntry = queueEntryRepository.findByQueueNo(queueNo);
            
            if (optionalEntry.isPresent()) {
                Map<String, Object> response = convertToMap(optionalEntry.get());
                response.put("currentQueue", optionalEntry.get().getStage());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Update queue entry status
    @PutMapping("/update-status/{queueNo}")
    public ResponseEntity<Map<String, Object>> updateQueueEntryStatus(
            @PathVariable String queueNo,
            @RequestBody Map<String, String> updates) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<QueueEntry> optionalEntry = queueEntryRepository.findByQueueNo(queueNo);
            
            if (!optionalEntry.isPresent()) {
                response.put("success", false);
                response.put("error", "Entry not found in queue");
                return ResponseEntity.notFound().build();
            }

            QueueEntry entry = optionalEntry.get();
            
            // Update status if provided
            if (updates.containsKey("status")) {
                entry.setStatus(updates.get("status"));
            }
            
            // Update priority if provided
            if (updates.containsKey("priority")) {
                entry.setPriority(updates.get("priority"));
            }
            
            // Update stage if provided
            if (updates.containsKey("stage")) {
                entry.setStage(updates.get("stage"));
            }

            QueueEntry updatedEntry = queueEntryRepository.save(entry);

            response.put("success", true);
            response.put("message", "Queue entry updated successfully");
            response.put("queueEntry", convertToMap(updatedEntry));
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to update queue entry: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get queue statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getQueueStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("reception", queueEntryRepository.countByStage("reception"));
            stats.put("doctor", queueEntryRepository.countByStage("doctor"));
            stats.put("pharmacy", queueEntryRepository.countByStage("pharmacy"));
            stats.put("completed", queueEntryRepository.countByStage("completed"));
            stats.put("total", queueEntryRepository.count());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<>());
        }
    }

    // Clear all queues (for testing)
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllQueues() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            queueEntryRepository.deleteAll();
            queueCounter = 1; // Reset counter to start from 1
            
            response.put("success", true);
            response.put("message", "All queues cleared successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to clear queues: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Helper method to convert QueueEntry to Map for JSON response
    private Map<String, Object> convertToMap(QueueEntry entry) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", entry.getId());
        map.put("queueNo", entry.getQueueNo());
        map.put("studentName", entry.getStudentName());
        map.put("studentId", entry.getStudentId());
        map.put("email", entry.getEmail());
        map.put("nic", entry.getNic());
        map.put("phone", entry.getPhone());
        map.put("medicalRecordId", entry.getMedicalRecordId());
        map.put("status", entry.getStatus());
        map.put("priority", entry.getPriority());
        map.put("stage", entry.getStage());
        map.put("addedTime", entry.getAddedTime().toString());
        
        // Calculate wait time
        if (entry.getAddedTime() != null) {
            long waitMinutes = java.time.Duration.between(entry.getAddedTime(), LocalDateTime.now()).toMinutes();
            map.put("waitTime", waitMinutes > 0 ? waitMinutes + " min" : "0 min");
        }
        
        map.put("action", "Call Now");
        
        // Include time stamps if they exist
        if (entry.getMovedToDoctorTime() != null) {
            map.put("movedToDoctorTime", entry.getMovedToDoctorTime().toString());
        }
        if (entry.getPrescriptionTime() != null) {
            map.put("prescriptionTime", entry.getPrescriptionTime().toString());
        }
        if (entry.getCompletedTime() != null) {
            map.put("completedTime", entry.getCompletedTime().toString());
        }
        
        // Include additional data if it exists
        if (entry.getPrescription() != null) {
            map.put("prescription", entry.getPrescription());
        }
        if (entry.getPharmacyStatus() != null) {
            map.put("pharmacyStatus", entry.getPharmacyStatus());
        }
        
        return map;
    }
}