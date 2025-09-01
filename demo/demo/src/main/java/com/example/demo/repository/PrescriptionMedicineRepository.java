package com.example.demo.repository;

import com.example.demo.entity.PrescriptionMedicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionMedicineRepository extends JpaRepository<PrescriptionMedicine, Long> {
    
    // Find medicines by prescription ID
    List<PrescriptionMedicine> findByPrescriptionIdOrderByCreatedDateAsc(Long prescriptionId);
    
    // Find medicines by prescription ID and status
    List<PrescriptionMedicine> findByPrescriptionIdAndStatus(Long prescriptionId, String status);
    
    // Find medicines by medicine name
    List<PrescriptionMedicine> findByMedicineNameContainingIgnoreCase(String medicineName);
    
    // Find medicines by medicine ID
    List<PrescriptionMedicine> findByMedicineId(Long medicineId);
    
    // Find medicines by status
    List<PrescriptionMedicine> findByStatusOrderByCreatedDateDesc(String status);
    
    // Find pending medicines across all prescriptions
    @Query("SELECT pm FROM PrescriptionMedicine pm WHERE pm.status = 'Pending' ORDER BY pm.createdDate ASC")
    List<PrescriptionMedicine> findPendingMedicines();
    
    // Find medicines that are out of stock
    @Query("SELECT pm FROM PrescriptionMedicine pm WHERE pm.status = 'Out of Stock' ORDER BY pm.createdDate ASC")
    List<PrescriptionMedicine> findOutOfStockMedicines();
    
    // Find partially dispensed medicines
    @Query("SELECT pm FROM PrescriptionMedicine pm WHERE pm.status = 'Partially Dispensed' ORDER BY pm.createdDate ASC")
    List<PrescriptionMedicine> findPartiallyDispensedMedicines();
    
    // Count medicines by status for a prescription
    @Query("SELECT pm.status, COUNT(pm) FROM PrescriptionMedicine pm WHERE pm.prescription.id = :prescriptionId GROUP BY pm.status")
    List<Object[]> countMedicinesByStatusForPrescription(@Param("prescriptionId") Long prescriptionId);
    
    // Get total quantity for a medicine across all prescriptions
    @Query("SELECT pm.medicineName, SUM(pm.quantity), SUM(pm.dispensedQuantity) " +
           "FROM PrescriptionMedicine pm " +
           "WHERE pm.medicineName = :medicineName " +
           "GROUP BY pm.medicineName")
    List<Object[]> getMedicineTotalQuantities(@Param("medicineName") String medicineName);
    
    // Find medicines that need specific medicine from inventory
    @Query("SELECT pm FROM PrescriptionMedicine pm " +
           "WHERE pm.medicineId = :medicineId AND pm.status IN ('Pending', 'Partially Dispensed') " +
           "ORDER BY pm.createdDate ASC")
    List<PrescriptionMedicine> findPendingMedicinesByInventoryId(@Param("medicineId") Long medicineId);
    
    // Get medicine usage statistics
    @Query("SELECT pm.medicineName, COUNT(pm), SUM(pm.quantity), AVG(pm.quantity) " +
           "FROM PrescriptionMedicine pm " +
           "GROUP BY pm.medicineName " +
           "ORDER BY COUNT(pm) DESC")
    List<Object[]> getMedicineUsageStatistics();
    
    // Find medicines with insufficient dispensed quantity
    @Query("SELECT pm FROM PrescriptionMedicine pm " +
           "WHERE pm.quantity > pm.dispensedQuantity " +
           "ORDER BY pm.createdDate ASC")
    List<PrescriptionMedicine> findIncompleteMedicines();
    
    // Count medicines by prescription status
    @Query("SELECT p.status, COUNT(pm) FROM PrescriptionMedicine pm " +
           "JOIN pm.prescription p " +
           "GROUP BY p.status")
    List<Object[]> countMedicinesByPrescriptionStatus();
}