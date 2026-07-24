package com.gridpulse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "technicians")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(unique = true, nullable = false)
    private String employeeId;

    @Column(nullable = false)
    private String fullName;

    private String phone;
    private String email;

    @Column(nullable = false)
    private String specialization; 

    private Integer experience;

    @Builder.Default
    private Double rating = 5.0;

    @Column(nullable = false)
    private String availability; 

    private Double currentLatitude;
    private Double currentLongitude;

    private String status;

    private String skillCategory;
    private String address;

    @Builder.Default
    private Integer currentJobs = 0;

    
    public String getName() {
        return fullName;
    }

    public void setName(String name) {
        this.fullName = name;
    }

    public String getSkills() {
        return specialization;
    }

    public void setSkills(String skills) {
        this.specialization = skills;
    }
}
