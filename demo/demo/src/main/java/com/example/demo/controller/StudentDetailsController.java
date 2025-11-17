package com.example.demo.controller;

import com.example.demo.model.StudentDetails;
import com.example.demo.repository.StudentDetailsRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * REST Controller for managing student details in the SmartMed system.
 * 
 * <p>This controller provides comprehensive CRUD operations for student medical records,
 * including personal information, emergency contacts, medical history, family history,
 * vaccinations, and profile images.</p>
 * 
 * <p>Key Features:</p>
 * <ul>
 *   <li>Create and save student details with validation</li>
 *   <li>Retrieve student information by ID, NIC, registration number, or email</li>
 *   <li>Update existing student records</li>
 *   <li>Delete student records</li>
 *   <li>Search students by name</li>
 *   <li>Manage profile images</li>
 *   <li>Handle complex JSON data structures (medical history, vaccinations)</li>
 * </ul>
 * 
 * <p>All endpoints support CORS for cross-origin requests.</p>
 * 
 * @author 
 * @version 1.0
 * @since 2024
 */
@RestController
@RequestMapping("/api/student-details")
@CrossOrigin(origins = "*")
public class StudentDetailsController {

    /**
     * Repository for performing database operations on StudentDetails entities.
     * Provides methods for CRUD operations and custom queries.
     */
    @Autowired
    private StudentDetailsRepository studentDetailsRepository;

    /**
     * Jackson ObjectMapper for converting complex objects (family history, medical history,
     * vaccinations) to/from JSON strings for database storage.
     */
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Saves new student details to the database.
     * 
     * <p>This endpoint performs the following operations:</p>
     * <ol>
     *   <li>Validates required fields (fullName, NIC, studentRegistrationNumber)</li>
     *   <li>Checks for duplicate registration numbers</li>
     *   <li>Maps all student information from request body</li>
     *   <li>Converts complex objects (family history, medical history, vaccinations) to JSON</li>
     *   <li>Saves the record to the database</li>
     * </ol>
     * 
     * @param requestData Map containing all student information including:
     *                    - Basic info: fullName, NIC, studentRegistrationNumber, academicDivision, email
     *                    - Personal details: dateOfBirth, gender, age, nationality, address, etc.
     *                    - Emergency contact: emergencyName, emergencyTelephone, emergencyAddress, emergencyRelationship
     *                    - Medical data: familyHistory, medicalHistory, vaccinations (as complex objects)
     *                    - Profile image: profileImage (base64 encoded string)
     * @return ResponseEntity containing:
     *         - Success: status="success", message, studentId
     *         - Error: status="error", message with error details
     * @throws Exception if database operation fails or JSON conversion fails
     */
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveStudentDetails(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Initialize new student details entity
            StudentDetails studentDetails = new StudentDetails();
            
            // ===== SECTION 1: Basic Information =====
            // Extract and set core student identification fields
            studentDetails.setFullName((String) requestData.get("fullName"));
            studentDetails.setNic((String) requestData.get("nic"));
            studentDetails.setStudentRegistrationNumber((String) requestData.get("studentRegistrationNumber"));
            studentDetails.setAcademicDivision((String) requestData.get("academicDivision"));
            studentDetails.setEmail((String) requestData.get("email"));

            // ===== VALIDATION: Required Fields =====
            // Validate full name - required for student identification
            if (studentDetails.getFullName() == null || studentDetails.getFullName().trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Full name is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate NIC - required for legal identification
            if (studentDetails.getNic() == null || studentDetails.getNic().trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "NIC is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate registration number - must be unique and non-empty
            if (studentDetails.getStudentRegistrationNumber() == null || studentDetails.getStudentRegistrationNumber().trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Student registration number is required");
                return ResponseEntity.badRequest().body(response);
            }

            // ===== VALIDATION: Duplicate Check =====
            // Ensure no duplicate registration numbers exist in the system
            Optional<StudentDetails> existingStudent = studentDetailsRepository.findByStudentRegistrationNumber(
                studentDetails.getStudentRegistrationNumber());
            
            if (existingStudent.isPresent()) {
                response.put("status", "error");
                response.put("message", "Student with this registration number already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // ===== SECTION 2: Personal Details =====
            // Parse date of birth from string format (ISO 8601: YYYY-MM-DD)
            String dateOfBirthStr = (String) requestData.get("dateOfBirth");
            if (dateOfBirthStr != null && !dateOfBirthStr.isEmpty()) {
                studentDetails.setDateOfBirth(LocalDate.parse(dateOfBirthStr));
            }
            
            // Set family and social information
            studentDetails.setPositionOfFamily((String) requestData.get("positionOfFamily"));
            studentDetails.setGender((String) requestData.get("gender"));
            studentDetails.setLastAttendSchool((String) requestData.get("lastAttendSchool"));
            studentDetails.setReligion((String) requestData.get("religion"));
            studentDetails.setOccupationOfFather((String) requestData.get("occupationOfFather"));
            studentDetails.setSingleMarried((String) requestData.get("singleMarried"));
            studentDetails.setOccupationOfMother((String) requestData.get("occupationOfMother"));
            
            // Parse age safely - handle both String and Integer types
            Object ageObj = requestData.get("age");
            if (ageObj != null && !ageObj.toString().isEmpty()) {
                studentDetails.setAge(Integer.parseInt(ageObj.toString()));
            }
            
            // Set contact and location information
            studentDetails.setHomeAddress((String) requestData.get("homeAddress"));
            studentDetails.setNationality((String) requestData.get("nationality"));
            studentDetails.setTelephoneNumber((String) requestData.get("telephoneNumber"));
            studentDetails.setExtraCurricularActivities((String) requestData.get("extraCurricularActivities"));

            // ===== SECTION 3: Emergency Contact =====
            // Store emergency contact details for critical situations
            studentDetails.setEmergencyName((String) requestData.get("emergencyName"));
            studentDetails.setEmergencyTelephone((String) requestData.get("emergencyTelephone"));
            studentDetails.setEmergencyAddress((String) requestData.get("emergencyAddress"));
            studentDetails.setEmergencyRelationship((String) requestData.get("emergencyRelationship"));

            // ===== SECTION 4: Complex Medical Data =====
            // Convert complex nested objects to JSON strings for database storage
            // Family history: genetic conditions, hereditary diseases
            if (requestData.get("familyHistory") != null) {
                studentDetails.setFamilyHistory(objectMapper.writeValueAsString(requestData.get("familyHistory")));
            }

            // Medical history: past illnesses, surgeries, chronic conditions
            if (requestData.get("medicalHistory") != null) {
                studentDetails.setMedicalHistory(objectMapper.writeValueAsString(requestData.get("medicalHistory")));
            }

            // Vaccinations: immunization records with dates and types
            if (requestData.get("vaccinations") != null) {
                studentDetails.setVaccinations(objectMapper.writeValueAsString(requestData.get("vaccinations")));
            }

            // ===== SECTION 5: Profile Image =====
            // Store base64-encoded profile image for student identification
            studentDetails.setProfileImage((String) requestData.get("profileImage"));

            // ===== DATABASE OPERATION =====
            // Persist student details to database and retrieve generated ID
            StudentDetails savedDetails = studentDetailsRepository.save(studentDetails);
            
            // Build success response with student ID for future references
            response.put("status", "success");
            response.put("message", "Student details saved successfully");
            response.put("studentId", savedDetails.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Handle any errors during save operation (validation, JSON conversion, database errors)
            response.put("status", "error");
            response.put("message", "Failed to save student details: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Retrieves all student details from the database.
     * 
     * <p>Results are ordered by creation date in descending order (newest first).</p>
     * 
     * @return ResponseEntity containing:
     *         - Success: List of all StudentDetails entities
     *         - Error: Empty list with 500 status code
     */
    @GetMapping("/all")
    public ResponseEntity<List<StudentDetails>> getAllStudentDetails() {
        try {
            List<StudentDetails> students = studentDetailsRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    /**
     * Retrieves student details by registration number.
     * 
     * @param registrationNumber The unique student registration number (e.g., "2020/CS/001")
     * @return ResponseEntity containing:
     *         - Success (200): StudentDetails entity
     *         - Not Found (404): Student with given registration number doesn't exist
     *         - Error (500): Database or server error
     */
    @GetMapping("/registration/{registrationNumber}")
    public ResponseEntity<StudentDetails> getStudentByRegistrationNumber(@PathVariable String registrationNumber) {
        try {
            Optional<StudentDetails> student = studentDetailsRepository.findByStudentRegistrationNumber(registrationNumber);
            if (student.isPresent()) {
                return ResponseEntity.ok(student.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Retrieves student details by National Identity Card (NIC) number.
     * 
     * @param nic The NIC number (e.g., "200012345678" or "991234567V")
     * @return ResponseEntity containing:
     *         - Success (200): StudentDetails entity
     *         - Not Found (404): Student with given NIC doesn't exist
     *         - Error (500): Database or server error
     */
    @GetMapping("/nic/{nic}")
    public ResponseEntity<StudentDetails> getStudentByNic(@PathVariable String nic) {
        try {
            Optional<StudentDetails> student = studentDetailsRepository.findByNic(nic);
            if (student.isPresent()) {
                return ResponseEntity.ok(student.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Searches for students by name (case-insensitive partial match).
     * 
     * <p>Performs a case-insensitive substring search on the fullName field.</p>
     * <p>Example: searching "john" will match "John Doe", "Johnny Smith", "john williams"</p>
     * 
     * @param name The search term (partial name allowed)
     * @return ResponseEntity containing:
     *         - Success: List of matching StudentDetails (empty list if no matches)
     *         - Error (500): Empty list with error status
     */
    @GetMapping("/search/{name}")
    public ResponseEntity<List<StudentDetails>> searchStudentsByName(@PathVariable String name) {
        try {
            List<StudentDetails> students = studentDetailsRepository.findByFullNameContainingIgnoreCase(name);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    /**
     * Retrieves student details by database ID.
     * 
     * @param id The unique database identifier (primary key)
     * @return ResponseEntity containing:
     *         - Success (200): StudentDetails entity
     *         - Not Found (404): Student with given ID doesn't exist
     *         - Error (500): Database or server error
     */
    @GetMapping("/{id}")
    public ResponseEntity<StudentDetails> getStudentDetailsById(@PathVariable Long id) {
        try {
            Optional<StudentDetails> student = studentDetailsRepository.findById(id);
            if (student.isPresent()) {
                return ResponseEntity.ok(student.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Updates existing student details.
     * 
     * <p>This endpoint performs a partial update - only fields present in the request
     * body will be updated. Missing fields will retain their current values.</p>
     * 
     * <p>Updatable fields include:</p>
     * <ul>
     *   <li>Basic info: fullName, NIC, academicDivision, email</li>
     *   <li>Personal details: dateOfBirth, gender, age, positionOfFamily</li>
     *   <li>Emergency contact: emergencyName, emergencyTelephone</li>
     *   <li>Medical data: familyHistory, medicalHistory, vaccinations</li>
     *   <li>Profile image: profileImage</li>
     * </ul>
     * 
     * @param id The database ID of the student to update
     * @param requestData Map containing fields to update (partial update supported)
     * @return ResponseEntity containing:
     *         - Success: status="success", message, studentId
     *         - Not Found (404): Student doesn't exist
     *         - Error (500): status="error", message with error details
     * @throws Exception if JSON conversion or database operation fails
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateStudentDetails(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> requestData) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Retrieve existing student record from database
            Optional<StudentDetails> existingStudent = studentDetailsRepository.findById(id);
            
            if (!existingStudent.isPresent()) {
                response.put("status", "error");
                response.put("message", "Student details not found");
                return ResponseEntity.notFound().build();
            }
            
            StudentDetails studentDetails = existingStudent.get();
            
            // ===== UPDATE: Basic Fields =====
            // Only update fields that are present in the request (partial update)
            if (requestData.containsKey("fullName")) {
                studentDetails.setFullName((String) requestData.get("fullName"));
            }
            if (requestData.containsKey("nic")) {
                studentDetails.setNic((String) requestData.get("nic"));
            }
            if (requestData.containsKey("academicDivision")) {
                studentDetails.setAcademicDivision((String) requestData.get("academicDivision"));
            }
            if (requestData.containsKey("email")) {
                studentDetails.setEmail((String) requestData.get("email"));
            }
            
            // ===== UPDATE: Personal Details =====
            // Parse and update date of birth if provided
            if (requestData.containsKey("dateOfBirth")) {
                String dateOfBirthStr = (String) requestData.get("dateOfBirth");
                if (dateOfBirthStr != null && !dateOfBirthStr.isEmpty()) {
                    studentDetails.setDateOfBirth(LocalDate.parse(dateOfBirthStr));
                }
            }
            
            if (requestData.containsKey("positionOfFamily")) {
                studentDetails.setPositionOfFamily((String) requestData.get("positionOfFamily"));
            }
            if (requestData.containsKey("gender")) {
                studentDetails.setGender((String) requestData.get("gender"));
            }
            if (requestData.containsKey("age")) {
                Object ageObj = requestData.get("age");
                if (ageObj != null && !ageObj.toString().isEmpty()) {
                    studentDetails.setAge(Integer.parseInt(ageObj.toString()));
                }
            }
            
            // ===== UPDATE: Emergency Contact =====
            // Update emergency contact information if provided
            if (requestData.containsKey("emergencyName")) {
                studentDetails.setEmergencyName((String) requestData.get("emergencyName"));
            }
            if (requestData.containsKey("emergencyTelephone")) {
                studentDetails.setEmergencyTelephone((String) requestData.get("emergencyTelephone"));
            }
            
            // ===== UPDATE: Complex Medical Data =====
            // Convert and update complex nested objects to JSON strings
            if (requestData.containsKey("familyHistory") && requestData.get("familyHistory") != null) {
                studentDetails.setFamilyHistory(objectMapper.writeValueAsString(requestData.get("familyHistory")));
            }
            
            if (requestData.containsKey("medicalHistory") && requestData.get("medicalHistory") != null) {
                studentDetails.setMedicalHistory(objectMapper.writeValueAsString(requestData.get("medicalHistory")));
            }
            
            // Update vaccinations array - supports new vaccination entries
            if (requestData.containsKey("vaccinations") && requestData.get("vaccinations") != null) {
                studentDetails.setVaccinations(objectMapper.writeValueAsString(requestData.get("vaccinations")));
            }
            
            // ===== UPDATE: Profile Image =====
            // Update base64-encoded profile image if provided
            if (requestData.containsKey("profileImage")) {
                studentDetails.setProfileImage((String) requestData.get("profileImage"));
            }
            
            // Persist updated student details to database
            StudentDetails updatedDetails = studentDetailsRepository.save(studentDetails);
            
            // Build success response
            response.put("status", "success");
            response.put("message", "Student details updated successfully");
            response.put("studentId", updatedDetails.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Handle errors during update (JSON conversion, database errors)
            response.put("status", "error");
            response.put("message", "Failed to update student details: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Retrieves student profile image by registration number.
     * 
     * <p>This endpoint is optimized for quick profile image retrieval without
     * loading all student details.</p>
     * 
     * @param registrationNumber The unique student registration number
     * @return ResponseEntity containing:
     *         - Success: status="success", profileImage (base64), fullName
     *         - Not Found (404): status="error", message="Student not found"
     *         - Error (500): status="error", message with error details
     */
    @GetMapping("/profile-image/registration/{registrationNumber}")
    public ResponseEntity<Map<String, Object>> getStudentProfileImage(@PathVariable String registrationNumber) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<StudentDetails> student = studentDetailsRepository.findByStudentRegistrationNumber(registrationNumber);
            if (student.isPresent()) {
                StudentDetails studentDetails = student.get();
                response.put("status", "success");
                response.put("profileImage", studentDetails.getProfileImage());
                response.put("fullName", studentDetails.getFullName());
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "Student not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to fetch profile image: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Retrieves student profile image by email address.
     * 
     * <p>Alternative endpoint for retrieving profile images when only email is available.
     * Useful for login systems or email-based lookups.</p>
     * 
     * @param email The student's email address
     * @return ResponseEntity containing:
     *         - Success: status="success", profileImage (base64), fullName
     *         - Not Found (404): status="error", message="Student not found"
     *         - Error (500): status="error", message with error details
     */
    @GetMapping("/profile-image/email/{email}")
    public ResponseEntity<Map<String, Object>> getStudentProfileImageByEmail(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<StudentDetails> student = studentDetailsRepository.findByEmail(email);
            if (student.isPresent()) {
                StudentDetails studentDetails = student.get();
                response.put("status", "success");
                response.put("profileImage", studentDetails.getProfileImage());
                response.put("fullName", studentDetails.getFullName());
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "Student not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to fetch profile image: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Deletes student details from the database.
     * 
     * <p><strong>WARNING:</strong> This permanently deletes all student information including
     * medical history, vaccinations, and profile images. This action cannot be undone.</p>
     * 
     * <p>Consider implementing soft delete or archival for production systems.</p>
     * 
     * @param id The database ID of the student to delete
     * @return ResponseEntity containing:
     *         - Success: status="success", message="Student details deleted successfully"
     *         - Not Found (404): status="error", message="Student details not found"
     *         - Error (500): status="error", message with error details
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteStudentDetails(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Verify student exists before attempting deletion
            Optional<StudentDetails> existingStudent = studentDetailsRepository.findById(id);
            
            if (!existingStudent.isPresent()) {
                response.put("status", "error");
                response.put("message", "Student details not found");
                return ResponseEntity.notFound().build();
            }
            
            // Perform permanent deletion from database
            studentDetailsRepository.deleteById(id);
            
            // Build success response
            response.put("status", "success");
            response.put("message", "Student details deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Handle deletion errors (database constraints, foreign key violations)
            response.put("status", "error");
            response.put("message", "Failed to delete student details: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}