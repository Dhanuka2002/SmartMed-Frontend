package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_details")
public class StudentDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Information
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

    // Personal Details
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

    // Emergency Contact
    private String emergencyName;
    private String emergencyTelephone;
    
    @Column(columnDefinition = "TEXT")
    private String emergencyAddress;
    
    private String emergencyRelationship;

    // Family Medical History - JSON format
    @Column(columnDefinition = "JSON")
    private String familyHistory;

    // Medical History - JSON format
    @Column(columnDefinition = "JSON")
    private String medicalHistory;

    // Vaccinations - JSON format
    @Column(columnDefinition = "JSON")
    private String vaccinations;

    // Profile Image
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;

    // Certification
    private LocalDate certificationDate;
    private String signature;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public StudentDetails() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getStudentRegistrationNumber() {
        return studentRegistrationNumber;
    }

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

    public String getFamilyHistory() {
        return familyHistory;
    }

    public void setFamilyHistory(String familyHistory) {
        this.familyHistory = familyHistory;
    }

    public String getMedicalHistory() {
        return medicalHistory;
    }

    public void setMedicalHistory(String medicalHistory) {
        this.medicalHistory = medicalHistory;
    }

    public String getVaccinations() {
        return vaccinations;
    }

    public void setVaccinations(String vaccinations) {
        this.vaccinations = vaccinations;
    }

    public String getProfileImage() {
        return profileImage;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}