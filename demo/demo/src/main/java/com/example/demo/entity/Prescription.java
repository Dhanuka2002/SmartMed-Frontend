package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prescriptions")
public class Prescription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "patient_name", nullable = false)
    private String patientName;
    
    @Column(name = "patient_id", nullable = false)
    private String patientId;
    
    @Column(name = "student_id")
    private String studentId;
    
    @Column(name = "queue_no")
    private String queueNo;
    
    @Column(name = "doctor_name", nullable = false)
    private String doctorName;
    
    @Column(name = "prescription_text", columnDefinition = "TEXT")
    private String prescriptionText;
    
    @Column(name = "status", nullable = false)
    private String status; // "Pending", "In Progress", "Completed", "Cancelled"
    
    @Column(name = "total_medicines")
    private Integer totalMedicines;
    
    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;
    
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
    
    @Column(name = "completed_date")
    private LocalDateTime completedDate;
    
    @Column(name = "dispensed_by")
    private String dispensedBy;
    
    @Column(name = "inventory_status")
    private String inventoryStatus;
    
    @Column(name = "dispensed_date")
    private LocalDateTime dispensedDate;
    
    @Column(name = "signature", columnDefinition = "LONGTEXT")
    private String signature;
    
    @Column(name = "signed_at")
    private LocalDateTime signedAt;
    
    // One-to-Many relationship with PrescriptionMedicine
    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PrescriptionMedicine> prescriptionMedicines;
    
    // Constructors
    public Prescription() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        this.status = "Pending";
    }
    
    public Prescription(String patientName, String patientId, String doctorName) {
        this();
        this.patientName = patientName;
        this.patientId = patientId;
        this.doctorName = doctorName;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getPatientName() {
        return patientName;
    }
    
    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }
    
    public String getPatientId() {
        return patientId;
    }
    
    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }
    
    public String getStudentId() {
        return studentId;
    }
    
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
    
    public String getQueueNo() {
        return queueNo;
    }
    
    public void setQueueNo(String queueNo) {
        this.queueNo = queueNo;
    }
    
    public String getDoctorName() {
        return doctorName;
    }
    
    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }
    
    public String getPrescriptionText() {
        return prescriptionText;
    }
    
    public void setPrescriptionText(String prescriptionText) {
        this.prescriptionText = prescriptionText;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
        this.updatedDate = LocalDateTime.now();
        
        if ("Completed".equals(status)) {
            this.completedDate = LocalDateTime.now();
        }
    }
    
    public Integer getTotalMedicines() {
        return totalMedicines;
    }
    
    public void setTotalMedicines(Integer totalMedicines) {
        this.totalMedicines = totalMedicines;
    }
    
    public String getInstructions() {
        return instructions;
    }
    
    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }
    
    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }
    
    public LocalDateTime getCompletedDate() {
        return completedDate;
    }
    
    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }
    
    public String getDispensedBy() {
        return dispensedBy;
    }
    
    public void setDispensedBy(String dispensedBy) {
        this.dispensedBy = dispensedBy;
    }
    
    public List<PrescriptionMedicine> getPrescriptionMedicines() {
        return prescriptionMedicines;
    }
    
    public void setPrescriptionMedicines(List<PrescriptionMedicine> prescriptionMedicines) {
        this.prescriptionMedicines = prescriptionMedicines;
    }
    
    public String getInventoryStatus() {
        return inventoryStatus;
    }
    
    public void setInventoryStatus(String inventoryStatus) {
        this.inventoryStatus = inventoryStatus;
    }
    
    public LocalDateTime getDispensedDate() {
        return dispensedDate;
    }
    
    public void setDispensedDate(LocalDateTime dispensedDate) {
        this.dispensedDate = dispensedDate;
    }
    
    public String getSignature() {
        return signature;
    }
    
    public void setSignature(String signature) {
        this.signature = signature;
    }
    
    public LocalDateTime getSignedAt() {
        return signedAt;
    }
    
    public void setSignedAt(LocalDateTime signedAt) {
        this.signedAt = signedAt;
    }
    
    // Helper methods
    public boolean isPending() {
        return "Pending".equals(status);
    }
    
    public boolean isInProgress() {
        return "In Progress".equals(status);
    }
    
    public boolean isCompleted() {
        return "Completed".equals(status);
    }
    
    public boolean isCancelled() {
        return "Cancelled".equals(status);
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedDate = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Prescription{" +
                "id=" + id +
                ", patientName='" + patientName + '\'' +
                ", patientId='" + patientId + '\'' +
                ", doctorName='" + doctorName + '\'' +
                ", status='" + status + '\'' +
                ", createdDate=" + createdDate +
                '}';
    }
}