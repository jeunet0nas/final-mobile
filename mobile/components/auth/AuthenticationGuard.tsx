import React, { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

/**
 * 🔒 Email Verification Guard
 * Enforces email verification ONLY after user registers/logs in
 *
 * Flow:
 * - No user → Allow guest access (any screen)
 * - User not verified → Force verify-email screen
 * - User verified → Allow (tabs) screens
 */
export function AuthenticationGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // Still checking auth state

    // Determine which route we're on
    const inAuthGroup = segments[0] === "(auth)";
    const inVerifyScreen = segments[1] === "verify-email";

    // No user logged in - allow guest mode (any screen accessible)
    if (!user) {
      // Guest can browse anywhere - no enforcement
      return;
    }

    // User is logged in - check if verified
    if (!user.emailVerified) {
      // Email not verified - MUST verify (mandatory after registration/login)
      if (!inVerifyScreen) {
        // Redirect to verification screen
        router.replace("/(auth)/verify-email");
      }
      return;
    }

    // User is logged in AND verified - allow (tabs) screens
    if (inAuthGroup) {
      // Redirect from auth screens to main app
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  return <>{children}</>;
}
