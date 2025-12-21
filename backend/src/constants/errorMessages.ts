export const ErrorMessages = {
  // Generic
  INTERNAL_SERVER_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
  INVALID_REQUEST: 'Yêu cầu không hợp lệ.',
  MISSING_REQUIRED_FIELDS: 'Thiếu thông tin bắt buộc.',

  // Authentication
  UNAUTHORIZED: 'Bạn chưa đăng nhập.',
  INVALID_TOKEN: 'Token không hợp lệ hoặc đã hết hạn.',
  FORBIDDEN: 'Bạn không có quyền truy cập.',

  // File Upload
  FILE_TOO_LARGE: 'Kích thước file vượt quá giới hạn cho phép.',
  INVALID_FILE_TYPE: 'Loại file không được hỗ trợ.',
  NO_FILE_UPLOADED: 'Chưa có file nào được tải lên.',

  // Rate Limiting
  TOO_MANY_REQUESTS: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',

  // Analysis
  ANALYSIS_FAILED: 'Không thể phân tích hình ảnh. Vui lòng thử lại.',
  INVALID_IMAGE: 'Hình ảnh không hợp lệ hoặc bị hỏng.',

  // Gemini AI
  GEMINI_API_ERROR: 'Lỗi kết nối với Gemini AI.',
  GEMINI_RATE_LIMIT: 'Đã vượt quá giới hạn API của Gemini.',

  // Firebase
  FIREBASE_ERROR: 'Lỗi kết nối với Firebase.',
  USER_NOT_FOUND: 'Không tìm thấy người dùng.',

  // Cache
  CACHE_ERROR: 'Lỗi cache. Dữ liệu có thể không được cập nhật.',
} as const;
