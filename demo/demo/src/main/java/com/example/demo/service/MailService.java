package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendRegistrationEmail(String toEmail, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("your-email@gmail.com");  // ✅ Your email address
        message.setTo(toEmail);                   // ✅ User's email address
        message.setSubject("Registration Successful - SmartMed");
        message.setText("Hello " + userName + ",\n\nYour registration was successful!\n\nThank you for using SmartMed!");

        mailSender.send(message);
    }
}
