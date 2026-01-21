import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { socketClient } from './socketClient';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

/**
 * Socket Provider - Wrap app để dùng socket global
 * 
 * Usage:
 * ```tsx
 * <SocketProvider autoConnect={true}>
 *   <App />
 * </SocketProvider>
 * ```
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  autoConnect = false,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      const socketInstance = await socketClient.connect();
      setSocket(socketInstance);

      // Listen to connection status
      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });
    } catch (error) {
      console.error('Failed to connect socket:', error);
    }
  };

  const disconnect = () => {
    socketClient.disconnect();
    setSocket(null);
    setIsConnected(false);
  };

  const emit = (event: string, data?: any) => {
    socketClient.emit(event, data);
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socketClient.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socketClient.off(event, callback);
  };

  // Auto connect khi mount (nếu autoConnect = true)
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup khi unmount
    return () => {
      disconnect();
    };
  }, [autoConnect]);

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

/**
 * Hook để dùng socket trong components
 * 
 * Usage:
 * ```tsx
 * const { socket, isConnected, emit, on, off } = useSocket();
 * 
 * useEffect(() => {
 *   on('attendance:update', (data) => {
 *     console.log('Attendance updated:', data);
 *   });
 *   
 *   return () => {
 *     off('attendance:update');
 *   };
 * }, [on, off]);
 * ```
 */
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

