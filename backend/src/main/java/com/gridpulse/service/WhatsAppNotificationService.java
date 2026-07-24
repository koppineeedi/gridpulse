package com.gridpulse.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppNotificationService.class);

    @Override
    public void sendCredentials(String email, String phone, String name, String username, String tempPassword) {
        log.info("Placeholder WhatsApp delivery to {}: Welcome {}. Log in with user: {}", phone, name, username);
    }

    @Override
    public void sendOtp(String email, String name, String otp) {
        log.info("Placeholder WhatsApp OTP delivery to email: {}", email);
    }
}
