"""
Day 1 — test_groq.py
AI Developer 2 (Jahnavi) — GRC Health Score Calculator
Purpose: Verify Groq API key is working correctly
Run: python test_groq.py
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("❌ ERROR: GROQ_API_KEY not found in .env file!")
    print("   Please copy .env.example to .env and add your Groq API key.")
    sys.exit(1)

try:
    from groq import Groq

    client = Groq(api_key=GROQ_API_KEY)

    print("🔄 Testing Groq API connection...")

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": "Say hello in one sentence."}
        ],
        temperature=0.3,
        max_tokens=100
    )

    print("✅ Groq API is working!")
    print(f"   Model: llama-3.3-70b-versatile")
    print(f"   Response: {response.choices[0].message.content}")
    print(f"   Tokens used: {response.usage.total_tokens}")

except ImportError:
    print("❌ ERROR: groq package not installed.")
    print("   Run: pip install -r requirements.txt")
    sys.exit(1)

except Exception as e:
    print(f"❌ ERROR: Groq API call failed — {e}")
    sys.exit(1)
