<<<<<<< HEAD
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5e1806b3-199c-4b68-8556-5449071c49bf

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5e1806b3-199c-4b68-8556-5449071c49bf) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5e1806b3-199c-4b68-8556-5449071c49bf) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
=======
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
>>>>>>> 048309d5d7017ce7537bb492cc438474128c8973
