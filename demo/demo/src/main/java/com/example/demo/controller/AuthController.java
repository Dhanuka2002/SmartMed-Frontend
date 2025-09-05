package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailService mailService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();

        // Extract data from request
        String role = (String) requestData.get("role");
        String firstName = (String) requestData.get("firstName");
        String lastName = (String) requestData.get("lastName");
        String name = (String) requestData.get("name");
        String email = (String) requestData.get("email");
        String password = (String) requestData.get("password");

        // Only allow Student registration through public registration
        if (!"Student".equals(role)) {
            response.put("status", "error");
            response.put("message", "Only students can register through this form. Other roles must be created by admin.");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<User> existUser = userRepository.findByEmail(email);
        if (existUser.isPresent()) {
            response.put("status", "error");
            response.put("message", "Email already exists!");
            return ResponseEntity.badRequest().body(response);
        }

        // Create new user
        User user = new User();
        user.setRole(role);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setIsApproved(true); // Students are auto-approved
        user.setCreatedByAdmin(false);
        
        // Set names - prefer firstName/lastName if available, otherwise use combined name
        if (firstName != null && lastName != null) {
            user.setFirstName(firstName);
            user.setLastName(lastName);
            // name field is automatically set in the setter
        } else if (name != null) {
            user.setName(name);
            // Try to split name into first and last
            String[] nameParts = name.trim().split(" ", 2);
            user.setFirstName(nameParts[0]);
            user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        }
        
        userRepository.save(user);

        // Send confirmation email - wrap in try-catch to avoid failure on mail issues
        try {
            mailService.sendRegistrationEmail(user.getEmail(), user.getName(), password);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        response.put("status", "success");
        response.put("message", "Student registered successfully! A confirmation email has been sent.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> existUser = userRepository.findByEmail(user.getEmail());
        if (existUser.isPresent()) {
            User foundUser = existUser.get();
            
            // Check if user is approved (except students who are auto-approved)
            if (!foundUser.getIsApproved() && !foundUser.getRole().equals("Student")) {
                response.put("status", "error");
                response.put("message", "Your account is pending admin approval!");
                return ResponseEntity.status(403).body(response);
            }
            
            if (passwordEncoder.matches(user.getPassword(), foundUser.getPassword())) {
                response.put("status", "success");
                response.put("message", "Login successful");
                response.put("role", foundUser.getRole());
                response.put("name", foundUser.getName());
                response.put("firstName", foundUser.getFirstName());
                response.put("lastName", foundUser.getLastName());
                response.put("email", foundUser.getEmail());
                response.put("userId", foundUser.getId());
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "Invalid password!");
                return ResponseEntity.status(401).body(response);
            }
        }
        response.put("status", "error");
        response.put("message", "User not found!");
        return ResponseEntity.status(404).body(response);
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    // Admin endpoints for managing users
    @PostMapping("/admin/create-user")
    public ResponseEntity<Map<String, Object>> createUserByAdmin(@RequestBody Map<String, String> requestData) {
        Map<String, Object> response = new HashMap<>();
        
        String adminEmail = requestData.get("adminEmail");
        String role = requestData.get("role");
        String name = requestData.get("name");
        String email = requestData.get("email");
        String password = requestData.get("password");
        
        // Verify admin privileges
        Optional<User> adminUser = userRepository.findByEmail(adminEmail);
        if (!adminUser.isPresent() || !adminUser.get().getRole().equals("Admin")) {
            response.put("status", "error");
            response.put("message", "Unauthorized. Only admins can create users.");
            return ResponseEntity.status(403).body(response);
        }
        
        // Check if role is valid (not Student or Admin)
        if (role.equals("Student") || role.equals("Admin")) {
            response.put("status", "error");
            response.put("message", "Students register themselves. Admin accounts are created separately.");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Check if user already exists
        Optional<User> existUser = userRepository.findByEmail(email);
        if (existUser.isPresent()) {
            response.put("status", "error");
            response.put("message", "Email already exists!");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Create new user
        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRole(role);
        newUser.setIsApproved(true); // Admin-created users are pre-approved
        newUser.setCreatedByAdmin(true);
        
        userRepository.save(newUser);
        
        // Send welcome email
        try {
            mailService.sendRegistrationEmail(email, name, password);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
        
        response.put("status", "success");
        response.put("message", role + " account created successfully!");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/admin/pending-users")
    public ResponseEntity<List<User>> getPendingUsers(@RequestParam String adminEmail) {
        // Verify admin privileges
        Optional<User> adminUser = userRepository.findByEmail(adminEmail);
        if (!adminUser.isPresent() || !adminUser.get().getRole().equals("Admin")) {
            return ResponseEntity.status(403).body(null);
        }
        
        List<User> pendingUsers = userRepository.findAll().stream()
            .filter(user -> !user.getIsApproved() && !user.getRole().equals("Student"))
            .toList();
            
        return ResponseEntity.ok(pendingUsers);
    }
    
    @PostMapping("/admin/approve-user")
    public ResponseEntity<Map<String, Object>> approveUser(@RequestBody Map<String, String> requestData) {
        Map<String, Object> response = new HashMap<>();
        
        String adminEmail = requestData.get("adminEmail");
        Long userId = Long.parseLong(requestData.get("userId"));
        
        // Verify admin privileges
        Optional<User> adminUser = userRepository.findByEmail(adminEmail);
        if (!adminUser.isPresent() || !adminUser.get().getRole().equals("Admin")) {
            response.put("status", "error");
            response.put("message", "Unauthorized. Only admins can approve users.");
            return ResponseEntity.status(403).body(response);
        }
        
        Optional<User> userToApprove = userRepository.findById(userId);
        if (!userToApprove.isPresent()) {
            response.put("status", "error");
            response.put("message", "User not found!");
            return ResponseEntity.status(404).body(response);
        }
        
        User user = userToApprove.get();
        user.setIsApproved(true);
        userRepository.save(user);
        
        response.put("status", "success");
        response.put("message", "User approved successfully!");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/admin/all-users")
    public ResponseEntity<List<User>> getAllUsersByAdmin(@RequestParam String adminEmail) {
        // Verify admin privileges
        Optional<User> adminUser = userRepository.findByEmail(adminEmail);
        if (!adminUser.isPresent() || !adminUser.get().getRole().equals("Admin")) {
            return ResponseEntity.status(403).body(null);
        }
        
        return ResponseEntity.ok(userRepository.findAll());
    }
    
    // Temporary endpoint to manually create admin for testing
    @PostMapping("/create-test-admin")
    public ResponseEntity<Map<String, Object>> createTestAdmin() {
        Map<String, Object> response = new HashMap<>();
        
        // Check if admin already exists
        Optional<User> existingAdmin = userRepository.findByEmail("admin@smartmed.com");
        if (existingAdmin.isPresent()) {
            response.put("status", "info");
            response.put("message", "Admin already exists");
            response.put("admin", existingAdmin.get());
            return ResponseEntity.ok(response);
        }
        
        // Create admin user
        User admin = new User();
        admin.setName("System Administrator");
        admin.setEmail("admin@smartmed.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("Admin");
        admin.setIsApproved(true);
        admin.setCreatedByAdmin(false);
        
        userRepository.save(admin);
        
        response.put("status", "success");
        response.put("message", "Test admin created successfully");
        response.put("admin", admin);
        return ResponseEntity.ok(response);
    }
}
