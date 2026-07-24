package com.gridpulse.service;

import com.gridpulse.entity.Substation;
import com.gridpulse.exception.ResourceNotFoundException;
import com.gridpulse.repository.SubstationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubstationService {

    @Autowired
    private SubstationRepository substationRepository;

    public List<Substation> getAllSubstations() {
        return substationRepository.findAll();
    }

    public Substation getSubstationById(Long id) {
        return substationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Substation not found with id: " + id));
    }

    public Substation createSubstation(Substation substation) {
        if (substation.getStatus() == null) {
            substation.setStatus("HEALTHY");
        }
        return substationRepository.save(substation);
    }

    public Substation updateSubstation(Long id, Substation details) {
        Substation sub = getSubstationById(id);
        sub.setName(details.getName());
        sub.setLocation(details.getLocation());
        sub.setLatitude(details.getLatitude());
        sub.setLongitude(details.getLongitude());
        sub.setMaxCapacityKw(details.getMaxCapacityKw());
        sub.setDescription(details.getDescription());
        if (details.getStatus() != null) {
            sub.setStatus(details.getStatus());
        }
        return substationRepository.save(sub);
    }

    public void deleteSubstation(Long id) {
        Substation sub = getSubstationById(id);
        substationRepository.delete(sub);
    }
}
