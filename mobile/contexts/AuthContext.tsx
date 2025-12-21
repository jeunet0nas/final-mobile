import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase.config";
import {
  loginUser,
  registerUser,
  logoutUser,
  signInWithFacebook,
  resendVerificationEmail,
  isEmailVerified,
  isUserFullyAuthenticated,
} from "@/api/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loginWithFacebook: (accessToken: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  isFullyAuthenticated: () => Promise<boolean>; // 🔒 NEW: Check if verified
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    await registerUser(email, password, displayName);
  };

  const logout = async () => {
    await logoutUser();
  };

  const loginWithFacebook = async (accessToken: string) => {
    await signInWithFacebook(accessToken);
  };

  const resendVerification = async () => {
    if (!user) throw new Error("No user logged in");
    await resendVerificationEmail(user);
  };

  const checkEmailVerified = async (): Promise<boolean> => {
    return await isEmailVerified();
  };

  const isFullyAuthenticated = async (): Promise<boolean> => {
    return await isUserFullyAuthenticated();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loginWithFacebook,
        resendVerification,
        checkEmailVerified,
        isFullyAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
