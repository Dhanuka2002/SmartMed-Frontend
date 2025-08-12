package com.example.demo.repository;

import com.example.demo.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    // Find records by student name
    List<MedicalRecord> findByStudentNameContainingIgnoreCase(String studentName);

    // Find records by fitness status
    List<MedicalRecord> findByFitForStudies(String fitForStudies);

    // Find records by blood group
    List<MedicalRecord> findByBloodGroup(String bloodGroup);

    // Custom query to find students with specific conditions
    @Query("SELECT m FROM MedicalRecord m WHERE " +
            "m.heartDisease = :condition OR " +
            "m.tuberculosis = :condition OR " +
            "m.convulsion = :condition")
    List<MedicalRecord> findByMedicalCondition(@Param("condition") String condition);

    // Find recent records (useful for dashboard)
    @Query("SELECT m FROM MedicalRecord m ORDER BY m.createdAt DESC")
    List<MedicalRecord> findRecentRecords();
}