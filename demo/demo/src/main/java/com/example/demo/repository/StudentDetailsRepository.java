package com.example.demo.repository;

import com.example.demo.model.StudentDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentDetailsRepository extends JpaRepository<StudentDetails, Long> {
    
    List<StudentDetails> findAllByOrderByCreatedAtDesc();
    
    Optional<StudentDetails> findByStudentRegistrationNumber(String studentRegistrationNumber);
    
    Optional<StudentDetails> findByNic(String nic);
    
    List<StudentDetails> findByFullNameContainingIgnoreCase(String name);
    
    Optional<StudentDetails> findByEmail(String email);
    
    List<StudentDetails> findByAcademicDivision(String academicDivision);
}