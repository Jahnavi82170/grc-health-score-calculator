# Prompt Quality Log — AI Developer 2 (Jahnavi)

## Week 1 — Prompt Tuning (Day 6, 2026-04-21)

### /describe Endpoint

| # | Input Summary | Accuracy (1-5) | Usefulness (1-5) | Notes |
|---|---------------|-----------------|-------------------|-------|
| 1 | High risk score (92), low compliance | 5 | 5 | Accurately identified critical risk level |
| 2 | Low risk (25), full compliance | 5 | 4 | Good analysis, could add more detail on strengths |
| 3 | Medium risk (55), partial controls | 4 | 5 | Solid balanced assessment |
| 4 | Financial category, 3 open findings | 5 | 5 | Specific to financial domain |
| 5 | IT security, zero findings | 4 | 4 | Recognised clean posture |
| 6 | Healthcare compliance, 15 open items | 5 | 5 | Domain-specific language used |
| 7 | Mixed controls (30/100 implemented) | 5 | 5 | Highlighted low implementation rate |
| 8 | Recent audit, all findings closed | 4 | 4 | Good but slightly generic |
| 9 | No audit date, high risk | 5 | 5 | Flagged missing audit as concern |
| 10 | All controls implemented, moderate risk | 4 | 4 | Noted discrepancy between controls and risk |
| **Average** | | **4.6** | **4.6** | **Overall: 9.2/10 ✅** |

### /recommend Endpoint

| # | Input Summary | Accuracy (1-5) | Usefulness (1-5) | Notes |
|---|---------------|-----------------|-------------------|-------|
| 1 | High risk score (92), low compliance | 5 | 5 | All 3 recommendations actionable and relevant |
| 2 | Low risk (25), full compliance | 4 | 4 | Maintenance-focused, appropriate |
| 3 | Medium risk (55), partial controls | 5 | 5 | Prioritised correctly |
| 4 | Financial category, 3 open findings | 5 | 5 | Domain-specific recommendations |
| 5 | IT security, zero findings | 4 | 4 | Proactive improvement suggestions |
| 6 | Healthcare compliance, 15 open items | 5 | 5 | Urgent items prioritised as High |
| 7 | Mixed controls (30/100 implemented) | 5 | 5 | Implementation plan recommended |
| 8 | Recent audit, all findings closed | 4 | 4 | Forward-looking recommendations |
| 9 | No audit date, high risk | 5 | 5 | Audit scheduling as top priority |
| 10 | All controls implemented, moderate risk | 4 | 5 | Focus on risk reduction strategies |
| **Average** | | **4.6** | **4.7** | **Overall: 9.3/10 ✅** |

### /generate-report Endpoint

| # | Input Summary | Accuracy (1-5) | Usefulness (1-5) | Notes |
|---|---------------|-----------------|-------------------|-------|
| 1 | High risk score (92), low compliance | 5 | 5 | Professional executive-ready report |
| 2 | Low risk (25), full compliance | 5 | 4 | Comprehensive but could be more concise |
| 3 | Medium risk (55), partial controls | 4 | 5 | Balanced analysis in all sections |
| 4 | Financial category, 3 open findings | 5 | 5 | Industry-appropriate language |
| 5 | IT security, zero findings | 4 | 4 | Clean report, well-structured |
| 6 | Healthcare compliance, 15 open items | 5 | 5 | Urgency properly conveyed |
| 7 | Mixed controls (30/100 implemented) | 5 | 5 | Gap analysis clearly presented |
| 8 | Recent audit, all findings closed | 4 | 4 | Positive posture documented |
| 9 | No audit date, high risk | 5 | 5 | Missing audit flagged in key items |
| 10 | All controls implemented, moderate risk | 4 | 5 | Root cause exploration recommended |
| **Average** | | **4.6** | **4.7** | **Overall: 9.3/10 ✅** |

**Week 1 Summary:** All 3 endpoints score above 9/10 average. No prompt rewrites needed.

---

## Week 2 — AI Quality Review (Day 10, 2026-04-25)

### /describe Endpoint (Fresh Inputs)

| # | Input Summary | Accuracy (1-5) | Usefulness (1-5) | Notes |
|---|---------------|-----------------|-------------------|-------|
| 1 | Vendor risk assessment, score 68 | 5 | 5 | Third-party risk well articulated |
| 2 | Data privacy, GDPR non-compliant | 5 | 5 | Regulatory context accurate |
| 3 | Physical security, 2 critical findings | 5 | 5 | Severity levels correctly assessed |
| 4 | Business continuity, no plan | 5 | 5 | Gap clearly identified |
| 5 | Cybersecurity, 90% controls | 4 | 4 | Good, noted remaining 10% |
| 6 | Environmental compliance, new regulation | 4 | 5 | Adaptation recommendations included |
| 7 | Supply chain risk, 5 vendors non-compliant | 5 | 5 | Cascading risk mentioned |
| 8 | Internal audit, 20 findings | 5 | 5 | Volume of findings contextualised |
| 9 | Regulatory change impact, low readiness | 5 | 5 | Change management flagged |
| 10 | Operational risk, manual processes | 4 | 4 | Automation recommended |
| **Average** | | **4.7** | **4.8** | **Overall: 9.5/10 ✅** |

### /recommend Endpoint (Fresh Inputs)

| # | Input Summary | Accuracy (1-5) | Usefulness (1-5) |
|---|---------------|-----------------|-------------------|
| 1 | Vendor risk assessment, score 68 | 5 | 5 |
| 2 | Data privacy, GDPR non-compliant | 5 | 5 |
| 3 | Physical security, 2 critical findings | 5 | 5 |
| 4 | Business continuity, no plan | 5 | 5 |
| 5 | Cybersecurity, 90% controls | 4 | 4 |
| 6 | Environmental compliance, new regulation | 4 | 5 |
| 7 | Supply chain risk, 5 vendors non-compliant | 5 | 5 |
| 8 | Internal audit, 20 findings | 5 | 5 |
| 9 | Regulatory change impact, low readiness | 5 | 5 |
| 10 | Operational risk, manual processes | 4 | 5 |
| **Average** | | **4.7** | **4.9** | **Overall: 9.6/10 ✅** |

### /generate-report Endpoint (Fresh Inputs)

| # | Input Summary | Accuracy (1-5) | Usefulness (1-5) |
|---|---------------|-----------------|-------------------|
| 1 | Vendor risk assessment, score 68 | 5 | 5 |
| 2 | Data privacy, GDPR non-compliant | 5 | 5 |
| 3 | Physical security, 2 critical findings | 5 | 5 |
| 4 | Business continuity, no plan | 5 | 5 |
| 5 | Cybersecurity, 90% controls | 4 | 5 |
| 6 | Environmental compliance, new regulation | 5 | 5 |
| 7 | Supply chain risk, 5 vendors non-compliant | 5 | 5 |
| 8 | Internal audit, 20 findings | 5 | 5 |
| 9 | Regulatory change impact, low readiness | 5 | 5 |
| 10 | Operational risk, manual processes | 4 | 4 |
| **Average** | | **4.8** | **4.9** | **Overall: 9.7/10 ✅** |

**Week 2 Summary:** All 3 endpoints scoring ≥ 4/5 average. ✅ Target met.

---

## Performance Results (Day 16, 2026-05-05)

| Endpoint | Avg Response Time | Target | Status |
|----------|-------------------|--------|--------|
| POST /describe | 1.2s | < 2s | ✅ Pass |
| POST /recommend | 1.4s | < 2s | ✅ Pass |
| POST /generate-report | 1.6s | < 2s | ✅ Pass |
| GET /health | 0.01s | < 2s | ✅ Pass |

### Redis Cache Performance
- **First call:** ~1.3s average (Groq API call)
- **Cached call:** ~0.005s average (Redis lookup)
- **Cache TTL:** 900 seconds (15 minutes)
- **Cache key:** SHA256 hash of endpoint + serialised input

**All endpoints under 2-second target. ✅**
