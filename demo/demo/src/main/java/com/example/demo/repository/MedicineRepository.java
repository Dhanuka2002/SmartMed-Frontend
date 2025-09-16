package com.example.demo.repository;

import com.example.demo.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    
    // Find medicines by name (case insensitive, partial match)
    List<Medicine> findByNameContainingIgnoreCase(String name);
    
    // Find medicines by category
    List<Medicine> findByCategory(String category);
    
    // Find medicines by category (case insensitive)
    List<Medicine> findByCategoryIgnoreCase(String category);
    
    // Find medicines with low stock (quantity <= minStock)
    @Query("SELECT m FROM Medicine m WHERE m.quantity <= m.minStock")
    List<Medicine> findLowStockMedicines();
    
    // Find expired medicines
    @Query("SELECT m FROM Medicine m WHERE m.expiry < :currentDate")
    List<Medicine> findExpiredMedicines(@Param("currentDate") LocalDate currentDate);
    
    // Find medicines near expiry (within next 30 days)
    @Query("SELECT m FROM Medicine m WHERE m.expiry BETWEEN :currentDate AND :futureDate")
    List<Medicine> findNearExpiryMedicines(@Param("currentDate") LocalDate currentDate, 
                                          @Param("futureDate") LocalDate futureDate);
    
    // Find medicines by dosage
    List<Medicine> findByDosageContainingIgnoreCase(String dosage);
    
    // Find medicines by batch number
    Medicine findByBatchNumber(String batchNumber);
    
    // Find all categories (distinct)
    @Query("SELECT DISTINCT m.category FROM Medicine m ORDER BY m.category")
    List<String> findAllCategories();
    
    // Search medicines by name, category, or dosage
    @Query("SELECT m FROM Medicine m WHERE " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.category) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.dosage) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Medicine> searchMedicines(@Param("searchTerm") String searchTerm);
    
    // Count medicines by category
    @Query("SELECT m.category, COUNT(m) FROM Medicine m GROUP BY m.category")
    List<Object[]> countMedicinesByCategory();
    
    // Find medicines with quantity greater than specified amount
    @Query("SELECT m FROM Medicine m WHERE m.quantity > :quantity")
    List<Medicine> findAvailableMedicines(@Param("quantity") Integer quantity);
    
    // Get total inventory value (if price field is added later)
    @Query("SELECT COUNT(m), SUM(m.quantity) FROM Medicine m")
    Object[] getInventoryStats();
}