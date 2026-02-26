/**
 * Helper functions để map error messages từ backend thành messages thân thiện với user
 * Cải thiện UX khi hiển thị toast/error messages
 */

/**
 * Map error message từ backend thành message thân thiện hơn
 * @param errorMessage - Error message từ backend
 * @returns Message thân thiện với user
 */
export function getFriendlyErrorMessage(errorMessage: string): string {
  if (!errorMessage) {
    return "Đã xảy ra lỗi. Vui lòng thử lại.";
  }

  // Normalize message (lowercase, trim)
  const normalized = errorMessage.toLowerCase().trim();

  // Map các error messages phổ biến
  if (normalized.includes("không tìm thấy khuôn mặt") || 
      normalized.includes("no face") ||
      normalized.includes("face not found")) {
    return " Không phát hiện khuôn mặt. Vui lòng:\n• Đưa mặt vào giữa khung\n• Đảm bảo đủ ánh sáng\n• Giữ khoảng cách vừa phải";
  }

  if (normalized.includes("mặt quá xa") || 
      normalized.includes("face too far") ||
      normalized.includes("face too small")) {
    return " Khuôn mặt quá xa. Vui lòng đưa mặt lại gần camera hơn.";
  }

  if (normalized.includes("mặt quá gần") || 
      normalized.includes("face too close") ||
      normalized.includes("face too large")) {
    return " Khuôn mặt quá gần. Vui lòng lùi ra xa một chút.";
  }

  if (normalized.includes("không khớp") || 
      normalized.includes("not match") ||
      normalized.includes("face mismatch")) {
    return " Khuôn mặt không khớp. Vui lòng thử lại hoặc đăng ký lại khuôn mặt.";
  }

  if (normalized.includes("gian lận") || 
      normalized.includes("spoof") ||
      normalized.includes("fake") ||
      normalized.includes("ảnh giả") ||
      normalized.includes("video giả")) {
    return " Phát hiện gian lận. Vui lòng sử dụng khuôn mặt thật để xác thực.";
  }

  if (normalized.includes("chưa đăng ký") || 
      normalized.includes("not registered") ||
      normalized.includes("face id chưa")) {
    return " Chưa đăng ký khuôn mặt. Vui lòng đăng ký khuôn mặt trước khi điểm danh.";
  }

  if (normalized.includes("network") || 
      normalized.includes("kết nối") ||
      normalized.includes("connection")) {
    return " Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.";
  }

  if (normalized.includes("timeout") || 
      normalized.includes("hết thời gian")) {
    return "⏱ Hết thời gian chờ. Vui lòng thử lại.";
  }

  if (normalized.includes("camera") || 
      normalized.includes("chưa sẵn sàng")) {
    return " Camera chưa sẵn sàng. Vui lòng kiểm tra quyền truy cập camera.";
  }

  // Nếu không match pattern nào → trả về message gốc (đã thân thiện từ backend)
  return errorMessage;
}

/**
 * Extract error message từ error object (Axios error)
 * @param error - Error object từ catch block
 * @returns Error message string
 */
export function extractErrorMessage(error: any): string {
  // Ưu tiên lấy từ detail (message chi tiết từ backend)
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.data?.detail) {
    return error.response.data.data.detail;
  }
  if (error?.response?.data?.data?.message) {
    return error.response.data.data.message;
  }
  
  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

/**
 * Get friendly error message từ error object
 * @param error - Error object từ catch block
 * @returns Friendly error message
 */
export function getFriendlyError(error: any): string {
  const errorMessage = extractErrorMessage(error);
  return getFriendlyErrorMessage(errorMessage);
}

