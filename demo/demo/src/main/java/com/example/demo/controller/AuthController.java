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
@CrossOrigin(origins = "*")  // Allow all origins (you can restrict this to http://localhost:3000 later)
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailService mailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ✅ Register Endpoint
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> existUser = userRepository.findByEmail(user.getEmail());
        if (existUser.isPresent()) {
            response.put("status", "error");
            response.put("message", "Email already exists!");
            return ResponseEntity.badRequest().body(response);
        }

        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        // ✅ Try sending confirmation email
        try {
            mailService.sendRegistrationEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        response.put("status", "success");
        response.put("message", "User registered successfully! A confirmation email has been sent.");
        return ResponseEntity.ok(response);
    }

    // ✅ Login Endpoint
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User loginRequest) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                response.put("status", "success");
                response.put("message", "Login successful");
                response.put("role", user.getRole());
                response.put("name", user.getName());  // ✅ Send name to display on dashboard
                response.put("email", user.getEmail());  // Optional: in case frontend needs it
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

    // ✅ Optional: Get All Users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
