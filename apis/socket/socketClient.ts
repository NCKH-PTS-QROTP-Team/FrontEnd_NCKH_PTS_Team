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
    // Tắt reconnection để tránh spam error khi server socket không chạy
    this.socket = io(this.baseURL, {
      auth: {
        token: token || undefined,
      },
      transports: ['websocket', 'polling'],
      reconnection: false, // Tắt auto-reconnect để tránh spam error
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 0, // Không tự động reconnect
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

    // Track error để tránh spam log
    let lastErrorTime = 0;
    const ERROR_LOG_INTERVAL = 5000; // Chỉ log error mỗi 5 giây

    // Tắt log error để tránh spam (socket không bắt buộc, chỉ dùng cho realtime face detection)
    this.socket.on('connect_error', () => {
      // Tắt log error vì socket không bắt buộc
      this.isConnected = false;
    });

    this.socket.on('error', () => {
      // Tắt log error vì socket không bắt buộc
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

