package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA Entity representing comprehensive student details in the SmartMed medical system.
 * 
 * <p>This entity stores complete student medical records including personal information,
 * emergency contacts, medical history, family health history, vaccination records, and
 * profile images. The data is structured to support university health center operations.</p>
 * 
 * <p>Key Data Categories:</p>
 * <ul>
 *   <li><strong>Basic Information:</strong> Name, NIC, registration number, division, email</li>
 *   <li><strong>Personal Details:</strong> DOB, gender, family info, contact details</li>
 *   <li><strong>Emergency Contact:</strong> Emergency contact person details</li>
 *   <li><strong>Medical Data:</strong> Family history, medical history, vaccinations (stored as JSON)</li>
 *   <li><strong>Documents:</strong> Profile images (base64), signatures, certifications</li>
 *   <li><strong>Metadata:</strong> Creation and update timestamps</li>
 * </ul>
 * 
 * <p>Database Design Notes:</p>
 * <ul>
 *   <li>Complex medical data (familyHistory, medicalHistory, vaccinations) stored as JSON for flexibility</li>
 *   <li>Profile images stored as LONGTEXT to support base64-encoded images</li>
 *   <li>Automatic timestamp management via @PreUpdate lifecycle hook</li>
 *   <li>Unique constraint recommended on studentRegistrationNumber and NIC</li>
 * </ul>
 * 
 * @author SmartMed Development Team
 * @version 1.0
 * @since 2024
 * @see com.example.demo.controller.StudentDetailsController
 * @see com.example.demo.repository.StudentDetailsRepository
 */
@Entity
@Table(name = "student_details")
public class StudentDetails {

    /**
     * Primary key - Auto-generated unique identifier.
     * Uses database auto-increment strategy for ID generation.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== SECTION 1: Basic Information =====
    // Core identification and contact fields - required for student registration
    
    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String nic;

    @Column(nullable = false)
    private String studentRegistrationNumber;

    @Column(nullable = false)
    private String academicDivision;
 
    @Column
    private String email;

    // ===== SECTION 2: Personal Details =====
    // Demographic and social information for comprehensive student profiling

    private LocalDate dateOfBirth;

    private String positionOfFamily;
 
    private String gender;

    private String lastAttendSchool;

    private String religion;

    private String occupationOfFather;
 
    private String singleMarried;

    private String occupationOfMother;

    private Integer age;
    
    @Column(columnDefinition = "TEXT")
    private String homeAddress;
    
    private String nationality;

    private String telephoneNumber;

    @Column(columnDefinition = "TEXT")
    private String extraCurricularActivities;

    // ===== SECTION 3: Emergency Contact =====
    // Critical contact information for emergency situations
    
    /**
     * Full name of emergency contact person.
     * Must be someone who can be reached quickly in case of medical emergency.
     */
    private String emergencyName;

    private String emergencyTelephone;

    @Column(columnDefinition = "TEXT")
    private String emergencyAddress;
 
    private String emergencyRelationship;

    // ===== SECTION 4: Medical Data (JSON Format) =====
    // Complex medical information stored as JSON for flexibility and structure
    
    /**
     * Family medical history stored as JSON.
     * 
     * <p>Contains information about hereditary conditions, genetic predispositions,
     * and family health patterns that may affect the student.</p>
     * 
     * <p>Expected JSON structure (example):</p>
     * <pre>
     * {
     *   "diabetes": {"present": true, "relation": "Father"},
     *   "heartDisease": {"present": false},
     *   "hypertension": {"present": true, "relation": "Mother, Grandfather"},
     *   "cancer": {"present": false},
     *   "mentalIllness": {"present": false}
     * }
     * </pre>
     */
    @Column(columnDefinition = "JSON")
    private String familyHistory;

    /**
     * Personal medical history stored as JSON.
     * 
     * <p>Contains student's past medical conditions, surgeries, chronic illnesses,
     * allergies, and ongoing treatments.</p>
     * 
     * <p>Expected JSON structure (example):</p>
     * <pre>
     * {
     *   "allergies": ["Penicillin", "Peanuts"],
     *   "chronicConditions": ["Asthma"],
     *   "pastSurgeries": [{"type": "Appendectomy", "year": 2018}],
     *   "currentMedications": [{"name": "Inhaler", "dosage": "As needed"}],
     *   "bloodType": "O+"
     * }
     * </pre>
     */
    @Column(columnDefinition = "JSON")
    private String medicalHistory;

    /**
     * Vaccination records stored as JSON.
     * 
     * <p>Contains complete immunization history with vaccine names, dates,
     * and doses administered.</p>
     * 
     * <p>Expected JSON structure (example):</p>
     * <pre>
     * [
     *   {"name": "COVID-19", "date": "2023-05-15", "dose": "Booster"},
     *   {"name": "Hepatitis B", "date": "2020-03-10", "dose": "Complete"},
     *   {"name": "Tetanus", "date": "2019-08-22", "dose": "1st"}
     * ]
     * </pre>
     */
    @Column(columnDefinition = "JSON")
    private String vaccinations;

    // ===== SECTION 5: Documents =====
    // Visual identification and certification documents
    
    /**
     * Student's profile image stored as base64-encoded string.
     * 
     * <p>Uses LONGTEXT to accommodate large image files.</p>
     * <p>Format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."</p>
     * <p>Recommended: Compress images before storage to optimize database size.</p>
     */
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;

    /**
     * Date when medical certification or health clearance was issued.
     * Used for tracking validity of health clearances and periodic check-ups.
     */
    private LocalDate certificationDate;
    
    /**
     * Digital signature of certifying medical officer.
     * May be base64-encoded image or encrypted signature data.
     */
    private String signature;

    // ===== SECTION 6: Metadata =====
    // Automatic timestamp tracking for audit and data management

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ===== CONSTRUCTORS =====
    
    public StudentDetails() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ===== LIFECYCLE HOOKS =====
 
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ===== GETTERS AND SETTERS =====
    // Standard JavaBean accessor methods for all fields
    // Note: Detailed field documentation is provided in the field declarations above
 
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique database identifier.
     * @param id Primary key value (typically set by JPA, manual setting not recommended)
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the student's full name.
     * @return Full legal name as registered
     */
    public String getFullName() {
        return fullName;
    }

    /**
     * Sets the student's full name.
     * @param fullName Full legal name (required, cannot be null)
     */
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    /**
     * Gets the National Identity Card number.
     * @return NIC number in old or new format
     */
    public String getNic() {
        return nic;
    }

    /**
     * Sets the National Identity Card number.
     * @param nic NIC number (required, should be validated)
     */
    public void setNic(String nic) {
        this.nic = nic;
    }

    /**
     * Gets the student registration number.
     * @return Unique registration number assigned by institution
     */
    public String getStudentRegistrationNumber() {
        return studentRegistrationNumber;
    }

    /**
     * Sets the student registration number.
     * @param studentRegistrationNumber Unique registration identifier (required)
     */
    public void setStudentRegistrationNumber(String studentRegistrationNumber) {
        this.studentRegistrationNumber = studentRegistrationNumber;
    }

    public String getAcademicDivision() {
        return academicDivision;
    }

    public void setAcademicDivision(String academicDivision) {
        this.academicDivision = academicDivision;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getPositionOfFamily() {
        return positionOfFamily;
    }

    public void setPositionOfFamily(String positionOfFamily) {
        this.positionOfFamily = positionOfFamily;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getLastAttendSchool() {
        return lastAttendSchool;
    }

    public void setLastAttendSchool(String lastAttendSchool) {
        this.lastAttendSchool = lastAttendSchool;
    }

    public String getReligion() {
        return religion;
    }

    public void setReligion(String religion) {
        this.religion = religion;
    }

    public String getOccupationOfFather() {
        return occupationOfFather;
    }

    public void setOccupationOfFather(String occupationOfFather) {
        this.occupationOfFather = occupationOfFather;
    }

    public String getSingleMarried() {
        return singleMarried;
    }

    public void setSingleMarried(String singleMarried) {
        this.singleMarried = singleMarried;
    }

    public String getOccupationOfMother() {
        return occupationOfMother;
    }

    public void setOccupationOfMother(String occupationOfMother) {
        this.occupationOfMother = occupationOfMother;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getHomeAddress() {
        return homeAddress;
    }

    public void setHomeAddress(String homeAddress) {
        this.homeAddress = homeAddress;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getTelephoneNumber() {
        return telephoneNumber;
    }

    public void setTelephoneNumber(String telephoneNumber) {
        this.telephoneNumber = telephoneNumber;
    }

    public String getExtraCurricularActivities() {
        return extraCurricularActivities;
    }

    public void setExtraCurricularActivities(String extraCurricularActivities) {
        this.extraCurricularActivities = extraCurricularActivities;
    }

    public String getEmergencyName() {
        return emergencyName;
    }

    public void setEmergencyName(String emergencyName) {
        this.emergencyName = emergencyName;
    }

    public String getEmergencyTelephone() {
        return emergencyTelephone;
    }

    public void setEmergencyTelephone(String emergencyTelephone) {
        this.emergencyTelephone = emergencyTelephone;
    }

    public String getEmergencyAddress() {
        return emergencyAddress;
    }

    public void setEmergencyAddress(String emergencyAddress) {
        this.emergencyAddress = emergencyAddress;
    }

    public String getEmergencyRelationship() {
        return emergencyRelationship;
    }

    public void setEmergencyRelationship(String emergencyRelationship) {
        this.emergencyRelationship = emergencyRelationship;
    }

    /**
     * Gets the family medical history.
     * @return JSON string containing family health information, null if not set
     */
    public String getFamilyHistory() {
        return familyHistory;
    }

    /**
     * Sets the family medical history.
     * @param familyHistory JSON string with structured family health data
     */
    public void setFamilyHistory(String familyHistory) {
        this.familyHistory = familyHistory;
    }

    /**
     * Gets the personal medical history.
     * @return JSON string containing personal health records, null if not set
     */
    public String getMedicalHistory() {
        return medicalHistory;
    }

    /**
     * Sets the personal medical history.
     * @param medicalHistory JSON string with structured medical data (allergies, conditions, etc.)
     */
    public void setMedicalHistory(String medicalHistory) {
        this.medicalHistory = medicalHistory;
    }

    /**
     * Gets the vaccination records.
     * @return JSON string containing immunization history, null if not set
     */
    public String getVaccinations() {
        return vaccinations;
    }

    /**
     * Sets the vaccination records.
     * @param vaccinations JSON array string with vaccination entries
     */
    public void setVaccinations(String vaccinations) {
        this.vaccinations = vaccinations;
    }

    /**
     * Gets the profile image.
     * @return Base64-encoded image string with data URI prefix, null if not set
     */
    public String getProfileImage() {
        return profileImage;
    }

    /**
     * Sets the profile image.
     * @param profileImage Base64-encoded image string (format: "data:image/type;base64,...")
     */
    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public LocalDate getCertificationDate() {
        return certificationDate;
    }

    public void setCertificationDate(LocalDate certificationDate) {
        this.certificationDate = certificationDate;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }

    /**
     * Gets the record creation timestamp.
     * @return Date and time when this student record was first created
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the record creation timestamp.
     * @param createdAt Creation timestamp (typically set automatically, manual override possible)
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Gets the last update timestamp.
     * @return Date and time of the most recent modification to this record
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Sets the last update timestamp.
     * @param updatedAt Update timestamp (automatically managed by @PreUpdate, manual override possible)
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}