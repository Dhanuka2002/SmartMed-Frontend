package com.example.demo.service;

import com.example.demo.entity.InventoryAlert;
import com.example.demo.entity.Medicine;
import com.example.demo.entity.PrescriptionMedicine;
import com.example.demo.repository.InventoryAlertRepository;
import com.example.demo.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class InventoryService {
    
    @Autowired
    private MedicineRepository medicineRepository;
    
    @Autowired
    private InventoryAlertRepository alertRepository;
    
    // Check and update inventory after medicine dispensing
    public void updateInventoryAfterDispensing(List<PrescriptionMedicine> prescriptionMedicines) {
        for (PrescriptionMedicine prescriptionMedicine : prescriptionMedicines) {
            if (prescriptionMedicine.getMedicineId() != null) {
                Optional<Medicine> medicineOpt = medicineRepository.findById(prescriptionMedicine.getMedicineId());
                if (medicineOpt.isPresent()) {
                    Medicine medicine = medicineOpt.get();
                    
                    // Update quantity
                    int newQuantity = medicine.getQuantity() - prescriptionMedicine.getQuantity();
                    medicine.setQuantity(Math.max(0, newQuantity)); // Don't go below 0
                    medicine.setLastUpdated(LocalDateTime.now());
                    
                    medicineRepository.save(medicine);
                    
                    // Check for alerts after inventory update
                    checkAndCreateAlerts(medicine);
                    
                    // Update prescription medicine status based on availability
                    if (newQuantity <= 0) {
                        prescriptionMedicine.setStatus("Out of Stock");
                    } else if (newQuantity < prescriptionMedicine.getQuantity()) {
                        prescriptionMedicine.setStatus("Partially Dispensed");
                        prescriptionMedicine.setDispensedQuantity(newQuantity);
                    } else {
                        prescriptionMedicine.setStatus("Dispensed");
                        prescriptionMedicine.setDispensedQuantity(prescriptionMedicine.getQuantity());
                    }
                }
            }
        }
    }
    
    // Check and create alerts for a specific medicine
    public void checkAndCreateAlerts(Medicine medicine) {
        // Check for low stock alert
        if (medicine.isLowStock()) {
            createOrUpdateAlert(medicine, "LOW_STOCK", 
                "Low stock alert: " + medicine.getName() + " has only " + medicine.getQuantity() + " units left (minimum: " + medicine.getMinStock() + ")",
                determineLowStockSeverity(medicine));
        } else {
            // Resolve existing low stock alert if stock is now adequate
            resolveAlert(medicine.getId(), "LOW_STOCK");
        }
        
        // Check for out of stock alert
        if (medicine.getQuantity() <= 0) {
            createOrUpdateAlert(medicine, "OUT_OF_STOCK", 
                "OUT OF STOCK: " + medicine.getName() + " is completely out of stock",
                "CRITICAL");
        } else {
            // Resolve existing out of stock alert if stock is now available
            resolveAlert(medicine.getId(), "OUT_OF_STOCK");
        }
        
        // Check for expired medicines alert
        if (medicine.isExpired()) {
            createOrUpdateAlert(medicine, "EXPIRED", 
                "EXPIRED: " + medicine.getName() + " expired on " + medicine.getExpiry(),
                "CRITICAL");
        }
        
        // Check for near expiry alert
        if (medicine.isNearExpiry()) {
            createOrUpdateAlert(medicine, "NEAR_EXPIRY", 
                "Near expiry: " + medicine.getName() + " expires on " + medicine.getExpiry(),
                determineExpiryAlertSeverity(medicine.getExpiry()));
        } else {
            // Resolve near expiry alert if medicine is no longer near expiry
            resolveAlert(medicine.getId(), "NEAR_EXPIRY");
        }
    }
    
    // Run comprehensive inventory check for all medicines
    public void runInventoryCheck() {
        List<Medicine> allMedicines = medicineRepository.findAll();
        for (Medicine medicine : allMedicines) {
            checkAndCreateAlerts(medicine);
        }
    }
    
    // Create or update an alert
    private void createOrUpdateAlert(Medicine medicine, String alertType, String message, String severity) {
        Optional<InventoryAlert> existingAlert = alertRepository.findByMedicineIdAndAlertTypeAndStatus(
            medicine.getId(), alertType, "ACTIVE");
        
        if (existingAlert.isPresent()) {
            // Update existing alert
            InventoryAlert alert = existingAlert.get();
            alert.setAlertMessage(message);
            alert.setSeverity(severity);
            alert.setCurrentQuantity(medicine.getQuantity());
            alert.setMinStock(medicine.getMinStock());
            alert.setExpiryDate(medicine.getExpiry());
            alert.setCreatedDate(LocalDateTime.now()); // Update timestamp
            alertRepository.save(alert);
        } else {
            // Create new alert
            InventoryAlert alert = new InventoryAlert(alertType, medicine.getId(), 
                medicine.getName(), message, severity);
            alert.setCurrentQuantity(medicine.getQuantity());
            alert.setMinStock(medicine.getMinStock());
            alert.setExpiryDate(medicine.getExpiry());
            alertRepository.save(alert);
        }
    }
    
    // Resolve an alert
    private void resolveAlert(Long medicineId, String alertType) {
        Optional<InventoryAlert> existingAlert = alertRepository.findByMedicineIdAndAlertTypeAndStatus(
            medicineId, alertType, "ACTIVE");
        
        if (existingAlert.isPresent()) {
            InventoryAlert alert = existingAlert.get();
            alert.setStatus("RESOLVED");
            alert.setResolvedDate(LocalDateTime.now());
            alert.setResolvedBy("System");
            alertRepository.save(alert);
        }
    }
    
    // Determine low stock alert severity
    private String determineLowStockSeverity(Medicine medicine) {
        int quantity = medicine.getQuantity();
        int minStock = medicine.getMinStock();
        
        if (quantity <= 0) {
            return "CRITICAL";
        } else if (quantity <= minStock / 2) {
            return "HIGH";
        } else if (quantity <= minStock * 0.75) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
    
    // Determine expiry alert severity based on days until expiry
    private String determineExpiryAlertSeverity(LocalDate expiryDate) {
        long daysUntilExpiry = LocalDate.now().until(expiryDate).getDays();
        
        if (daysUntilExpiry <= 7) {
            return "HIGH";
        } else if (daysUntilExpiry <= 15) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
    
    // Get active alerts summary
    public Map<String, Object> getActiveAlertsSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        // Count by type
        summary.put("lowStock", alertRepository.countActiveAlertsByType("LOW_STOCK"));
        summary.put("outOfStock", alertRepository.countActiveAlertsByType("OUT_OF_STOCK"));
        summary.put("expired", alertRepository.countActiveAlertsByType("EXPIRED"));
        summary.put("nearExpiry", alertRepository.countActiveAlertsByType("NEAR_EXPIRY"));
        
        // Count by severity
        summary.put("critical", alertRepository.countActiveAlertsBySeverity("CRITICAL"));
        summary.put("high", alertRepository.countActiveAlertsBySeverity("HIGH"));
        summary.put("medium", alertRepository.countActiveAlertsBySeverity("MEDIUM"));
        summary.put("low", alertRepository.countActiveAlertsBySeverity("LOW"));
        
        // Recent critical alerts
        summary.put("criticalAlerts", alertRepository.findCriticalAndHighSeverityActiveAlerts());
        
        return summary;
    }
    
    // Get all active alerts
    public List<InventoryAlert> getActiveAlerts() {
        return alertRepository.findActiveAlertsOrderedBySeverity();
    }
    
    // Acknowledge an alert
    public void acknowledgeAlert(Long alertId, String acknowledgedBy) {
        Optional<InventoryAlert> alertOpt = alertRepository.findById(alertId);
        if (alertOpt.isPresent()) {
            InventoryAlert alert = alertOpt.get();
            alert.setStatus("ACKNOWLEDGED");
            alert.setAcknowledgedBy(acknowledgedBy);
            alertRepository.save(alert);
        }
    }
    
    // Resolve an alert manually
    public void resolveAlertById(Long alertId, String resolvedBy) {
        Optional<InventoryAlert> alertOpt = alertRepository.findById(alertId);
        if (alertOpt.isPresent()) {
            InventoryAlert alert = alertOpt.get();
            alert.setStatus("RESOLVED");
            alert.setResolvedBy(resolvedBy);
            alertRepository.save(alert);
        }
    }
    
    // Get medicines requiring attention (low stock, expired, near expiry)
    public Map<String, Object> getMedicinesRequiringAttention() {
        List<Medicine> allMedicines = medicineRepository.findAll();
        
        List<Medicine> lowStockMedicines = new ArrayList<>();
        List<Medicine> expiredMedicines = new ArrayList<>();
        List<Medicine> nearExpiryMedicines = new ArrayList<>();
        List<Medicine> outOfStockMedicines = new ArrayList<>();
        
        for (Medicine medicine : allMedicines) {
            if (medicine.getQuantity() <= 0) {
                outOfStockMedicines.add(medicine);
            } else if (medicine.isLowStock()) {
                lowStockMedicines.add(medicine);
            }
            
            if (medicine.isExpired()) {
                expiredMedicines.add(medicine);
            } else if (medicine.isNearExpiry()) {
                nearExpiryMedicines.add(medicine);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("lowStock", lowStockMedicines);
        result.put("expired", expiredMedicines);
        result.put("nearExpiry", nearExpiryMedicines);
        result.put("outOfStock", outOfStockMedicines);
        
        return result;
    }
    
    // Check medicine availability for prescription
    public Map<String, Object> checkMedicineAvailability(List<PrescriptionMedicine> prescriptionMedicines) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> availabilityList = new ArrayList<>();
        boolean allAvailable = true;
        
        for (PrescriptionMedicine prescriptionMedicine : prescriptionMedicines) {
            Map<String, Object> availability = new HashMap<>();
            availability.put("medicineName", prescriptionMedicine.getMedicineName());
            availability.put("requestedQuantity", prescriptionMedicine.getQuantity());
            
            if (prescriptionMedicine.getMedicineId() != null) {
                Optional<Medicine> medicineOpt = medicineRepository.findById(prescriptionMedicine.getMedicineId());
                if (medicineOpt.isPresent()) {
                    Medicine medicine = medicineOpt.get();
                    availability.put("availableQuantity", medicine.getQuantity());
                    availability.put("isAvailable", medicine.getQuantity() >= prescriptionMedicine.getQuantity());
                    availability.put("isLowStock", medicine.isLowStock());
                    availability.put("isExpired", medicine.isExpired());
                    
                    if (medicine.getQuantity() < prescriptionMedicine.getQuantity()) {
                        allAvailable = false;
                    }
                } else {
                    availability.put("availableQuantity", 0);
                    availability.put("isAvailable", false);
                    availability.put("error", "Medicine not found in inventory");
                    allAvailable = false;
                }
            } else {
                availability.put("availableQuantity", 0);
                availability.put("isAvailable", false);
                availability.put("error", "Medicine not linked to inventory");
                allAvailable = false;
            }
            
            availabilityList.add(availability);
        }
        
        result.put("medicines", availabilityList);
        result.put("allAvailable", allAvailable);
        
        return result;
    }
    
    // Clean up old resolved alerts (older than 30 days)
    public void cleanupOldAlerts() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        alertRepository.deleteByStatusAndResolvedDateBefore("RESOLVED", cutoffDate);
    }
}