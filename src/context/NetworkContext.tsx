import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthContext';
import { Network } from '@capacitor/network';
import { toast } from '@/components/ui/sonner';
import { websocketService } from '@/services/websocketService';

interface NetworkContextType {
  isOnline: boolean;
  connectionType: string | null;
  wsConnected: boolean;
  connectWebSocket: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  // Initialize WebSocket Status Handlers
  useEffect(() => {
    if (!isAuthenticated) return;
    // Listen for WebSocket connection status changes
    const handleWsStatus = (status: 'connected' | 'disconnected') => {
      setWsConnected(status === 'connected');
      // console.log(`WebSocket status changed: ${status}`);

      if (status === 'connected') {
        toast.success('Connected to server', {
          duration: 3000,
          id: 'ws-connected-toast',
        });
      } else {
        toast.error('Disconnected from server', {
          duration: 5000,
          id: 'ws-disconnected-toast',
        });
      }
    };

    websocketService.onStatusChange(handleWsStatus);

    return () => {
      websocketService.removeStatusHandler(handleWsStatus);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Check initial network status
    const checkNetworkStatus = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    };

    checkNetworkStatus();

    // Listen for network status changes
    //   const networkStatusListener =
    Network.addListener('networkStatusChange', (status) => {
      if (status.connected && !isOnline) {
        // Connection was restored
        toast.success('You are back online!', {
          duration: 3000,
        });

        // Try to reconnect WebSocket when network is back
        if (!wsConnected) {
          websocketService.connect();
        }
      } else if (!status.connected && isOnline) {
        // Connection was lost
        toast.error('You are offline. Some features may be unavailable.', {
          duration: Infinity, // Show until connection restored
          id: 'offline-toast', // Give it an ID to reference it later
        });
      }

      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    });

    return () => {
      // Clean up listeners when component unmounts
      Network.removeAllListeners();
    };
  }, [isOnline, wsConnected]);

  const connectWebSocket = () => {
    if (isOnline && !wsConnected) {
      websocketService.connect();
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        connectionType,
        wsConnected,
        connectWebSocket,
      }}
    >
      {children}
      {!isOnline && (
        <div className='fixed bottom-0 left-0 right-0 bg-destructive text-destructive-foreground p-2 z-50 flex items-center justify-center space-x-2'>
          <span className='inline-block h-2 w-2 rounded-full bg-current animate-pulse' />
          <span>You are offline. Some features may be unavailable.</span>
        </div>
      )}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
