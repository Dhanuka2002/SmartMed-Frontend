package com.example.demo.controller;

import com.example.demo.entity.Prescription;
import com.example.demo.entity.PrescriptionMedicine;
import com.example.demo.repository.PrescriptionRepository;
import com.example.demo.repository.PrescriptionMedicineRepository;
import com.example.demo.repository.MedicineRepository;
import com.example.demo.entity.Medicine;
import com.example.demo.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {
    
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    
    @Autowired
    private PrescriptionMedicineRepository prescriptionMedicineRepository;
    
    @Autowired
    private MedicineRepository medicineRepository;
    
    @Autowired
    private InventoryService inventoryService;
    
    // Get all prescriptions
    @GetMapping
    public ResponseEntity<List<Prescription>> getAllPrescriptions() {
        try {
            List<Prescription> prescriptions = prescriptionRepository.findAll();
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get prescription by ID with medicines
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPrescriptionById(@PathVariable Long id) {
        try {
            Optional<Prescription> optionalPrescription = prescriptionRepository.findById(id);
            
            if (optionalPrescription.isPresent()) {
                Prescription prescription = optionalPrescription.get();
                List<PrescriptionMedicine> medicines = prescriptionMedicineRepository.findByPrescriptionIdOrderByCreatedDateAsc(id);
                
                Map<String, Object> response = new HashMap<>();
                response.put("prescription", prescription);
                response.put("medicines", medicines);
                response.put("success", true);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Prescription not found");
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching prescription: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Create new prescription (from doctor)
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPrescription(@RequestBody Map<String, Object> prescriptionData) {
        try {
            // Extract prescription details
            String patientName = (String) prescriptionData.get("patientName");
            String patientId = (String) prescriptionData.get("patientId");
            String studentId = (String) prescriptionData.get("studentId");
            String queueNo = (String) prescriptionData.get("queueNo");
            String doctorName = (String) prescriptionData.get("doctorName");
            String prescriptionText = (String) prescriptionData.get("prescriptionText");
            String instructions = (String) prescriptionData.get("instructions");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> medicinesData = (List<Map<String, Object>>) prescriptionData.get("medicines");
            
            // Check for duplicate prescriptions (same patient + doctor + recent time)
            if (queueNo != null) {
                Prescription existingPrescription = prescriptionRepository.findByQueueNo(queueNo);
                if (existingPrescription != null) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Prescription already exists for this queue number: " + queueNo);
                    response.put("existingPrescriptionId", existingPrescription.getId());
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
                }
            }
            
            // Create prescription
            Prescription prescription = new Prescription();
            prescription.setPatientName(patientName);
            prescription.setPatientId(patientId);
            prescription.setStudentId(studentId);
            prescription.setQueueNo(queueNo);
            prescription.setDoctorName(doctorName);
            prescription.setPrescriptionText(prescriptionText);
            prescription.setInstructions(instructions);
            prescription.setTotalMedicines(medicinesData != null ? medicinesData.size() : 0);
            prescription.setStatus("Pending");
            
            // Save prescription
            Prescription savedPrescription = prescriptionRepository.save(prescription);
            
            // Create prescription medicines
            if (medicinesData != null && !medicinesData.isEmpty()) {
                for (Map<String, Object> medicineData : medicinesData) {
                    PrescriptionMedicine prescriptionMedicine = new PrescriptionMedicine();
                    prescriptionMedicine.setPrescription(savedPrescription);
                    
                    Object medicineIdObj = medicineData.get("medicineId");
                    if (medicineIdObj != null) {
                        Long medicineId = Long.valueOf(medicineIdObj.toString());
                        prescriptionMedicine.setMedicineId(medicineId);
                    }
                    
                    prescriptionMedicine.setMedicineName((String) medicineData.get("medicineName"));
                    prescriptionMedicine.setDosage((String) medicineData.get("dosage"));
                    prescriptionMedicine.setFrequency((String) medicineData.get("frequency"));
                    prescriptionMedicine.setDuration((String) medicineData.get("duration"));
                    prescriptionMedicine.setInstructions((String) medicineData.get("instructions"));
                    
                    Object quantityObj = medicineData.get("quantity");
                    if (quantityObj != null) {
                        prescriptionMedicine.setQuantity(Integer.valueOf(quantityObj.toString()));
                    }
                    
                    prescriptionMedicineRepository.save(prescriptionMedicine);
                }
            }
            
            // Check medicine availability for the prescription
            try {
                List<PrescriptionMedicine> prescriptionMedicines = prescriptionMedicineRepository.findByPrescriptionIdOrderByCreatedDateAsc(savedPrescription.getId());
                Map<String, Object> availability = inventoryService.checkMedicineAvailability(prescriptionMedicines);
                
                // Update inventory status on prescription
                Boolean allAvailable = (Boolean) availability.get("allAvailable");
                if (allAvailable != null && !allAvailable) {
                    savedPrescription.setInventoryStatus("Partial Stock Available");
                } else {
                    savedPrescription.setInventoryStatus("All Medicines Available");
                }
                prescriptionRepository.save(savedPrescription);
                
            } catch (Exception e) {
                System.err.println("Error in prescription inventory check: " + e.getMessage());
                savedPrescription.setInventoryStatus("Inventory Check Failed");
                prescriptionRepository.save(savedPrescription);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Prescription created and automatically processed for inventory");
            response.put("prescription", savedPrescription);
            response.put("prescriptionId", savedPrescription.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating prescription: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Get pending prescriptions (for pharmacy queue)
    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingPrescriptions() {
        try {
            List<Prescription> prescriptions = prescriptionRepository.findPendingPrescriptions();
            List<Map<String, Object>> response = prescriptions.stream().map(prescription -> {
                Map<String, Object> prescriptionData = new HashMap<>();
                prescriptionData.put("id", prescription.getId());
                prescriptionData.put("patientName", prescription.getPatientName());
                prescriptionData.put("patientId", prescription.getPatientId());
                prescriptionData.put("studentId", prescription.getStudentId());
                prescriptionData.put("queueNo", prescription.getQueueNo());
                prescriptionData.put("doctorName", prescription.getDoctorName());
                prescriptionData.put("prescriptionText", prescription.getPrescriptionText());
                prescriptionData.put("status", prescription.getStatus());
                prescriptionData.put("totalMedicines", prescription.getTotalMedicines());
                prescriptionData.put("instructions", prescription.getInstructions());
                prescriptionData.put("createdDate", prescription.getCreatedDate().toString());
                
                // Get medicines for this prescription
                List<PrescriptionMedicine> medicines = prescriptionMedicineRepository.findByPrescriptionIdOrderByCreatedDateAsc(prescription.getId());
                prescriptionData.put("medicines", medicines);
                
                return prescriptionData;
            }).toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get prescriptions by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByStatus(@PathVariable String status) {
        try {
            List<Prescription> prescriptions = prescriptionRepository.findByStatusOrderByCreatedDateDesc(status);
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Update prescription status
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updatePrescriptionStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> statusData) {
        try {
            Optional<Prescription> optionalPrescription = prescriptionRepository.findById(id);
            
            if (optionalPrescription.isPresent()) {
                Prescription prescription = optionalPrescription.get();
                String newStatus = (String) statusData.get("status");
                String dispensedBy = (String) statusData.get("dispensedBy");
                
                prescription.setStatus(newStatus);
                
                if (dispensedBy != null) {
                    prescription.setDispensedBy(dispensedBy);
                }
                
                Prescription updatedPrescription = prescriptionRepository.save(prescription);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Prescription status updated successfully");
                response.put("prescription", updatedPrescription);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Prescription not found");
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating prescription status: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Search prescriptions
    @GetMapping("/search")
    public ResponseEntity<List<Prescription>> searchPrescriptions(@RequestParam String term) {
        try {
            List<Prescription> prescriptions = prescriptionRepository.searchPrescriptions(term);
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get prescription statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPrescriptionStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Count by status
            List<Object[]> statusCounts = prescriptionRepository.countPrescriptionsByStatus();
            Map<String, Long> statusMap = new HashMap<>();
            for (Object[] row : statusCounts) {
                statusMap.put((String) row[0], (Long) row[1]);
            }
            stats.put("byStatus", statusMap);
            
            // Count by doctor
            List<Object[]> doctorCounts = prescriptionRepository.countPrescriptionsByDoctor();
            Map<String, Long> doctorMap = new HashMap<>();
            for (Object[] row : doctorCounts) {
                doctorMap.put((String) row[0], (Long) row[1]);
            }
            stats.put("byDoctor", doctorMap);
            
            // Recent prescriptions (last 24 hours)
            LocalDateTime since = LocalDateTime.now().minusHours(24);
            List<Prescription> recentPrescriptions = prescriptionRepository.findRecentPrescriptions(since);
            stats.put("recentCount", recentPrescriptions.size());
            
            // Total prescriptions
            long totalCount = prescriptionRepository.count();
            stats.put("totalCount", totalCount);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Dispense prescription medicines
    @PostMapping("/{id}/dispense")
    public ResponseEntity<Map<String, Object>> dispensePrescription(
            @PathVariable Long id,
            @RequestBody Map<String, Object> dispensingData) {
        try {
            Optional<Prescription> optionalPrescription = prescriptionRepository.findById(id);
            
            if (!optionalPrescription.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Prescription not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            Prescription prescription = optionalPrescription.get();
            String dispensedBy = (String) dispensingData.get("dispensedBy");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> dispensedMedicines = (List<Map<String, Object>>) dispensingData.get("medicines");
            
            // Update prescription medicines with dispensed quantities
            List<PrescriptionMedicine> prescriptionMedicines = prescriptionMedicineRepository.findByPrescriptionIdOrderByCreatedDateAsc(id);
            for (Map<String, Object> dispensedMed : dispensedMedicines) {
                Long medicineId = Long.valueOf(dispensedMed.get("medicineId").toString());
                Integer dispensedQuantity = Integer.valueOf(dispensedMed.get("dispensedQuantity").toString());
                
                // Find and update the prescription medicine record
                for (PrescriptionMedicine prescriptionMedicine : prescriptionMedicines) {
                    if (medicineId.equals(prescriptionMedicine.getMedicineId())) {
                        prescriptionMedicine.setDispensedQuantity(dispensedQuantity);
                        prescriptionMedicine.setStatus(dispensedQuantity >= prescriptionMedicine.getQuantity() ? "Dispensed" : "Partially Dispensed");
                        prescriptionMedicine.setDispensedBy(dispensedBy);
                        prescriptionMedicine.setDispensedDate(LocalDateTime.now());
                        prescriptionMedicineRepository.save(prescriptionMedicine);
                        break;
                    }
                }
            }
            
            // Update inventory using InventoryService (handles alerts automatically)
            try {
                inventoryService.updateInventoryAfterDispensing(prescriptionMedicines);
            } catch (Exception e) {
                System.err.println("Error updating inventory after dispensing: " + e.getMessage());
            }
            
            // Update prescription status
            prescription.setStatus("In Progress");
            prescription.setDispensedBy(dispensedBy);
            
            // Check if all medicines are fully dispensed
            List<PrescriptionMedicine> allMedicines = prescriptionMedicineRepository.findByPrescriptionIdOrderByCreatedDateAsc(id);
            boolean allDispensed = allMedicines.stream().allMatch(PrescriptionMedicine::isDispensed);
            
            if (allDispensed) {
                prescription.setStatus("Completed");
            }
            
            prescriptionRepository.save(prescription);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Prescription dispensed successfully");
            response.put("prescription", prescription);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error dispensing prescription: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}