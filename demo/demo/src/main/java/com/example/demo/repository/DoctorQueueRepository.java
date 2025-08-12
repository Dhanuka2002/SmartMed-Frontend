package com.example.demo.repository;

import com.example.demo.model.DoctorQueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorQueueRepository extends JpaRepository<DoctorQueueEntry, Long> {
}
