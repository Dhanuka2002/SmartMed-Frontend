package com.example.demo.repository;

import com.example.demo.model.AmbulanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AmbulanceRequestRepository extends JpaRepository<AmbulanceRequest, Long> {
}
