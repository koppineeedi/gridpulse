package com.gridpulse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "repair_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepairTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long substationId;

    @Column(nullable = false)
    private String substationName;

    @Column(nullable = false)
    private String probableFault;

    private Double confidenceScore;

    @Column(columnDefinition = "TEXT")
    private String recommendedRepair;

    @Column(columnDefinition = "TEXT")
    private String rootCause;


    @Column(nullable = false)
    private String priority; 

    private Long technicianId;
    private String technicianName;

    private Integer etaHours;

    @Column(nullable = false)
    private String status; 

    @Column(columnDefinition = "TEXT")
    private String repairNotes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;
}
