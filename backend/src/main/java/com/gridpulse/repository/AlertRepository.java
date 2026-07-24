package com.gridpulse.repository;

import com.gridpulse.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByStatus(String status);
    List<Alert> findBySubstationIdOrderByTimestampDesc(Long substationId);
    List<Alert> findTop10ByOrderByTimestampDesc();
    long countByStatus(String status);
}
