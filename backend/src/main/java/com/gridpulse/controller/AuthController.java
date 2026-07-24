package com.gridpulse.controller;

import com.gridpulse.dto.AuthResponse;
import com.gridpulse.dto.LoginRequest;
import com.gridpulse.entity.User;
import com.gridpulse.exception.InvalidCredentialsException;
import com.gridpulse.repository.UserRepository;
import com.gridpulse.security.JwtTokenProvider;
import com.gridpulse.security.UserPrincipal;
import com.gridpulse.service.EmailNotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final String KEY_MESSAGE = "message";
    private static final String KEY_EMAIL = "email";
    private static final String KEY_SUCCESS = "success";

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailNotificationService notificationService;

    private final Map<String, OtpDetails> otpStorage = new ConcurrentHashMap<>();

    private static class OtpDetails {
        String otp;
        LocalDateTime expiry;
        OtpDetails(String otp) {
            this.otp = otp;
            this.expiry = LocalDateTime.now().plusMinutes(5);
        }
        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiry);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Object> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.isAccountLocked()) {
                return ResponseEntity.badRequest().body(Map.of(KEY_MESSAGE, "Account is locked due to 5 failed login attempts. Please contact Administrator."));
            }
            if (!user.isEnabled()) {
                return ResponseEntity.badRequest().body(Map.of(KEY_MESSAGE, "Account is disabled. Please contact Administrator."));
            }
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getFailedAttempts() > 0) {
                    user.setFailedAttempts(0);
                    userRepository.save(user);
                }
            }

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(jwt)
                    .tokenType("Bearer")
                    .userId(userPrincipal.getId())
                    .username(userPrincipal.getUsername())
                    .fullName(userPrincipal.getUser().getFullName())
                    .role(userPrincipal.getUser().getRole().replace("ROLE_", ""))
                    .build());
        } catch (Exception e) {
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setFailedAttempts(user.getFailedAttempts() + 1);
                if (user.getFailedAttempts() >= 5) {
                    user.setAccountLocked(true);
                }
                userRepository.save(user);

                if (user.isAccountLocked()) {
                    return ResponseEntity.badRequest().body(Map.of(KEY_MESSAGE, "Account is locked due to 5 failed login attempts. Please contact Administrator."));
                }
            }
            throw new InvalidCredentialsException("Invalid username or password");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get(KEY_EMAIL);
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(KEY_MESSAGE, "Email is required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(KEY_MESSAGE, "No account registered with this email address"));
        }

        User user = userOpt.get();
        String otp = String.format("%06d", secureRandom.nextInt(900000) + 100000);
        otpStorage.put(email, new OtpDetails(otp));

        notificationService.sendOtp(email, user.getFullName(), otp);

        return ResponseEntity.ok(Map.of(KEY_SUCCESS, true, KEY_MESSAGE, "OTP verification code sent to your registered email."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Object> verifyOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get(KEY_EMAIL);
        String otp = payload.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of(KEY_MESSAGE, "Email and OTP code are required"));
        }

        OtpDetails details = otpStorage.get(email);
        if (details == null || details.isExpired() || !details.otp.equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of(KEY_MESSAGE, "Invalid or expired OTP verification code"));
        }

        return ResponseEntity.ok(Map.of(KEY_SUCCESS, true, KEY_MESSAGE, "OTP verified successfully."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get(KEY_EMAIL);
        String otp = payload.get("otp");
        String password = payload.get("password");

        if (email == null || otp == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of(KEY_MESSAGE, "All parameters are required"));
        }

        OtpDetails details = otpStorage.get(email);
        if (details == null || details.isExpired() || !details.otp.equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of(KEY_MESSAGE, "Invalid or expired OTP verification code"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(KEY_MESSAGE, "User account not found"));
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(password));
        user.setPasswordChanged(true);
        userRepository.save(user);

        otpStorage.remove(email);

        return ResponseEntity.ok(Map.of(KEY_SUCCESS, true, KEY_MESSAGE, "Password has been reset successfully. Please login with your new password."));
    }
}
