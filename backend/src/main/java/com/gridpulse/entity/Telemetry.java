package com.gridpulse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Telemetry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long substationId;

    private Double voltage;
    private Double current;
    private Double power; 
    private Double temperature;
    private Double frequency;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
