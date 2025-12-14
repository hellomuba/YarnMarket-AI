# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the **YarnMarket AI Dashboard**, a Next.js 15-based admin dashboard for managing a multi-tenant AI messaging system. The dashboard provides real-time monitoring, merchant management, message handling, and system administration capabilities for the YarnMarket AI platform.

Key technologies:
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **React Query** (@tanstack/react-query) for data fetching and caching
- **WebSocket** integration for real-time updates
- **Framer Motion** for animations

## Development Commands

### Core Development Commands
```bash
# Start development server (runs on port 3002)
npm run dev

# Build for production
npm run build

# Start production server (runs on port 3002)
npm run start

# Run ESLint
npm run lint
```

### Running Individual Tests
The project doesn't currently have test scripts configured. When adding tests, typical commands would be:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testNamePattern="ComponentName"
```

## Architecture Overview

### High-Level Structure

The application follows Next.js App Router conventions with a clear separation of concerns:

**Core Directories:**
- `src/app/` - App Router pages and layouts
- `src/components/` - Reusable UI components
- `src/lib/` - API clients and utilities
- `src/hooks/` - Custom React hooks
- `src/contexts/` - React context providers
- `src/types.ts` - TypeScript type definitions

### Key Architectural Patterns

#### 1. Multi-Tenant Dashboard Structure
The dashboard manages multiple merchants through a centralized interface:
- **Merchant Selection**: Global merchant context in sidebar and header
- **Filtered Views**: All data views can be filtered by selected merchant
- **Real-time Updates**: WebSocket integration for live system status

#### 2. API Architecture
The API layer (`src/lib/api.ts`) provides:
- **Mock API Support**: `USE_MOCK_API` flag for development without backend
- **Axios-based Client**: Centralized HTTP client with error handling
- **Service Organization**: Separate API objects for merchants, messages, conversations, queues, system, and settings

#### 3. Data Management
- **React Query**: All API calls use React Query for caching, background updates, and error handling
- **WebSocket Integration**: Real-time updates invalidate relevant queries
- **Global State**: Minimal global state via React Context (ThemeContext)

#### 4. Real-Time Communication
WebSocket connection (`src/hooks/useWebSocket.ts`) handles:
- **System Health Updates**: Live service status monitoring
- **Message Status Changes**: Real-time message processing updates
- **Merchant Events**: New merchant creation notifications
- **Queue Updates**: Live queue status monitoring

### Page Structure

Each major feature has its own route under `src/app/`:

- **Dashboard** (`/`) - System overview with metrics and health status
- **Merchants** (`/merchants`) - Merchant management and creation
- **Messages** (`/messages`) - Message monitoring and retry functionality
- **Conversations** (`/conversations`) - Customer conversation tracking
- **Queues** (`/queues`) - Message queue status monitoring
- **RAG Management** (`/rag-management`) - AI knowledge base management
- **Test Console** (`/test-console`) - Message testing interface
- **Settings** (`/settings`) - System configuration

### Component Architecture

#### Layout Components
- **Providers** (`src/app/providers.tsx`) - Wraps app with React Query, Theme, and WebSocket providers
- **Sidebar** - Navigation with merchant selection
- **Header** - Connection status and merchant display

#### Shared Components
- **ErrorBoundary** - Error handling wrapper
- **ThemeToggle** - Theme switching functionality
- **RAGConfiguration** - AI knowledge management
- **ProductImportExport** - Data import/export utilities

### Type System

The `src/types.ts` file defines the core data models:
- **Merchant**: Business entities with status tracking
- **Message**: Communication records with processing status
- **Conversation**: Customer interaction threads
- **QueueInfo**: Message queue monitoring data
- **SystemMetrics**: Performance and health metrics
- **WebSocketMessage**: Real-time event structure

## API Integration

### Backend Connection
- **Development**: `http://localhost:8005` (configurable via `NEXT_PUBLIC_API_URL`)
- **WebSocket**: `ws://localhost:8005/ws` (configurable via `NEXT_PUBLIC_WS_URL`)
- **Mock Mode**: Set `USE_MOCK_API=true` in mock-api.ts for development without backend

### Key API Endpoints
- `/api/merchants` - Merchant CRUD operations
- `/api/messages` - Message retrieval and retry
- `/api/conversations` - Conversation management
- `/api/queues` - Queue status monitoring
- `/api/metrics` - System performance data
- `/health` - System health checks
- `/api/test-message` - Message testing

## Development Environment

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8005
NEXT_PUBLIC_WS_URL=ws://localhost:8005/ws
NEXT_PUBLIC_RAG_API_URL=http://localhost:8004
NEXT_PUBLIC_WEAVIATE_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCK_API=false
```

### Port Configuration
The application runs on port **3002** by default to avoid conflicts with other Next.js applications that typically use port 3000.

### TypeScript Configuration
- **Path Mapping**: `@/*` maps to `./src/*`
- **Strict Mode**: Enabled for better type safety
- **Target**: ES2017 for broad browser compatibility

## Key Features to Understand

### 1. Merchant Context System
The dashboard operates with a "selected merchant" concept where users can filter all views by a specific merchant. This is managed through:
- Sidebar merchant selection
- Header merchant display
- API calls with merchant_id filtering

### 2. Real-Time Updates
WebSocket integration provides live updates for:
- System health status changes
- New message processing
- Queue status changes
- Merchant creation events

### 3. Error Handling
- API errors are caught by axios interceptors
- ErrorBoundary components wrap key UI sections
- Toast notifications (Sonner) provide user feedback

### 4. Mock API Support
The `src/lib/mock-api.ts` provides a complete mock backend for development, allowing the frontend to be developed and tested independently.

This architecture supports rapid development while maintaining clear separation between the UI layer, data management, and backend integration.

## Weaviate Integration

### Vector Database Setup
The admin dashboard integrates with Weaviate for AI-powered semantic search and RAG functionality:

- **Weaviate URL**: http://localhost:8080
- **RAG System**: http://localhost:8004 (Weaviate-based)
- **Integration**: Via dashboard-api:8005 and direct RAG API calls

### Key Weaviate Features
1. **Product Catalog Indexing**: Merchants can index their product catalogs for semantic search
2. **Hybrid Search**: Text and image-based product search capabilities
3. **Real-time Analytics**: Conversation and customer behavior insights
4. **Cross-Dashboard**: Shared vector database between admin and vendor dashboards

### API Integration
```typescript
// RAG System API calls
import { ragSystemApi, weaviateApi } from '@/lib/api'

// Index merchant catalog
const result = await ragSystemApi.indexCatalog({
  merchant_id: "123",
  products: [...products],
  force_recreate: false
})

// Search products
const searchResults = await ragSystemApi.searchProducts({
  merchant_id: "123",
  text_query: "iPhone cases",
  limit: 10
})

// Direct Weaviate health check
const health = await weaviateApi.getHealth()
```

### Development Notes
- Mock API is **disabled** by default to use real Weaviate integration
- RAG system requires OpenAI API key for text embeddings
- Weaviate collections are automatically created per merchant
- Vector search supports both text queries and image uploads
