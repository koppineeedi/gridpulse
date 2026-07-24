package com.gridpulse.controller;

import com.gridpulse.entity.Technician;
import com.gridpulse.entity.RepairTicket;
import com.gridpulse.repository.TicketRepository;
import com.gridpulse.service.TechnicianService;
import com.gridpulse.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(origins = "*")
public class TechnicianController {

    @Autowired
    private TechnicianService technicianService;

    @Autowired
    private TicketRepository ticketRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_GRID_OPERATOR', 'ADMIN', 'OPERATOR', 'GRID_OPERATOR')")
    public List<Technician> getAllTechnicians() {
        return technicianService.getAllTechnicians();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ROLE_TECHNICIAN', 'TECHNICIAN')")
    public ResponseEntity<Technician> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(technicianService.getTechnicianByUserId(principal.getId()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('ROLE_TECHNICIAN', 'TECHNICIAN')")
    public ResponseEntity<Technician> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> payload) {
        String phone = payload.get("phone");
        String newPassword = payload.get("password");
        String availability = payload.get("availability");
        return ResponseEntity.ok(technicianService.updateTechnicianProfile(
                principal.getId(), phone, newPassword, availability));
    }

    @GetMapping("/me/performance")
    @PreAuthorize("hasAnyRole('ROLE_TECHNICIAN', 'TECHNICIAN')")
    public ResponseEntity<Map<String, Object>> getMyPerformance(@AuthenticationPrincipal UserPrincipal principal) {
        Technician tech = technicianService.getTechnicianByUserId(principal.getId());
        List<RepairTicket> myTickets = ticketRepository.findByTechnicianId(tech.getId());
        
        long totalAssigned = myTickets.size();
        long completedRepairs = myTickets.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        long activeJobs = myTickets.stream().filter(t -> !"COMPLETED".equals(t.getStatus()) && !"REJECTED".equals(t.getStatus())).count();
        
        double avgConfidence = myTickets.stream()
                .mapToDouble(t -> t.getConfidenceScore() != null ? t.getConfidenceScore() : 0.0)
                .average()
                .orElse(0.0);
             
        double avgRepairTime = myTickets.stream()
                .filter(t -> t.getEtaHours() != null)
                .mapToDouble(RepairTicket::getEtaHours)
                .average()
                .orElse(2.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAssigned", totalAssigned);
        stats.put("completedRepairs", completedRepairs);
        stats.put("activeJobs", activeJobs);
        stats.put("averageConfidence", Math.round(avgConfidence * 10.0) / 10.0);
        stats.put("averageRepairTime", Math.round(avgRepairTime * 10.0) / 10.0);
        stats.put("customerSatisfaction", 4.9);
        
        
        Map<String, Object> monthly = new LinkedHashMap<>();
        monthly.put("May", 4);
        monthly.put("June", 8);
        monthly.put("July", completedRepairs);
        stats.put("monthlyPerformance", monthly);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_GRID_OPERATOR', 'ADMIN', 'OPERATOR', 'GRID_OPERATOR')")
    public ResponseEntity<Technician> getTechnicianById(@PathVariable Long id) {
        return ResponseEntity.ok(technicianService.getTechnicianById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ADMIN')")
    public Technician createTechnician(@Valid @RequestBody Technician technician) {
        return technicianService.createTechnician(technician);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<Technician> updateTechnician(@PathVariable Long id, @Valid @RequestBody Technician technicianDetails) {
        return ResponseEntity.ok(technicianService.updateTechnician(id, technicianDetails));
    }

    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<Technician> toggleTechnicianStatus(
            @PathVariable Long id, 
            @RequestParam boolean enabled) {
        return ResponseEntity.ok(technicianService.toggleTechnicianStatus(id, enabled));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<Technician> resetTechnicianPassword(@PathVariable Long id) {
        return ResponseEntity.ok(technicianService.resetTechnicianPassword(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<Void> deleteTechnician(@PathVariable Long id) {
        technicianService.deleteTechnician(id);
        return ResponseEntity.ok().build();
    }
}
