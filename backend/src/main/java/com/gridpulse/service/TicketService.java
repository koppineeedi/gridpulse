package com.gridpulse.service;

import com.gridpulse.config.NotificationWebSocketHandler;
import com.gridpulse.entity.RepairHistory;
import com.gridpulse.entity.RepairTicket;
import com.gridpulse.entity.Substation;
import com.gridpulse.entity.Technician;
import com.gridpulse.exception.ResourceNotFoundException;
import com.gridpulse.repository.RepairHistoryRepository;
import com.gridpulse.repository.SubstationRepository;
import com.gridpulse.repository.TechnicianRepository;
import com.gridpulse.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    private static final String STATUS_AVAILABLE = "AVAILABLE";
    private static final String TECH_PREFIX = "Technician ";
    private static final String EVENT_TICKET_UPDATED = "TICKET_UPDATED";

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private SubstationRepository substationRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private RepairHistoryRepository repairHistoryRepository;

    public List<RepairTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public RepairTicket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair ticket not found with id: " + id));
    }

    public List<RepairTicket> getTicketsBySubstation(Long substationId) {
        return ticketRepository.findBySubstationIdOrderByCreatedAtDesc(substationId);
    }

    public List<RepairTicket> getTicketsByTechnician(Long technicianId) {
        return ticketRepository.findByTechnicianId(technicianId);
    }

    public List<RepairTicket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    @Transactional
    public RepairTicket createTicket(RepairTicket ticket) {
        if (ticket.getSubstationId() != null) {
            Substation sub = substationRepository.findById(ticket.getSubstationId()).orElse(null);
            if (sub != null) {
                ticket.setSubstationName(sub.getName());
                updateSubstationStatus(sub.getId(), "WARNING");
            }
        }

        if (ticket.getTechnicianId() != null) {
            Technician tech = technicianRepository.findById(ticket.getTechnicianId()).orElse(null);
            if (tech != null) {
                ticket.setTechnicianName(tech.getName());
                ticket.setStatus("ASSIGNED");
                updateTechnicianWorkload(tech.getId(), 1);
            }
        } else {
            ticket.setStatus("OPEN");
        }

        RepairTicket savedTicket = ticketRepository.save(ticket);
        NotificationWebSocketHandler.broadcast("TICKET_CREATED", "New repair ticket created for " + savedTicket.getSubstationName(), savedTicket);
        return savedTicket;
    }

    @Transactional
    public RepairTicket updateTicket(Long id, RepairTicket details) {
        RepairTicket ticket = getTicketById(id);
        if (details.getProbableFault() != null) {
            ticket.setProbableFault(details.getProbableFault());
        }
        if (details.getRecommendedRepair() != null) {
            ticket.setRecommendedRepair(details.getRecommendedRepair());
        }
        if (details.getPriority() != null) {
            ticket.setPriority(details.getPriority());
        }
        if (details.getRepairNotes() != null) {
            ticket.setRepairNotes(details.getRepairNotes());
        }
        if (details.getStatus() != null) {
            return updateTicketStatus(id, details.getStatus());
        }
        return ticketRepository.save(ticket);
    }

    @Transactional
    public RepairTicket updateTicketStatus(Long id, String status) {
        RepairTicket ticket = getTicketById(id);
        String oldStatus = ticket.getStatus();
        String newStatus = status.toUpperCase();
        ticket.setStatus(newStatus);

        if ("RESOLVED".equals(newStatus) || "CLOSED".equals(newStatus)) {
            if (ticket.getTechnicianId() != null) {
                updateTechnicianWorkload(ticket.getTechnicianId(), -1);
            }
            if (ticket.getSubstationId() != null) {
                long openTickets = ticketRepository.findBySubstationIdOrderByCreatedAtDesc(ticket.getSubstationId()).stream()
                        .filter(t -> !t.getId().equals(id) && !"RESOLVED".equals(t.getStatus()) && !"CLOSED".equals(t.getStatus()))
                        .count();
                if (openTickets == 0) {
                    updateSubstationStatus(ticket.getSubstationId(), "HEALTHY");
                }
            }

            if ("RESOLVED".equals(newStatus) && !"RESOLVED".equals(oldStatus)) {
                recordRepairHistory(ticket);
            }
        }

        RepairTicket updatedTicket = ticketRepository.save(ticket);
        NotificationWebSocketHandler.broadcast(EVENT_TICKET_UPDATED, "Ticket #" + id + " status updated to " + newStatus, updatedTicket);
        return updatedTicket;
    }

    @Transactional
    public RepairTicket assignTechnician(Long ticketId, Long technicianId) {
        RepairTicket ticket = getTicketById(ticketId);
        Technician tech = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));

        if (ticket.getTechnicianId() != null && !ticket.getTechnicianId().equals(technicianId)) {
            updateTechnicianWorkload(ticket.getTechnicianId(), -1);
        }

        ticket.setTechnicianId(tech.getId());
        ticket.setTechnicianName(tech.getName());
        ticket.setStatus("ASSIGNED");

        updateTechnicianWorkload(tech.getId(), 1);

        RepairTicket updatedTicket = ticketRepository.save(ticket);
        NotificationWebSocketHandler.broadcast("TICKET_ASSIGNED", "Ticket #" + ticketId + " assigned to " + tech.getName(), updatedTicket);
        return updatedTicket;
    }

    private void updateTechnicianWorkload(Long technicianId, int delta) {
        technicianRepository.findById(technicianId).ifPresent(tech -> {
            int current = tech.getCurrentJobs() != null ? tech.getCurrentJobs() : 0;
            int newJobs = Math.max(0, current + delta);
            tech.setCurrentJobs(newJobs);
            if (newJobs > 0) {
                tech.setAvailability("ON_JOB");
            } else {
                tech.setAvailability(STATUS_AVAILABLE);
            }
            technicianRepository.save(tech);
        });
    }

    private void updateSubstationStatus(Long substationId, String status) {
        substationRepository.findById(substationId).ifPresent(sub -> {
            sub.setStatus(status);
            substationRepository.save(sub);
        });
    }

    public List<RepairTicket> getTicketsForTechnician(Long userId) {
        Technician tech = technicianRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Technician not found for user ID: " + userId));
        return ticketRepository.findByTechnicianId(tech.getId());
    }

    @Transactional
    public RepairTicket updateTicketWorkflow(Long ticketId, Long userId, String status, String notes) {
        Technician tech = technicianRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found for user ID: " + userId));

        RepairTicket ticket = getTicketById(ticketId);

        if (!tech.getId().equals(ticket.getTechnicianId())) {
            throw new org.springframework.security.access.AccessDeniedException("You are not assigned to this repair ticket.");
        }

        String newStatus = status.toUpperCase();
        ticket.setStatus(newStatus);

        if (notes != null) {
            ticket.setRepairNotes(notes);
        }

        if ("ACCEPTED".equals(newStatus)) {
            tech.setAvailability("BUSY");
            technicianRepository.save(tech);
            NotificationWebSocketHandler.broadcast("TECHNICIAN_ACCEPTED", TECH_PREFIX + tech.getName() + " accepted repair ticket for " + ticket.getSubstationName(), ticket);
        } else if ("REJECTED".equals(newStatus)) {
            tech.setCurrentJobs(Math.max(0, tech.getCurrentJobs() - 1));
            tech.setAvailability(STATUS_AVAILABLE);
            technicianRepository.save(tech);

            ticket.setStatus("OPEN");
            ticket.setTechnicianId(null);
            ticket.setTechnicianName(null);
            ticket.setRepairNotes("Ticket rejected by " + tech.getName() + ". Reason: " + (notes != null ? notes : "None"));
            NotificationWebSocketHandler.broadcast(EVENT_TICKET_UPDATED, "Ticket rejected by technician " + tech.getName(), ticket);
        } else if ("TRAVELLING".equals(newStatus)) {
            NotificationWebSocketHandler.broadcast(EVENT_TICKET_UPDATED, TECH_PREFIX + tech.getName() + " is travelling to " + ticket.getSubstationName(), ticket);
        } else if ("ON_SITE".equals(newStatus)) {
            NotificationWebSocketHandler.broadcast(EVENT_TICKET_UPDATED, TECH_PREFIX + tech.getName() + " has arrived on site at " + ticket.getSubstationName(), ticket);
        } else if ("RESOLVED".equals(newStatus) || "COMPLETED".equals(newStatus)) {
            tech.setCurrentJobs(Math.max(0, tech.getCurrentJobs() - 1));
            if (tech.getCurrentJobs() == 0) {
                tech.setAvailability(STATUS_AVAILABLE);
            }
            technicianRepository.save(tech);

            recordRepairHistory(ticket);
            updateSubstationStatus(ticket.getSubstationId(), "HEALTHY");
            NotificationWebSocketHandler.broadcast("TICKET_RESOLVED", TECH_PREFIX + tech.getName() + " resolved ticket for " + ticket.getSubstationName(), ticket);
        }

        return ticketRepository.save(ticket);
    }

    private void recordRepairHistory(RepairTicket ticket) {
        RepairHistory history = RepairHistory.builder()
                .substationId(ticket.getSubstationId())
                .substationName(ticket.getSubstationName())
                .technicianName(ticket.getTechnicianName())
                .faultResolved(ticket.getProbableFault())
                .notes(ticket.getRecommendedRepair() + (ticket.getRepairNotes() != null ? " | Notes: " + ticket.getRepairNotes() : ""))
                .completedAt(LocalDateTime.now())
                .build();
        repairHistoryRepository.save(history);
    }
}
