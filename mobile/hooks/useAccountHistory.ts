import { useState, useEffect } from "react";
import { Alert } from "react-native";
import {
  getAnalysisHistory,
  deleteAnalysis,
} from "@/api/services/analysis.service";
import { handleApiError } from "@/api/client";
import type { SavedAnalysis } from "@/types/api.types";

export const useAccountHistory = (isLoggedIn: boolean) => {
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Load history when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      // Small delay to ensure token is ready after login/register
      const timer = setTimeout(() => {
        loadHistory();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      // Clear history when logged out
      setHistory([]);
    }
  }, [isLoggedIn]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getAnalysisHistory(50);
      setHistory(data.analyses);
    } catch (error: any) {
      const errorMsg = handleApiError(error);
      Alert.alert("Lỗi", errorMsg);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDeleteHistory = (id: string) => {
    Alert.alert(
      "Xóa phân tích",
      "Bạn có chắc muốn xóa kết quả phân tích này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnalysis(id);
              setHistory((prev) => prev.filter((item) => item.id !== id));
              Alert.alert("Thành công", "Đã xóa phân tích");
            } catch (error: any) {
              const errorMsg = handleApiError(error);
              Alert.alert("Lỗi", errorMsg);
            }
          },
        },
      ]
    );
  };

  const toggleShowAll = () => {
    setShowAllHistory((prev) => !prev);
  };

  return {
    history,
    loadingHistory,
    refreshing,
    showAllHistory,
    handleRefresh,
    handleDeleteHistory,
    toggleShowAll,
    clearHistory: () => setHistory([]),
  };
};
