package com.gridpulse.service;

import com.gridpulse.config.NotificationWebSocketHandler;
import com.gridpulse.ai.AiFaultDiagnoser;
import com.gridpulse.dto.DiagnosisDto;
import com.gridpulse.entity.*;
import com.gridpulse.repository.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TelemetryService {

    private static final Logger log = LoggerFactory.getLogger(TelemetryService.class);

    @Autowired(required = false)
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private TelemetryRepository telemetryRepository;

    @Autowired
    private SubstationRepository substationRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private RepairHistoryRepository repairHistoryRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private AiFaultDiagnoser aiFaultDiagnoser;

    @Value("${gridpulse.dynamodb.mock:true}")
    private boolean isMock;

    public Telemetry saveTelemetry(Telemetry telemetry) {
        if (telemetry.getTimestamp() == null) {
            telemetry.setTimestamp(LocalDateTime.now());
        }

        
        Telemetry savedLocal = telemetryRepository.save(telemetry);

        
        if (!isMock && dynamoDbClient != null) {
            try {
                Map<String, AttributeValue> item = new HashMap<>();
                item.put("id", AttributeValue.builder().s(UUID.randomUUID().toString()).build());
                item.put("substationId", AttributeValue.builder().n(String.valueOf(telemetry.getSubstationId())).build());
                item.put("voltage", AttributeValue.builder().n(String.valueOf(telemetry.getVoltage())).build());
                item.put("current", AttributeValue.builder().n(String.valueOf(telemetry.getCurrent())).build());
                item.put("power", AttributeValue.builder().n(String.valueOf(telemetry.getPower())).build());
                item.put("temperature", AttributeValue.builder().n(String.valueOf(telemetry.getTemperature())).build());
                item.put("frequency", AttributeValue.builder().n(String.valueOf(telemetry.getFrequency())).build());
                item.put("timestamp", AttributeValue.builder().s(telemetry.getTimestamp().toString()).build());

                PutItemRequest putItemRequest = PutItemRequest.builder()
                        .tableName("GridPulseTelemetry")
                        .item(item)
                        .build();

                dynamoDbClient.putItem(putItemRequest);
                log.info("Telemetry successfully pushed to DynamoDB table [GridPulseTelemetry]");
            } catch (Exception e) {
                log.warn("Failed to write to AWS DynamoDB: {}. Saved locally in MySQL.", e.getMessage());
            }
        }

        
        checkAndProcessAnomalies(telemetry);

        return savedLocal;
    }

    private void checkAndProcessAnomalies(Telemetry telemetry) {
        boolean isAnomaly = telemetry.getVoltage() < 170.0 
                || telemetry.getTemperature() > 75.0 
                || telemetry.getCurrent() > 30.0;

        if (!isAnomaly) {
            return;
        }

        Long subId = telemetry.getSubstationId();
        
        
        Optional<Substation> substationOpt = substationRepository.findById(subId);
        if (substationOpt.isEmpty()) {
            return;
        }
        Substation substation = substationOpt.get();

        
        List<Alert> activeAlerts = alertRepository.findBySubstationIdOrderByTimestampDesc(subId)
                .stream()
                .filter(a -> "ACTIVE".equals(a.getStatus()))
                .collect(Collectors.toList());

        List<RepairTicket> activeTickets = ticketRepository.findBySubstationIdOrderByCreatedAtDesc(subId)
                .stream()
                .filter(t -> !"COMPLETED".equals(t.getStatus()))
                .collect(Collectors.toList());

        if (!activeAlerts.isEmpty() || !activeTickets.isEmpty()) {
            
            return;
        }

        log.info("ANOMALY DETECTED on substation: {}", substation.getName());
        log.info("Voltage: {}V, Current: {}A, Temp: {}°C", 
                telemetry.getVoltage(), telemetry.getCurrent(), telemetry.getTemperature());

        
        String severity = (telemetry.getVoltage() < 120.0 || telemetry.getTemperature() > 85.0 || telemetry.getCurrent() > 40.0) 
                ? "CRITICAL" : "WARNING";

        String message = String.format("Telemetry out of range. V: %.1fV, A: %.1fA, T: %.1f°C", 
                telemetry.getVoltage(), telemetry.getCurrent(), telemetry.getTemperature());

        Alert alert = Alert.builder()
                .substationId(subId)
                .substationName(substation.getName())
                .voltage(telemetry.getVoltage())
                .current(telemetry.getCurrent())
                .temperature(telemetry.getTemperature())
                .frequency(telemetry.getFrequency())
                .severity(severity)
                .status("ACTIVE")
                .timestamp(LocalDateTime.now())
                .message(message)
                .build();

        alertRepository.save(alert);
        NotificationWebSocketHandler.broadcast("NEW_FAULT", "New anomaly alert raised on " + substation.getName(), alert);

        
        substation.setStatus("FAULT");
        substationRepository.save(substation);


        
        try {
            
            List<RepairHistory> historyList = repairHistoryRepository.findBySubstationIdOrderByCompletedAtDesc(subId);
            List<String> historyStrings = historyList.stream()
                    .map(h -> String.format("%s resolved by %s on %s. Notes: %s", 
                            h.getFaultResolved(), h.getTechnicianName(), h.getCompletedAt().toLocalDate(), h.getNotes()))
                    .collect(Collectors.toList());

            
            DiagnosisDto diagnosis = aiFaultDiagnoser.diagnoseFault(
                    telemetry.getVoltage(), 
                    telemetry.getCurrent(), 
                    telemetry.getTemperature(), 
                    telemetry.getFrequency(), 
                    historyStrings
            );

            
            RepairTicket ticket = RepairTicket.builder()
                    .substationId(subId)
                    .substationName(substation.getName())
                    .probableFault(diagnosis.getProbableFault())
                    .confidenceScore(diagnosis.getConfidenceScore())
                    .recommendedRepair(diagnosis.getRecommendedRepair())
                    .rootCause(diagnosis.getRootCause())
                    .priority(diagnosis.getPriority())
                    .etaHours(diagnosis.getEtaHours())
                    .status("OPEN")
                    .createdAt(LocalDateTime.now())
                    .repairNotes("AI Diagnostics Auto-Generated.")
                    .build();

            String specialization = diagnosis.getTechnicianSpecialization();
            List<Technician> availableTechs = technicianRepository.findByAvailability("AVAILABLE");
            Technician assignedTech = null;

            for (Technician tech : availableTechs) {
                
                if (specialization != null && tech.getSkills().toLowerCase().contains(specialization.toLowerCase())) {
                    assignedTech = tech;
                    break;
                }
            }

            
            if (assignedTech == null && !availableTechs.isEmpty()) {
                assignedTech = availableTechs.get(0);
            }

            if (assignedTech != null) {
                ticket.setTechnicianId(assignedTech.getId());
                ticket.setTechnicianName(assignedTech.getName());
                ticket.setStatus("ASSIGNED");

                
                assignedTech.setCurrentJobs(assignedTech.getCurrentJobs() + 1);
                assignedTech.setAvailability("ON_JOB");
                technicianRepository.save(assignedTech);
                
                log.info("Ticket auto-assigned to Technician: {}", assignedTech.getName());
            }

            ticketRepository.save(ticket);
            NotificationWebSocketHandler.broadcast("TICKET_ASSIGNED", "Ticket auto-assigned to technician " + (ticket.getTechnicianName() != null ? ticket.getTechnicianName() : "Unassigned"), ticket);
            log.info("Automated Repair Ticket created successfully.");

            log.info("AI Diagnosis generated: {}", diagnosis);
            NotificationWebSocketHandler.broadcast("AI_DIAGNOSIS_COMPLETED", "AI fault diagnosis completed for " + substation.getName(), diagnosis);

        } catch (Exception e) {
            log.error("Failed to execute AI diagnostics or create repair ticket", e);
        }
    }

    public List<Telemetry> getTelemetryHistory(Long substationId) {
        List<Telemetry> logs = telemetryRepository.findBySubstationIdAndTimestampAfterOrderByTimestampAsc(
                substationId, 
                LocalDateTime.now().minusHours(2)
        );
        if (logs.size() > 50) {
            return logs.subList(logs.size() - 50, logs.size());
        }
        return logs;
    }

    public List<Telemetry> getAllLiveTelemetry() {
        List<Substation> substations = substationRepository.findAll();
        List<Telemetry> liveData = new ArrayList<>();
        
        for (Substation sub : substations) {
            List<Telemetry> latestList = telemetryRepository.findLatestTelemetryBySubstation(sub.getId());
            if (!latestList.isEmpty()) {
                liveData.add(latestList.get(0));
            } else {
                liveData.add(Telemetry.builder()
                        .substationId(sub.getId())
                        .voltage(230.0)
                        .current(10.0)
                        .power(2.3)
                        .temperature(35.0)
                        .frequency(50.0)
                        .timestamp(LocalDateTime.now())
                        .build());
            }
        }
        return liveData;
    }
}

