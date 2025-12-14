FROM python:3.11-slim

# Install system dependencies (with retry for mirror sync issues)
RUN apt-get update && \
    apt-get install -y --fix-missing \
    build-essential \
    curl \
    git \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/* || \
    (apt-get clean && \
     apt-get update && \
     apt-get install -y --fix-missing \
     build-essential \
     curl \
     git \
     ffmpeg \
     && rm -rf /var/lib/apt/lists/*)

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create models directory
RUN mkdir -p models

EXPOSE 8001

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]