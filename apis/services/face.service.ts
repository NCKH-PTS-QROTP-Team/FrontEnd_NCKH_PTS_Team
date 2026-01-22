import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import {
  RegisterFaceRequest,
  RegisterFaceFromCameraRequest,
  VerifyFaceRequest,
  VerifyFaceFromCameraRequest,
  FaceResponse,
  FaceVerifyResponse,
  FaceEncodingResponse,
  FaceDetectionResponse,
} from '../types/face.types';

/**
 * Face Recognition Service
 */
export const faceService = {
  /**
   * Extract face encoding từ ảnh upload (multipart/form-data)
   * @param imageFile - File object (web) hoặc object có uri (React Native)
   */
  extractEncoding: async (imageFile: any): Promise<FaceEncodingResponse> => {
    const formData = new FormData();
    
    // Handle React Native image format
    if (imageFile.uri) {
      formData.append('image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.name || 'image.jpg',
      } as any);
    } else {
      // Handle web File/Blob
      formData.append('image', imageFile);
    }
    
    const response = await apiClient.post<ApiResponse<FaceEncodingResponse>>(
      '/face/extract-encoding',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Extract face encoding từ camera (base64)
   */
  extractEncodingFromCamera: async (
    base64Image: string
  ): Promise<FaceEncodingResponse> => {
    const response = await apiClient.post<ApiResponse<FaceEncodingResponse>>(
      '/face/extract-encoding-camera',
      { base64Image }
    );
    return response.data.data;
  },

  /**
   * Đăng ký face với encoding
   */
  register: async (request: RegisterFaceRequest): Promise<FaceResponse> => {
    const response = await apiClient.post<ApiResponse<FaceResponse>>(
      '/face/register',
      request
    );
    return response.data.data;
  },

  /**
   * Đăng ký face từ ảnh upload
   * @param imageFile - File object (web) hoặc object có uri (React Native)
   */
  registerFromImage: async (
    studentId: string,
    imageFile: any
  ): Promise<FaceResponse> => {
    const formData = new FormData();
    formData.append('studentId', studentId);
    
    // Handle React Native image format
    if (imageFile.uri) {
      formData.append('image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.name || 'image.jpg',
      } as any);
    } else {
      // Handle web File/Blob
      formData.append('image', imageFile);
    }
    
    const response = await apiClient.post<ApiResponse<FaceResponse>>(
      '/face/register-from-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Đăng ký face từ camera (base64)
   */
  registerFromCamera: async (
    request: RegisterFaceFromCameraRequest
  ): Promise<FaceResponse> => {
    const response = await apiClient.post<ApiResponse<FaceResponse>>(
      '/face/register-from-camera',
      request
    );
    return response.data.data;
  },

  /**
   * Thêm góc mặt mới (multi-angle registration)
   */
  addFaceAngle: async (
    request: RegisterFaceFromCameraRequest
  ): Promise<FaceResponse> => {
    const response = await apiClient.post<ApiResponse<FaceResponse>>(
      '/face/add-face-angle',
      request
    );
    return response.data.data;
  },

  /**
   * Verify face với encoding
   */
  verify: async (request: VerifyFaceRequest): Promise<FaceVerifyResponse> => {
    const response = await apiClient.post<ApiResponse<FaceVerifyResponse>>(
      '/face/verify',
      request
    );
    return response.data.data;
  },

  /**
   * Verify face từ ảnh upload
   * @param imageFile - File object (web) hoặc object có uri (React Native)
   */
  verifyFromImage: async (
    studentId: string,
    imageFile: any
  ): Promise<FaceVerifyResponse> => {
    const formData = new FormData();
    formData.append('studentId', studentId);
    
    // Handle React Native image format
    if (imageFile.uri) {
      formData.append('image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.name || 'image.jpg',
      } as any);
    } else {
      // Handle web File/Blob
      formData.append('image', imageFile);
    }
    
    const response = await apiClient.post<ApiResponse<FaceVerifyResponse>>(
      '/face/verify-from-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Verify face từ camera (base64)
   */
  verifyFromCamera: async (
    request: VerifyFaceFromCameraRequest
  ): Promise<FaceVerifyResponse> => {
    const response = await apiClient.post<ApiResponse<FaceVerifyResponse>>(
      '/face/verify-from-camera',
      request
    );
    return response.data.data;
  },

  /**
   * Lấy face data theo studentId
   */
  getByStudentId: async (studentId: string): Promise<FaceResponse> => {
    const response = await apiClient.get<ApiResponse<FaceResponse>>(
      `/face/student/${studentId}`
    );
    return response.data.data;
  },

  /**
   * Cập nhật face
   */
  update: async (
    studentId: string,
    request: RegisterFaceRequest
  ): Promise<FaceResponse> => {
    const response = await apiClient.put<ApiResponse<FaceResponse>>(
      `/face/student/${studentId}`,
      request
    );
    return response.data.data;
  },

  /**
   * Xóa face
   */
  delete: async (studentId: string): Promise<void> => {
    await apiClient.delete(`/face/student/${studentId}`);
  },

  /**
   * Detect features từ ảnh (faces, eyes, smiles)
   * @param imageFile - File object (web) hoặc object có uri (React Native)
   */
  detectFeatures: async (
    imageFile: any,
    detectionType: string = 'all'
  ): Promise<FaceDetectionResponse> => {
    const formData = new FormData();
    formData.append('type', detectionType);
    
    // Handle React Native image format
    if (imageFile.uri) {
      formData.append('image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.name || 'image.jpg',
      } as any);
    } else {
      // Handle web File/Blob
      formData.append('image', imageFile);
    }
    
    const response = await apiClient.post<ApiResponse<FaceDetectionResponse>>(
      '/face/detect',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Detect face realtime từ camera frame (base64)
   * Dùng cho quét realtime để hiển thị bounding box
   */
  detectRealtime: async (
    base64Image: string
  ): Promise<FaceDetectionResponse> => {
    const response = await apiClient.post<ApiResponse<FaceDetectionResponse>>(
      '/face/detect-realtime',
      { base64Image }
    );
    return response.data.data;
  },

  /**
   * Test OpenCV status
   */
  testOpenCV: async (): Promise<string> => {
    const response = await apiClient.get<ApiResponse<string>>('/face/test/opencv');
    return response.data.data;
  },
};

