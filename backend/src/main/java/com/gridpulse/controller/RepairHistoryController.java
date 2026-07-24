package com.gridpulse.controller;

import com.gridpulse.entity.RepairHistory;
import com.gridpulse.service.RepairHistoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/repair-history")
public class RepairHistoryController {

    @Autowired
    private RepairHistoryService repairHistoryService;

    @GetMapping
    public List<RepairHistory> getAllRepairHistory() {
        return repairHistoryService.getAllRepairHistory();
    }

    @GetMapping("/substation/{substationId}")
    public List<RepairHistory> getHistoryBySubstation(@PathVariable Long substationId) {
        return repairHistoryService.getRepairHistoryBySubstation(substationId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepairHistory> getHistoryById(@PathVariable Long id) {
        return ResponseEntity.ok(repairHistoryService.getRepairHistoryById(id));
    }

    @PostMapping
    public RepairHistory createRepairHistory(@Valid @RequestBody RepairHistory history) {
        return repairHistoryService.createRepairHistory(history);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RepairHistory> updateRepairHistory(@PathVariable Long id, @Valid @RequestBody RepairHistory details) {
        return ResponseEntity.ok(repairHistoryService.updateRepairHistory(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepairHistory(@PathVariable Long id) {
        repairHistoryService.deleteRepairHistory(id);
        return ResponseEntity.ok().build();
    }
}
