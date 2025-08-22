package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Service to manage database triggers and automated procedures for inventory management
 */
@Service
public class DatabaseTriggerService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Initialize database triggers and procedures on application startup
     */
    @PostConstruct
    public void initializeDatabaseTriggers() {
        try {
            System.out.println("🔧 Initializing database triggers and procedures for automated inventory management...");
            
            // Load and execute the SQL script
            ClassPathResource resource = new ClassPathResource("database_triggers.sql");
            String sql = FileCopyUtils.copyToString(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
            
            // Split SQL commands by semicolon and execute each one
            String[] commands = sql.split(";");
            int executedCount = 0;
            
            for (String command : commands) {
                command = command.trim();
                if (!command.isEmpty() && !command.startsWith("--")) {
                    try {
                        jdbcTemplate.execute(command);
                        executedCount++;
                    } catch (Exception e) {
                        // Log error but continue with other commands
                        System.err.println("Warning: Failed to execute SQL command: " + e.getMessage());
                        System.err.println("Command: " + command.substring(0, Math.min(100, command.length())) + "...");
                    }
                }
            }
            
            System.out.println("✅ Database triggers and procedures initialized successfully!");
            System.out.println("📊 Executed " + executedCount + " SQL commands");
            
            // Verify setup
            verifyDatabaseSetup();
            
        } catch (IOException e) {
            System.err.println("❌ Error reading database triggers SQL file: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Error initializing database triggers: " + e.getMessage());
        }
    }

    /**
     * Verify that all database components are properly set up
     */
    private void verifyDatabaseSetup() {
        try {
            // Check if audit table exists
            String auditTableCheck = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'medicine_inventory_audit'";
            Integer auditTableExists = jdbcTemplate.queryForObject(auditTableCheck, Integer.class);
            
            // Check if alerts table exists
            String alertsTableCheck = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'inventory_alerts'";
            Integer alertsTableExists = jdbcTemplate.queryForObject(alertsTableCheck, Integer.class);
            
            // Check if reorders table exists
            String reordersTableCheck = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'automated_reorders'";
            Integer reordersTableExists = jdbcTemplate.queryForObject(reordersTableCheck, Integer.class);
            
            System.out.println("🔍 Database Setup Verification:");
            System.out.println("   📝 Audit Table: " + (auditTableExists > 0 ? "✅ Created" : "❌ Missing"));
            System.out.println("   🚨 Alerts Table: " + (alertsTableExists > 0 ? "✅ Created" : "❌ Missing"));
            System.out.println("   📦 Reorders Table: " + (reordersTableExists > 0 ? "✅ Created" : "❌ Missing"));
            
        } catch (Exception e) {
            System.err.println("Warning: Could not verify database setup: " + e.getMessage());
        }
    }

    /**
     * Get inventory dashboard data using stored procedure
     */
    public Map<String, Object> getInventoryDashboardData() {
        try {
            String sql = "CALL GetInventoryDashboardData()";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
            
            if (!results.isEmpty()) {
                return results.get(0);
            }
            
            return Map.of("success", false, "error", "No data returned from dashboard procedure");
            
        } catch (Exception e) {
            System.err.println("Error executing GetInventoryDashboardData: " + e.getMessage());
            return Map.of("success", false, "error", "Database procedure error: " + e.getMessage());
        }
    }

    /**
     * Get active alerts using stored procedure
     */
    public Map<String, Object> getActiveAlertsFromDatabase() {
        try {
            String sql = "CALL GetActiveAlerts()";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
            
            Map<String, Object> alertsMap = new java.util.HashMap<>();
            alertsMap.put("success", true);
            
            // Process alert counts
            for (Map<String, Object> result : results) {
                String alertType = (String) result.get("alert_type");
                Object countObj = result.get("alert_count");
                
                if (alertType != null && countObj != null) {
                    alertsMap.put(alertType, countObj);
                }
            }
            
            return alertsMap;
            
        } catch (Exception e) {
            System.err.println("Error executing GetActiveAlerts: " + e.getMessage());
            return Map.of(
                "success", false, 
                "error", "Database procedure error: " + e.getMessage(),
                "lowStock", 0,
                "expired", 0,
                "nearExpiry", 0,
                "stockShortage", 0,
                "reorderRequired", 0
            );
        }
    }

    /**
     * Acknowledge an alert using stored procedure
     */
    public boolean acknowledgeAlertInDatabase(String alertId, String acknowledgedBy) {
        try {
            String sql = "CALL AcknowledgeAlert(?, ?)";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, Long.valueOf(alertId), acknowledgedBy);
            
            if (!results.isEmpty()) {
                Object affectedRows = results.get(0).get("affected_rows");
                return affectedRows != null && Integer.parseInt(affectedRows.toString()) > 0;
            }
            
            return false;
            
        } catch (Exception e) {
            System.err.println("Error acknowledging alert " + alertId + ": " + e.getMessage());
            return false;
        }
    }

    /**
     * Run automatic inventory monitoring procedure
     */
    public Map<String, Object> runInventoryMonitoring() {
        try {
            String sql = "CALL AutomaticInventoryMonitoring()";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
            
            if (!results.isEmpty()) {
                Map<String, Object> result = results.get(0);
                return Map.of(
                    "success", true,
                    "message", result.get("status"),
                    "completedAt", result.get("completed_at")
                );
            }
            
            return Map.of("success", true, "message", "Monitoring completed");
            
        } catch (Exception e) {
            System.err.println("Error running inventory monitoring: " + e.getMessage());
            return Map.of("success", false, "error", "Monitoring failed: " + e.getMessage());
        }
    }

    /**
     * Get recent inventory activity
     */
    public List<Map<String, Object>> getRecentInventoryActivity(int days) {
        try {
            String sql = """
                SELECT 
                    mia.id,
                    mia.medicine_name,
                    mia.action_type,
                    mia.quantity_changed,
                    mia.reason,
                    mia.performed_by,
                    mia.created_date,
                    m.quantity as current_quantity
                FROM medicine_inventory_audit mia
                LEFT JOIN medicine m ON mia.medicine_id = m.id
                WHERE mia.created_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
                ORDER BY mia.created_date DESC
                LIMIT 50
            """;
            
            return jdbcTemplate.queryForList(sql, days);
            
        } catch (Exception e) {
            System.err.println("Error getting recent inventory activity: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get inventory status summary
     */
    public List<Map<String, Object>> getInventoryStatusSummary() {
        try {
            String sql = """
                SELECT 
                    id,
                    medicine_name,
                    quantity,
                    min_stock,
                    stock_status,
                    expiry_status,
                    days_to_expiry
                FROM inventory_status_view
                WHERE stock_status != 'NORMAL' OR expiry_status != 'VALID'
                ORDER BY 
                    CASE stock_status 
                        WHEN 'OUT_OF_STOCK' THEN 1
                        WHEN 'LOW_STOCK' THEN 2
                        WHEN 'OVERSTOCK' THEN 3
                        ELSE 4
                    END,
                    days_to_expiry ASC
            """;
            
            return jdbcTemplate.queryForList(sql);
            
        } catch (Exception e) {
            System.err.println("Error getting inventory status summary: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get active alerts summary
     */
    public List<Map<String, Object>> getActiveAlertsSummary() {
        try {
            String sql = """
                SELECT 
                    alert_type,
                    severity,
                    alert_count,
                    oldest_alert,
                    newest_alert
                FROM active_alerts_summary
                ORDER BY 
                    CASE severity 
                        WHEN 'CRITICAL' THEN 1
                        WHEN 'HIGH' THEN 2
                        WHEN 'MEDIUM' THEN 3
                        WHEN 'LOW' THEN 4
                    END
            """;
            
            return jdbcTemplate.queryForList(sql);
            
        } catch (Exception e) {
            System.err.println("Error getting active alerts summary: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get automated reorder status
     */
    public List<Map<String, Object>> getAutomatedReorderStatus() {
        try {
            String sql = """
                SELECT 
                    ar.*,
                    m.quantity as current_quantity,
                    m.min_stock
                FROM automated_reorders ar
                LEFT JOIN medicine m ON ar.medicine_id = m.id
                WHERE ar.status IN ('PENDING', 'ORDERED')
                ORDER BY ar.created_date DESC
            """;
            
            return jdbcTemplate.queryForList(sql);
            
        } catch (Exception e) {
            System.err.println("Error getting automated reorder status: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Manual trigger for database monitoring (for testing)
     */
    public void triggerManualMonitoring() {
        try {
            System.out.println("🔍 Triggering manual inventory monitoring...");
            Map<String, Object> result = runInventoryMonitoring();
            System.out.println("✅ Manual monitoring completed: " + result);
        } catch (Exception e) {
            System.err.println("❌ Error in manual monitoring: " + e.getMessage());
        }
    }
}