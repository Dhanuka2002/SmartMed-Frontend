package com.example.demo.repository;

import com.example.demo.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    
    List<MedicalRecord> findByStudentName(String studentName);
    
    List<MedicalRecord> findByStudentEmail(String studentEmail);
    
    Optional<MedicalRecord> findByStudentEmailAndCreatedAtBetween(
        String studentEmail, 
        java.time.LocalDateTime startDate, 
        java.time.LocalDateTime endDate
    );
    
    Optional<MedicalRecord> findByStudentNameAndCreatedAtBetween(
        String studentName, 
        java.time.LocalDateTime startDate, 
        java.time.LocalDateTime endDate
    );
    
    List<MedicalRecord> findAllByOrderByCreatedAtDesc();
}