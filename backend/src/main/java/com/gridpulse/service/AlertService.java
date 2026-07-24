package com.gridpulse.service;

import com.gridpulse.entity.Alert;
import com.gridpulse.exception.ResourceNotFoundException;
import com.gridpulse.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Alert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));
    }

    public Alert createAlert(Alert alert) {
        if (alert.getTimestamp() == null) {
            alert.setTimestamp(LocalDateTime.now());
        }
        if (alert.getStatus() == null) {
            alert.setStatus("ACTIVE");
        }
        return alertRepository.save(alert);
    }

    public Alert updateAlert(Long id, Alert details) {
        Alert alert = getAlertById(id);
        alert.setStatus(details.getStatus());
        if (details.getSeverity() != null) {
            alert.setSeverity(details.getSeverity());
        }
        if (details.getMessage() != null) {
            alert.setMessage(details.getMessage());
        }
        return alertRepository.save(alert);
    }

    public long getActiveAlertCount() {
        return alertRepository.countByStatus("ACTIVE") + alertRepository.countByStatus("WARNING") + alertRepository.countByStatus("CRITICAL");
    }
}
