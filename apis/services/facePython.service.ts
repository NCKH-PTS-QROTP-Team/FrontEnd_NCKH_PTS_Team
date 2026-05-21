/**
 * Gọi thẳng Face Recognition Service (Python) - không qua Java.
 * Cấu hình: EXPO_PUBLIC_FACE_PYTHON_URL (mặc định http://localhost:8110)
 */

const getPythonBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_FACE_PYTHON_URL) {
    return process.env.EXPO_PUBLIC_FACE_PYTHON_URL.replace(/\/$/, "");
  }
  return "http://localhost:8110";
};

export interface PythonDetectBbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PythonDetectResponse {
  success: boolean;
  message: string;
  data?: {
    faceCount?: number;
    bbox?: PythonDetectBbox;
    confidence?: number;
    imageWidth?: number;
    imageHeight?: number;
  };
}

export interface PythonVerifyResponse {
  success: boolean;
  message: string;
  data?: {
    isMatch: boolean;
    similarity: number;
    threshold: number;
    message?: string;
  };
}

export const facePythonService = {
  getBaseUrl: getPythonBaseUrl,

  /**
   * Detect mặt trong ảnh (base64) - POST /api/detect
   * Python trả về bbox { x, y, width, height } (tọa độ ảnh gốc)
   */
  async detect(base64Image: string): Promise<PythonDetectResponse> {
    const baseUrl = getPythonBaseUrl();
    const cleanBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
    const res = await fetch(`${baseUrl}/api/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image: cleanBase64 }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.detail || json?.message || "Lỗi detect face");
    }
    return json as PythonDetectResponse;
  },

  /**
   * Xác thực: so sánh ảnh với encoding đã đăng ký - POST /api/verify
   * Cần registeredEncoding (lấy từ nguồn khác, ví dụ Java hoặc storage)
   */
  async verify(base64Image: string, registeredEncoding: number[]): Promise<PythonVerifyResponse> {
    const baseUrl = getPythonBaseUrl();
    const cleanBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
    const res = await fetch(`${baseUrl}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64Image: cleanBase64,
        registeredEncoding,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.detail || json?.message || "Lỗi verify face");
    }
    return json as PythonVerifyResponse;
  },
};
