/**
 * API Response wrapper - Theo format của backend
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * Error response từ API
 */
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
  isNetworkError?: boolean;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

