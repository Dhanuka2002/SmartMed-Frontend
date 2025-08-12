package com.example.demo.repository;
import com.example.demo.model.PrescriptionQueue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionQueueRepository extends JpaRepository<PrescriptionQueue, Long> {
}
