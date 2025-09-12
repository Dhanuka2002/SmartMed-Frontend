package com.example.demo;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * This class creates an initial admin user when the application starts
 * Only creates admin if no admin exists in the database
 */
@Component
public class InitialAdminSetup implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        // Check if any admin user exists
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(user -> "Admin".equals(user.getRole()));
        
        if (!adminExists) {
            // Create initial admin user
            User admin = new User();
            admin.setName("System Administrator");
            admin.setEmail("admin@smartmed.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Change this password in production
            admin.setRole("Admin");
            admin.setIsApproved(true);
            admin.setCreatedByAdmin(false); // This is the initial admin
            
            userRepository.save(admin);
            
            System.out.println("=========================================");
            System.out.println("INITIAL ADMIN USER CREATED");
            System.out.println("Email: admin@smartmed.com");
            System.out.println("Password: admin123");
            System.out.println("PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN");
            System.out.println("=========================================");
        }
    }
}