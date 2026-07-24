package com.gridpulse.controller;

import com.gridpulse.entity.RepairTicket;
import com.gridpulse.service.TicketService;
import com.gridpulse.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_GRID_OPERATOR', 'ADMIN', 'OPERATOR', 'GRID_OPERATOR')")
    public List<RepairTicket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/my-assigned")
    @PreAuthorize("hasAnyRole('ROLE_TECHNICIAN', 'TECHNICIAN')")
    public ResponseEntity<List<RepairTicket>> getMyAssignedTickets(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ticketService.getTicketsForTechnician(principal.getId()));
    }

    @PutMapping("/{id}/workflow")
    @PreAuthorize("hasAnyRole('ROLE_TECHNICIAN', 'TECHNICIAN')")
    public ResponseEntity<RepairTicket> updateTicketWorkflow(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String notes = payload.get("notes");
        return ResponseEntity.ok(ticketService.updateTicketWorkflow(id, principal.getId(), status, notes));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_GRID_OPERATOR', 'ADMIN', 'OPERATOR', 'GRID_OPERATOR')")
    public ResponseEntity<RepairTicket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_GRID_OPERATOR', 'ADMIN', 'OPERATOR', 'GRID_OPERATOR')")
    public RepairTicket createTicket(@Valid @RequestBody RepairTicket ticket) {
        return ticketService.createTicket(ticket);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_GRID_OPERATOR', 'ADMIN', 'OPERATOR', 'GRID_OPERATOR')")
    public ResponseEntity<RepairTicket> updateTicket(@PathVariable Long id, @Valid @RequestBody RepairTicket ticketDetails) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticketDetails));
    }
}
