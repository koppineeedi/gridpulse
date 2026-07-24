package com.gridpulse.repository;

import com.gridpulse.entity.Telemetry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {
    List<Telemetry> findBySubstationIdOrderByTimestampDesc(Long substationId);
    List<Telemetry> findBySubstationIdAndTimestampAfterOrderByTimestampAsc(Long substationId, LocalDateTime timestamp);
    
    @Query("SELECT t FROM Telemetry t WHERE t.substationId = :substationId ORDER BY t.timestamp DESC")
    List<Telemetry> findLatestTelemetryBySubstation(@Param("substationId") Long substationId);
}
