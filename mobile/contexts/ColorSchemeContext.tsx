import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ColorScheme = "light" | "dark" | "auto";

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  actualColorScheme: "light" | "dark";
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
  isDark: boolean;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(
  undefined
);

const STORAGE_KEY = "@dermascan:color_scheme";

export const ColorSchemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("auto");

  // Load saved preference on mount
  useEffect(() => {
    loadSavedScheme();
  }, []);

  const loadSavedScheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved && (saved === "light" || saved === "dark" || saved === "auto")) {
        setColorSchemeState(saved as ColorScheme);
      }
    } catch (error) {
      console.error("Failed to load color scheme:", error);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, scheme);
      setColorSchemeState(scheme);
    } catch (error) {
      console.error("Failed to save color scheme:", error);
    }
  };

  // Determine actual color scheme to use
  const actualColorScheme: "light" | "dark" =
    colorScheme === "auto"
      ? deviceColorScheme || "light"
      : colorScheme;

  const isDark = actualColorScheme === "dark";

  return (
    <ColorSchemeContext.Provider
      value={{
        colorScheme,
        actualColorScheme,
        setColorScheme,
        isDark,
      }}
    >
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorSchemeContext = () => {
  const context = useContext(ColorSchemeContext);
  if (context === undefined) {
    throw new Error(
      "useColorSchemeContext must be used within a ColorSchemeProvider"
    );
  }
  return context;
};
