/**
 * OTP Generate Request
 */
export interface OTPGenerateRequest {
  sessionId: string;
  teacherId: string;
}

/**
 * OTP Response
 */
export interface OTPResponse {
  id: string;
  sessionId: string;
  code: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * OTP Verify Request
 */
export interface OTPVerifyRequest {
  sessionId: string;
  code: string;
}

