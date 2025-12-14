'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState, useEffect, ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Merchant } from '@/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // WebSocket connection
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8005/ws';
  const { connectionStatus, lastMessage } = useWebSocket(wsUrl);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'connected':
          console.log('Dashboard connected to YarnMarket AI');
          break;
        case 'merchant_created':
          console.log('New merchant created:', lastMessage.data);
          queryClient.invalidateQueries({ queryKey: ['merchants'] });
          break;
        case 'system_update':
          queryClient.setQueryData(['metrics'], lastMessage.data?.metrics);
          break;
        case 'new_message':
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          break;
      }
    }
  }, [lastMessage]);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div className="flex h-screen">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            selectedMerchant={selectedMerchant}
            onMerchantSelect={setSelectedMerchant}
          />
          <div className="flex-1 flex flex-col">
            <Header
              selectedMerchant={selectedMerchant}
              onMerchantSelect={setSelectedMerchant}
            />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
        <Toaster richColors position="top-right" theme="dark" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
