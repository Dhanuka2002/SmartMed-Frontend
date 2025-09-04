package com.example.demo.repository;

import com.example.demo.entity.InventoryAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryAlertRepository extends JpaRepository<InventoryAlert, Long> {
    
    // Find alerts by status
    List<InventoryAlert> findByStatusOrderByCreatedDateDesc(String status);
    
    // Find active alerts
    List<InventoryAlert> findByStatusAndCreatedDateAfterOrderBySeverityDescCreatedDateDesc(String status, LocalDateTime date);
    
    // Find alerts by medicine
    List<InventoryAlert> findByMedicineIdAndStatusOrderByCreatedDateDesc(Long medicineId, String status);
    
    // Find alerts by type
    List<InventoryAlert> findByAlertTypeAndStatusOrderByCreatedDateDesc(String alertType, String status);
    
    // Find alerts by severity
    List<InventoryAlert> findBySeverityAndStatusOrderByCreatedDateDesc(String severity, String status);
    
    // Check if alert already exists for a medicine and type
    Optional<InventoryAlert> findByMedicineIdAndAlertTypeAndStatus(Long medicineId, String alertType, String status);
    
    // Find all active alerts ordered by severity and creation date
    @Query("SELECT a FROM InventoryAlert a WHERE a.status = 'ACTIVE' ORDER BY " +
           "CASE a.severity " +
           "WHEN 'CRITICAL' THEN 1 " +
           "WHEN 'HIGH' THEN 2 " +
           "WHEN 'MEDIUM' THEN 3 " +
           "WHEN 'LOW' THEN 4 " +
           "END, a.createdDate DESC")
    List<InventoryAlert> findActiveAlertsOrderedBySeverity();
    
    // Count active alerts by type
    @Query("SELECT COUNT(a) FROM InventoryAlert a WHERE a.status = 'ACTIVE' AND a.alertType = :alertType")
    long countActiveAlertsByType(@Param("alertType") String alertType);
    
    // Count active alerts by severity
    @Query("SELECT COUNT(a) FROM InventoryAlert a WHERE a.status = 'ACTIVE' AND a.severity = :severity")
    long countActiveAlertsBySeverity(@Param("severity") String severity);
    
    // Find critical and high severity active alerts
    @Query("SELECT a FROM InventoryAlert a WHERE a.status = 'ACTIVE' AND (a.severity = 'CRITICAL' OR a.severity = 'HIGH') ORDER BY " +
           "CASE a.severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 END, a.createdDate DESC")
    List<InventoryAlert> findCriticalAndHighSeverityActiveAlerts();
    
    // Find alerts created within specific time period
    List<InventoryAlert> findByCreatedDateBetweenOrderByCreatedDateDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    // Delete resolved alerts older than specified date
    void deleteByStatusAndResolvedDateBefore(String status, LocalDateTime date);
    
    // Get alert statistics
    @Query("SELECT a.alertType, COUNT(a) FROM InventoryAlert a WHERE a.status = 'ACTIVE' GROUP BY a.alertType")
    List<Object[]> getActiveAlertsStatistics();
    
    @Query("SELECT a.severity, COUNT(a) FROM InventoryAlert a WHERE a.status = 'ACTIVE' GROUP BY a.severity")
    List<Object[]> getActiveAlertsBySeverityStatistics();
}