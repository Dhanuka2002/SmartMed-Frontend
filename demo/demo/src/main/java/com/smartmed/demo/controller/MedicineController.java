package com.smartmed.demo.controller;

import com.smartmed.demo.entity.Medicine;
import com.smartmed.demo.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "*")
public class MedicineController {
    
    @Autowired
    private MedicineRepository medicineRepository;
    
    // Get all medicines
    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        try {
            List<Medicine> medicines = medicineRepository.findAll();
            return ResponseEntity.ok(medicines);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get medicine by ID
    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable Long id) {
        try {
            Optional<Medicine> medicine = medicineRepository.findById(id);
            return medicine.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Add new medicine
    @PostMapping
    public ResponseEntity<Map<String, Object>> addMedicine(@RequestBody Medicine medicine) {
        try {
            medicine.setAddedDate(LocalDateTime.now());
            medicine.setLastUpdated(LocalDateTime.now());
            
            Medicine savedMedicine = medicineRepository.save(medicine);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Medicine added successfully");
            response.put("medicine", savedMedicine);
            response.put("id", savedMedicine.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error adding medicine: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Update medicine
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateMedicine(@PathVariable Long id, @RequestBody Medicine medicineDetails) {
        try {
            Optional<Medicine> optionalMedicine = medicineRepository.findById(id);
            
            if (optionalMedicine.isPresent()) {
                Medicine medicine = optionalMedicine.get();
                
                // Update fields
                medicine.setName(medicineDetails.getName());
                medicine.setQuantity(medicineDetails.getQuantity());
                medicine.setExpiry(medicineDetails.getExpiry());
                medicine.setCategory(medicineDetails.getCategory());
                medicine.setMinStock(medicineDetails.getMinStock());
                medicine.setDosage(medicineDetails.getDosage());
                medicine.setBatchNumber(medicineDetails.getBatchNumber());
                medicine.setLastUpdated(LocalDateTime.now());
                
                Medicine updatedMedicine = medicineRepository.save(medicine);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Medicine updated successfully");
                response.put("medicine", updatedMedicine);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Medicine not found");
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating medicine: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Delete medicine
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMedicine(@PathVariable Long id) {
        try {
            if (medicineRepository.existsById(id)) {
                medicineRepository.deleteById(id);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Medicine deleted successfully");
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Medicine not found");
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting medicine: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Update medicine quantity (for dispensing)
    @PutMapping("/{id}/quantity")
    public ResponseEntity<Map<String, Object>> updateMedicineQuantity(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Optional<Medicine> optionalMedicine = medicineRepository.findById(id);
            
            if (optionalMedicine.isPresent()) {
                Medicine medicine = optionalMedicine.get();
                Integer newQuantity = request.get("quantity");
                
                if (newQuantity != null && newQuantity >= 0) {
                    medicine.setQuantity(newQuantity);
                    medicine.setLastUpdated(LocalDateTime.now());
                    
                    Medicine updatedMedicine = medicineRepository.save(medicine);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Medicine quantity updated successfully");
                    response.put("medicine", updatedMedicine);
                    
                    return ResponseEntity.ok(response);
                } else {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Invalid quantity provided");
                    
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Medicine not found");
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating medicine quantity: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Dispense medicines (reduce quantities for multiple medicines)
    @PostMapping("/dispense")
    public ResponseEntity<Map<String, Object>> dispenseMedicines(@RequestBody List<Map<String, Object>> prescribedMedicines) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            for (Map<String, Object> prescribedMed : prescribedMedicines) {
                Long medicineId = Long.valueOf(prescribedMed.get("medicineId").toString());
                Integer quantityToDispense = Integer.valueOf(prescribedMed.get("quantity").toString());
                
                Optional<Medicine> optionalMedicine = medicineRepository.findById(medicineId);
                
                if (optionalMedicine.isPresent()) {
                    Medicine medicine = optionalMedicine.get();
                    int currentQuantity = medicine.getQuantity();
                    int newQuantity = Math.max(0, currentQuantity - quantityToDispense);
                    
                    medicine.setQuantity(newQuantity);
                    medicine.setLastUpdated(LocalDateTime.now());
                    medicineRepository.save(medicine);
                }
            }
            
            response.put("success", true);
            response.put("message", "Medicines dispensed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error dispensing medicines: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Search medicines
    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> searchMedicines(@RequestParam String term) {
        try {
            List<Medicine> medicines = medicineRepository.searchMedicines(term);
            return ResponseEntity.ok(medicines);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get medicines by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Medicine>> getMedicinesByCategory(@PathVariable String category) {
        try {
            List<Medicine> medicines = medicineRepository.findByCategoryIgnoreCase(category);
            return ResponseEntity.ok(medicines);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        try {
            List<String> categories = medicineRepository.findAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get low stock medicines
    @GetMapping("/low-stock")
    public ResponseEntity<List<Medicine>> getLowStockMedicines() {
        try {
            List<Medicine> medicines = medicineRepository.findLowStockMedicines();
            return ResponseEntity.ok(medicines);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get expired medicines
    @GetMapping("/expired")
    public ResponseEntity<List<Medicine>> getExpiredMedicines() {
        try {
            LocalDate today = LocalDate.now();
            List<Medicine> medicines = medicineRepository.findExpiredMedicines(today);
            return ResponseEntity.ok(medicines);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get near expiry medicines
    @GetMapping("/near-expiry")
    public ResponseEntity<List<Medicine>> getNearExpiryMedicines() {
        try {
            LocalDate today = LocalDate.now();
            LocalDate thirtyDaysFromNow = today.plusDays(30);
            List<Medicine> medicines = medicineRepository.findNearExpiryMedicines(today, thirtyDaysFromNow);
            return ResponseEntity.ok(medicines);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Initialize default medicines (for first-time setup)
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initializeDefaultMedicines() {
        try {
            // Check if medicines already exist
            long count = medicineRepository.count();
            if (count > 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Medicines already initialized");
                return ResponseEntity.ok(response);
            }
            
            // Create default medicines
            Medicine[] defaultMedicines = {
                new Medicine("Paracetamol", 150, LocalDate.of(2025, 8, 10), "Analgesic", 20, "500mg", "PCT001", "System"),
                new Medicine("Amoxicillin", 85, LocalDate.of(2025, 12, 15), "Antibiotic", 30, "250mg", "AMX002", "System"),
                new Medicine("Aspirin", 200, LocalDate.of(2024, 6, 20), "Analgesic", 25, "75mg", "ASP003", "System"),
                new Medicine("Ibuprofen", 120, LocalDate.of(2026, 3, 10), "Anti-inflammatory", 20, "400mg", "IBU004", "System"),
                new Medicine("Ciprofloxacin", 60, LocalDate.of(2025, 9, 20), "Antibiotic", 15, "500mg", "CIP005", "System"),
                new Medicine("Omeprazole", 75, LocalDate.of(2025, 11, 30), "Antacid", 25, "20mg", "OMP006", "System"),
                new Medicine("Metformin", 90, LocalDate.of(2025, 10, 15), "Antidiabetic", 30, "500mg", "MET007", "System"),
                new Medicine("Vitamin D3", 180, LocalDate.of(2026, 1, 25), "Vitamin", 50, "1000IU", "VTD008", "System"),
                new Medicine("Loratadine", 45, LocalDate.of(2025, 7, 10), "Antihistamine", 20, "10mg", "LOR009", "System"),
                new Medicine("Amlodipine", 65, LocalDate.of(2025, 12, 5), "Antihypertensive", 25, "5mg", "AML010", "System")
            };
            
            for (Medicine medicine : defaultMedicines) {
                medicineRepository.save(medicine);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Default medicines initialized successfully");
            response.put("count", defaultMedicines.length);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error initializing medicines: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}