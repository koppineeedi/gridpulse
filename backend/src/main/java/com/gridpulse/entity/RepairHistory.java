package com.gridpulse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "repair_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepairHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long substationId;

    @Column(nullable = false)
    private String substationName;

    @Column(nullable = false)
    private String faultResolved;

    private String technicianName;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
