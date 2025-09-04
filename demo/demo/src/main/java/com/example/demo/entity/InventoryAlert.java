package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_alerts")
public class InventoryAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "alert_type", nullable = false)
    private String alertType; // LOW_STOCK, EXPIRED, NEAR_EXPIRY, OUT_OF_STOCK
    
    @Column(name = "medicine_id")
    private Long medicineId;
    
    @Column(name = "medicine_name", nullable = false)
    private String medicineName;
    
    @Column(name = "current_quantity")
    private Integer currentQuantity;
    
    @Column(name = "min_stock")
    private Integer minStock;
    
    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;
    
    @Column(name = "alert_message", columnDefinition = "TEXT")
    private String alertMessage;
    
    @Column(name = "severity", nullable = false)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    
    @Column(name = "status")
    private String status; // ACTIVE, ACKNOWLEDGED, RESOLVED
    
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    
    @Column(name = "acknowledged_date")
    private LocalDateTime acknowledgedDate;
    
    @Column(name = "resolved_date")
    private LocalDateTime resolvedDate;
    
    @Column(name = "acknowledged_by")
    private String acknowledgedBy;
    
    @Column(name = "resolved_by")
    private String resolvedBy;
    
    // Constructors
    public InventoryAlert() {
        this.createdDate = LocalDateTime.now();
        this.status = "ACTIVE";
    }
    
    public InventoryAlert(String alertType, Long medicineId, String medicineName, 
                         String alertMessage, String severity) {
        this();
        this.alertType = alertType;
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.alertMessage = alertMessage;
        this.severity = severity;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getAlertType() {
        return alertType;
    }
    
    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }
    
    public Long getMedicineId() {
        return medicineId;
    }
    
    public void setMedicineId(Long medicineId) {
        this.medicineId = medicineId;
    }
    
    public String getMedicineName() {
        return medicineName;
    }
    
    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }
    
    public Integer getCurrentQuantity() {
        return currentQuantity;
    }
    
    public void setCurrentQuantity(Integer currentQuantity) {
        this.currentQuantity = currentQuantity;
    }
    
    public Integer getMinStock() {
        return minStock;
    }
    
    public void setMinStock(Integer minStock) {
        this.minStock = minStock;
    }
    
    public java.time.LocalDate getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(java.time.LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public String getAlertMessage() {
        return alertMessage;
    }
    
    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }
    
    public String getSeverity() {
        return severity;
    }
    
    public void setSeverity(String severity) {
        this.severity = severity;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
        
        if ("ACKNOWLEDGED".equals(status)) {
            this.acknowledgedDate = LocalDateTime.now();
        } else if ("RESOLVED".equals(status)) {
            this.resolvedDate = LocalDateTime.now();
        }
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public LocalDateTime getAcknowledgedDate() {
        return acknowledgedDate;
    }
    
    public void setAcknowledgedDate(LocalDateTime acknowledgedDate) {
        this.acknowledgedDate = acknowledgedDate;
    }
    
    public LocalDateTime getResolvedDate() {
        return resolvedDate;
    }
    
    public void setResolvedDate(LocalDateTime resolvedDate) {
        this.resolvedDate = resolvedDate;
    }
    
    public String getAcknowledgedBy() {
        return acknowledgedBy;
    }
    
    public void setAcknowledgedBy(String acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
    }
    
    public String getResolvedBy() {
        return resolvedBy;
    }
    
    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }
    
    // Helper methods
    public boolean isActive() {
        return "ACTIVE".equals(status);
    }
    
    public boolean isAcknowledged() {
        return "ACKNOWLEDGED".equals(status);
    }
    
    public boolean isResolved() {
        return "RESOLVED".equals(status);
    }
    
    public boolean isCritical() {
        return "CRITICAL".equals(severity);
    }
    
    public boolean isHighSeverity() {
        return "HIGH".equals(severity);
    }
    
    @Override
    public String toString() {
        return "InventoryAlert{" +
                "id=" + id +
                ", alertType='" + alertType + '\'' +
                ", medicineName='" + medicineName + '\'' +
                ", severity='" + severity + '\'' +
                ", status='" + status + '\'' +
                ", createdDate=" + createdDate +
                '}';
    }
}