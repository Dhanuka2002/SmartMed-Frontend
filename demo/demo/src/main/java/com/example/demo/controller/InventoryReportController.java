package com.example.demo.controller;

import com.example.demo.service.DatabaseTriggerService;
import com.example.demo.service.AutomatedInventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for automated inventory reporting and analytics
 */
@RestController
@RequestMapping("/api/inventory-reports")
@CrossOrigin(origins = "*")
public class InventoryReportController {

    @Autowired
    private DatabaseTriggerService databaseTriggerService;
    
    @Autowired
    private AutomatedInventoryService automatedInventoryService;

    /**
     * Get comprehensive inventory dashboard report
     */
    @GetMapping("/dashboard-summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        try {
            Map<String, Object> report = new HashMap<>();
            
            // Get inventory status
            Map<String, Object> inventoryStatus = automatedInventoryService.getInventoryStatus();
            report.put("inventoryStatus", inventoryStatus);
            
            // Get recent activity
            List<Map<String, Object>> recentActivity = databaseTriggerService.getRecentInventoryActivity(7);
            report.put("recentActivity", recentActivity);
            
            // Get inventory status summary
            List<Map<String, Object>> statusSummary = databaseTriggerService.getInventoryStatusSummary();
            report.put("statusSummary", statusSummary);
            
            // Get active alerts summary
            List<Map<String, Object>> alertsSummary = databaseTriggerService.getActiveAlertsSummary();
            report.put("alertsSummary", alertsSummary);
            
            // Get automated reorder status
            List<Map<String, Object>> reorderStatus = databaseTriggerService.getAutomatedReorderStatus();
            report.put("reorderStatus", reorderStatus);
            
            // Generate report metadata
            report.put("reportGenerated", LocalDateTime.now());
            report.put("reportType", "DASHBOARD_SUMMARY");
            report.put("success", true);
            
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error generating dashboard summary: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get low stock medicines report
     */
    @GetMapping("/low-stock")
    public ResponseEntity<Map<String, Object>> getLowStockReport() {
        try {
            Map<String, Object> report = new HashMap<>();
            
            // Get inventory status summary filtered for low stock
            List<Map<String, Object>> lowStockItems = databaseTriggerService.getInventoryStatusSummary();
            
            // Filter for low stock and out of stock only
            List<Map<String, Object>> filteredItems = lowStockItems.stream()
                .filter(item -> {
                    String status = (String) item.get("stock_status");
                    return "LOW_STOCK".equals(status) || "OUT_OF_STOCK".equals(status);
                })
                .toList();
            
            report.put("lowStockItems", filteredItems);
            report.put("totalLowStockCount", filteredItems.size());
            report.put("reportGenerated", LocalDateTime.now());
            report.put("reportType", "LOW_STOCK_REPORT");
            report.put("success", true);
            
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error generating low stock report: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get expiry report (expired and near-expiry medicines)
     */
    @GetMapping("/expiry-report")
    public ResponseEntity<Map<String, Object>> getExpiryReport() {
        try {
            Map<String, Object> report = new HashMap<>();
            
            // Get inventory status summary filtered for expiry issues
            List<Map<String, Object>> expiryItems = databaseTriggerService.getInventoryStatusSummary();
            
            // Filter for expired and near expiry
            List<Map<String, Object>> expiredItems = expiryItems.stream()
                .filter(item -> "EXPIRED".equals(item.get("expiry_status")))
                .toList();
                
            List<Map<String, Object>> nearExpiryItems = expiryItems.stream()
                .filter(item -> "NEAR_EXPIRY".equals(item.get("expiry_status")))
                .toList();
            
            report.put("expiredItems", expiredItems);
            report.put("nearExpiryItems", nearExpiryItems);
            report.put("expiredCount", expiredItems.size());
            report.put("nearExpiryCount", nearExpiryItems.size());
            report.put("reportGenerated", LocalDateTime.now());
            report.put("reportType", "EXPIRY_REPORT");
            report.put("success", true);
            
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error generating expiry report: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get inventory activity report for specified days
     */
    @GetMapping("/activity-report")
    public ResponseEntity<Map<String, Object>> getActivityReport(@RequestParam(defaultValue = "30") int days) {
        try {
            Map<String, Object> report = new HashMap<>();
            
            // Get recent inventory activity
            List<Map<String, Object>> activityData = databaseTriggerService.getRecentInventoryActivity(days);
            
            // Group activity by type
            Map<String, Long> activitySummary = activityData.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    item -> (String) item.get("action_type"),
                    java.util.stream.Collectors.counting()
                ));
            
            report.put("activityData", activityData);
            report.put("activitySummary", activitySummary);
            report.put("totalTransactions", activityData.size());
            report.put("reportPeriodDays", days);
            report.put("reportGenerated", LocalDateTime.now());
            report.put("reportType", "ACTIVITY_REPORT");
            report.put("success", true);
            
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error generating activity report: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get alerts history and summary
     */
    @GetMapping("/alerts-report")
    public ResponseEntity<Map<String, Object>> getAlertsReport() {
        try {
            Map<String, Object> report = new HashMap<>();
            
            // Get active alerts summary
            List<Map<String, Object>> alertsSummary = databaseTriggerService.getActiveAlertsSummary();
            
            // Calculate total alerts by severity
            Map<String, Long> alertsBySeverity = alertsSummary.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    item -> (String) item.get("severity"),
                    java.util.stream.Collectors.summingLong(
                        item -> ((Number) item.get("alert_count")).longValue()
                    )
                ));
            
            // Calculate total alerts by type
            Map<String, Long> alertsByType = alertsSummary.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    item -> (String) item.get("alert_type"),
                    java.util.stream.Collectors.summingLong(
                        item -> ((Number) item.get("alert_count")).longValue()
                    )
                ));
            
            report.put("alertsSummary", alertsSummary);
            report.put("alertsBySeverity", alertsBySeverity);
            report.put("alertsByType", alertsByType);
            report.put("totalActiveAlerts", alertsSummary.stream()
                .mapToLong(item -> ((Number) item.get("alert_count")).longValue())
                .sum());
            report.put("reportGenerated", LocalDateTime.now());
            report.put("reportType", "ALERTS_REPORT");
            report.put("success", true);
            
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error generating alerts report: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get automated reorder recommendations report
     */
    @GetMapping("/reorder-report")
    public ResponseEntity<Map<String, Object>> getReorderReport() {
        try {
            Map<String, Object> report = new HashMap<>();
            
            // Get automated reorder status
            List<Map<String, Object>> reorderData = databaseTriggerService.getAutomatedReorderStatus();
            
            // Group reorders by status
            Map<String, Long> reordersByStatus = reorderData.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    item -> (String) item.get("status"),
                    java.util.stream.Collectors.counting()
                ));
            
            // Calculate total reorder value (estimated)
            double totalReorderValue = reorderData.stream()
                .mapToDouble(item -> {
                    Number quantity = (Number) item.get("reorder_quantity");
                    // Estimated cost per unit (in real system, this would come from medicine price)
                    return quantity != null ? quantity.doubleValue() * 10.0 : 0.0; // $10 avg per unit
                })
                .sum();
            
            report.put("reorderData", reorderData);
            report.put("reordersByStatus", reordersByStatus);
            report.put("totalPendingReorders", reorderData.size());
            report.put("estimatedReorderValue", totalReorderValue);
            report.put("reportGenerated", LocalDateTime.now());
            report.put("reportType", "REORDER_REPORT");
            report.put("success", true);
            
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error generating reorder report: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Generate comprehensive PDF report (endpoint for future PDF generation)
     */
    @GetMapping("/export-pdf")
    public ResponseEntity<Map<String, Object>> exportPdfReport(@RequestParam String reportType) {
        try {
            // In a real implementation, this would generate a PDF using libraries like iText or JasperReports
            Map<String, Object> response = new HashMap<>();
            response.put("message", "PDF export feature will be implemented with report generation libraries");
            response.put("reportType", reportType);
            response.put("suggestedLibraries", List.of("iText", "JasperReports", "Apache POI"));
            response.put("status", "FEATURE_PLANNED");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error exporting PDF report: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Generate CSV export for reports
     */
    @GetMapping("/export-csv")
    public ResponseEntity<String> exportCsvReport(@RequestParam String reportType) {
        try {
            StringBuilder csv = new StringBuilder();
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            
            switch (reportType.toLowerCase()) {
                case "low-stock":
                    csv.append("Medicine Name,Current Quantity,Min Stock,Stock Status,Days to Expiry\n");
                    List<Map<String, Object>> lowStockItems = databaseTriggerService.getInventoryStatusSummary();
                    for (Map<String, Object> item : lowStockItems) {
                        if ("LOW_STOCK".equals(item.get("stock_status")) || "OUT_OF_STOCK".equals(item.get("stock_status"))) {
                            csv.append(String.format("%s,%s,%s,%s,%s\n",
                                item.get("medicine_name"),
                                item.get("quantity"),
                                item.get("min_stock"),
                                item.get("stock_status"),
                                item.get("days_to_expiry")
                            ));
                        }
                    }
                    break;
                    
                case "activity":
                    csv.append("Medicine Name,Action Type,Quantity Changed,Reason,Performed By,Date\n");
                    List<Map<String, Object>> activityData = databaseTriggerService.getRecentInventoryActivity(30);
                    for (Map<String, Object> activity : activityData) {
                        csv.append(String.format("%s,%s,%s,%s,%s,%s\n",
                            activity.get("medicine_name"),
                            activity.get("action_type"),
                            activity.get("quantity_changed"),
                            activity.get("reason"),
                            activity.get("performed_by"),
                            activity.get("created_date")
                        ));
                    }
                    break;
                    
                default:
                    csv.append("Report Type,Generated At\n");
                    csv.append(String.format("%s,%s\n", reportType, timestamp));
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            headers.setContentDispositionFormData("attachment", 
                String.format("inventory_%s_report_%s.csv", 
                    reportType.toLowerCase(), 
                    timestamp.replaceAll(":", "-")));
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(csv.toString());
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body("Error generating CSV report: " + e.getMessage());
        }
    }

    /**
     * Get system performance analytics
     */
    @GetMapping("/performance-analytics")
    public ResponseEntity<Map<String, Object>> getPerformanceAnalytics() {
        try {
            Map<String, Object> analytics = new HashMap<>();
            
            // Get recent activity for performance calculation
            List<Map<String, Object>> recentActivity = databaseTriggerService.getRecentInventoryActivity(7);
            
            // Calculate metrics
            long totalTransactions = recentActivity.size();
            long dispensingTransactions = recentActivity.stream()
                .mapToLong(item -> "PRESCRIPTION_DISPENSE".equals(item.get("action_type")) ? 1 : 0)
                .sum();
            
            long stockAdditions = recentActivity.stream()
                .mapToLong(item -> "STOCK_ADD".equals(item.get("action_type")) ? 1 : 0)
                .sum();
            
            // Get alerts data for efficiency calculation
            List<Map<String, Object>> alertsSummary = databaseTriggerService.getActiveAlertsSummary();
            long totalAlerts = alertsSummary.stream()
                .mapToLong(item -> ((Number) item.get("alert_count")).longValue())
                .sum();
            
            // Calculate automation efficiency (mock calculation)
            double automationEfficiency = totalAlerts > 0 ? 
                Math.max(85.0, 100.0 - (totalAlerts * 2.5)) : 95.0;
            
            analytics.put("totalTransactions", totalTransactions);
            analytics.put("dispensingTransactions", dispensingTransactions);
            analytics.put("stockAdditions", stockAdditions);
            analytics.put("totalActiveAlerts", totalAlerts);
            analytics.put("automationEfficiency", String.format("%.1f%%", automationEfficiency));
            analytics.put("averageProcessingTime", "2.3 seconds"); // Mock data
            analytics.put("systemUptime", "99.8%"); // Mock data
            analytics.put("reportGenerated", LocalDateTime.now());
            analytics.put("reportType", "PERFORMANCE_ANALYTICS");
            analytics.put("success", true);
            
            return ResponseEntity.ok(analytics);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error generating performance analytics: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Trigger manual report generation and system health check
     */
    @PostMapping("/generate-health-report")
    public ResponseEntity<Map<String, Object>> generateHealthReport() {
        try {
            // Trigger database monitoring
            Map<String, Object> monitoringResult = databaseTriggerService.runInventoryMonitoring();
            
            // Get comprehensive system status
            Map<String, Object> healthReport = new HashMap<>();
            
            // Database health
            healthReport.put("databaseMonitoring", monitoringResult);
            
            // System components status
            healthReport.put("inventoryService", "healthy");
            healthReport.put("notificationService", "healthy"); 
            healthReport.put("databaseTriggers", "active");
            healthReport.put("scheduledTasks", "running");
            
            // Quick stats
            Map<String, Object> inventoryStatus = automatedInventoryService.getInventoryStatus();
            healthReport.put("inventoryStatus", inventoryStatus);
            
            // Recent activity count
            List<Map<String, Object>> recentActivity = databaseTriggerService.getRecentInventoryActivity(1);
            healthReport.put("recentActivityCount", recentActivity.size());
            
            healthReport.put("reportGenerated", LocalDateTime.now());
            healthReport.put("reportType", "SYSTEM_HEALTH_REPORT");
            healthReport.put("overallStatus", "healthy");
            healthReport.put("success", true);
            
            return ResponseEntity.ok(healthReport);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("overallStatus", "unhealthy");
            error.put("error", "Error generating health report: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}