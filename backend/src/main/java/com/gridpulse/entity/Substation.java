package com.gridpulse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "substations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Substation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String status; 

    private Double maxCapacityKw;

    private String description;
}
