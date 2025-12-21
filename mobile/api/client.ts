import { ApiError } from "@/types/api.types";
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { auth } from "@/config/firebase.config";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
const API_TIMEOUT = parseInt(
  process.env.EXPO_PUBLIC_API_TIMEOUT || "150000",
  10
);
const ENABLE_DEBUG = process.env.EXPO_PUBLIC_ENABLE_DEBUG_LOGS === "true";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Token refresh promise để tránh race condition
let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Auto attach Firebase ID token if user is logged in
    const user = auth.currentUser;

    if (user) {
      try {
        // Chỉ force refresh nếu đang retry (có header X-Retry)
        // Request bình thường dùng cached token (performance tốt hơn)
        const forceRefresh = config.headers["X-Retry"] === "true";
        const token = await user.getIdToken(forceRefresh);
        config.headers.Authorization = `Bearer ${token}`;

        if (ENABLE_DEBUG) {
          console.log(
            `[API Request] 🔐 Token attached${forceRefresh ? " (refreshed)" : " (cached)"}`
          );
        }
      } catch (error) {
        console.error("[API Request] ❌ Failed to get Firebase token:", error);
        // Don't throw - allow request to continue as guest
      }
    } else {
      if (ENABLE_DEBUG) {
        console.log("[API Request] 👤 Guest mode - no token");
      }
    }

    if (ENABLE_DEBUG) {
      console.log("[API Request]", {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullURL: `${config.baseURL}${config.url}`,
        hasData: !!config.data,
        hasAuth: !!config.headers.Authorization,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("[Request Setup Error]", error.message);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // SUCCESS case
    if (ENABLE_DEBUG) {
      console.log("[API Response]", {
        status: response.status,
        url: response.config.url,
        success: response.data.success,
      });
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    if (!error.response) {
      console.error("[Network Error]", error.message);

      const networkError: ApiError = {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message:
            "Không thể kết nối đến server.\n\nKiểm tra:\n• Backend có chạy không?\n• URL đúng chưa?\n• Mạng có vấn đề?",
          details: error.message,
        },
      };
      return Promise.reject(networkError);
    }

    // Handle 401 Unauthorized (Token expired)
    const { status, data } = error.response;

    if (status === 401 && error.config && !error.config.headers["X-Retry"]) {
      console.log("[API] 🔄 Token expired, attempting to refresh...");

      try {
        const user = auth.currentUser;
        if (user) {
          // Tránh race condition: nếu đang có request khác refresh token rồi, đợi nó
          if (!refreshPromise) {
            refreshPromise = user.getIdToken(true).finally(() => {
              refreshPromise = null; // Clear sau khi xong
            });
          }

          const newToken = await refreshPromise;

          // Retry the original request with new token
          error.config.headers.Authorization = `Bearer ${newToken}`;
          error.config.headers["X-Retry"] = "true"; // Prevent infinite loop

          console.log("[API] ✅ Token refreshed, retrying request...");
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        console.error("[API] ❌ Token refresh failed:", refreshError);
        refreshPromise = null; // Clear on error
        // Let it fall through to normal error handling
      }
    }

    if (ENABLE_DEBUG) {
      console.error("[API Error]", {
        status,
        url: error.config?.url,
        code: data?.error?.code,
        message: data?.error?.message,
      });
    }

    // Chuẩn hóa error format
    const apiError: ApiError = {
      success: false,
      error: {
        code: data?.error?.code || `HTTP_${status}`,
        message: data?.error?.message || error.message || "Đã xảy ra lỗi",
        details: data?.error?.details,
      },
      requestId: data?.requestId,
    };

    return Promise.reject(apiError);
  }
);

export const handleApiError = (error: any): string => {
  if (error?.error?.message) return error.error.message;
  if (error?.message) return error.message;
  return "Đã xảy ra lỗi không xác định";
};

export default apiClient;
