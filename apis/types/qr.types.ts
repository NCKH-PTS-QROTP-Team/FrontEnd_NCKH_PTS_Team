/**
 * QR Code Status enum
 */
export enum QRStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

/**
 * Generate QR Code Request
 */
export interface GenerateQRRequest {
  sessionId: string;
  teacherId?: string;
  expiryMinutes?: number; // Thời hạn QR code (phút), mặc định 5 phút
}

/**
 * QR Code Response
 */
export interface QRCodeResponse {
  id: string;
  sessionId: string;
  token: string;
  expiresAt: string;
  status: QRStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Verify QR Code Request
 */
export interface VerifyQRRequest {
  sessionId: string;
  token: string;
}
