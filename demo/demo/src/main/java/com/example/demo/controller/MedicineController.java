package com.example.demo.controller;

import com.example.demo.model.Medicine;
import com.example.demo.repository.MedicineRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "http://localhost:5173") // Adjust to your React app URL and port
public class MedicineController {

    private final MedicineRepository medicineRepository;

    public MedicineController(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    // Get all medicines
    @GetMapping
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    // Add new medicine with automatic status update
    @PostMapping
    public Medicine createMedicine(@RequestBody Medicine medicine) {
        medicine.setStatus(calculateStatus(medicine.getQuantity()));
        return medicineRepository.save(medicine);
    }

    // Get medicine by ID
    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable Long id) {
        Optional<Medicine> medicine = medicineRepository.findById(id);
        return medicine.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update medicine with automatic status update
    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id, @RequestBody Medicine updatedMedicine) {
        return medicineRepository.findById(id).map(medicine -> {
            medicine.setName(updatedMedicine.getName());
            medicine.setQuantity(updatedMedicine.getQuantity());
            medicine.setExpiry(updatedMedicine.getExpiry());
            medicine.setCategory(updatedMedicine.getCategory());
            // Ignore incoming status; calculate based on quantity
            medicine.setStatus(calculateStatus(updatedMedicine.getQuantity()));

            medicineRepository.save(medicine);
            return ResponseEntity.ok(medicine);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete medicine by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        if (medicineRepository.existsById(id)) {
            medicineRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Helper method: sets status based on quantity
    private String calculateStatus(int quantity) {
        if (quantity < 20) {
            return "Low Stock";
        }
        return "In Stock";
    }
}
