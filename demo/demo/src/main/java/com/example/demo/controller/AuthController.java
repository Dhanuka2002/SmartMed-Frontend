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
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailService mailService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> existUser = userRepository.findByEmail(user.getEmail());
        if (existUser.isPresent()) {
            response.put("status", "error");
            response.put("message", "Email already exists!");
            return ResponseEntity.badRequest().body(response);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        // Send confirmation email - wrap in try-catch to avoid failure on mail issues
        try {
            mailService.sendRegistrationEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            // Optional: add this info to response if you want
            // response.put("mailStatus", "Email sending failed");
        }

        response.put("status", "success");
        response.put("message", "User registered successfully! A confirmation email has been sent.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> existUser = userRepository.findByEmail(user.getEmail());
        if (existUser.isPresent()) {
            if (passwordEncoder.matches(user.getPassword(), existUser.get().getPassword())) {
                response.put("status", "success");
                response.put("message", "Login successful");
                response.put("role", existUser.get().getRole());
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
}