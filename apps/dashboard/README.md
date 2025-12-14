# YarnMarket AI Dashboard

A comprehensive admin dashboard for managing the YarnMarket AI multi-tenant system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.development .env.local
   ```

3. **Start the development server:**

   **Option A: With WebSocket server (Recommended)**
   ```bash
   npm run dev:full
   ```

   **Option B: Frontend only**
   ```bash
   npm run dev
   ```

   **Option C: WebSocket server only**
   ```bash
   npm run dev:ws
   ```

## 🔧 Fixing WebSocket Connection Issues

If you're seeing WebSocket connection errors like:
```
WebSocket connection to 'ws://localhost:8005/ws' failed: WebSocket is closed before the connection is established.
```

### Solution 1: Use Development WebSocket Server

The quickest fix is to use our included development WebSocket server:

```bash
# Install new dependencies first
npm install

# Start both the WebSocket server and React app
npm run dev:full
```

This will start:
- WebSocket server on `http://localhost:8005/ws`
- React development server on `http://localhost:5173`

### Solution 2: Manual Steps

1. **Install WebSocket dependencies:**
   ```bash
   npm install ws concurrently --save-dev
   ```

2. **Start the WebSocket server in one terminal:**
   ```bash
   npm run dev:ws
   ```

3. **Start the React app in another terminal:**
   ```bash
   npm run dev
   ```

## 🛠️ Development WebSocket Server

Our development WebSocket server (`scripts/dev-websocket-server.js`) provides:

- ✅ Basic WebSocket connection handling
- ✅ CORS support for development
- ✅ Health check endpoint at `/health`
- ✅ Test message broadcasting every 10 seconds
- ✅ Connection logging and debugging

**Server endpoints:**
- WebSocket: `ws://localhost:8005/ws`
- Health check: `http://localhost:8005/health`

A comprehensive admin dashboard for monitoring and managing the YarnMarket AI conversation system.

## Features

### 🎯 System Overview
- **Real-time System Metrics**: Monitor merchants, messages, response times, and success rates
- **Live Status Indicators**: Track WhatsApp webhook, message worker, conversation engine, and database health
- **Queue Monitoring**: View RabbitMQ queue status and message processing rates
- **Recent Activity Feed**: See latest system events and activities

### 👥 Merchant Management
- **Merchant Directory**: View all registered merchants with status indicators
- **Quick Actions**: Create, edit, and manage merchant accounts
- **Search & Filter**: Find merchants by name, phone, business type, or status
- **Activity Tracking**: See message counts and engagement metrics per merchant

### 💬 Message Monitoring
- **Live Message Stream**: Real-time view of all WhatsApp messages (inbound/outbound)
- **Advanced Filtering**: Filter by merchant, direction, status, and timeframe
- **Message Analytics**: View delivery rates, response times, and failure rates
- **Content Preview**: See message content with type indicators (text, image, etc.)

### 🗣️ Conversation Threads
- **Conversation Overview**: Monitor active customer conversations
- **Thread Details**: View full conversation history in chat interface
- **Status Tracking**: See conversation states (active, waiting, ended)
- **Duration & Metrics**: Track conversation length and message counts

### 📊 Queue Management
- **RabbitMQ Monitoring**: Real-time queue depth, consumer count, and memory usage
- **Queue Actions**: Retry failed messages or purge queues when needed
- **System Health**: Monitor RabbitMQ node status, uptime, and connections
- **Performance Alerts**: Visual indicators for high load or error conditions

### ⚙️ System Configuration
- **Webhook Settings**: Configure WhatsApp webhook URL and verify token
- **Processing Parameters**: Set retry attempts, timeouts, and queue limits
- **Monitoring Controls**: Enable/disable logging, metrics, and set log levels
- **Testing Tools**: Send test messages and run system health checks

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds  
- **Tailwind CSS** for responsive, utility-first styling
- **React Query** for server state management and caching
- **React Router** for client-side routing
- **Lucide React** for consistent iconography
- **Sonner** for toast notifications

### Backend API
- **FastAPI** for high-performance Python API
- **WebSockets** for real-time updates and live data streaming
- **SQLAlchemy** for PostgreSQL database operations
- **Redis** integration for caching and session management
- **MongoDB** client for conversation data access
- **RabbitMQ** management for queue monitoring and operations
- **Prometheus** metrics collection and health monitoring

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dashboard UI  │    │  Dashboard API   │    │  Existing YM    │
│   (React SPA)   │◄──►│   (FastAPI)     │◄──►│   Services      │
│   Port: 3001    │    │   Port: 8005     │    │   (Various)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌──────────────────┐    ┌─────────────────┐
         │              │   Data Sources   │    │  Message Queue  │
         │              │                  │    │   (RabbitMQ)    │
         │              │ • PostgreSQL     │    │   Port: 5673    │
         ▼              │ • Redis Cache    │    └─────────────────┘
┌─────────────────┐     │ • MongoDB        │              │
│     Nginx       │     │ • RabbitMQ       │              ▼
│  (Reverse Proxy │     └──────────────────┘    ┌─────────────────┐
│   Load Balancer)│                             │  WhatsApp API   │
│   Port: 80      │                             │   Processing    │
└─────────────────┘                             └─────────────────┘
```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for API development)

### Development Setup

1. **Clone and Install**
   ```bash
   # From project root
   cd apps/dashboard
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Update API endpoints
   VITE_API_URL=http://localhost:8005
   VITE_WS_URL=ws://localhost:8005
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Backend Services**
   ```bash
   # From project root
   docker-compose up dashboard-api postgres redis mongodb rabbitmq
   ```

### Production Deployment

1. **Full Stack Launch**
   ```bash
   # From project root
   docker-compose up -d
   ```

2. **Access Points**
   - Dashboard UI: http://localhost:3001
   - Dashboard API: http://localhost:8005
   - API Documentation: http://localhost:8005/docs
   - RabbitMQ Management: http://localhost:15673

## API Integration

The dashboard seamlessly integrates with existing YarnMarket services:

- **Reads from existing PostgreSQL merchants table** - No data duplication
- **Connects to existing Redis cache** - Shares session and cache data  
- **Accesses existing MongoDB conversations** - Views conversation history
- **Monitors existing RabbitMQ queues** - Real-time message processing status
- **Does not modify core message flow** - Pure monitoring and management layer

## Real-time Features

### WebSocket Connections
- Live system metrics updates every 5-30 seconds
- Real-time message status changes
- Queue depth and processing rate updates
- Connection status indicators with auto-reconnect

### Live Data Streams
- New message notifications
- Conversation status changes  
- Queue alerts and system events
- Merchant status updates

## Security Considerations

- **Environment Variables**: All sensitive config stored in environment variables
- **API Authentication**: Dashboard API includes authentication middleware
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Input Validation**: Comprehensive request validation and sanitization

## Monitoring & Observability

### Built-in Metrics
- API response times and error rates
- WebSocket connection health
- Database query performance  
- Queue processing metrics

### Health Checks
- Service health endpoints for all components
- Database connectivity checks
- Message queue accessibility verification
- External service dependency monitoring

## Customization

### Theming
```css
/* Customize colors in tailwind.config.js */
colors: {
  primary: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  }
}
```

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update sidebar navigation in `src/components/layout/Sidebar.tsx`
4. Add API endpoints in `src/api.ts`

### Custom API Endpoints
1. Add endpoint in `services/dashboard-api/main.py`
2. Update frontend API client in `apps/dashboard/src/api.ts`
3. Add TypeScript types in `apps/dashboard/src/types.ts`

## Contributing

1. **Development Workflow**
   ```bash
   # Create feature branch
   git checkout -b feature/dashboard-enhancement
   
   # Make changes and test
   npm run dev
   npm run type-check
   npm run lint
   
   # Build and verify
   npm run build
   
   # Submit pull request
   ```

2. **Code Standards**
   - TypeScript for all new code
   - ESLint and Prettier for formatting
   - Component-driven architecture
   - Responsive design patterns

## Troubleshooting

### Common Issues

**Connection Failed**
- Verify dashboard-api service is running on port 8005
- Check Docker network connectivity
- Confirm environment variables are set correctly

**WebSocket Disconnections**
- Check nginx proxy configuration
- Verify WebSocket endpoint accessibility
- Monitor browser dev tools for connection errors

**Slow Performance**
- Enable query caching in React Query configuration  
- Optimize database queries in dashboard API
- Check Redis connectivity for caching

### Debug Mode
```bash
# Enable verbose logging
VITE_DEBUG=true npm run dev

# Check API logs
docker-compose logs -f dashboard-api

# Monitor WebSocket messages
# Open browser dev tools > Network > WS
```

## License

This dashboard is part of the YarnMarket AI system and follows the same licensing terms.
