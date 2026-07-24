package com.gridpulse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long substationId;

    @Column(nullable = false)
    private String substationName;

    private Double voltage;
    private Double current;
    private Double temperature;
    private Double frequency;

    @Column(nullable = false)
    private String severity; 

    @Column(nullable = false)
    private String status; 

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private String message;
}
