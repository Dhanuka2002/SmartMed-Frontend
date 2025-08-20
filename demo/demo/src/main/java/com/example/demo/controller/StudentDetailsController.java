package com.example.demo.controller;

import com.example.demo.model.StudentDetails;
import com.example.demo.repository.StudentDetailsRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/student-details")
@CrossOrigin(origins = "*")
public class StudentDetailsController {

    @Autowired
    private StudentDetailsRepository studentDetailsRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveStudentDetails(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            StudentDetails studentDetails = new StudentDetails();
            
            // Basic Information
            studentDetails.setFullName((String) requestData.get("fullName"));
            studentDetails.setNic((String) requestData.get("nic"));
            studentDetails.setStudentRegistrationNumber((String) requestData.get("studentRegistrationNumber"));
            studentDetails.setAcademicDivision((String) requestData.get("academicDivision"));
            studentDetails.setEmail((String) requestData.get("email"));

            // Validate required fields
            if (studentDetails.getFullName() == null || studentDetails.getFullName().trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Full name is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (studentDetails.getNic() == null || studentDetails.getNic().trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "NIC is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (studentDetails.getStudentRegistrationNumber() == null || studentDetails.getStudentRegistrationNumber().trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Student registration number is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Check if student already exists
            Optional<StudentDetails> existingStudent = studentDetailsRepository.findByStudentRegistrationNumber(
                studentDetails.getStudentRegistrationNumber());
            
            if (existingStudent.isPresent()) {
                response.put("status", "error");
                response.put("message", "Student with this registration number already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Personal Details
            String dateOfBirthStr = (String) requestData.get("dateOfBirth");
            if (dateOfBirthStr != null && !dateOfBirthStr.isEmpty()) {
                studentDetails.setDateOfBirth(LocalDate.parse(dateOfBirthStr));
            }
            
            studentDetails.setPositionOfFamily((String) requestData.get("positionOfFamily"));
            studentDetails.setGender((String) requestData.get("gender"));
            studentDetails.setLastAttendSchool((String) requestData.get("lastAttendSchool"));
            studentDetails.setReligion((String) requestData.get("religion"));
            studentDetails.setOccupationOfFather((String) requestData.get("occupationOfFather"));
            studentDetails.setSingleMarried((String) requestData.get("singleMarried"));
            studentDetails.setOccupationOfMother((String) requestData.get("occupationOfMother"));
            
            Object ageObj = requestData.get("age");
            if (ageObj != null && !ageObj.toString().isEmpty()) {
                studentDetails.setAge(Integer.parseInt(ageObj.toString()));
            }
            
            studentDetails.setHomeAddress((String) requestData.get("homeAddress"));
            studentDetails.setNationality((String) requestData.get("nationality"));
            studentDetails.setTelephoneNumber((String) requestData.get("telephoneNumber"));
            studentDetails.setExtraCurricularActivities((String) requestData.get("extraCurricularActivities"));

            // Emergency Contact
            studentDetails.setEmergencyName((String) requestData.get("emergencyName"));
            studentDetails.setEmergencyTelephone((String) requestData.get("emergencyTelephone"));
            studentDetails.setEmergencyAddress((String) requestData.get("emergencyAddress"));
            studentDetails.setEmergencyRelationship((String) requestData.get("emergencyRelationship"));

            // Convert complex objects to JSON strings
            if (requestData.get("familyHistory") != null) {
                studentDetails.setFamilyHistory(objectMapper.writeValueAsString(requestData.get("familyHistory")));
            }

            if (requestData.get("medicalHistory") != null) {
                studentDetails.setMedicalHistory(objectMapper.writeValueAsString(requestData.get("medicalHistory")));
            }

            if (requestData.get("vaccinations") != null) {
                studentDetails.setVaccinations(objectMapper.writeValueAsString(requestData.get("vaccinations")));
            }

            // Profile Image
            studentDetails.setProfileImage((String) requestData.get("profileImage"));

            // Save the student details
            StudentDetails savedDetails = studentDetailsRepository.save(studentDetails);
            
            response.put("status", "success");
            response.put("message", "Student details saved successfully");
            response.put("studentId", savedDetails.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to save student details: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<StudentDetails>> getAllStudentDetails() {
        try {
            List<StudentDetails> students = studentDetailsRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

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

    @GetMapping("/search/{name}")
    public ResponseEntity<List<StudentDetails>> searchStudentsByName(@PathVariable String name) {
        try {
            List<StudentDetails> students = studentDetailsRepository.findByFullNameContainingIgnoreCase(name);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

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

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateStudentDetails(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> requestData) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<StudentDetails> existingStudent = studentDetailsRepository.findById(id);
            
            if (!existingStudent.isPresent()) {
                response.put("status", "error");
                response.put("message", "Student details not found");
                return ResponseEntity.notFound().build();
            }
            
            StudentDetails studentDetails = existingStudent.get();
            
            // Update fields (similar logic as save method)
            studentDetails.setFullName((String) requestData.get("fullName"));
            studentDetails.setNic((String) requestData.get("nic"));
            studentDetails.setAcademicDivision((String) requestData.get("academicDivision"));
            
            // Profile Image
            if (requestData.containsKey("profileImage")) {
                studentDetails.setProfileImage((String) requestData.get("profileImage"));
            }
            
            // Continue with other fields...
            
            StudentDetails updatedDetails = studentDetailsRepository.save(studentDetails);
            
            response.put("status", "success");
            response.put("message", "Student details updated successfully");
            response.put("studentId", updatedDetails.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to update student details: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteStudentDetails(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<StudentDetails> existingStudent = studentDetailsRepository.findById(id);
            
            if (!existingStudent.isPresent()) {
                response.put("status", "error");
                response.put("message", "Student details not found");
                return ResponseEntity.notFound().build();
            }
            
            studentDetailsRepository.deleteById(id);
            
            response.put("status", "success");
            response.put("message", "Student details deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to delete student details: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}