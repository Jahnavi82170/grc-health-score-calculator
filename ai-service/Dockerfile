FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (leverage Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download sentence-transformers model during build to cache it
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application code
COPY . .

# Expose Flask port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health', timeout=5)" || exit 1

# Run the application
CMD ["python", "app.py"]
