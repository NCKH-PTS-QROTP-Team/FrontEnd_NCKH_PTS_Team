import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../config/apiClient';

/**
 * Socket.io Client Configuration
 */
class SocketClient {
  private socket: Socket | null = null;
  private baseURL: string;
  private isConnected: boolean = false;

  constructor() {
    // Base URL cho socket - Socket.IO chạy trên port 9092 (configurable trong backend)
    // Ưu tiên: Environment variable
    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SOCKET_URL) {
      this.baseURL = process.env.EXPO_PUBLIC_SOCKET_URL;
    } else if (__DEV__ || (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.startsWith('192.168.') ||
         window.location.hostname.startsWith('10.')))) {
      // Development hoặc local serve
      this.baseURL = 'http://localhost:9092'; // Socket port riêng để tránh conflict
    } else if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Nếu đang chạy local, dùng localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1' || 
          hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
        this.baseURL = 'http://localhost:9092';
      } else {
        // Production
        this.baseURL = 'https://your-production-api.com';
      }
    } else {
      // Fallback
      this.baseURL = __DEV__ ? 'http://localhost:9092' : 'https://your-production-api.com';
    }
  }

  /**
   * Kết nối socket với authentication
   */
  connect = async (): Promise<Socket> => {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Lấy token để authenticate
    const token = await getAuthToken();

    // Tạo socket connection với auth token
    this.socket = io(this.baseURL, {
      auth: {
        token: token || undefined,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Event listeners
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  };

  /**
   * Ngắt kết nối socket
   */
  disconnect = (): void => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  };

  /**
   * Emit event lên server
   */
  emit = (event: string, data?: any): void => {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Event not sent:', event);
    }
  };

  /**
   * Listen event từ server
   */
  on = (event: string, callback: (...args: any[]) => void): void => {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  };

  /**
   * Remove listener
   */
  off = (event: string, callback?: (...args: any[]) => void): void => {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  };

  /**
   * Get socket instance
   */
  getSocket = (): Socket | null => {
    return this.socket;
  };

  /**
   * Check connection status
   */
  getIsConnected = (): boolean => {
    return this.isConnected && this.socket?.connected === true;
  };
}

// Export singleton instance
export const socketClient = new SocketClient();

