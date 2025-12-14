import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';

// Components
import { ModernSidebar } from './components/layout/ModernSidebar';
import { Header } from './components/layout/Header';

// Pages
import { Dashboard } from './pages/Dashboard';
import { ConversationTester } from './pages/ConversationTester';
import { Merchants } from './pages/Merchants';
import { Messages } from './pages/Messages';
import { Conversations } from './pages/Conversations';
import { Queues } from './pages/Queues';
import { Settings } from './pages/Settings';
import { RAGSystem } from './pages/RAGSystem';

// Hooks and Services
import { useWebSocket } from './hooks/useWebSocket';

// Types
import { Merchant } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime in React Query v5)
    },
  },
});

function App() {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // WebSocket connection for real-time updates
  const { lastMessage, connectionStatus } = useWebSocket('ws://localhost:8005/ws');
  
  // Handle real-time updates from WebSocket
  useEffect(() => {
    if (lastMessage) {
      try {
        const update = JSON.parse(lastMessage.data);
        
        switch (update.type) {
          case 'connected':
            toast.success('Dashboard connected to YarnMarket AI');
            break;
            
          case 'merchant_created':
            toast.success(`New merchant created: ${update.data.business_name}`);
            // Invalidate merchants query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
            break;
            
          case 'message_status_update':
            // Invalidate messages query to refresh data
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            break;
            
          case 'new_message':
            toast.info(`New message from ${update.data.from_user}`);
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            break;
            
          case 'system_update':
            // Update metrics without showing notification
            queryClient.setQueryData(['system-metrics'], update.data.metrics);
            queryClient.setQueryData(['queue-status'], update.data.queue_status);
            break;
            
          case 'queue_update':
            queryClient.invalidateQueries({ queryKey: ['queue-status'] });
            break;
            
          case 'error':
            toast.error(`System error: ${update.message}`);
            break;
            
          default:
            console.log('Unknown WebSocket update:', update);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage, queryClient]);

  // Connection status indicator
  useEffect(() => {
    if (connectionStatus === 'Open') {
      toast.success('Real-time connection established');
    } else if (connectionStatus === 'Closed') {
      toast.error('Real-time connection lost - attempting to reconnect...');
    }
  }, [connectionStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden relative">
          {/* Background Effects */}
          <div className="absolute inset-0 gradient-mesh animate-gradient opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
          
          {/* Sidebar */}
          <ModernSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            selectedMerchant={selectedMerchant}
            onMerchantSelect={setSelectedMerchant}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 relative z-10">
            {/* Header */}
            <Header
              selectedMerchant={selectedMerchant}
              connectionStatus={connectionStatus}
              onMerchantSelect={setSelectedMerchant}
            />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route 
                  path="/" 
                  element={<Navigate to="/dashboard" replace />} 
                />
                <Route 
                  path="/dashboard" 
                  element={<Dashboard selectedMerchant={selectedMerchant} />} 
                />
                <Route 
                  path="/conversation-tester" 
                  element={<ConversationTester selectedMerchant={selectedMerchant} />} 
                />
                <Route 
                  path="/merchants" 
                  element={<Merchants onMerchantSelect={setSelectedMerchant} />} 
                />
                <Route 
                  path="/messages" 
                  element={<Messages selectedMerchant={selectedMerchant} />} 
                />
                <Route 
                  path="/conversations" 
                  element={<Conversations selectedMerchant={selectedMerchant} />} 
                />
                <Route 
                  path="/queues" 
                  element={<Queues />} 
                />
                <Route 
                  path="/settings" 
                  element={<Settings />} 
                />
                <Route 
                  path="/rag-system" 
                  element={<RAGSystem selectedMerchant={selectedMerchant} />} 
                />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
      
      {/* Toast notifications */}
      <Toaster 
        richColors 
        position="top-right"
        expand={true}
        visibleToasts={5}
        duration={4000}
        theme="dark"
      />
    </QueryClientProvider>
  );
}

export default App;
