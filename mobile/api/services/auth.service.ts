import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  User,
  UserCredential,
  FacebookAuthProvider,
  signInWithCredential,
  OAuthCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase.config";
import type { UserProfile } from "@/types/firebase.types";

export const registerUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    await sendEmailVerification(user);

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      photoURL: null,
      emailVerified: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);

    return user;
  } catch (error: any) {
    console.error("Register error:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // 🔒 Check if email is verified before allowing login
    if (!user.emailVerified) {
      // Email not verified - user must verify first
      // Don't throw yet, just note it - UI will handle routing to verify screen
      console.log(
        "User logged in but email not verified - redirect to verify screen"
      );
    }

    return user;
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Logout error:", error);
    throw new Error("Đăng xuất thất bại. Vui lòng thử lại.");
  }
};

/**
 * Resend verification email to user
 */
export const resendVerificationEmail = async (user: User): Promise<void> => {
  try {
    await user.reload();
    if (user.emailVerified) {
      throw new Error("Email đã được xác nhận rồi");
    }
    await sendEmailVerification(user);
  } catch (error: any) {
    console.error("Resend verification error:", error);
    throw new Error(
      error.message || "Không thể gửi lại email xác nhận. Vui lòng thử lại."
    );
  }
};

/**
 * Check if current user's email is verified
 */
export const isEmailVerified = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;
  await user.reload();
  return user.emailVerified;
};

/**
 * 🔒 Enforce email verification requirement
 * Returns true only if user is authenticated AND email is verified
 */
export const isUserFullyAuthenticated = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  await user.reload();

  // Must be both authenticated AND verified
  return user.emailVerified;
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Password reset error:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Change password for logged-in user
 * Requires old password for reauthentication
 */
export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("Người dùng chưa đăng nhập");
    }

    // Reauthenticate with old password
    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    await reauthenticateWithCredential(user, credential);

    // Update to new password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error("Change password error:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Get user profile error:", error);
    return null;
  }
};

/**
 * Sign in with Facebook using access token
 */
export const signInWithFacebook = async (
  accessToken: string
): Promise<User> => {
  try {
    const credential = FacebookAuthProvider.credential(accessToken);
    const userCredential: UserCredential = await signInWithCredential(
      auth,
      credential
    );
    const user = userCredential.user;

    // Check if user profile exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    // If user profile doesn't exist, create it
    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || "Facebook User",
        photoURL: user.photoURL,
        emailVerified: true, // Facebook already verified email
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await setDoc(doc(db, "users", user.uid), userProfile);
    }

    return user;
  } catch (error: any) {
    console.error("Facebook login error:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Convert Firebase Auth error codes to Vietnamese messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "Email này đã được sử dụng";
    case "auth/invalid-email":
      return "Email không hợp lệ";
    case "auth/operation-not-allowed":
      return "Tính năng này chưa được kích hoạt";
    case "auth/weak-password":
      return "Mật khẩu quá yếu (tối thiểu 6 ký tự)";
    case "auth/user-disabled":
      return "Tài khoản đã bị vô hiệu hóa";
    case "auth/user-not-found":
      return "Không tìm thấy tài khoản";
    case "auth/wrong-password":
      return "Mật khẩu không đúng";
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không đúng";
    case "auth/too-many-requests":
      return "Quá nhiều lần thử. Vui lòng thử lại sau";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng. Vui lòng kiểm tra internet";
    case "auth/requires-recent-login":
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại";
    default:
      return "Đã xảy ra lỗi. Vui lòng thử lại";
  }
};
