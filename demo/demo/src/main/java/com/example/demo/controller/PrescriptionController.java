package com.example.demo.controller;

import com.example.demo.dto.PrescriptionDTO;
import com.example.demo.dto.MedicineItem;
import com.example.demo.model.Medicine;
import com.example.demo.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:5173") // Match your React frontend port
public class PrescriptionController {

    @Autowired
    private MedicineRepository medicineRepository;

    @PostMapping("/complete")
    public ResponseEntity<String> completePrescription(@RequestBody PrescriptionDTO prescription) {
        for (MedicineItem item : prescription.getMedicines()) {
            Optional<Medicine> optionalMedicine = medicineRepository.findById(item.getMedicineId());

            if (optionalMedicine.isPresent()) {
                Medicine medicine = optionalMedicine.get();

                try {
                    medicine.reduceQuantity(item.getQuantity());
                    medicineRepository.save(medicine);
                } catch (IllegalArgumentException e) {
                    // Return 400 Bad Request with error message
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Error: " + e.getMessage());
                }
            } else {
                // Return 404 Not Found if medicine not found
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Medicine with ID " + item.getMedicineId() + " not found!");
            }
        }

        return ResponseEntity.ok("Prescription completed and inventory updated.");
    }
}
