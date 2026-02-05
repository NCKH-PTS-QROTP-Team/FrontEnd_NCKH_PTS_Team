/**
 * Face Registration Request (với encoding)
 */
export interface RegisterFaceRequest {
  studentId: string;
  faceEncoding: number[];
  faceImageUrl?: string;
}

/**
 * Face Registration Request từ Camera (base64)
 */
export interface RegisterFaceFromCameraRequest {
  studentId: string;
  base64Image: string;
}

/**
 * Face Verify Request
 */
export interface VerifyFaceRequest {
  studentId: string;
  faceEncoding: number[];
  sessionId?: string;
}

/**
 * Face Verify Request từ Camera (base64)
 */
export interface VerifyFaceFromCameraRequest {
  studentId: string;
  base64Image: string;
}

/**
 * Face Response
 */
export interface FaceResponse {
  id: string;
  studentId: string;
  isVerified: boolean;
  registeredAt: string;
  registeredAnglesCount?: number; // Số góc mặt đã đăng ký
}

/**
 * Face Verify Response
 */
export interface FaceVerifyResponse {
  isMatch: boolean;
  similarity: number; // 0.0 - 1.0
  message: string;
  faceEncoding?: number[]; // Face encoding đã extract (optional, để tái sử dụng)
}

/**
 * Face Encoding Response
 */
export interface FaceEncodingResponse {
  faceEncoding: number[];
  processedImageBase64?: string;
  faceX?: number;
  faceY?: number;
  faceWidth?: number;
  faceHeight?: number;
}

/**
 * Face Detection Response
 */
export interface FaceDetectionResponse {
  facesDetected: number;
  faces: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  eyesDetected?: number;
  smilesDetected?: number;
  processedImageBase64?: string;
  imageWidth?: number; // Width của image đã detect (từ OpenCV Mat)
  imageHeight?: number; // Height của image đã detect (từ OpenCV Mat)
}

