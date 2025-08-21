package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_entries")
public class QueueEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String queueNo;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String nic;

    @Column
    private String phone;

    @Column(nullable = false)
    private String medicalRecordId;

    @Column(nullable = false)
    private String status = "Waiting";

    @Column
    private String priority = "Normal";

    @Column(nullable = false)
    private String stage = "reception"; // reception, doctor, pharmacy, completed

    @Column(nullable = false)
    private LocalDateTime addedTime;

    @Column
    private LocalDateTime movedToDoctorTime;

    @Column
    private LocalDateTime prescriptionTime;

    @Column
    private LocalDateTime completedTime;

    @Column(columnDefinition = "TEXT")
    private String medicalData; // JSON string of medical data

    @Column(columnDefinition = "TEXT")
    private String prescription; // JSON string of prescription data

    @Column
    private String pharmacyStatus;

    // Constructors
    public QueueEntry() {}

    public QueueEntry(String queueNo, String studentName, String studentId, String email, String nic, 
                     String phone, String medicalRecordId, String medicalData) {
        this.queueNo = queueNo;
        this.studentName = studentName;
        this.studentId = studentId;
        this.email = email;
        this.nic = nic;
        this.phone = phone;
        this.medicalRecordId = medicalRecordId;
        this.medicalData = medicalData;
        this.addedTime = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQueueNo() {
        return queueNo;
    }

    public void setQueueNo(String queueNo) {
        this.queueNo = queueNo;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getMedicalRecordId() {
        return medicalRecordId;
    }

    public void setMedicalRecordId(String medicalRecordId) {
        this.medicalRecordId = medicalRecordId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public LocalDateTime getAddedTime() {
        return addedTime;
    }

    public void setAddedTime(LocalDateTime addedTime) {
        this.addedTime = addedTime;
    }

    public LocalDateTime getMovedToDoctorTime() {
        return movedToDoctorTime;
    }

    public void setMovedToDoctorTime(LocalDateTime movedToDoctorTime) {
        this.movedToDoctorTime = movedToDoctorTime;
    }

    public LocalDateTime getPrescriptionTime() {
        return prescriptionTime;
    }

    public void setPrescriptionTime(LocalDateTime prescriptionTime) {
        this.prescriptionTime = prescriptionTime;
    }

    public LocalDateTime getCompletedTime() {
        return completedTime;
    }

    public void setCompletedTime(LocalDateTime completedTime) {
        this.completedTime = completedTime;
    }

    public String getMedicalData() {
        return medicalData;
    }

    public void setMedicalData(String medicalData) {
        this.medicalData = medicalData;
    }

    public String getPrescription() {
        return prescription;
    }

    public void setPrescription(String prescription) {
        this.prescription = prescription;
    }

    public String getPharmacyStatus() {
        return pharmacyStatus;
    }

    public void setPharmacyStatus(String pharmacyStatus) {
        this.pharmacyStatus = pharmacyStatus;
    }
}