/**
 * API Module - Export tất cả services, types, và socket
 */

// Services
export * from './services';

// Types
export * from './types/api.types';
export * from './types/auth.types';
export * from './types/face.types';
export * from './types/attendance.types';
export * from './types/otp.types';
export * from './types/qr.types';
export * from './types/student.types';
export * from './types/teacher.types';
export * from './types/class.types';

// Socket
export { socketClient } from './socket/socketClient';
export { SocketProvider, useSocket } from './socket/SocketProvider';

// API Client
export { default as apiClient } from './config/apiClient';
export { setAuthToken, getAuthToken, removeAuthToken } from './config/apiClient';

