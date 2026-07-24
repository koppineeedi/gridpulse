package com.gridpulse.repository;

import com.gridpulse.entity.Substation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubstationRepository extends JpaRepository<Substation, Long> {
}
