# Lessons Learned — AI Developer 2 (Jahnavi)

## Sprint: 14 April – 9 May 2026

---

## 3 Things That Went Well

### 1. Defence-in-Depth Security Architecture
Building security into the application from Day 1 — rather than bolting it on at the end — saved significant time and prevented multiple potential issues. The global sanitiser middleware, rate limiter, and security headers were implemented early (Days 2-3) and remained stable throughout the sprint. Having SECURITY.md as a living document made the Week 2 security sign-off straightforward because every threat and mitigation was already documented.

### 2. Groq REST API Resilience Pattern
The 3-retry exponential backoff pattern in the GroqClient proved invaluable. During development, we encountered occasional 429 rate-limit responses from Groq, and the automatic retry mechanism handled these transparently without any manual intervention. The fallback response pattern (`is_fallback: true`) ensured zero unhandled exceptions throughout the sprint — the application never returned a 500 error due to AI unavailability.

### 3. Prompt Engineering Methodology
The structured approach to prompt testing — scoring 10 inputs per endpoint across two separate weeks — provided quantifiable evidence of AI output quality. Scoring each output 1-5 for accuracy and usefulness made it objective rather than subjective. All endpoints consistently scored ≥ 4.5/5, which gave the team high confidence for Demo Day. Explicitly instructing the model to return structured JSON with exact key names eliminated parsing errors entirely.

---

## 3 Things to Improve in Future Sprints

### 1. Earlier Integration Testing with Java Backend
Integration testing with the Spring Boot backend via AiServiceClient.java was delayed until Day 11. Earlier integration (Week 1) would have caught cross-service issues sooner. In future, setting up a basic E2E test pipeline in the first few days would reduce late-stage integration bugs and give more time for polish.

### 2. Redis Cache Monitoring and Metrics
While the Redis cache works correctly (SHA256 key, 15-min TTL), we lack visibility into cache hit/miss ratios in production. Adding a `/cache-stats` endpoint or integrating with a monitoring tool like Prometheus/Grafana would provide operational insights. Cache invalidation strategies should also be explored for scenarios where underlying GRC data changes frequently.

### 3. Prompt Versioning and A/B Testing
Prompt templates evolved during the sprint, but we had no formal versioning system. In future, prompts should be version-controlled with metadata (version number, author, test date, average score) and the system should support A/B testing between prompt versions to objectively measure improvements. This would also make rollbacks easier if a new prompt performs worse.

---

## Features to Add Post-Sprint

The following features have been logged as GitHub Issues labelled `post-sprint`:

1. **Streaming AI Responses** — Use server-sent events (SSE) to stream long report generation in real-time instead of waiting for the full response. This improves perceived performance for the /generate-report endpoint.

2. **Prompt Injection ML Classifier** — Replace regex-based injection detection with a machine learning classifier (e.g., fine-tuned BERT) for more robust detection of novel attack patterns that static regexes might miss.

3. **Multi-Model Support** — Add ability to switch between different Groq models (e.g., Mixtral, Gemma) based on task complexity. Simpler queries could use smaller, faster models, while detailed reports use the full 70b model.

4. **Automated Prompt Quality Pipeline** — Build a CI/CD pipeline that automatically runs 10 test inputs through each endpoint on every PR, scores the outputs, and blocks merges if quality drops below 4/5 threshold.

5. **Audit Logging** — Log all AI requests and responses (with PII redaction) to a separate audit database for compliance tracking and model performance monitoring over time.

---

*Sprint complete. All submissions confirmed. — Jahnavi, AI Developer 2, Team Tool-86*
