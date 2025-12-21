import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ColorSchemeProvider } from "@/contexts/ColorSchemeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthenticationGuard } from "@/components/auth/AuthenticationGuard";
import "./global.css";

export default function RootLayout() {
  return (
    <ColorSchemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <AnalysisProvider>
            <ChatProvider>
              <AuthenticationGuard>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(auth)"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="analysis/[id]"
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="account"
                    options={{
                      headerShown: false,
                    }}
                  />
                </Stack>
              </AuthenticationGuard>
            </ChatProvider>
          </AnalysisProvider>
        </SettingsProvider>
      </AuthProvider>
    </ColorSchemeProvider>
  );
}
