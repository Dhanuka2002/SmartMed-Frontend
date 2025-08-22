package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescription_medicines")
public class PrescriptionMedicine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Many-to-One relationship with Prescription
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;
    
    // Reference to medicine from inventory
    @Column(name = "medicine_id")
    private Long medicineId;
    
    @Column(name = "medicine_name", nullable = false)
    private String medicineName;
    
    @Column(name = "dosage")
    private String dosage;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "frequency")
    private String frequency;
    
    @Column(name = "duration")
    private String duration;
    
    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;
    
    @Column(name = "dispensed_quantity")
    private Integer dispensedQuantity;
    
    @Column(name = "status")
    private String status; // "Pending", "Partially Dispensed", "Dispensed", "Out of Stock"
    
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @Column(name = "dispensed_date")
    private LocalDateTime dispensedDate;
    
    @Column(name = "dispensed_by")
    private String dispensedBy;
    
    // Constructors
    public PrescriptionMedicine() {
        this.createdDate = LocalDateTime.now();
        this.status = "Pending";
        this.dispensedQuantity = 0;
    }
    
    public PrescriptionMedicine(Prescription prescription, String medicineName, Integer quantity) {
        this();
        this.prescription = prescription;
        this.medicineName = medicineName;
        this.quantity = quantity;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Prescription getPrescription() {
        return prescription;
    }
    
    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
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
    
    public String getDosage() {
        return dosage;
    }
    
    public void setDosage(String dosage) {
        this.dosage = dosage;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public String getFrequency() {
        return frequency;
    }
    
    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }
    
    public String getDuration() {
        return duration;
    }
    
    public void setDuration(String duration) {
        this.duration = duration;
    }
    
    public String getInstructions() {
        return instructions;
    }
    
    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
    
    public Integer getDispensedQuantity() {
        return dispensedQuantity;
    }
    
    public void setDispensedQuantity(Integer dispensedQuantity) {
        this.dispensedQuantity = dispensedQuantity;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
        
        if ("Dispensed".equals(status)) {
            this.dispensedDate = LocalDateTime.now();
        }
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public LocalDateTime getDispensedDate() {
        return dispensedDate;
    }
    
    public void setDispensedDate(LocalDateTime dispensedDate) {
        this.dispensedDate = dispensedDate;
    }
    
    public String getDispensedBy() {
        return dispensedBy;
    }
    
    public void setDispensedBy(String dispensedBy) {
        this.dispensedBy = dispensedBy;
    }
    
    // Helper methods
    public boolean isPending() {
        return "Pending".equals(status);
    }
    
    public boolean isDispensed() {
        return "Dispensed".equals(status);
    }
    
    public boolean isPartiallyDispensed() {
        return "Partially Dispensed".equals(status);
    }
    
    public boolean isOutOfStock() {
        return "Out of Stock".equals(status);
    }
    
    public Integer getRemainingQuantity() {
        return quantity - (dispensedQuantity != null ? dispensedQuantity : 0);
    }
    
    @Override
    public String toString() {
        return "PrescriptionMedicine{" +
                "id=" + id +
                ", medicineName='" + medicineName + '\'' +
                ", quantity=" + quantity +
                ", dispensedQuantity=" + dispensedQuantity +
                ", status='" + status + '\'' +
                '}';
    }
}