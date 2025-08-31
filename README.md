# 🗣️ YarnMarket AI: The Conversational Commerce Revolution

## Project Overview

YarnMarket AI is a WhatsApp-native conversational commerce platform that brings the authentic African market haggling experience to digital commerce. Our AI assistant handles customer conversations, negotiates prices with cultural intelligence, and closes sales 24/7 with human-like warmth and trust.

## Architecture

```
yarnmarket-ai/
├── services/                    # Microservices
│   ├── webhook-handler/        # Go service for WhatsApp webhooks
│   ├── conversation-engine/    # Python FastAPI for AI conversations  
│   ├── merchant-api/          # NestJS for merchant operations
│   └── analytics-service/     # Python service for metrics
├── models/                     # AI/ML Models
│   ├── language-detection/    # Pidgin/Nigerian language detection
│   ├── intent-classification/ # Understanding customer intent
│   ├── negotiation-rl/       # Reinforcement learning for haggling
│   └── response-generation/  # Culturally appropriate responses
├── infrastructure/            # DevOps and deployment
├── mobile/                   # React Native merchant app
├── web/                     # Next.js dashboard
├── data/                   # Training data and logs
└── scripts/               # Utility scripts
```

## Key Features

- **Multi-language Support**: Nigerian Pidgin, Yoruba, Igbo, Hausa, English
- **Cultural Intelligence**: Authentic market haggling patterns
- **Real-time Negotiation**: AI-powered price negotiation
- **WhatsApp Native**: Full WhatsApp Business API integration
- **Merchant Control**: Live conversation monitoring and intervention
- **Voice Processing**: Voice note transcription and response
- **Analytics**: Comprehensive conversation and sales analytics

## Quick Start

1. **Setup Environment**:
   ```bash
   # Clone and setup
   git clone https://github.com/hellomuba/YarnMarket-AI
   cd yarnmarket-ai
   
   # Install dependencies
   make setup
   ```

2. **Configure WhatsApp**:
   - Register WhatsApp Business API
   - Add webhook URL to environment
   - Configure phone number verification

3. **Start Services**:
   ```bash
   docker-compose up -d
   ```

## Tech Stack

- **Backend**: Python FastAPI, Go (Gin), Node.js (NestJS)
- **AI/ML**: PyTorch, Transformers, Whisper, Ray RLlib
- **Database**: PostgreSQL, MongoDB, Redis, ClickHouse
- **Infrastructure**: Kubernetes, Docker, Terraform
- **Frontend**: React Native, Next.js, Tailwind CSS

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

Copyright 2024 YarnMarket AI. All rights reserved.
