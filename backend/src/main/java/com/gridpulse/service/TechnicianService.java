package com.gridpulse.service;

import com.gridpulse.entity.Technician;
import com.gridpulse.entity.User;
import com.gridpulse.exception.ResourceNotFoundException;
import com.gridpulse.repository.TechnicianRepository;
import com.gridpulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class TechnicianService {

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailNotificationService notificationService;

    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public Technician getTechnicianById(Long id) {
        return technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));
    }

    public Technician getTechnicianByUserId(Long userId) {
        return technicianRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician profile not found for user ID: " + userId));
    }

    @Transactional
    public Technician updateTechnicianProfile(Long userId, String phone, String newPassword, String availability) {
        Technician tech = getTechnicianByUserId(userId);
        
        if (phone != null) {
            tech.setPhone(phone);
        }
        
        if (availability != null && !availability.trim().isEmpty()) {
            String upper = availability.toUpperCase();
            if (upper.equals("AVAILABLE") || upper.equals("BUSY") || upper.equals("OFFLINE") || upper.equals("ON_LEAVE")) {
                tech.setAvailability(upper);
            }
        }
        
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            User user = tech.getUser();
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setPasswordChanged(true);
            userRepository.save(user);
        }
        
        return technicianRepository.save(tech);
    }

    private String generateUniqueUsername() {
        java.security.SecureRandom rand = new java.security.SecureRandom();
        while (true) {
            String username = "tech" + (1000 + rand.nextInt(9000));
            if (!userRepository.existsByUsername(username)) {
                return username;
            }
        }
    }

    private String generateRandomPassword() {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "@$!%*?&";
        String all = upper + lower + digits + special;
        
        java.security.SecureRandom rand = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder();
        
        sb.append(upper.charAt(rand.nextInt(upper.length())));
        sb.append(lower.charAt(rand.nextInt(lower.length())));
        sb.append(digits.charAt(rand.nextInt(digits.length())));
        sb.append(special.charAt(rand.nextInt(special.length())));
        
        int len = 10 + rand.nextInt(3); 
        for (int i = 4; i < len; i++) {
            sb.append(all.charAt(rand.nextInt(all.length())));
        }
        
        List<String> letters = Arrays.asList(sb.toString().split(""));
        Collections.shuffle(letters);
        return String.join("", letters);
    }

    @Transactional
    public Technician createTechnician(Technician technician) {
        if (userRepository.existsByEmail(technician.getEmail())) {
            throw new RuntimeException("Email address is already in use by another user account.");
        }

        String username = generateUniqueUsername();
        String tempPassword = generateRandomPassword();

        User user = User.builder()
                .username(username)
                .email(technician.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .fullName(technician.getFullName())
                .role("TECHNICIAN")
                .enabled(true)
                .passwordChanged(false)
                .build();

        User savedUser = userRepository.save(user);

        technician.setUser(savedUser);
        if (technician.getAvailability() == null) {
            technician.setAvailability("AVAILABLE");
        }
        if (technician.getCurrentJobs() == null) {
            technician.setCurrentJobs(0);
        }
        if (technician.getRating() == null) {
            technician.setRating(5.0);
        }
        if (technician.getCurrentLatitude() == null) {
            technician.setCurrentLatitude(12.9716);
        }
        if (technician.getCurrentLongitude() == null) {
            technician.setCurrentLongitude(77.5946);
        }

        Technician savedTech = technicianRepository.save(technician);

        
        notificationService.sendCredentials(
                technician.getEmail(),
                technician.getPhone(),
                technician.getFullName(),
                username,
                tempPassword
        );

        return savedTech;
    }

    @Transactional
    public Technician toggleTechnicianStatus(Long id, boolean enabled) {
        Technician tech = getTechnicianById(id);
        User user = tech.getUser();
        user.setEnabled(enabled);
        userRepository.save(user);
        return tech;
    }

    @Transactional
    public Technician resetTechnicianPassword(Long id) {
        Technician tech = getTechnicianById(id);
        User user = tech.getUser();
        
        String newTempPassword = generateRandomPassword();
        user.setPassword(passwordEncoder.encode(newTempPassword));
        user.setPasswordChanged(false);
        user.setFailedAttempts(0);
        user.setAccountLocked(false);
        userRepository.save(user);

        notificationService.sendCredentials(
                tech.getEmail(),
                tech.getPhone(),
                tech.getFullName(),
                user.getUsername(),
                newTempPassword
        );

        return tech;
    }

    @Transactional
    public Technician updateTechnician(Long id, Technician details) {
        Technician tech = getTechnicianById(id);
        tech.setFullName(details.getFullName());
        tech.setSpecialization(details.getSpecialization());
        tech.setPhone(details.getPhone());
        tech.setEmail(details.getEmail());
        tech.setExperience(details.getExperience());
        tech.setSkillCategory(details.getSkillCategory());
        tech.setAddress(details.getAddress());
        tech.setAvailability(details.getAvailability());
        
        User user = tech.getUser();
        user.setEmail(details.getEmail());
        user.setFullName(details.getFullName());
        userRepository.save(user);

        return technicianRepository.save(tech);
    }

    public void deleteTechnician(Long id) {
        Technician tech = getTechnicianById(id);
        User user = tech.getUser();
        technicianRepository.delete(tech);
        if (user != null) {
            userRepository.delete(user);
        }
    }
}
