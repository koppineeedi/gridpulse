package com.gridpulse.repository;

import com.gridpulse.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    List<Technician> findByAvailability(String availability);
    Optional<Technician> findByUserId(Long userId);
    Optional<Technician> findByEmployeeId(String employeeId);
}
