package com.example.demo.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_name", nullable = false)

    private String studentName;

    // Vaccination
    @Column(name = "vaccinated")
    private String vaccinated;

    // Physical Measurements
    @Column(name = "weight")
    private Double weight;

    @Column(name = "height")
    private Double height;

    @Column(name = "chest_inspiration")
    private Double chestInspiration;

    @Column(name = "chest_expiration")
    private Double chestExpiration;

    // Dental Conditions
    @Column(name = "teeth_decayed")
    private Boolean teethDecayed = false;

    @Column(name = "teeth_missing")
    private Boolean teethMissing = false;

    @Column(name = "teeth_dentures")
    private Boolean teethDentures = false;

    @Column(name = "teeth_gingivitis")
    private Boolean teethGingivitis = false;

    // Hearing
    @Column(name = "hearing_right")
    private String hearingRight;

    @Column(name = "hearing_left")
    private String hearingLeft;

    @Column(name = "speech")
    private String speech;

    // Circulation
    @Column(name = "heart_disease")
    private String heartDisease;

    @Column(name = "heart_sound")
    private String heartSound;

    @Column(name = "blood_pressure")
    private String bloodPressure;

    @Column(name = "murmurs")
    private String murmurs;

    @Column(name = "pulse")
    private String pulse;

    // Respiration
    @Column(name = "tuberculosis")
    private String tuberculosis;

    @Column(name = "tuberculosis_test")
    private String tuberculosisTest;

    @Column(name = "xray_chest")
    private String xrayChest;

    @Column(name = "xray_no")
    private String xrayNo;

    @Column(name = "xray_findings", columnDefinition = "TEXT")
    private String xrayFindings;

    @Column(name = "xray_date")
    private LocalDate xrayDate;

    // Nervous Functions
    @Column(name = "convulsion")
    private String convulsion;

    @Column(name = "knee_jerks")
    private String kneeJerks;

    // Abdomen
    @Column(name = "liver_spleen")
    private String liverSpleen;

    @Column(name = "hemorrhoids")
    private String hemorrhoids;

    @Column(name = "hernial_orifices")
    private String hernialOrifices;

    // Vision
    @Column(name = "vision_right_without")
    private String visionRightWithout;

    @Column(name = "vision_left_without")
    private String visionLeftWithout;

    @Column(name = "vision_right_with")
    private String visionRightWith;

    @Column(name = "vision_left_with")
    private String visionLeftWith;

    @Column(name = "color_vision_normal")
    private Boolean colorVisionNormal = true;

    @Column(name = "color_vision_red")
    private Boolean colorVisionRed = false;

    @Column(name = "color_vision_green")
    private Boolean colorVisionGreen = false;

    // Extremities
    @Column(name = "scars_operations")
    private String scarsOperations;

    @Column(name = "varicose_veins")
    private String varicoseVeins;

    @Column(name = "bone_joint")
    private String boneJoint;

    // Clinical Tests
    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "hemoglobin")
    private Double hemoglobin;

    // Specialist Referral
    @Column(name = "specialist_referral")
    private String specialistReferral;

    @Column(name = "condition", columnDefinition = "TEXT")
    private String condition;

    // Final Assessment
    @Column(name = "fit_for_studies")
    private String fitForStudies;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    // Audit fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public MedicalRecord() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getVaccinated() { return vaccinated; }
    public void setVaccinated(String vaccinated) { this.vaccinated = vaccinated; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Double getChestInspiration() { return chestInspiration; }
    public void setChestInspiration(Double chestInspiration) { this.chestInspiration = chestInspiration; }

    public Double getChestExpiration() { return chestExpiration; }
    public void setChestExpiration(Double chestExpiration) { this.chestExpiration = chestExpiration; }

    public Boolean getTeethDecayed() { return teethDecayed; }
    public void setTeethDecayed(Boolean teethDecayed) { this.teethDecayed = teethDecayed; }

    public Boolean getTeethMissing() { return teethMissing; }
    public void setTeethMissing(Boolean teethMissing) { this.teethMissing = teethMissing; }

    public Boolean getTeethDentures() { return teethDentures; }
    public void setTeethDentures(Boolean teethDentures) { this.teethDentures = teethDentures; }

    public Boolean getTeethGingivitis() { return teethGingivitis; }
    public void setTeethGingivitis(Boolean teethGingivitis) { this.teethGingivitis = teethGingivitis; }

    public String getHearingRight() { return hearingRight; }
    public void setHearingRight(String hearingRight) { this.hearingRight = hearingRight; }

    public String getHearingLeft() { return hearingLeft; }
    public void setHearingLeft(String hearingLeft) { this.hearingLeft = hearingLeft; }

    public String getSpeech() { return speech; }
    public void setSpeech(String speech) { this.speech = speech; }

    public String getHeartDisease() { return heartDisease; }
    public void setHeartDisease(String heartDisease) { this.heartDisease = heartDisease; }

    public String getHeartSound() { return heartSound; }
    public void setHeartSound(String heartSound) { this.heartSound = heartSound; }

    public String getBloodPressure() { return bloodPressure; }
    public void setBloodPressure(String bloodPressure) { this.bloodPressure = bloodPressure; }

    public String getMurmurs() { return murmurs; }
    public void setMurmurs(String murmurs) { this.murmurs = murmurs; }

    public String getPulse() { return pulse; }
    public void setPulse(String pulse) { this.pulse = pulse; }

    public String getTuberculosis() { return tuberculosis; }
    public void setTuberculosis(String tuberculosis) { this.tuberculosis = tuberculosis; }

    public String getTuberculosisTest() { return tuberculosisTest; }
    public void setTuberculosisTest(String tuberculosisTest) { this.tuberculosisTest = tuberculosisTest; }

    public String getXrayChest() { return xrayChest; }
    public void setXrayChest(String xrayChest) { this.xrayChest = xrayChest; }

    public String getXrayNo() { return xrayNo; }
    public void setXrayNo(String xrayNo) { this.xrayNo = xrayNo; }

    public String getXrayFindings() { return xrayFindings; }
    public void setXrayFindings(String xrayFindings) { this.xrayFindings = xrayFindings; }

    public LocalDate getXrayDate() { return xrayDate; }
    public void setXrayDate(LocalDate xrayDate) { this.xrayDate = xrayDate; }

    public String getConvulsion() { return convulsion; }
    public void setConvulsion(String convulsion) { this.convulsion = convulsion; }

    public String getKneeJerks() { return kneeJerks; }
    public void setKneeJerks(String kneeJerks) { this.kneeJerks = kneeJerks; }

    public String getLiverSpleen() { return liverSpleen; }
    public void setLiverSpleen(String liverSpleen) { this.liverSpleen = liverSpleen; }

    public String getHemorrhoids() { return hemorrhoids; }
    public void setHemorrhoids(String hemorrhoids) { this.hemorrhoids = hemorrhoids; }

    public String getHernialOrifices() { return hernialOrifices; }
    public void setHernialOrifices(String hernialOrifices) { this.hernialOrifices = hernialOrifices; }

    public String getVisionRightWithout() { return visionRightWithout; }
    public void setVisionRightWithout(String visionRightWithout) { this.visionRightWithout = visionRightWithout; }

    public String getVisionLeftWithout() { return visionLeftWithout; }
    public void setVisionLeftWithout(String visionLeftWithout) { this.visionLeftWithout = visionLeftWithout; }

    public String getVisionRightWith() { return visionRightWith; }
    public void setVisionRightWith(String visionRightWith) { this.visionRightWith = visionRightWith; }

    public String getVisionLeftWith() { return visionLeftWith; }
    public void setVisionLeftWith(String visionLeftWith) { this.visionLeftWith = visionLeftWith; }

    public Boolean getColorVisionNormal() { return colorVisionNormal; }
    public void setColorVisionNormal(Boolean colorVisionNormal) { this.colorVisionNormal = colorVisionNormal; }

    public Boolean getColorVisionRed() { return colorVisionRed; }
    public void setColorVisionRed(Boolean colorVisionRed) { this.colorVisionRed = colorVisionRed; }

    public Boolean getColorVisionGreen() { return colorVisionGreen; }
    public void setColorVisionGreen(Boolean colorVisionGreen) { this.colorVisionGreen = colorVisionGreen; }

    public String getScarsOperations() { return scarsOperations; }
    public void setScarsOperations(String scarsOperations) { this.scarsOperations = scarsOperations; }

    public String getVaricoseVeins() { return varicoseVeins; }
    public void setVaricoseVeins(String varicoseVeins) { this.varicoseVeins = varicoseVeins; }

    public String getBoneJoint() { return boneJoint; }
    public void setBoneJoint(String boneJoint) { this.boneJoint = boneJoint; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public Double getHemoglobin() { return hemoglobin; }
    public void setHemoglobin(Double hemoglobin) { this.hemoglobin = hemoglobin; }

    public String getSpecialistReferral() { return specialistReferral; }
    public void setSpecialistReferral(String specialistReferral) { this.specialistReferral = specialistReferral; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getFitForStudies() { return fitForStudies; }
    public void setFitForStudies(String fitForStudies) { this.fitForStudies = fitForStudies; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
