package com.example.demo.service;

import com.example.demo.entity.Medicine;
import com.example.demo.entity.Prescription;
import com.example.demo.entity.PrescriptionMedicine;
import com.example.demo.repository.MedicineRepository;
import com.example.demo.repository.PrescriptionRepository;
import com.example.demo.repository.PrescriptionMedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
public class AutomatedInventoryService {

    @Autowired
    private MedicineRepository medicineRepository;
    
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    
    @Autowired
    private PrescriptionMedicineRepository prescriptionMedicineRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private DatabaseTriggerService databaseTriggerService;

    /**
     * Automatically process prescription and update inventory
     * Called when doctor creates a prescription
     */
    @Async
    public CompletableFuture<Map<String, Object>> processNewPrescription(Long prescriptionId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<Prescription> optionalPrescription = prescriptionRepository.findById(prescriptionId);
            if (!optionalPrescription.isPresent()) {
                result.put("success", false);
                result.put("message", "Prescription not found");
                return CompletableFuture.completedFuture(result);
            }
            
            Prescription prescription = optionalPrescription.get();
            List<PrescriptionMedicine> prescriptionMedicines = prescriptionMedicineRepository.findByPrescriptionIdOrderByCreatedDateAsc(prescriptionId);
            
            // Check inventory availability for all medicines
            Map<String, Integer> unavailableMedicines = new HashMap<>();
            boolean canFullyFulfill = true;
            
            for (PrescriptionMedicine prescMed : prescriptionMedicines) {
                Optional<Medicine> medicineOpt = medicineRepository.findById(prescMed.getMedicineId());
                if (medicineOpt.isPresent()) {
                    Medicine medicine = medicineOpt.get();
                    int availableQuantity = medicine.getQuantity();
                    int requiredQuantity = prescMed.getQuantity();
                    
                    if (availableQuantity < requiredQuantity) {
                        unavailableMedicines.put(medicine.getName(), availableQuantity);
                        canFullyFulfill = false;
                    }
                    
                    // Check if this will trigger low stock alert
                    if ((availableQuantity - requiredQuantity) <= medicine.getMinStock()) {
                        notificationService.triggerLowStockAlert(medicine, availableQuantity - requiredQuantity);
                    }
                }
            }
            
            // Update prescription status based on availability
            if (canFullyFulfill) {
                prescription.setStatus("Ready for Dispensing");
                prescription.setInventoryStatus("Available");
            } else {
                prescription.setStatus("Pending - Insufficient Stock");
                prescription.setInventoryStatus("Partial/Unavailable");
                
                // Trigger stock shortage notification
                notificationService.triggerStockShortageAlert(prescription, unavailableMedicines);
            }
            
            // Reserve medicines (optional feature for high-priority prescriptions)
            if (canFullyFulfill) {
                reserveMedicinesForPrescription(prescriptionId);
            }
            
            prescriptionRepository.save(prescription);
            
            result.put("success", true);
            result.put("canFullyFulfill", canFullyFulfill);
            result.put("unavailableMedicines", unavailableMedicines);
            result.put("prescription", prescription);
            
            return CompletableFuture.completedFuture(result);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error processing prescription: " + e.getMessage());
            return CompletableFuture.completedFuture(result);
        }
    }

    /**
     * Automatically dispense medicines and update inventory
     * Called when pharmacist dispenses prescription
     */
    @Transactional
    public Map<String, Object> autoDispensePrescription(Long prescriptionId, String dispensedBy) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<Prescription> optionalPrescription = prescriptionRepository.findById(prescriptionId);
            if (!optionalPrescription.isPresent()) {
                result.put("success", false);
                result.put("message", "Prescription not found");
                return result;
            }
            
            Prescription prescription = optionalPrescription.get();
            List<PrescriptionMedicine> prescriptionMedicines = prescriptionMedicineRepository.findByPrescriptionIdOrderByCreatedDateAsc(prescriptionId);
            
            Map<String, Object> dispensingResults = new HashMap<>();
            boolean fullyDispensed = true;
            
            for (PrescriptionMedicine prescMed : prescriptionMedicines) {
                Map<String, Object> medicineResult = autoDispenseMedicine(prescMed, dispensedBy);
                dispensingResults.put(prescMed.getMedicineName(), medicineResult);
                
                if (!(Boolean) medicineResult.get("success")) {
                    fullyDispensed = false;
                }
            }
            
            // Update prescription status
            prescription.setDispensedBy(dispensedBy);
            prescription.setDispensedDate(LocalDateTime.now());
            
            if (fullyDispensed) {
                prescription.setStatus("Completed");
                prescription.setInventoryStatus("Dispensed");
            } else {
                prescription.setStatus("Partially Dispensed");
                prescription.setInventoryStatus("Partial");
            }
            
            prescriptionRepository.save(prescription);
            
            // Trigger post-dispensing analytics update
            updateInventoryAnalytics();
            
            result.put("success", true);
            result.put("fullyDispensed", fullyDispensed);
            result.put("dispensingResults", dispensingResults);
            result.put("prescription", prescription);
            
            return result;
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error auto-dispensing prescription: " + e.getMessage());
            return result;
        }
    }

    /**
     * Auto-dispense individual medicine and update inventory
     */
    private Map<String, Object> autoDispenseMedicine(PrescriptionMedicine prescMed, String dispensedBy) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<Medicine> medicineOpt = medicineRepository.findById(prescMed.getMedicineId());
            if (!medicineOpt.isPresent()) {
                result.put("success", false);
                result.put("message", "Medicine not found in inventory");
                return result;
            }
            
            Medicine medicine = medicineOpt.get();
            int currentStock = medicine.getQuantity();
            int requestedQuantity = prescMed.getQuantity();
            
            // Calculate actual dispensed quantity
            int dispensedQuantity = Math.min(currentStock, requestedQuantity);
            
            // Update inventory
            medicine.setQuantity(currentStock - dispensedQuantity);
            medicine.setLastUpdated(LocalDateTime.now());
            medicineRepository.save(medicine);
            
            // Update prescription medicine record
            prescMed.setDispensedQuantity(dispensedQuantity);
            prescMed.setDispensedBy(dispensedBy);
            prescMed.setDispensedDate(LocalDateTime.now());
            prescMed.setStatus(dispensedQuantity >= requestedQuantity ? "Dispensed" : "Partially Dispensed");
            prescriptionMedicineRepository.save(prescMed);
            
            // Log inventory transaction
            logInventoryTransaction(medicine, dispensedQuantity, "DISPENSED", prescMed.getPrescription().getId());
            
            // Check for low stock alert
            if (medicine.getQuantity() <= medicine.getMinStock()) {
                notificationService.triggerLowStockAlert(medicine, medicine.getQuantity());
            }
            
            result.put("success", true);
            result.put("requestedQuantity", requestedQuantity);
            result.put("dispensedQuantity", dispensedQuantity);
            result.put("remainingStock", medicine.getQuantity());
            result.put("fullyDispensed", dispensedQuantity >= requestedQuantity);
            
            return result;
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error dispensing medicine: " + e.getMessage());
            return result;
        }
    }

    /**
     * Reserve medicines for high-priority prescriptions
     */
    private void reserveMedicinesForPrescription(Long prescriptionId) {
        try {
            List<PrescriptionMedicine> prescriptionMedicines = prescriptionMedicineRepository.findByPrescriptionIdOrderByCreatedDateAsc(prescriptionId);
            
            for (PrescriptionMedicine prescMed : prescriptionMedicines) {
                Optional<Medicine> medicineOpt = medicineRepository.findById(prescMed.getMedicineId());
                if (medicineOpt.isPresent()) {
                    Medicine medicine = medicineOpt.get();
                    
                    // Mark as reserved (you might want to add a reserved_quantity field to Medicine entity)
                    prescMed.setStatus("Reserved");
                    prescriptionMedicineRepository.save(prescMed);
                    
                    logInventoryTransaction(medicine, prescMed.getQuantity(), "RESERVED", prescriptionId);
                }
            }
        } catch (Exception e) {
            System.err.println("Error reserving medicines: " + e.getMessage());
        }
    }

    /**
     * Scheduled task to monitor inventory and trigger alerts
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void monitorInventoryLevels() {
        try {
            // Run database-level monitoring first
            databaseTriggerService.runInventoryMonitoring();
            
            // Check for low stock medicines
            List<Medicine> lowStockMedicines = medicineRepository.findLowStockMedicines();
            for (Medicine medicine : lowStockMedicines) {
                notificationService.triggerLowStockAlert(medicine, medicine.getQuantity());
            }
            
            // Check for expired medicines
            LocalDate today = LocalDate.now();
            List<Medicine> expiredMedicines = medicineRepository.findExpiredMedicines(today);
            for (Medicine medicine : expiredMedicines) {
                notificationService.triggerExpiryAlert(medicine, "EXPIRED");
            }
            
            // Check for near-expiry medicines (30 days)
            LocalDate thirtyDaysFromNow = today.plusDays(30);
            List<Medicine> nearExpiryMedicines = medicineRepository.findNearExpiryMedicines(today, thirtyDaysFromNow);
            for (Medicine medicine : nearExpiryMedicines) {
                notificationService.triggerExpiryAlert(medicine, "NEAR_EXPIRY");
            }
            
            // Update inventory analytics
            updateInventoryAnalytics();
            
        } catch (Exception e) {
            System.err.println("Error in scheduled inventory monitoring: " + e.getMessage());
        }
    }

    /**
     * Scheduled task to process pending prescriptions
     * Runs every 30 minutes
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes
    public void processPendingPrescriptions() {
        try {
            List<Prescription> pendingPrescriptions = prescriptionRepository.findByStatus("Pending - Insufficient Stock");
            
            for (Prescription prescription : pendingPrescriptions) {
                // Re-check availability
                processNewPrescription(prescription.getId());
            }
            
        } catch (Exception e) {
            System.err.println("Error processing pending prescriptions: " + e.getMessage());
        }
    }

    /**
     * Automatic reorder when stock falls below threshold
     */
    @Async
    public CompletableFuture<Void> autoReorderMedicine(Medicine medicine) {
        try {
            if (medicine.getQuantity() <= (medicine.getMinStock() / 2)) {
                // Calculate suggested reorder quantity
                int suggestedQuantity = medicine.getMinStock() * 3; // 3x minimum stock
                
                // Create reorder notification/request
                notificationService.triggerReorderAlert(medicine, suggestedQuantity);
                
                // Log reorder requirement
                logInventoryTransaction(medicine, suggestedQuantity, "REORDER_REQUIRED", null);
            }
        } catch (Exception e) {
            System.err.println("Error in auto-reorder: " + e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Update inventory analytics and statistics
     */
    private void updateInventoryAnalytics() {
        try {
            // This would update analytics tables or trigger reports
            // For now, we'll just log the analytics update
            System.out.println("Inventory analytics updated at: " + LocalDateTime.now());
            
            // You can add code here to:
            // - Update inventory turnover rates
            // - Calculate average consumption patterns
            // - Generate predictive analytics for reordering
            // - Update dashboard statistics
            
        } catch (Exception e) {
            System.err.println("Error updating inventory analytics: " + e.getMessage());
        }
    }

    /**
     * Log inventory transactions for audit trail
     */
    private void logInventoryTransaction(Medicine medicine, int quantity, String transactionType, Long relatedRecordId) {
        try {
            // Here you would save to an inventory_transactions table
            // For now, we'll just log to console
            System.out.println(String.format(
                "INVENTORY TRANSACTION: Medicine=%s, Quantity=%d, Type=%s, RelatedId=%s, Timestamp=%s",
                medicine.getName(), quantity, transactionType, relatedRecordId, LocalDateTime.now()
            ));
            
            // In a full implementation, you would save this to a database table like:
            /*
            InventoryTransaction transaction = new InventoryTransaction();
            transaction.setMedicineId(medicine.getId());
            transaction.setQuantity(quantity);
            transaction.setTransactionType(transactionType);
            transaction.setRelatedRecordId(relatedRecordId);
            transaction.setTimestamp(LocalDateTime.now());
            inventoryTransactionRepository.save(transaction);
            */
            
        } catch (Exception e) {
            System.err.println("Error logging inventory transaction: " + e.getMessage());
        }
    }

    /**
     * Get real-time inventory status for dashboard
     */
    public Map<String, Object> getInventoryStatus() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            // First try to get data from database triggers/procedures
            Map<String, Object> dbStatus = databaseTriggerService.getInventoryDashboardData();
            if (dbStatus.containsKey("success") && (Boolean) dbStatus.get("success")) {
                return dbStatus;
            }
            
            // Fallback to application-level data gathering
            // Total medicines count
            long totalMedicines = medicineRepository.count();
            status.put("totalMedicines", totalMedicines);
            
            // Low stock count
            List<Medicine> lowStockMedicines = medicineRepository.findLowStockMedicines();
            status.put("lowStockCount", lowStockMedicines.size());
            
            // Expired medicines count
            LocalDate today = LocalDate.now();
            List<Medicine> expiredMedicines = medicineRepository.findExpiredMedicines(today);
            status.put("expiredCount", expiredMedicines.size());
            
            // Near expiry count
            LocalDate thirtyDaysFromNow = today.plusDays(30);
            List<Medicine> nearExpiryMedicines = medicineRepository.findNearExpiryMedicines(today, thirtyDaysFromNow);
            status.put("nearExpiryCount", nearExpiryMedicines.size());
            
            // Total inventory value (sum of quantities)
            Object[] inventoryStats = medicineRepository.getInventoryStats();
            status.put("totalQuantity", inventoryStats[1]);
            
            // Pending prescriptions
            List<Prescription> pendingPrescriptions = prescriptionRepository.findPendingPrescriptions();
            status.put("pendingPrescriptions", pendingPrescriptions.size());
            
            status.put("lastUpdated", LocalDateTime.now());
            status.put("success", true);
            
        } catch (Exception e) {
            status.put("success", false);
            status.put("error", "Error getting inventory status: " + e.getMessage());
        }
        
        return status;
    }
}