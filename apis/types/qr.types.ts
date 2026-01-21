/**
 * QR Generate Request
 */
export interface QRGenerateRequest {
  sessionId: string;
  teacherId: string;
}

/**
 * QR Response
 */
export interface QRResponse {
  id: string;
  sessionId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * QR Verify Request
 */
export interface QRVerifyRequest {
  sessionId: string;
  token: string;
}

