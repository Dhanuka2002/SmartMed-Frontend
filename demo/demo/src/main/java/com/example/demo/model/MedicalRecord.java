package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Information
    private String vaccinated;
    private Double weight;
    private Double height;
    private Double chestInspiration;
    private Double chestExpiration;

    // Teeth Condition
    private Boolean teethDecayed;
    private Boolean teethMissing;
    private Boolean teethDentures;
    private Boolean teethGingivitis;

    // Hearing and Speech
    private String hearingRight;
    private String hearingLeft;
    private String speech;

    // Circulation
    private String heartDisease;
    private String heartSound;
    private String bloodPressure;
    private String murmurs;
    private String pulse;

    // Respiration
    private String tuberculosis;
    private String tuberculosisTest;
    private String xrayChest;
    private String xrayNo;
    private String xrayFindings;
    private LocalDate xrayDate;

    // Nervous Functions
    private String convulsion;
    private String kneeJerks;

    // Abdomen
    private String liverSpleen;
    private String hemorrhoids;
    private String hernialOrifices;

    // Vision
    private String visionRightWithout;
    private String visionLeftWithout;
    private String visionRightWith;
    private String visionLeftWith;
    private Boolean colorVisionNormal;
    private Boolean colorVisionRed;
    private Boolean colorVisionGreen;

    // Extremities and Surface
    private String scarsOperations;
    private String varicoseVeins;
    private String boneJoint;

    // Clinical Tests
    private String bloodGroup;
    private Double hemoglobin;

    // Assessment
    private String specialistReferral;
    @Column(columnDefinition = "TEXT")
    private String medicalCondition;
    private String studentName;
    @Column(name = "student_email")
    private String studentEmail;
    @Column(name = "email")
    private String email;
    private String fitForStudies;
    @Column(columnDefinition = "TEXT")
    private String reason;

    // Dates and Signatures
    private LocalDate date1;
    private LocalDate date2;
    
    @Column(columnDefinition = "LONGTEXT")
    private String medicalOfficerSignature;
    
    @Column(columnDefinition = "LONGTEXT")
    private String itumMedicalOfficerSignature;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public MedicalRecord() {
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

    public String getVaccinated() {
        return vaccinated;
    }

    public void setVaccinated(String vaccinated) {
        this.vaccinated = vaccinated;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Double getChestInspiration() {
        return chestInspiration;
    }

    public void setChestInspiration(Double chestInspiration) {
        this.chestInspiration = chestInspiration;
    }

    public Double getChestExpiration() {
        return chestExpiration;
    }

    public void setChestExpiration(Double chestExpiration) {
        this.chestExpiration = chestExpiration;
    }

    public Boolean getTeethDecayed() {
        return teethDecayed;
    }

    public void setTeethDecayed(Boolean teethDecayed) {
        this.teethDecayed = teethDecayed;
    }

    public Boolean getTeethMissing() {
        return teethMissing;
    }

    public void setTeethMissing(Boolean teethMissing) {
        this.teethMissing = teethMissing;
    }

    public Boolean getTeethDentures() {
        return teethDentures;
    }

    public void setTeethDentures(Boolean teethDentures) {
        this.teethDentures = teethDentures;
    }

    public Boolean getTeethGingivitis() {
        return teethGingivitis;
    }

    public void setTeethGingivitis(Boolean teethGingivitis) {
        this.teethGingivitis = teethGingivitis;
    }

    public String getHearingRight() {
        return hearingRight;
    }

    public void setHearingRight(String hearingRight) {
        this.hearingRight = hearingRight;
    }

    public String getHearingLeft() {
        return hearingLeft;
    }

    public void setHearingLeft(String hearingLeft) {
        this.hearingLeft = hearingLeft;
    }

    public String getSpeech() {
        return speech;
    }

    public void setSpeech(String speech) {
        this.speech = speech;
    }

    public String getHeartDisease() {
        return heartDisease;
    }

    public void setHeartDisease(String heartDisease) {
        this.heartDisease = heartDisease;
    }

    public String getHeartSound() {
        return heartSound;
    }

    public void setHeartSound(String heartSound) {
        this.heartSound = heartSound;
    }

    public String getBloodPressure() {
        return bloodPressure;
    }

    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
    }

    public String getMurmurs() {
        return murmurs;
    }

    public void setMurmurs(String murmurs) {
        this.murmurs = murmurs;
    }

    public String getPulse() {
        return pulse;
    }

    public void setPulse(String pulse) {
        this.pulse = pulse;
    }

    public String getTuberculosis() {
        return tuberculosis;
    }

    public void setTuberculosis(String tuberculosis) {
        this.tuberculosis = tuberculosis;
    }

    public String getTuberculosisTest() {
        return tuberculosisTest;
    }

    public void setTuberculosisTest(String tuberculosisTest) {
        this.tuberculosisTest = tuberculosisTest;
    }

    public String getXrayChest() {
        return xrayChest;
    }

    public void setXrayChest(String xrayChest) {
        this.xrayChest = xrayChest;
    }

    public String getXrayNo() {
        return xrayNo;
    }

    public void setXrayNo(String xrayNo) {
        this.xrayNo = xrayNo;
    }

    public String getXrayFindings() {
        return xrayFindings;
    }

    public void setXrayFindings(String xrayFindings) {
        this.xrayFindings = xrayFindings;
    }

    public LocalDate getXrayDate() {
        return xrayDate;
    }

    public void setXrayDate(LocalDate xrayDate) {
        this.xrayDate = xrayDate;
    }

    public String getConvulsion() {
        return convulsion;
    }

    public void setConvulsion(String convulsion) {
        this.convulsion = convulsion;
    }

    public String getKneeJerks() {
        return kneeJerks;
    }

    public void setKneeJerks(String kneeJerks) {
        this.kneeJerks = kneeJerks;
    }

    public String getLiverSpleen() {
        return liverSpleen;
    }

    public void setLiverSpleen(String liverSpleen) {
        this.liverSpleen = liverSpleen;
    }

    public String getHemorrhoids() {
        return hemorrhoids;
    }

    public void setHemorrhoids(String hemorrhoids) {
        this.hemorrhoids = hemorrhoids;
    }

    public String getHernialOrifices() {
        return hernialOrifices;
    }

    public void setHernialOrifices(String hernialOrifices) {
        this.hernialOrifices = hernialOrifices;
    }

    public String getVisionRightWithout() {
        return visionRightWithout;
    }

    public void setVisionRightWithout(String visionRightWithout) {
        this.visionRightWithout = visionRightWithout;
    }

    public String getVisionLeftWithout() {
        return visionLeftWithout;
    }

    public void setVisionLeftWithout(String visionLeftWithout) {
        this.visionLeftWithout = visionLeftWithout;
    }

    public String getVisionRightWith() {
        return visionRightWith;
    }

    public void setVisionRightWith(String visionRightWith) {
        this.visionRightWith = visionRightWith;
    }

    public String getVisionLeftWith() {
        return visionLeftWith;
    }

    public void setVisionLeftWith(String visionLeftWith) {
        this.visionLeftWith = visionLeftWith;
    }

    public Boolean getColorVisionNormal() {
        return colorVisionNormal;
    }

    public void setColorVisionNormal(Boolean colorVisionNormal) {
        this.colorVisionNormal = colorVisionNormal;
    }

    public Boolean getColorVisionRed() {
        return colorVisionRed;
    }

    public void setColorVisionRed(Boolean colorVisionRed) {
        this.colorVisionRed = colorVisionRed;
    }

    public Boolean getColorVisionGreen() {
        return colorVisionGreen;
    }

    public void setColorVisionGreen(Boolean colorVisionGreen) {
        this.colorVisionGreen = colorVisionGreen;
    }

    public String getScarsOperations() {
        return scarsOperations;
    }

    public void setScarsOperations(String scarsOperations) {
        this.scarsOperations = scarsOperations;
    }

    public String getVaricoseVeins() {
        return varicoseVeins;
    }

    public void setVaricoseVeins(String varicoseVeins) {
        this.varicoseVeins = varicoseVeins;
    }

    public String getBoneJoint() {
        return boneJoint;
    }

    public void setBoneJoint(String boneJoint) {
        this.boneJoint = boneJoint;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public Double getHemoglobin() {
        return hemoglobin;
    }

    public void setHemoglobin(Double hemoglobin) {
        this.hemoglobin = hemoglobin;
    }

    public String getSpecialistReferral() {
        return specialistReferral;
    }

    public void setSpecialistReferral(String specialistReferral) {
        this.specialistReferral = specialistReferral;
    }

    public String getMedicalCondition() {
        return medicalCondition;
    }

    public void setMedicalCondition(String medicalCondition) {
        this.medicalCondition = medicalCondition;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFitForStudies() {
        return fitForStudies;
    }

    public void setFitForStudies(String fitForStudies) {
        this.fitForStudies = fitForStudies;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDate getDate1() {
        return date1;
    }

    public void setDate1(LocalDate date1) {
        this.date1 = date1;
    }

    public LocalDate getDate2() {
        return date2;
    }

    public void setDate2(LocalDate date2) {
        this.date2 = date2;
    }

    public String getMedicalOfficerSignature() {
        return medicalOfficerSignature;
    }

    public void setMedicalOfficerSignature(String medicalOfficerSignature) {
        this.medicalOfficerSignature = medicalOfficerSignature;
    }

    public String getItumMedicalOfficerSignature() {
        return itumMedicalOfficerSignature;
    }

    public void setItumMedicalOfficerSignature(String itumMedicalOfficerSignature) {
        this.itumMedicalOfficerSignature = itumMedicalOfficerSignature;
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