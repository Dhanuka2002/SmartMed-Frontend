package com.smartmed.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicines")
public class Medicine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false)
    private LocalDate expiry;
    
    @Column(nullable = false)
    private String category;
    
    @Column(name = "min_stock", nullable = false)
    private Integer minStock;
    
    @Column(nullable = false)
    private String dosage;
    
    @Column(name = "batch_number")
    private String batchNumber;
    
    @Column(name = "added_by")
    private String addedBy;
    
    @Column(name = "added_date")
    private LocalDateTime addedDate;
    
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    // Constructors
    public Medicine() {
        this.addedDate = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }
    
    public Medicine(String name, Integer quantity, LocalDate expiry, String category, 
                   Integer minStock, String dosage, String batchNumber, String addedBy) {
        this();
        this.name = name;
        this.quantity = quantity;
        this.expiry = expiry;
        this.category = category;
        this.minStock = minStock;
        this.dosage = dosage;
        this.batchNumber = batchNumber;
        this.addedBy = addedBy;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        this.lastUpdated = LocalDateTime.now();
    }
    
    public LocalDate getExpiry() {
        return expiry;
    }
    
    public void setExpiry(LocalDate expiry) {
        this.expiry = expiry;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public Integer getMinStock() {
        return minStock;
    }
    
    public void setMinStock(Integer minStock) {
        this.minStock = minStock;
    }
    
    public String getDosage() {
        return dosage;
    }
    
    public void setDosage(String dosage) {
        this.dosage = dosage;
    }
    
    public String getBatchNumber() {
        return batchNumber;
    }
    
    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }
    
    public String getAddedBy() {
        return addedBy;
    }
    
    public void setAddedBy(String addedBy) {
        this.addedBy = addedBy;
    }
    
    public LocalDateTime getAddedDate() {
        return addedDate;
    }
    
    public void setAddedDate(LocalDateTime addedDate) {
        this.addedDate = addedDate;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    // Helper methods
    public boolean isLowStock() {
        return quantity <= minStock;
    }
    
    public boolean isExpired() {
        return expiry.isBefore(LocalDate.now());
    }
    
    public boolean isNearExpiry() {
        return expiry.isBefore(LocalDate.now().plusDays(30)) && !isExpired();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Medicine{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", quantity=" + quantity +
                ", expiry=" + expiry +
                ", category='" + category + '\'' +
                ", dosage='" + dosage + '\'' +
                '}';
    }
}