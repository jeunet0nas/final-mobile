import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import type { AnalysisResult } from "@/types/api.types";

/**
 * Global Analysis Context
 * Persists analysis results across navigation and auth state changes
 *
 * Problem it solves:
 * 1. Keep analysis results when navigating (especially after login)
 * 2. Clear results only on logout
 * 3. Preserve state during component remounts
 */

interface AnalysisContextType {
  analysisResult: AnalysisResult | null;
  imageBase64: string | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setImageBase64: (base64: string | null) => void;
  resetAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setImageBase64(null);
  };

  /**
   * Clear analysis data only when user logs out
   * (NOT when logging in - we want to preserve guest analysis)
   */
  useEffect(() => {
    if (!user) {
      resetAnalysis();
    }
  }, [user?.uid]); // Trigger only on uid change (logout sets uid to undefined)

  return (
    <AnalysisContext.Provider
      value={{
        analysisResult,
        imageBase64,
        setAnalysisResult,
        setImageBase64,
        resetAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error(
      "useAnalysisContext must be used within an AnalysisProvider"
    );
  }
  return context;
};
