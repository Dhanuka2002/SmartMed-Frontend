package com.example.demo.repository;

import com.example.demo.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    
    // Find prescriptions by status
    List<Prescription> findByStatusOrderByCreatedDateDesc(String status);
    
    // Find prescriptions by patient ID
    List<Prescription> findByPatientIdOrderByCreatedDateDesc(String patientId);
    
    // Find prescriptions by patient name
    List<Prescription> findByPatientNameContainingIgnoreCaseOrderByCreatedDateDesc(String patientName);
    
    // Find prescriptions by doctor name
    List<Prescription> findByDoctorNameOrderByCreatedDateDesc(String doctorName);
    
    // Find prescriptions by queue number
    Prescription findByQueueNo(String queueNo);
    
    // Find pending prescriptions (for pharmacy queue)
    @Query("SELECT p FROM Prescription p WHERE p.status = 'Pending' ORDER BY p.createdDate ASC")
    List<Prescription> findPendingPrescriptions();
    
    // Find prescriptions in progress
    @Query("SELECT p FROM Prescription p WHERE p.status = 'In Progress' ORDER BY p.updatedDate DESC")
    List<Prescription> findInProgressPrescriptions();
    
    // Find completed prescriptions
    @Query("SELECT p FROM Prescription p WHERE p.status = 'Completed' ORDER BY p.completedDate DESC")
    List<Prescription> findCompletedPrescriptions();
    
    // Find prescriptions by date range
    @Query("SELECT p FROM Prescription p WHERE p.createdDate BETWEEN :startDate AND :endDate ORDER BY p.createdDate DESC")
    List<Prescription> findByCreatedDateBetween(@Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);
    
    // Find prescriptions by multiple statuses
    @Query("SELECT p FROM Prescription p WHERE p.status IN :statuses ORDER BY p.createdDate DESC")
    List<Prescription> findByStatusIn(@Param("statuses") List<String> statuses);
    
    // Search prescriptions by patient name or patient ID
    @Query("SELECT p FROM Prescription p WHERE " +
           "LOWER(p.patientName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.patientId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.studentId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY p.createdDate DESC")
    List<Prescription> searchPrescriptions(@Param("searchTerm") String searchTerm);
    
    // Count prescriptions by status
    @Query("SELECT p.status, COUNT(p) FROM Prescription p GROUP BY p.status")
    List<Object[]> countPrescriptionsByStatus();
    
    // Count prescriptions by doctor
    @Query("SELECT p.doctorName, COUNT(p) FROM Prescription p GROUP BY p.doctorName")
    List<Object[]> countPrescriptionsByDoctor();
    
    // Find recent prescriptions (last 24 hours)
    @Query("SELECT p FROM Prescription p WHERE p.createdDate >= :since ORDER BY p.createdDate DESC")
    List<Prescription> findRecentPrescriptions(@Param("since") LocalDateTime since);
    
    // Find prescriptions with medicines count
    @Query("SELECT p, SIZE(p.prescriptionMedicines) FROM Prescription p ORDER BY p.createdDate DESC")
    List<Object[]> findPrescriptionsWithMedicineCount();
    
    // Find prescriptions dispensed by specific pharmacist
    List<Prescription> findByDispensedByOrderByCompletedDateDesc(String dispensedBy);
}