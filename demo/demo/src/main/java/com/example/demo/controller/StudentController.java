package com.example.demo.controller;

import com.example.demo.model.Student;
import com.example.demo.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*") // Allow requests from all origins (for dev)
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    // Save or update student
    @PostMapping("/save")
    public Student saveStudent(@RequestBody Student student) {
        return studentRepository.save(student);
    }

    // Get student by email
    @GetMapping("/by-email/{email}")
    public Student getStudentByEmail(@PathVariable String email) {
        return studentRepository.findByEmail(email);
    }

    // Get student by studentId
    @GetMapping("/get/{studentId}")
    public ResponseEntity<Student> getStudentByStudentId(@PathVariable String studentId) {
        Student student = studentRepository.findByStudentId(studentId);
        if (student != null) {
            return ResponseEntity.ok(student);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Get student by database ID (used for loading saved student from localStorage)
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Optional<Student> student = studentRepository.findById(id);
        return student.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
