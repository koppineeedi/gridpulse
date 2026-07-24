package com.gridpulse.repository;

import com.gridpulse.entity.RepairTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<RepairTicket, Long> {
    List<RepairTicket> findByStatus(String status);
    List<RepairTicket> findByTechnicianId(Long technicianId);
    List<RepairTicket> findBySubstationIdOrderByCreatedAtDesc(Long substationId);
    long countByStatus(String status);
}
