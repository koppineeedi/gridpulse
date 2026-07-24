package com.gridpulse.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendCredentials(String email, String phone, String name, String username, String tempPassword) {
        log.info("Dispatching user credentials notification to: {}", email);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject("Welcome to GridPulse");
                message.setText("Hello " + name + ",\n\n" +
                        "Your GridPulse account has been created.\n\n" +
                        "Username:\n" + username + "\n\n" +
                        "Temporary Password:\n" + tempPassword + "\n\n" +
                        "Please log in and change your password immediately.\n\n" +
                        "Login URL:\nhttp://localhost:5173/login\n\n" +
                        "Regards,\nGridPulse Administration");
                mailSender.send(message);
                log.info("Real email successfully dispatched to SMTP host.");
            } catch (Exception e) {
                log.warn("SMTP send failed (running local offline fallback): {}", e.getMessage());
            }
        }
    }

    @Override
    public void sendOtp(String email, String name, String otp) {
        log.info("Dispatching OTP password reset email to: {}", email);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject("GridPulse Password Reset OTP");
                message.setText("Hello " + name + ",\n\n" +
                        "Your password reset OTP code is:\n" + otp + "\n\n" +
                        "If you did not request a password reset, please ignore this email.\n\n" +
                        "Regards,\nGridPulse Administration");
                mailSender.send(message);
                log.info("Real OTP email successfully dispatched to SMTP host.");
            } catch (Exception e) {
                log.warn("SMTP OTP send failed: {}", e.getMessage());
            }
        }
    }
}
