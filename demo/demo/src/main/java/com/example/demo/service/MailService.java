package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendRegistrationEmail(String toEmail, String userName, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("pasindurandima12347@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Welcome to SmartMed - Registration Successful! 🎉");
        
        String emailBody = "Dear " + userName + ",\n\n" +
                "🎉 Congratulations! Your SmartMed account has been successfully created.\n\n" +
                "Account Details:\n" +
                "• Name: " + userName + "\n" +
                "• Email: " + toEmail + "\n" +
                "• Password: " + password + "\n" +
                "• Role: Student\n" +
                "• Registration Date: " + new java.util.Date() + "\n\n" +
                "What's next?\n" +
                "✅ You can now log in to your SmartMed account\n" +
                "✅ Access your personalized dashboard\n" +
                "✅ Start managing your medical information\n\n" +
                "Login URL: http://localhost:3000/login\n\n" +
                "If you have any questions or need assistance, please don't hesitate to contact our support team.\n\n" +
                "Thank you for choosing SmartMed!\n\n" +
                "Best regards,\n" +
                "The SmartMed Team\n" +
                "Email: pasindurandima12347@gmail.com";
        
        message.setText(emailBody);
        mailSender.send(message);
    }
}
