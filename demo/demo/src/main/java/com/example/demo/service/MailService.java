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
    
    public void sendPasswordChangeEmail(String toEmail, String userName, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("pasindurandima12347@gmail.com");
        message.setTo(toEmail);
        message.setSubject("SmartMed - Password Changed Successfully! 🔐");
        
        String emailBody = "Dear " + userName + ",\n\n" +
                "🔐 Your SmartMed account password has been successfully changed.\n\n" +
                "Updated Account Details:\n" +
                "• Name: " + userName + "\n" +
                "• Email: " + toEmail + "\n" +
                "• New Password: " + newPassword + "\n" +
                "• Changed On: " + new java.util.Date() + "\n\n" +
                "Security Information:\n" +
                "• If you made this change, no further action is required\n" +
                "• If you did not make this change, please contact support immediately\n" +
                "• Always keep your password secure and do not share it with others\n\n" +
                "Login URL: http://localhost:3000/login\n\n" +
                "For your security, we recommend:\n" +
                "✅ Using a strong, unique password\n" +
                "✅ Logging out from shared devices\n" +
                "✅ Changing your password regularly\n\n" +
                "If you have any questions or need assistance, please don't hesitate to contact our support team.\n\n" +
                "Thank you for using SmartMed!\n\n" +
                "Best regards,\n" +
                "The SmartMed Team\n" +
                "Email: pasindurandima12347@gmail.com";
        
        message.setText(emailBody);
        mailSender.send(message);
    }
}
