package com.internship.tool.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * AiServiceClient — AI Developer 2 (Jahnavi)
 * Calls Flask AI endpoints from Spring Boot backend.
 * 
 * Features:
 *   - 10-second connect and read timeout
 *   - Methods: describeRecord, getRecommendations, generateReport
 *   - Returns null on ANY error (never throws to caller)
 *   - Logs each error with endpoint name and status code
 */
@Service
public class AiServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(AiServiceClient.class);

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    public AiServiceClient() {
        // Configure 10-second connect and read timeout
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * POST /describe — Get AI-generated description of a GRC record.
     *
     * @param payload GRC record data as key-value map
     * @return Parsed response map, or null on any error
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> describeRecord(Map<String, Object> payload) {
        String endpoint = "/describe";
        try {
            HttpEntity<Map<String, Object>> request = buildRequest(payload);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + endpoint, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("AI describeRecord call succeeded");
                return response.getBody();
            }

            logger.error("AI {} failed: HTTP {}", endpoint,
                    response.getStatusCode().value());
            return null;

        } catch (Exception e) {
            logger.error("AI {} error: {} — {}", endpoint,
                    e.getClass().getSimpleName(), e.getMessage());
            return null;
        }
    }

    /**
     * POST /recommend — Get 3 AI-generated recommendations for a GRC record.
     *
     * @param payload GRC record data as key-value map
     * @return Parsed response map with recommendations array, or null on error
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getRecommendations(Map<String, Object> payload) {
        String endpoint = "/recommend";
        try {
            HttpEntity<Map<String, Object>> request = buildRequest(payload);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + endpoint, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("AI getRecommendations call succeeded");
                return response.getBody();
            }

            logger.error("AI {} failed: HTTP {}", endpoint,
                    response.getStatusCode().value());
            return null;

        } catch (Exception e) {
            logger.error("AI {} error: {} — {}", endpoint,
                    e.getClass().getSimpleName(), e.getMessage());
            return null;
        }
    }

    /**
     * POST /generate-report — Generate a full GRC health report.
     *
     * @param payload GRC record data as key-value map
     * @return Parsed response map with report fields, or null on error
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> generateReport(Map<String, Object> payload) {
        String endpoint = "/generate-report";
        try {
            HttpEntity<Map<String, Object>> request = buildRequest(payload);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + endpoint, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("AI generateReport call succeeded");
                return response.getBody();
            }

            logger.error("AI {} failed: HTTP {}", endpoint,
                    response.getStatusCode().value());
            return null;

        } catch (Exception e) {
            logger.error("AI {} error: {} — {}", endpoint,
                    e.getClass().getSimpleName(), e.getMessage());
            return null;
        }
    }

    /**
     * Build an HttpEntity with JSON content-type headers.
     */
    private HttpEntity<Map<String, Object>> buildRequest(Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(payload, headers);
    }
}
