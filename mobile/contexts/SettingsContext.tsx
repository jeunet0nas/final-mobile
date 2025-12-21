import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";

/**
 * Settings Context
 * Manages app settings with AsyncStorage (local) and Firestore (cloud backup)
 * 
 * Features:
 * - Auto-save analysis results
 * - High-quality analysis mode (slower but more detailed)
 * - Analytics & crash reports
 * - Notification preferences
 * - Sync settings across devices via Firestore
 */

const STORAGE_KEY = "@dermascan:settings";

export interface AppSettings {
  // Analysis settings
  autoSave: boolean;
  highQuality: boolean;
  
  // Privacy settings
  analytics: boolean;
  crashReports: boolean;
  
  // Notification settings (placeholder for future implementation)
  notifications: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSave: true,
  highQuality: false,
  analytics: true,
  crashReports: true,
  notifications: true,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load settings on mount
   * Priority: Firestore (if logged in) > AsyncStorage > Default
   */
  useEffect(() => {
    loadSettings();
  }, [user?.uid]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Try loading from Firestore first (if logged in)
      if (user) {
        const firestoreSettings = await loadFromFirestore();
        if (firestoreSettings) {
          setSettings(firestoreSettings);
          // Also save to AsyncStorage for offline access
          await saveToAsyncStorage(firestoreSettings);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to AsyncStorage
      const localSettings = await loadFromAsyncStorage();
      if (localSettings) {
        setSettings(localSettings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Use default settings on error
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromFirestore = async (): Promise<AppSettings | null> => {
    if (!user) return null;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().settings) {
        return docSnap.data().settings as AppSettings;
      }
    } catch (error) {
      console.error("Failed to load settings from Firestore:", error);
    }

    return null;
  };

  const loadFromAsyncStorage = async (): Promise<AppSettings | null> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AppSettings;
      }
    } catch (error) {
      console.error("Failed to load settings from AsyncStorage:", error);
    }

    return null;
  };

  const saveToAsyncStorage = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings to AsyncStorage:", error);
    }
  };

  const saveToFirestore = async (newSettings: AppSettings) => {
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { settings: newSettings }, { merge: true });
    } catch (error) {
      console.error("Failed to save settings to Firestore:", error);
    }
  };

  /**
   * Update settings
   * Saves to both AsyncStorage and Firestore
   */
  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    // Save to AsyncStorage immediately
    await saveToAsyncStorage(newSettings);

    // Save to Firestore in background (if logged in)
    if (user) {
      saveToFirestore(newSettings).catch(console.error);
    }
  };

  /**
   * Reset settings to default
   */
  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    await saveToAsyncStorage(DEFAULT_SETTINGS);

    if (user) {
      await saveToFirestore(DEFAULT_SETTINGS);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
