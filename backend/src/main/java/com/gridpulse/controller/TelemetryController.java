package com.gridpulse.controller;

import com.gridpulse.entity.Telemetry;
import com.gridpulse.service.TelemetryService;
import com.gridpulse.scheduler.TelemetryScheduler;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    @Autowired
    private TelemetryService telemetryService;

    @Autowired
    private TelemetryScheduler telemetryScheduler;

    @GetMapping("/live")
    public List<Telemetry> getLiveTelemetry() {
        return telemetryService.getAllLiveTelemetry();
    }

    @PostMapping
    public ResponseEntity<Telemetry> recordTelemetry(@Valid @RequestBody Telemetry telemetry) {
        return ResponseEntity.ok(telemetryService.saveTelemetry(telemetry));
    }

    @GetMapping("/grid/{substationId}")
    public List<Telemetry> getGridTelemetryHistory(@PathVariable Long substationId) {
        return telemetryService.getTelemetryHistory(substationId);
    }

    @PostMapping("/simulate-anomaly/{substationId}")
    public ResponseEntity<Map<String, Object>> simulateAnomaly(
            @PathVariable Long substationId,
            @RequestParam(defaultValue = "VOLTAGE_SAG") String type) {
        telemetryScheduler.forceAnomaly(substationId, type.toUpperCase());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Injected anomaly [" + type.toUpperCase() + "] on substation id: " + substationId + ". Triggered in next 5s simulator cycle.");
        return ResponseEntity.ok(response);
    }
}

