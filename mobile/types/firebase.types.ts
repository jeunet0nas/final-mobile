import { Timestamp } from "firebase/firestore";
import type { AnalysisResult } from "./api.types";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AnalysisHistory {
  id: string;
  userId: string;
  createdAt: Timestamp;

  // Original image
  imageUrl: string;
  thumbnailUrl?: string;

  // Analysis result
  result: AnalysisResult;

  // Metadata
  deviceInfo?: {
    platform: "ios" | "android";
    appVersion: string;
  };
}

export interface SaveAnalysisParams {
  imageUri: string;
  result: AnalysisResult;
}
