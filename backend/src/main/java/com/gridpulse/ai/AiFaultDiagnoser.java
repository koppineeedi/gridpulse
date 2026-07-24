package com.gridpulse.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gridpulse.dto.DiagnosisDto;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AiFaultDiagnoser {

    private static final Logger log = LoggerFactory.getLogger(AiFaultDiagnoser.class);
    private static final String SPEC_GRID_AUTOMATION = "Grid Automation";

    @Value("${gridpulse.groq.api-key:}")
    private String groqApiKey;

    @Value("${gridpulse.groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${gridpulse.groq.url:https://api.groq.com/openai/v1}")
    private String groqUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public DiagnosisDto diagnoseFault(Double voltage, Double current, Double temperature, Double frequency, List<String> repairHistory) {
        
        if (groqApiKey == null || groqApiKey.trim().isEmpty() || groqApiKey.equals("${GROQ_API_KEY}")) {
            log.info("Groq API key not configured. Using local heuristic fault diagnosis.");
            return generateHeuristicDiagnosis(voltage, current, temperature, frequency, repairHistory);
        }

        try {
            log.info("Diagnosing fault using Groq AI ({}) via LangChain4j...", groqModel);
            
            OpenAiChatModel chatModel = OpenAiChatModel.builder()
                    .apiKey(groqApiKey)
                    .baseUrl(groqUrl)
                    .modelName(groqModel)
                    .temperature(0.1)
                    .build();

            String userPrompt = String.format("""
                    Telemetry:
                    Voltage: %.1fV
                    Current: %.1fA
                    Temperature: %.1f°C
                    Frequency: %.1fHz

                    Substation Repair History:
                    %s

                    Diagnose the fault and return EXACTLY this JSON format (no markdown blocks, no explanation):
                    {
                      "probableFault": "detailed fault description",
                      "confidenceScore": 0.0,
                      "recommendedRepair": "clear recommendation steps",
                      "rootCause": "underlying technical root cause",
                      "priority": "LOW" or "MEDIUM" or "HIGH" or "CRITICAL",
                      "etaHours": 4,
                      "technicianSpecialization": "Cable Repair" or "Transformer Specialist" or "Grid Automation"
                    }""",
                    voltage, current, temperature, frequency,
                    repairHistory.isEmpty() ? "No recent repairs recorded." : String.join("\n", repairHistory)
            );

            String response = chatModel.generate(userPrompt);
            log.info("AI Raw Response: {}", response);

            String cleanJson = response.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            return objectMapper.readValue(cleanJson, DiagnosisDto.class);

        } catch (Exception e) {
            log.warn("Groq AI Call failed: {}. Falling back to local heuristics.", e.getMessage());
            return generateHeuristicDiagnosis(voltage, current, temperature, frequency, repairHistory);
        }
    }

    private DiagnosisDto generateHeuristicDiagnosis(Double voltage, Double current, Double temperature, Double frequency, List<String> repairHistory) {
        String fault = "Normal Operation";
        double confidence = 99.0;
        String recommendation = "No repair required.";
        String cause = "System running under normal electrical parameters.";
        String priority = "LOW";
        int eta = 0;
        String spec = SPEC_GRID_AUTOMATION;

        if (temperature > 75.0) {
            fault = "Thermal Overload & Cooling Pump Seizure";
            confidence = 88.0;
            recommendation = "Inspect transformer cooling system, clean radiator fins, and replace coolant circulation pump.";
            cause = "Cooling pump mechanical seizure and radiator dust accumulation causing core temperature surge.";
            priority = "CRITICAL";
            eta = 4;
            spec = "Transformer Specialist";
        } else if (voltage < 170.0) {
            fault = "Feeder Cable Insulation Degradation (Voltage Sag)";
            confidence = 82.0;
            recommendation = "Conduct megger testing on primary distribution lines. Inspect terminal poles for sag or tracking.";
            cause = "Dielectric breakdown in underground feeder cable insulation caused by moisture ingress.";
            priority = "HIGH";
            eta = 3;
            spec = "Cable Repair";
        } else if (current > 30.0) {
            fault = "Distribution Overload & Short Circuit Threat";
            confidence = 85.0;
            recommendation = "Rebalance grid phases, investigate load surges from industrial sectors, and verify relay trip thresholds.";
            cause = "Excessive consumer demand spike and load unbalance across phases exceeding safe current limits.";
            priority = "CRITICAL";
            eta = 2;
            spec = SPEC_GRID_AUTOMATION;
        } else if (frequency < 48.0 || frequency > 52.0) {
            fault = "Phase Frequency Synchronisation Error";
            confidence = 90.0;
            recommendation = "Re-calibrate phase sync circuits, adjust tap changer ratios, and inspect circuit breakers.";
            cause = "Generator speed fluctuations and local transformer phase-locked loop (PLL) control loop drift.";
            priority = "MEDIUM";
            eta = 2;
            spec = SPEC_GRID_AUTOMATION;
        }

        if (!repairHistory.isEmpty()) {
            for (String hist : repairHistory) {
                if (hist.toLowerCase().contains("transformer") && fault.contains("Transformer")) {
                    fault = "Recurrent Transformer Winding Degradation";
                    confidence = 95.0;
                    recommendation = "Full transformer replacement recommended. Winding insulation has failed repeatedly.";
                    cause = "Repeated dielectric failure in core windings due to high persistent thermal stress.";
                    eta = 6;
                }
            }
        }

        return DiagnosisDto.builder()
                .probableFault(fault)
                .confidenceScore(confidence)
                .recommendedRepair(recommendation)
                .rootCause(cause)
                .priority(priority)
                .etaHours(eta)
                .technicianSpecialization(spec)
                .build();
    }
}
