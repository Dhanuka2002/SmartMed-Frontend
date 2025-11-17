package com.example.demo.repository;

import com.example.demo.model.StudentDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for StudentDetails entity management.
 * 
 * <p>This repository interface provides database access methods for student medical records.
 * It extends {@link JpaRepository} which provides standard CRUD operations and additional
 * query methods for the StudentDetails entity.</p>
 * 
 * <p>Key Features:</p>
 * <ul>
 *   <li><strong>Inherited CRUD Operations:</strong> save(), findById(), findAll(), delete(), etc.</li>
 *   <li><strong>Custom Query Methods:</strong> Derived queries using Spring Data JPA naming conventions</li>
 *   <li><strong>Automatic Implementation:</strong> Spring generates implementation at runtime</li>
 *   <li><strong>Type Safety:</strong> Generic parameters (StudentDetails, Long) ensure compile-time type checking</li>
 * </ul>
 * 
 * <p>Query Method Naming Convention:</p>
 * <ul>
 *   <li><code>findBy[Property]</code> - Retrieves entities matching the property value</li>
 *   <li><code>findBy[Property]Containing</code> - Performs substring search (LIKE query)</li>
 *   <li><code>findBy[Property]IgnoreCase</code> - Case-insensitive search</li>
 *   <li><code>findAllByOrderBy[Property]Desc</code> - Retrieves all records sorted descending</li>
 * </ul>
 * 
 * <p>Usage Example:</p>
 * <pre>
 * {@literal @}Autowired
 * private StudentDetailsRepository repository;
 * 
 * // Find by registration number
 * Optional&lt;StudentDetails&gt; student = repository.findByStudentRegistrationNumber("2020/CS/001");
 * 
 * // Search by name
 * List&lt;StudentDetails&gt; results = repository.findByFullNameContainingIgnoreCase("john");
 * </pre>
 * 
 * @author SmartMed Development Team
 * @version 1.0
 * @since 2024
 * @see StudentDetails
 * @see com.example.demo.controller.StudentDetailsController
 * @see JpaRepository
 */
@Repository
public interface StudentDetailsRepository extends JpaRepository<StudentDetails, Long> {
    
    /**
     * Retrieves all student details ordered by creation date in descending order.
     * 
     * <p>This method returns the most recently created student records first,
     * which is useful for displaying recent registrations or activity.</p>
     * 
     * <p>Query Translation:</p>
     * <pre>SELECT * FROM student_details ORDER BY created_at DESC</pre>
     * 
     * @return List of all StudentDetails entities sorted by createdAt (newest first).
     *         Returns empty list if no records exist.
     */
    List<StudentDetails> findAllByOrderByCreatedAtDesc();
    
    /**
     * Finds a student by their unique registration number.
     * 
     * <p>Registration numbers are expected to be unique per student, so this method
     * returns an Optional containing either the matching student or empty if not found.</p>
     * 
     * <p>Query Translation:</p>
     * <pre>SELECT * FROM student_details WHERE student_registration_number = ?</pre>
     * 
     * <p>Usage:</p>
     * <pre>
     * Optional&lt;StudentDetails&gt; student = repository.findByStudentRegistrationNumber("2020/CS/001");
     * if (student.isPresent()) {
     *     // Process student data
     * }
     * </pre>
     * 
     * @param studentRegistrationNumber The unique registration number (e.g., "2020/CS/001")
     * @return Optional containing the StudentDetails if found, empty Optional otherwise
     */
    Optional<StudentDetails> findByStudentRegistrationNumber(String studentRegistrationNumber);
    
    /**
     * Finds a student by their National Identity Card (NIC) number.
     * 
     * <p>NIC numbers are unique government-issued identifiers, so this method
     * returns an Optional for a single match or empty if not found.</p>
     * 
     * <p>Query Translation:</p>
     * <pre>SELECT * FROM student_details WHERE nic = ?</pre>
     * 
     * <p>Supported NIC Formats:</p>
     * <ul>
     *   <li>Old format: 9 digits + V (e.g., "991234567V")</li>
     *   <li>New format: 12 digits (e.g., "199912345678")</li>
     * </ul>
     * 
     * @param nic The National Identity Card number
     * @return Optional containing the StudentDetails if found, empty Optional otherwise
     */
    Optional<StudentDetails> findByNic(String nic);
    
    /**
     * Searches for students whose full name contains the specified string (case-insensitive).
     * 
     * <p>This method performs a partial, case-insensitive substring match, making it
     * ideal for search functionality where users may not know the exact name spelling.</p>
     * 
     * <p>Query Translation:</p>
     * <pre>SELECT * FROM student_details WHERE LOWER(full_name) LIKE LOWER(CONCAT('%', ?, '%'))</pre>
     * 
     * <p>Search Examples:</p>
     * <ul>
     *   <li>Search "john" matches: "John Doe", "Johnny Smith", "john williams"</li>
     *   <li>Search "silva" matches: "Silva Perera", "De Silva", "SILVA"</li>
     * </ul>
     * 
     * @param name The search term (partial name allowed, case-insensitive)
     * @return List of StudentDetails with matching names. Returns empty list if no matches found.
     */
    List<StudentDetails> findByFullNameContainingIgnoreCase(String name);
    
    /**
     * Finds a student by their email address.
     * 
     * <p>Email addresses should be unique per student for communication purposes.
     * This method is useful for login systems or email-based lookups.</p>
     * 
     * <p>Query Translation:</p>
     * <pre>SELECT * FROM student_details WHERE email = ?</pre>
     * 
     * <p>Note: Email comparison is case-sensitive by default. Consider adding
     * IgnoreCase suffix if case-insensitive matching is needed.</p>
     * 
     * @param email The student's email address
     * @return Optional containing the StudentDetails if found, empty Optional otherwise
     */
    Optional<StudentDetails> findByEmail(String email);
    
    /**
     * Retrieves all students belonging to a specific academic division.
     * 
     * <p>This method is useful for generating division-wise reports, filtering
     * students by department, or managing students within specific academic units.</p>
     * 
     * <p>Query Translation:</p>
     * <pre>SELECT * FROM student_details WHERE academic_division = ?</pre>
     * 
     * <p>Example Academic Divisions:</p>
     * <ul>
     *   <li>"Computer Science"</li>
     *   <li>"Engineering"</li>
     *   <li>"Medicine"</li>
     *   <li>"Business Administration"</li>
     * </ul>
     * 
     * @param academicDivision The academic division/department name (exact match, case-sensitive)
     * @return List of StudentDetails in the specified division. Returns empty list if none found.
     */
    List<StudentDetails> findByAcademicDivision(String academicDivision);
}