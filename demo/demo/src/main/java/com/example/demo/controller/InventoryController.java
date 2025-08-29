package com.example.demo.controller;

import com.example.demo.entity.InventoryAlert;
import com.example.demo.entity.PrescriptionMedicine;
import com.example.demo.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:3000")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/alerts")
    public ResponseEntity<List<InventoryAlert>> getActiveAlerts() {
        try {
            List<InventoryAlert> alerts = inventoryService.getActiveAlerts();
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/alerts/summary")
    public ResponseEntity<Map<String, Object>> getActiveAlertsSummary() {
        try {
            Map<String, Object> summary = inventoryService.getActiveAlertsSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/alerts/{alertId}/acknowledge")
    public ResponseEntity<String> acknowledgeAlert(@PathVariable Long alertId, 
                                                 @RequestBody Map<String, String> requestBody) {
        try {
            String acknowledgedBy = requestBody.get("acknowledgedBy");
            if (acknowledgedBy == null || acknowledgedBy.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("acknowledgedBy is required");
            }
            
            inventoryService.acknowledgeAlert(alertId, acknowledgedBy);
            return ResponseEntity.ok("Alert acknowledged successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to acknowledge alert: " + e.getMessage());
        }
    }

    @PostMapping("/alerts/{alertId}/resolve")
    public ResponseEntity<String> resolveAlert(@PathVariable Long alertId,
                                             @RequestBody Map<String, String> requestBody) {
        try {
            String resolvedBy = requestBody.get("resolvedBy");
            if (resolvedBy == null || resolvedBy.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("resolvedBy is required");
            }
            
            inventoryService.resolveAlertById(alertId, resolvedBy);
            return ResponseEntity.ok("Alert resolved successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to resolve alert: " + e.getMessage());
        }
    }

    @GetMapping("/medicines/attention")
    public ResponseEntity<Map<String, Object>> getMedicinesRequiringAttention() {
        try {
            Map<String, Object> medicines = inventoryService.getMedicinesRequiringAttention();
            return ResponseEntity.ok(medicines);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/check")
    public ResponseEntity<String> runInventoryCheck() {
        try {
            inventoryService.runInventoryCheck();
            return ResponseEntity.ok("Inventory check completed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to run inventory check: " + e.getMessage());
        }
    }

    @PostMapping("/check-availability")
    public ResponseEntity<Map<String, Object>> checkMedicineAvailability(@RequestBody List<PrescriptionMedicine> prescriptionMedicines) {
        try {
            if (prescriptionMedicines == null || prescriptionMedicines.isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }
            
            Map<String, Object> availability = inventoryService.checkMedicineAvailability(prescriptionMedicines);
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/update-after-dispensing")
    public ResponseEntity<String> updateInventoryAfterDispensing(@RequestBody List<PrescriptionMedicine> prescriptionMedicines) {
        try {
            if (prescriptionMedicines == null || prescriptionMedicines.isEmpty()) {
                return ResponseEntity.badRequest().body("Prescription medicines list is required");
            }
            
            inventoryService.updateInventoryAfterDispensing(prescriptionMedicines);
            return ResponseEntity.ok("Inventory updated successfully after dispensing");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update inventory: " + e.getMessage());
        }
    }

    @PostMapping("/cleanup-alerts")
    public ResponseEntity<String> cleanupOldAlerts() {
        try {
            inventoryService.cleanupOldAlerts();
            return ResponseEntity.ok("Old alerts cleaned up successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to cleanup old alerts: " + e.getMessage());
        }
    }
}