package com.gridpulse.service;

import com.gridpulse.entity.RepairHistory;
import com.gridpulse.exception.ResourceNotFoundException;
import com.gridpulse.repository.RepairHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RepairHistoryService {

    @Autowired
    private RepairHistoryRepository repairHistoryRepository;

    public List<RepairHistory> getAllRepairHistory() {
        return repairHistoryRepository.findAll();
    }

    public List<RepairHistory> getRepairHistoryBySubstation(Long substationId) {
        return repairHistoryRepository.findBySubstationIdOrderByCompletedAtDesc(substationId);
    }

    public RepairHistory getRepairHistoryById(Long id) {
        return repairHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair history record not found with id: " + id));
    }

    public RepairHistory createRepairHistory(RepairHistory history) {
        if (history.getCompletedAt() == null) {
            history.setCompletedAt(LocalDateTime.now());
        }
        return repairHistoryRepository.save(history);
    }

    public RepairHistory updateRepairHistory(Long id, RepairHistory details) {
        RepairHistory hist = getRepairHistoryById(id);
        hist.setSubstationId(details.getSubstationId());
        hist.setSubstationName(details.getSubstationName());
        hist.setFaultResolved(details.getFaultResolved());
        hist.setTechnicianName(details.getTechnicianName());
        hist.setNotes(details.getNotes());
        if (details.getCompletedAt() != null) {
            hist.setCompletedAt(details.getCompletedAt());
        }
        return repairHistoryRepository.save(hist);
    }

    public void deleteRepairHistory(Long id) {
        RepairHistory hist = getRepairHistoryById(id);
        repairHistoryRepository.delete(hist);
    }
}
