package com.example.demo.repository;

import com.example.demo.model.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QueueRepository extends JpaRepository<QueueEntry, Long> {
    // You can add custom queries here if needed
}
