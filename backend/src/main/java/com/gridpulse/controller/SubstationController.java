package com.gridpulse.controller;

import com.gridpulse.entity.Substation;
import com.gridpulse.service.SubstationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/substations")
public class SubstationController {

    @Autowired
    private SubstationService substationService;

    @GetMapping
    public List<Substation> getAllSubstations() {
        return substationService.getAllSubstations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Substation> getSubstationById(@PathVariable Long id) {
        return ResponseEntity.ok(substationService.getSubstationById(id));
    }

    @PostMapping
    public Substation createSubstation(@Valid @RequestBody Substation substation) {
        return substationService.createSubstation(substation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Substation> updateSubstation(@PathVariable Long id, @Valid @RequestBody Substation substationDetails) {
        return ResponseEntity.ok(substationService.updateSubstation(id, substationDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubstation(@PathVariable Long id) {
        substationService.deleteSubstation(id);
        return ResponseEntity.ok().build();
    }
}
