package com.example.demo.repository;

import com.example.demo.model.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {

    // Find by queue number
    Optional<QueueEntry> findByQueueNo(String queueNo);

    // Find by stage (reception, doctor, pharmacy, completed)
    List<QueueEntry> findByStageOrderByAddedTimeAsc(String stage);

    // Find by email
    Optional<QueueEntry> findByEmail(String email);

    // Find by NIC
    Optional<QueueEntry> findByNic(String nic);

    // Find by medical record ID
    Optional<QueueEntry> findByMedicalRecordId(String medicalRecordId);

    // Check for duplicates by email, NIC, or medical record ID (only in reception queue)
    @Query("SELECT q FROM QueueEntry q WHERE q.stage = 'reception' AND (q.email = :email OR q.nic = :nic OR q.medicalRecordId = :medicalRecordId)")
    List<QueueEntry> findDuplicates(@Param("email") String email, @Param("nic") String nic, @Param("medicalRecordId") String medicalRecordId);
    
    // Check for any existing entry (across all stages) - for reference
    @Query("SELECT q FROM QueueEntry q WHERE q.email = :email OR q.nic = :nic OR q.medicalRecordId = :medicalRecordId")
    List<QueueEntry> findAnyExistingEntry(@Param("email") String email, @Param("nic") String nic, @Param("medicalRecordId") String medicalRecordId);

    // Find all entries ordered by added time
    List<QueueEntry> findAllByOrderByAddedTimeDesc();

    // Find active entries (not completed)
    @Query("SELECT q FROM QueueEntry q WHERE q.stage != 'completed' ORDER BY q.addedTime ASC")
    List<QueueEntry> findActiveEntries();

    // Find entries by stage and status
    List<QueueEntry> findByStageAndStatusOrderByAddedTimeAsc(String stage, String status);

    // Count entries by stage
    @Query("SELECT COUNT(q) FROM QueueEntry q WHERE q.stage = :stage")
    long countByStage(@Param("stage") String stage);
}