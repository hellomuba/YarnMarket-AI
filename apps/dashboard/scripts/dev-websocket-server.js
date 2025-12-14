#!/usr/bin/env node

/**
 * Simple WebSocket Server for Development Testing
 * Run this when you don't have the full backend API running
 * 
 * Usage: node scripts/dev-websocket-server.js
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8006;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Basic health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        websocket: 'healthy'
      }
    }));
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/ws'
});

let clientCount = 0;
const clients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = `client_${++clientCount}`;
  clients.set(clientId, ws);
  
  console.log(`🔌 WebSocket client connected: ${clientId} (Total: ${clients.size})`);
  console.log(`📍 Client IP: ${req.socket.remoteAddress}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection_established',
    clientId: clientId,
    timestamp: new Date().toISOString(),
    message: 'Welcome to YarnMarket AI Development WebSocket Server!'
  }));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 Received from ${clientId}:`, message);

      // Echo the message back
      ws.send(JSON.stringify({
        type: 'echo',
        originalMessage: message,
        timestamp: new Date().toISOString(),
        clientId: clientId
      }));
    } catch (error) {
      console.error(`❌ Error parsing message from ${clientId}:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Invalid JSON format',
        timestamp: new Date().toISOString()
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', (code, reason) => {
    clients.delete(clientId);
    console.log(`🔌 Client disconnected: ${clientId} (Code: ${code}, Reason: ${reason})`);
    console.log(`📊 Active clients: ${clients.size}`);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${clientId}:`, error);
  });

  // Send periodic ping to keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000); // 30 seconds

  // Handle pong responses
  ws.on('pong', () => {
    console.log(`🏓 Pong received from ${clientId}`);
  });
});

// Broadcast test data every 10 seconds
setInterval(() => {
  if (clients.size > 0) {
    const testData = {
      type: 'test_broadcast',
      timestamp: new Date().toISOString(),
      data: {
        messageCount: Math.floor(Math.random() * 100),
        activeUsers: Math.floor(Math.random() * 20),
        systemLoad: (Math.random() * 100).toFixed(2) + '%'
      }
    };

    const message = JSON.stringify(testData);
    
    clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`📡 Broadcast sent to ${clients.size} clients`);
  }
}, 10000);

// Start server
server.listen(PORT, () => {
  console.log('\n🚀 YarnMarket AI Development WebSocket Server');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('\n📝 Logs:');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
