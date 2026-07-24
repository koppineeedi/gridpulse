package com.gridpulse.service;

public interface NotificationService {
    void sendCredentials(String email, String phone, String name, String username, String tempPassword);
    void sendOtp(String email, String name, String otp);
}
