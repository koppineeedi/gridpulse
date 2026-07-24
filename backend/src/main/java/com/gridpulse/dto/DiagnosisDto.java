package com.gridpulse.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class DiagnosisDto {
    private String probableFault;
    private Double confidenceScore;
    private String recommendedRepair;
    private String rootCause;
    private String priority; 
    private Integer etaHours; 
    private String technicianSpecialization; 

}
