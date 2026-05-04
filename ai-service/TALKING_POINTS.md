# Talking Points — AI Developer 2 (Jahnavi)

> Quick-reference card for Demo Day Q&A. Read before presenting.

---

## Groq Explained (Plain English)

Groq is a cloud-based AI inference service that runs large language models extremely fast. Instead of hosting our own AI model — which would require expensive GPU servers — we send our data to Groq's API and get back intelligent analysis in about 1-2 seconds. Think of it like using Google Translate, but instead of translating languages, it translates raw compliance data into meaningful insights and recommendations. Groq is especially fast because they use custom-built hardware called LPUs (Language Processing Units) designed specifically for AI workloads, making them significantly faster than traditional GPU-based inference providers.

---

## LLaMA-3.3-70b Explained (Plain English)

LLaMA 3.3 70b is a large language model created by Meta (the company behind Facebook). The "70b" means it has 70 billion parameters — think of parameters as the knowledge points the AI learned during training. It was trained on massive amounts of text data, which allows it to understand and analyse complex information like our GRC compliance records. We chose this specific model because it offers an excellent balance between intelligence and speed — it is smart enough to produce accurate compliance analysis, but fast enough to respond in under 2 seconds. We use the "versatile" variant, which is optimised for a wide range of tasks including structured data analysis.

---

## Prompt Engineering Approach (Plain English)

Prompt engineering is how we instruct the AI to give us the exact format and quality of response we need. Instead of just sending raw data to the model and hoping for the best, we write detailed instruction templates that tell the AI exactly what role to play (a GRC analyst), what structure to use for its response (specific JSON keys), and what rules to follow (no personal information, exactly 3 recommendations, etc.). We tested each prompt with 20 different inputs across two weeks, scoring every output for accuracy and usefulness. Any prompt scoring below 4 out of 5 was rewritten until it met our quality bar. This rigorous testing ensures consistent, reliable outputs every time.

---

## Security Measures (Plain English)

We built three layers of security protection. First, every request goes through an input sanitisation filter that checks for 17 different patterns of prompt injection — these are tricks attackers use to try to make AI models ignore their instructions and do something harmful. If we detect any of these patterns, we reject the request immediately with a 400 error, and it never reaches the AI model. Second, we enforce rate limiting at 30 requests per minute per IP address to prevent anyone from flooding our service. Third, we add security headers to every response to protect against common web attacks like clickjacking and cross-site scripting. On top of all this, if the AI service ever goes down, we have automatic fallback responses so the application never crashes — users see a graceful message instead of an error screen. We documented everything in our SECURITY.md file, including a threat model with 5 identified threats and their mitigations.

---

## Quick Answers for Panel Questions

**Q: What AI model are you using and why?**
> LLaMA-3.3-70b-versatile via Groq. We chose it for its balance of intelligence and speed — 70 billion parameters for accurate analysis, Groq's LPU hardware for sub-2-second responses.

**Q: How do you prevent prompt injection?**
> Global middleware checks every POST request against 17 injection patterns before it reaches the AI. Malicious requests get a 400 error instantly. The AI model never sees them.

**Q: What happens if the AI is down?**
> Every AI call is wrapped in a try-except with 3 retries. If all retries fail, we return a fallback response with `is_fallback: true`. The application never returns a 500 error because of AI unavailability.

**Q: How fast does the AI respond?**
> Average 1.2-1.6 seconds per endpoint. Cached responses return in under 5 milliseconds. All endpoints are under our 2-second target.

**Q: What security testing did you do?**
> Automated pytest suite with 8+ tests, manual adversarial testing (injection, SQL, oversized input), OWASP ZAP active scan with zero critical/high findings, and two PII audits confirming no personal data in prompts.
