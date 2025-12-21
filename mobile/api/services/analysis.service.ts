import apiClient from "../client";
import {
  ApiResponse,
  AnalyzeSkinRequest,
  AnalyzeSkinResponse,
  AnalysisResult,
  HealthCheckResponse,
  SaveAnalysisResponse,
  AnalysisHistoryResponse,
} from "@/types/api.types";

export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response =
    await apiClient.get<ApiResponse<HealthCheckResponse>>("/health");
  return response.data.data;
};

/**
 * Analyze Skin - Phân tích da từ ảnh
 *
 * @param imageBase64 - Base64 string với prefix "data:image/jpeg;base64,..."
 * @param includeExpertInfo - Có lấy expert info từ RAG không?
 * @returns AnalysisResult với skinType, zones, recommendations
 *
 * Example:
 * ```ts
 * const result = await analyzeSkin(
 *   "data:image/jpeg;base64,/9j/4AAQ...",
 *   true
 * );
 * console.log(result.skinType); // "combination"
 * console.log(result.zones.length); // 5
 * ```
 */
export const analyzeSkin = async (
  imageBase64: string,
  includeExpertInfo: boolean = false
): Promise<AnalysisResult> => {
  const payload: AnalyzeSkinRequest = {
    image: imageBase64,
    includeExpertInfo,
  };

  const response = await apiClient.post<ApiResponse<AnalyzeSkinResponse>>(
    "/api/v1/analysis/skin",
    payload
  );

  // Unwrap: response.data.data.result
  return response.data.data.result;
};

/**
 * Save Analysis - Lưu kết quả phân tích vào lịch sử
 * Requires authentication (Firebase token)
 *
 * @param analysisResult - Kết quả phân tích cần lưu
 * @param imageBase64 - Optional: Base64 image để lưu thumbnail
 * @returns SaveAnalysisResponse với id và savedAt timestamp
 */
export const saveAnalysis = async (
  analysisResult: AnalysisResult,
  imageBase64?: string
): Promise<SaveAnalysisResponse> => {
  const payload = {
    result: analysisResult,
    image: imageBase64,
  };

  const response = await apiClient.post<ApiResponse<SaveAnalysisResponse>>(
    "/api/v1/analysis/save",
    payload
  );

  return response.data.data;
};

/**
 * Get Analysis History - Lấy danh sách lịch sử phân tích
 * Requires authentication (Firebase token)
 *
 * @param limit - Số lượng kết quả tối đa (default: 50)
 * @returns AnalysisHistoryResponse với danh sách analyses
 */
export const getAnalysisHistory = async (
  limit: number = 50
): Promise<AnalysisHistoryResponse> => {
  const response = await apiClient.get<ApiResponse<AnalysisHistoryResponse>>(
    `/api/v1/analysis/history?limit=${limit}`
  );

  return response.data.data;
};

/**
 * Delete Analysis - Xóa một phân tích khỏi lịch sử
 * Requires authentication (Firebase token)
 *
 * @param analysisId - ID của phân tích cần xóa
 * @returns Success message
 */
export const deleteAnalysis = async (
  analysisId: string
): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/api/v1/analysis/history/${analysisId}`
  );

  return response.data.data;
};
