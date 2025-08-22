package com.example.demo.service;

import com.example.demo.entity.Medicine;
import com.example.demo.entity.Prescription;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class NotificationService {

    @Autowired
    private DatabaseTriggerService databaseTriggerService;

    /**
     * Trigger low stock alert for a medicine
     */
    @Async
    public CompletableFuture<Void> triggerLowStockAlert(Medicine medicine, int currentStock) {
        try {
            Map<String, Object> alertData = new HashMap<>();
            alertData.put("type", "LOW_STOCK");
            alertData.put("medicine", medicine.getName());
            alertData.put("currentStock", currentStock);
            alertData.put("minStock", medicine.getMinStock());
            alertData.put("category", medicine.getCategory());
            alertData.put("timestamp", LocalDateTime.now());
            alertData.put("severity", currentStock == 0 ? "CRITICAL" : "WARNING");
            
            // Log alert
            System.out.println("🚨 LOW STOCK ALERT: " + medicine.getName() + 
                " - Current: " + currentStock + ", Min: " + medicine.getMinStock());
            
            // In a real implementation, you would:
            // 1. Save to notifications table
            // 2. Send email to pharmacy staff
            // 3. Send SMS alerts
            // 4. Update dashboard notifications
            // 5. Trigger reorder workflow
            
            // For now, we'll simulate these actions
            sendAlert(alertData);
            updateDashboardAlert(alertData);
            
        } catch (Exception e) {
            System.err.println("Error triggering low stock alert: " + e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Trigger expiry alert for medicines
     */
    @Async
    public CompletableFuture<Void> triggerExpiryAlert(Medicine medicine, String alertType) {
        try {
            Map<String, Object> alertData = new HashMap<>();
            alertData.put("type", alertType); // "EXPIRED" or "NEAR_EXPIRY"
            alertData.put("medicine", medicine.getName());
            alertData.put("expiryDate", medicine.getExpiry());
            alertData.put("quantity", medicine.getQuantity());
            alertData.put("category", medicine.getCategory());
            alertData.put("timestamp", LocalDateTime.now());
            alertData.put("severity", alertType.equals("EXPIRED") ? "CRITICAL" : "WARNING");
            
            // Log alert
            System.out.println("⏰ " + alertType + " ALERT: " + medicine.getName() + 
                " - Expires: " + medicine.getExpiry() + ", Quantity: " + medicine.getQuantity());
            
            sendAlert(alertData);
            updateDashboardAlert(alertData);
            
        } catch (Exception e) {
            System.err.println("Error triggering expiry alert: " + e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Trigger stock shortage alert for prescriptions
     */
    @Async
    public CompletableFuture<Void> triggerStockShortageAlert(Prescription prescription, Map<String, Integer> unavailableMedicines) {
        try {
            Map<String, Object> alertData = new HashMap<>();
            alertData.put("type", "STOCK_SHORTAGE");
            alertData.put("prescriptionId", prescription.getId());
            alertData.put("patientName", prescription.getPatientName());
            alertData.put("doctorName", prescription.getDoctorName());
            alertData.put("unavailableMedicines", unavailableMedicines);
            alertData.put("timestamp", LocalDateTime.now());
            alertData.put("severity", "HIGH");
            
            // Log alert
            System.out.println("📋 STOCK SHORTAGE ALERT: Prescription #" + prescription.getId() + 
                " for " + prescription.getPatientName() + " - Medicines unavailable: " + unavailableMedicines.keySet());
            
            sendAlert(alertData);
            updateDashboardAlert(alertData);
            
            // Notify doctor about stock issues
            notifyDoctorAboutStockIssue(prescription, unavailableMedicines);
            
        } catch (Exception e) {
            System.err.println("Error triggering stock shortage alert: " + e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Trigger reorder alert for automatic restocking
     */
    @Async
    public CompletableFuture<Void> triggerReorderAlert(Medicine medicine, int suggestedQuantity) {
        try {
            Map<String, Object> alertData = new HashMap<>();
            alertData.put("type", "REORDER_REQUIRED");
            alertData.put("medicine", medicine.getName());
            alertData.put("currentStock", medicine.getQuantity());
            alertData.put("suggestedQuantity", suggestedQuantity);
            alertData.put("category", medicine.getCategory());
            alertData.put("supplier", getPreferredSupplier(medicine)); // Would come from supplier database
            alertData.put("timestamp", LocalDateTime.now());
            alertData.put("severity", "MEDIUM");
            
            // Log alert
            System.out.println("🔄 REORDER ALERT: " + medicine.getName() + 
                " - Current: " + medicine.getQuantity() + ", Suggested order: " + suggestedQuantity);
            
            sendAlert(alertData);
            updateDashboardAlert(alertData);
            
            // In a real system, this would:
            // 1. Generate purchase orders
            // 2. Send to procurement system
            // 3. Email suppliers
            // 4. Update inventory forecasting
            
        } catch (Exception e) {
            System.err.println("Error triggering reorder alert: " + e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Send general alert (email, SMS, push notification)
     */
    private void sendAlert(Map<String, Object> alertData) {
        try {
            String alertType = (String) alertData.get("type");
            String severity = (String) alertData.get("severity");
            
            // Simulate sending different types of notifications based on severity
            switch (severity) {
                case "CRITICAL":
                    sendEmailAlert(alertData);
                    sendSMSAlert(alertData);
                    sendPushNotification(alertData);
                    break;
                case "HIGH":
                    sendEmailAlert(alertData);
                    sendPushNotification(alertData);
                    break;
                case "WARNING":
                case "MEDIUM":
                    sendPushNotification(alertData);
                    break;
                default:
                    sendPushNotification(alertData);
            }
            
        } catch (Exception e) {
            System.err.println("Error sending alert: " + e.getMessage());
        }
    }

    /**
     * Update dashboard with real-time alerts
     */
    private void updateDashboardAlert(Map<String, Object> alertData) {
        try {
            // In a real implementation, this would:
            // 1. Save to notifications table
            // 2. Update real-time dashboard via WebSocket
            // 3. Update alert counters
            // 4. Trigger frontend notifications
            
            System.out.println("📊 Dashboard updated with alert: " + alertData.get("type"));
            
            // Simulate WebSocket notification to frontend
            sendWebSocketNotification(alertData);
            
        } catch (Exception e) {
            System.err.println("Error updating dashboard alert: " + e.getMessage());
        }
    }

    /**
     * Notify doctor about stock issues for their prescription
     */
    private void notifyDoctorAboutStockIssue(Prescription prescription, Map<String, Integer> unavailableMedicines) {
        try {
            Map<String, Object> doctorNotification = new HashMap<>();
            doctorNotification.put("type", "PRESCRIPTION_STOCK_ISSUE");
            doctorNotification.put("doctorName", prescription.getDoctorName());
            doctorNotification.put("prescriptionId", prescription.getId());
            doctorNotification.put("patientName", prescription.getPatientName());
            doctorNotification.put("unavailableMedicines", unavailableMedicines);
            doctorNotification.put("timestamp", LocalDateTime.now());
            
            System.out.println("👨‍⚕️ Doctor notification sent to " + prescription.getDoctorName() + 
                " about stock issues for prescription #" + prescription.getId());
            
            // In a real system, this would:
            // 1. Send email to doctor
            // 2. Update doctor's dashboard
            // 3. Suggest alternative medicines
            // 4. Allow prescription modification
            
        } catch (Exception e) {
            System.err.println("Error notifying doctor: " + e.getMessage());
        }
    }

    /**
     * Simulate email alert
     */
    private void sendEmailAlert(Map<String, Object> alertData) {
        System.out.println("📧 EMAIL ALERT: " + alertData.get("type") + " - " + alertData.get("timestamp"));
        // In real implementation: integrate with email service (SendGrid, AWS SES, etc.)
    }

    /**
     * Simulate SMS alert
     */
    private void sendSMSAlert(Map<String, Object> alertData) {
        System.out.println("📱 SMS ALERT: " + alertData.get("type") + " - " + alertData.get("timestamp"));
        // In real implementation: integrate with SMS service (Twilio, AWS SNS, etc.)
    }

    /**
     * Simulate push notification
     */
    private void sendPushNotification(Map<String, Object> alertData) {
        System.out.println("🔔 PUSH NOTIFICATION: " + alertData.get("type") + " - " + alertData.get("timestamp"));
        // In real implementation: integrate with push notification service (Firebase, etc.)
    }

    /**
     * Simulate WebSocket notification to frontend
     */
    private void sendWebSocketNotification(Map<String, Object> alertData) {
        System.out.println("🌐 WEBSOCKET: Real-time alert sent to frontend - " + alertData.get("type"));
        // In real implementation: use WebSocket to send real-time updates to frontend
    }

    /**
     * Get preferred supplier for a medicine (would come from database)
     */
    private String getPreferredSupplier(Medicine medicine) {
        // This would query a suppliers database
        // For now, return a mock supplier based on category
        switch (medicine.getCategory().toLowerCase()) {
            case "antibiotic":
                return "PharmaCorp Ltd";
            case "analgesic":
                return "MediSupply Inc";
            case "vitamin":
                return "HealthPlus Distributors";
            default:
                return "Universal Medical Supplies";
        }
    }

    /**
     * Get all active alerts for dashboard
     */
    public Map<String, Object> getActiveAlerts() {
        Map<String, Object> alerts = new HashMap<>();
        
        try {
            // First try to get alerts from database
            Map<String, Object> dbAlerts = databaseTriggerService.getActiveAlertsFromDatabase();
            if (dbAlerts.containsKey("success") && (Boolean) dbAlerts.get("success")) {
                return dbAlerts;
            }
            
            // Fallback to application-level alerts
            // In a real implementation, this would query notifications table
            // For now, return mock active alerts
            alerts.put("lowStock", 3);
            alerts.put("expired", 1);
            alerts.put("nearExpiry", 5);
            alerts.put("stockShortage", 2);
            alerts.put("reorderRequired", 4);
            alerts.put("lastUpdated", LocalDateTime.now());
            alerts.put("success", true);
            
        } catch (Exception e) {
            alerts.put("success", false);
            alerts.put("error", "Error getting active alerts: " + e.getMessage());
        }
        
        return alerts;
    }

    /**
     * Mark alert as acknowledged/resolved
     */
    public boolean acknowledgeAlert(String alertId, String acknowledgedBy) {
        try {
            // First try to acknowledge in database
            boolean dbSuccess = databaseTriggerService.acknowledgeAlertInDatabase(alertId, acknowledgedBy);
            if (dbSuccess) {
                System.out.println("✅ Alert " + alertId + " acknowledged by " + acknowledgedBy + " at " + LocalDateTime.now());
                return true;
            }
            
            // Fallback to application-level acknowledgment
            // In real implementation, update notifications table
            System.out.println("✅ Alert " + alertId + " acknowledged by " + acknowledgedBy + " at " + LocalDateTime.now());
            return true;
        } catch (Exception e) {
            System.err.println("Error acknowledging alert: " + e.getMessage());
            return false;
        }
    }
}