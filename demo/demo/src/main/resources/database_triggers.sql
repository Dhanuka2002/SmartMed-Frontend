-- Automated Database Procedures and Triggers for SmartMed Inventory Management
-- This file contains SQL scripts to automatically manage inventory at the database level

-- =====================================
-- 1. MEDICINE INVENTORY AUDIT TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS medicine_inventory_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    medicine_name VARCHAR(255),
    action_type ENUM('STOCK_ADD', 'STOCK_REMOVE', 'PRESCRIPTION_DISPENSE', 'MANUAL_ADJUSTMENT', 'EXPIRY_UPDATE') NOT NULL,
    previous_quantity INT,
    new_quantity INT,
    quantity_changed INT,
    reason VARCHAR(500),
    performed_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_medicine_audit (medicine_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_date (created_date)
);

-- =====================================
-- 2. INVENTORY ALERTS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_type ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'NEAR_EXPIRY', 'EXPIRED', 'REORDER_REQUIRED') NOT NULL,
    medicine_id BIGINT NOT NULL,
    medicine_name VARCHAR(255),
    current_quantity INT,
    threshold_quantity INT,
    alert_message TEXT,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(255),
    acknowledged_date TIMESTAMP NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_medicine_alerts (medicine_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_acknowledged (is_acknowledged)
);

-- =====================================
-- 3. AUTOMATED REORDER TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS automated_reorders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT NOT NULL,
    medicine_name VARCHAR(255),
    current_quantity INT,
    reorder_quantity INT,
    reorder_level INT,
    status ENUM('PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED') DEFAULT 'PENDING',
    supplier VARCHAR(255),
    estimated_delivery_date DATE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_medicine_reorder (medicine_id),
    INDEX idx_reorder_status (status)
);

-- =====================================
-- 4. TRIGGER: AUTO INVENTORY AUDIT ON MEDICINE QUANTITY CHANGE
-- =====================================
DELIMITER //

CREATE TRIGGER IF NOT EXISTS medicine_quantity_audit_trigger
AFTER UPDATE ON medicine
FOR EACH ROW
BEGIN
    DECLARE action_reason VARCHAR(500);
    DECLARE action_performer VARCHAR(255);
    
    -- Only trigger if quantity changed
    IF OLD.quantity != NEW.quantity THEN
        -- Determine action type and reason
        SET action_reason = CASE 
            WHEN NEW.quantity > OLD.quantity THEN 'Stock replenished'
            WHEN NEW.quantity < OLD.quantity THEN 'Stock dispensed/consumed'
            ELSE 'Manual adjustment'
        END;
        
        -- Insert audit record
        INSERT INTO medicine_inventory_audit (
            medicine_id,
            medicine_name,
            action_type,
            previous_quantity,
            new_quantity,
            quantity_changed,
            reason,
            performed_by
        ) VALUES (
            NEW.id,
            NEW.name,
            CASE 
                WHEN NEW.quantity > OLD.quantity THEN 'STOCK_ADD'
                WHEN NEW.quantity < OLD.quantity THEN 'STOCK_REMOVE'
                ELSE 'MANUAL_ADJUSTMENT'
            END,
            OLD.quantity,
            NEW.quantity,
            NEW.quantity - OLD.quantity,
            action_reason,
            'SYSTEM_AUTO'
        );
        
        -- Check for low stock and create alerts
        IF NEW.quantity <= NEW.min_stock THEN
            -- Remove existing alerts for this medicine and type
            DELETE FROM inventory_alerts 
            WHERE medicine_id = NEW.id 
            AND alert_type IN ('LOW_STOCK', 'OUT_OF_STOCK')
            AND is_acknowledged = FALSE;
            
            -- Insert new alert
            INSERT INTO inventory_alerts (
                alert_type,
                medicine_id,
                medicine_name,
                current_quantity,
                threshold_quantity,
                alert_message,
                severity
            ) VALUES (
                CASE WHEN NEW.quantity = 0 THEN 'OUT_OF_STOCK' ELSE 'LOW_STOCK' END,
                NEW.id,
                NEW.name,
                NEW.quantity,
                NEW.min_stock,
                CASE 
                    WHEN NEW.quantity = 0 THEN CONCAT('OUT OF STOCK: ', NEW.name, ' is completely out of stock!')
                    ELSE CONCAT('LOW STOCK ALERT: ', NEW.name, ' quantity (', NEW.quantity, ') is below minimum stock level (', NEW.min_stock, ')')
                END,
                CASE 
                    WHEN NEW.quantity = 0 THEN 'CRITICAL'
                    WHEN NEW.quantity <= (NEW.min_stock * 0.5) THEN 'HIGH'
                    ELSE 'MEDIUM'
                END
            );
            
            -- Trigger automated reorder if quantity is very low
            IF NEW.quantity <= (NEW.min_stock * 0.3) THEN
                -- Check if reorder doesn't already exist
                IF NOT EXISTS (
                    SELECT 1 FROM automated_reorders 
                    WHERE medicine_id = NEW.id 
                    AND status IN ('PENDING', 'ORDERED')
                ) THEN
                    INSERT INTO automated_reorders (
                        medicine_id,
                        medicine_name,
                        current_quantity,
                        reorder_quantity,
                        reorder_level,
                        supplier
                    ) VALUES (
                        NEW.id,
                        NEW.name,
                        NEW.quantity,
                        NEW.min_stock * 3, -- Reorder 3x minimum stock
                        NEW.min_stock,
                        'AUTO_SUPPLIER'
                    );
                END IF;
            END IF;
        END IF;
        
        -- Check for expiry alerts
        IF NEW.expiry_date IS NOT NULL THEN
            -- Remove existing expiry alerts
            DELETE FROM inventory_alerts 
            WHERE medicine_id = NEW.id 
            AND alert_type IN ('NEAR_EXPIRY', 'EXPIRED')
            AND is_acknowledged = FALSE;
            
            IF NEW.expiry_date <= CURDATE() THEN
                -- Expired medicine
                INSERT INTO inventory_alerts (
                    alert_type,
                    medicine_id,
                    medicine_name,
                    current_quantity,
                    alert_message,
                    severity
                ) VALUES (
                    'EXPIRED',
                    NEW.id,
                    NEW.name,
                    NEW.quantity,
                    CONCAT('EXPIRED: ', NEW.name, ' expired on ', NEW.expiry_date),
                    'CRITICAL'
                );
            ELSEIF NEW.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN
                -- Near expiry (within 30 days)
                INSERT INTO inventory_alerts (
                    alert_type,
                    medicine_id,
                    medicine_name,
                    current_quantity,
                    alert_message,
                    severity
                ) VALUES (
                    'NEAR_EXPIRY',
                    NEW.id,
                    NEW.name,
                    NEW.quantity,
                    CONCAT('NEAR EXPIRY: ', NEW.name, ' expires on ', NEW.expiry_date),
                    CASE 
                        WHEN NEW.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'HIGH'
                        WHEN NEW.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 15 DAY) THEN 'MEDIUM'
                        ELSE 'LOW'
                    END
                );
            END IF;
        END IF;
    END IF;
END //

DELIMITER ;

-- =====================================
-- 5. TRIGGER: AUTO AUDIT ON PRESCRIPTION MEDICINE DISPENSING
-- =====================================
DELIMITER //

CREATE TRIGGER IF NOT EXISTS prescription_dispense_audit_trigger
AFTER UPDATE ON prescription_medicine
FOR EACH ROW
BEGIN
    -- Only trigger when status changes to dispensed or quantity dispensed changes
    IF (OLD.status != NEW.status AND NEW.status IN ('Dispensed', 'Partially Dispensed')) 
       OR (OLD.dispensed_quantity != NEW.dispensed_quantity AND NEW.dispensed_quantity > 0) THEN
        
        INSERT INTO medicine_inventory_audit (
            medicine_id,
            medicine_name,
            action_type,
            quantity_changed,
            reason,
            performed_by
        ) VALUES (
            NEW.medicine_id,
            NEW.medicine_name,
            'PRESCRIPTION_DISPENSE',
            -NEW.dispensed_quantity,
            CONCAT('Prescription ID: ', NEW.prescription_id, ', Patient: ', 
                   (SELECT patient_name FROM prescription WHERE id = NEW.prescription_id LIMIT 1)),
            COALESCE(
                (SELECT dispensed_by FROM prescription WHERE id = NEW.prescription_id LIMIT 1),
                'SYSTEM_AUTO'
            )
        );
    END IF;
END //

DELIMITER ;

-- =====================================
-- 6. STORED PROCEDURE: GET INVENTORY DASHBOARD DATA
-- =====================================
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS GetInventoryDashboardData()
BEGIN
    DECLARE total_medicines INT DEFAULT 0;
    DECLARE low_stock_count INT DEFAULT 0;
    DECLARE expired_count INT DEFAULT 0;
    DECLARE near_expiry_count INT DEFAULT 0;
    DECLARE out_of_stock_count INT DEFAULT 0;
    DECLARE total_quantity INT DEFAULT 0;
    DECLARE pending_prescriptions INT DEFAULT 0;
    
    -- Get basic inventory statistics
    SELECT 
        COUNT(*),
        COALESCE(SUM(quantity), 0),
        COALESCE(SUM(CASE WHEN quantity <= min_stock AND quantity > 0 THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN expiry_date <= CURDATE() THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND expiry_date > CURDATE() THEN 1 ELSE 0 END), 0)
    INTO 
        total_medicines,
        total_quantity,
        low_stock_count,
        out_of_stock_count,
        expired_count,
        near_expiry_count
    FROM medicine;
    
    -- Get pending prescriptions count
    SELECT COUNT(*) INTO pending_prescriptions
    FROM prescription 
    WHERE status = 'Pending';
    
    -- Return dashboard data
    SELECT 
        total_medicines as totalMedicines,
        low_stock_count as lowStockCount,
        out_of_stock_count as outOfStockCount,
        expired_count as expiredCount,
        near_expiry_count as nearExpiryCount,
        total_quantity as totalQuantity,
        pending_prescriptions as pendingPrescriptions,
        TRUE as success,
        NOW() as lastUpdated;
END //

DELIMITER ;

-- =====================================
-- 7. STORED PROCEDURE: GET ACTIVE ALERTS
-- =====================================
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS GetActiveAlerts()
BEGIN
    SELECT 
        alert_type,
        COUNT(*) as alert_count
    FROM inventory_alerts 
    WHERE is_acknowledged = FALSE
    GROUP BY alert_type
    
    UNION ALL
    
    SELECT 
        'total' as alert_type,
        COUNT(*) as alert_count
    FROM inventory_alerts 
    WHERE is_acknowledged = FALSE;
    
    -- Also return detailed alerts
    SELECT 
        id,
        alert_type,
        medicine_name,
        current_quantity,
        threshold_quantity,
        alert_message,
        severity,
        created_date
    FROM inventory_alerts 
    WHERE is_acknowledged = FALSE
    ORDER BY 
        CASE severity 
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            WHEN 'LOW' THEN 4
        END,
        created_date DESC;
END //

DELIMITER ;

-- =====================================
-- 8. STORED PROCEDURE: ACKNOWLEDGE ALERT
-- =====================================
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS AcknowledgeAlert(
    IN alert_id BIGINT,
    IN acknowledged_by_user VARCHAR(255)
)
BEGIN
    UPDATE inventory_alerts 
    SET 
        is_acknowledged = TRUE,
        acknowledged_by = acknowledged_by_user,
        acknowledged_date = NOW()
    WHERE id = alert_id;
    
    SELECT ROW_COUNT() as affected_rows;
END //

DELIMITER ;

-- =====================================
-- 9. STORED PROCEDURE: AUTOMATIC INVENTORY MONITORING
-- =====================================
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS AutomaticInventoryMonitoring()
BEGIN
    -- Clean up old acknowledged alerts (older than 30 days)
    DELETE FROM inventory_alerts 
    WHERE is_acknowledged = TRUE 
    AND acknowledged_date < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Clean up old audit records (older than 90 days)
    DELETE FROM medicine_inventory_audit 
    WHERE created_date < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    -- Update any missing alerts by checking current medicine status
    INSERT INTO inventory_alerts (
        alert_type,
        medicine_id,
        medicine_name,
        current_quantity,
        threshold_quantity,
        alert_message,
        severity
    )
    SELECT 
        'LOW_STOCK',
        m.id,
        m.name,
        m.quantity,
        m.min_stock,
        CONCAT('LOW STOCK: ', m.name, ' (', m.quantity, ') below minimum (', m.min_stock, ')'),
        'MEDIUM'
    FROM medicine m
    WHERE m.quantity <= m.min_stock 
    AND m.quantity > 0
    AND NOT EXISTS (
        SELECT 1 FROM inventory_alerts ia 
        WHERE ia.medicine_id = m.id 
        AND ia.alert_type = 'LOW_STOCK' 
        AND ia.is_acknowledged = FALSE
    );
    
    -- Check for expired medicines
    INSERT INTO inventory_alerts (
        alert_type,
        medicine_id,
        medicine_name,
        current_quantity,
        alert_message,
        severity
    )
    SELECT 
        'EXPIRED',
        m.id,
        m.name,
        m.quantity,
        CONCAT('EXPIRED: ', m.name, ' expired on ', m.expiry_date),
        'CRITICAL'
    FROM medicine m
    WHERE m.expiry_date <= CURDATE()
    AND NOT EXISTS (
        SELECT 1 FROM inventory_alerts ia 
        WHERE ia.medicine_id = m.id 
        AND ia.alert_type = 'EXPIRED' 
        AND ia.is_acknowledged = FALSE
    );
    
    SELECT 'Inventory monitoring completed' as status, NOW() as completed_at;
END //

DELIMITER ;

-- =====================================
-- 10. EVENT SCHEDULER FOR AUTOMATIC MONITORING
-- =====================================
-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Create event for automatic inventory monitoring (runs every hour)
CREATE EVENT IF NOT EXISTS AutoInventoryMonitoringEvent
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    CALL AutomaticInventoryMonitoring();
END;

-- =====================================
-- 11. VIEWS FOR REPORTING
-- =====================================

-- Inventory status view
CREATE OR REPLACE VIEW inventory_status_view AS
SELECT 
    m.id,
    m.name as medicine_name,
    m.quantity,
    m.min_stock,
    m.max_stock,
    m.price,
    m.expiry_date,
    CASE 
        WHEN m.quantity = 0 THEN 'OUT_OF_STOCK'
        WHEN m.quantity <= m.min_stock THEN 'LOW_STOCK'
        WHEN m.quantity >= m.max_stock THEN 'OVERSTOCK'
        ELSE 'NORMAL'
    END as stock_status,
    CASE 
        WHEN m.expiry_date <= CURDATE() THEN 'EXPIRED'
        WHEN m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'NEAR_EXPIRY'
        ELSE 'VALID'
    END as expiry_status,
    DATEDIFF(m.expiry_date, CURDATE()) as days_to_expiry
FROM medicine m;

-- Active alerts summary view
CREATE OR REPLACE VIEW active_alerts_summary AS
SELECT 
    alert_type,
    severity,
    COUNT(*) as alert_count,
    MIN(created_date) as oldest_alert,
    MAX(created_date) as newest_alert
FROM inventory_alerts 
WHERE is_acknowledged = FALSE
GROUP BY alert_type, severity;

-- Recent inventory activity view
CREATE OR REPLACE VIEW recent_inventory_activity AS
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
WHERE mia.created_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY mia.created_date DESC;

-- =====================================
-- INITIAL SETUP COMPLETE MESSAGE
-- =====================================
SELECT 'Automated Database Procedures and Triggers Setup Complete!' as message,
       'The following components have been created:' as description,
       '1. Audit tables for tracking inventory changes' as component1,
       '2. Alert system for low stock and expiry notifications' as component2,
       '3. Automated reorder system' as component3,
       '4. Triggers for automatic monitoring' as component4,
       '5. Stored procedures for dashboard and alerts' as component5,
       '6. Scheduled events for continuous monitoring' as component6,
       '7. Views for reporting and analytics' as component7;