package com.gridpulse.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String tokenType; 
    private Long userId;
    private String username;
    private String fullName;
    private String role;
}
