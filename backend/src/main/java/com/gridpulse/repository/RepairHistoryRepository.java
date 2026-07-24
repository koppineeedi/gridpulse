package com.gridpulse.repository;

import com.gridpulse.entity.RepairHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RepairHistoryRepository extends JpaRepository<RepairHistory, Long> {
    List<RepairHistory> findBySubstationIdOrderByCompletedAtDesc(Long substationId);
    List<RepairHistory> findTop10ByOrderByCompletedAtDesc();
}
