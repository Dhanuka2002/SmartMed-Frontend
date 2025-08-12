package com.example.demo.model; 
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class PrescriptionQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private String studentName;
    private String medicines; // Comma-separated or JSON string
    private String status; // e.g., "Pending", "Completed"

    // Default constructor (needed by JPA)
    public PrescriptionQueue() {
    }

    // Constructor without id (for creating new prescriptions)
    public PrescriptionQueue(Long studentId, String studentName, String medicines, String status) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.medicines = medicines;
        this.status = status;
    }

    // Constructor with all fields (optional)
    public PrescriptionQueue(Long id, Long studentId, String studentName, String medicines, String status) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.medicines = medicines;
        this.status = status;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getMedicines() {
        return medicines;
    }

    public void setMedicines(String medicines) {
        this.medicines = medicines;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // toString() - for debugging
    @Override
    public String toString() {
        return "PrescriptionQueue{"
                + "id=" + id
                + ", studentId=" + studentId
                + ", studentName='" + studentName + '\''
                + ", medicines='" + medicines + '\''
                + ", status='" + status + '\''
                + '}';
    }
}
