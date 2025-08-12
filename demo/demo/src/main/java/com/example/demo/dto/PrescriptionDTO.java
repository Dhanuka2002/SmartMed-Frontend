package com.example.demo.dto;

import java.util.List;

public class PrescriptionDTO {
    private String patientId;
    private List<MedicineItem> medicines;
    private String date;

    // No-args constructor
    public PrescriptionDTO() {
    }

    // All-args constructor
    public PrescriptionDTO(String patientId, List<MedicineItem> medicines, String date) {
        this.patientId = patientId;
        this.medicines = medicines;
        this.date = date;
    }

    // Getters and Setters
    public String getPatientId() {
        return patientId;
    }
    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public List<MedicineItem> getMedicines() {
        return medicines;
    }
    public void setMedicines(List<MedicineItem> medicines) {
        this.medicines = medicines;
    }

    public String getDate() {
        return date;
    }
    public void setDate(String date) {
        this.date = date;
    }

    @Override
    public String toString() {
        return "PrescriptionDTO{" +
                "patientId='" + patientId + '\'' +
                ", medicines=" + medicines +
                ", date='" + date + '\'' +
                '}';
    }
}
