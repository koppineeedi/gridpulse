package com.gridpulse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String role; 

    @Column(nullable = false)
    private String fullName;

    @Builder.Default
    private boolean passwordChanged = false;

    @Builder.Default
    private boolean enabled = true;

    @Builder.Default
    private boolean accountLocked = false;

    @Builder.Default
    private int failedAttempts = 0;

    @Builder.Default
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
}
