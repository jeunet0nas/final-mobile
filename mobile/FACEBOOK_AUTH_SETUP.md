# Hướng Dẫn Cấu Hình Facebook Authentication cho Expo

## 📋 Yêu Cầu

- Tài khoản Facebook Developer
- Facebook App ID
- Expo project đã được cấu hình

## 🚀 Các Bước Cấu Hình

### 1. Tạo Facebook App

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Nhấp vào **"My Apps"** → **"Create App"**
3. Chọn **"Consumer"** hoặc **"None"**
4. Điền thông tin:
   - **App Name**: DermaCheck (hoặc tên app của bạn)
   - **App Contact Email**: Email của bạn
5. Nhấp **"Create App"**

### 2. Thêm Facebook Login

1. Trong dashboard của app, tìm **"Facebook Login"**
2. Nhấp **"Set Up"**
3. Chọn platform **"Web"** để cấu hình cơ bản

### 3. Cấu Hình OAuth Settings

1. Vào **Settings → Basic**
2. Lưu lại **App ID** và **App Secret**
3. Vào **Facebook Login → Settings**
4. Thêm **Valid OAuth Redirect URIs**:
   ```
   https://auth.expo.io/@your-username/your-app-slug
   ```
   Thay `your-username` và `your-app-slug` bằng thông tin thực của bạn

### 4. Cài Đặt Package

Chạy lệnh sau trong thư mục `mobile`:

```bash
npx expo install expo-auth-session expo-crypto expo-web-browser
```

### 5. Cập Nhật Code

#### 5.1 Cập nhật app.json

Thêm scheme vào `app.json`:

```json
{
  "expo": {
    "scheme": "dermacheck",
    "ios": {
      "bundleIdentifier": "com.yourcompany.dermacheck"
    },
    "android": {
      "package": "com.yourcompany.dermacheck"
    }
  }
}
```

#### 5.2 Tạo Facebook Auth Hook

Tạo file `hooks/useFacebookAuth.ts`:

```typescript
import { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

WebBrowser.maybeCompleteAuthSession();

const FACEBOOK_APP_ID = "YOUR_FACEBOOK_APP_ID"; // Thay bằng App ID của bạn

export const useFacebookAuth = () => {
  const { loginWithFacebook } = useAuth();
  const [loading, setLoading] = useState(false);

  const discovery = {
    authorizationEndpoint: "https://www.facebook.com/v12.0/dialog/oauth",
  };

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "dermacheck",
    path: "redirect",
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: FACEBOOK_APP_ID,
      scopes: ["public_profile", "email"],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      handleFacebookLogin(access_token);
    } else if (response?.type === "error") {
      Alert.alert("Lỗi", "Đăng nhập Facebook thất bại");
      setLoading(false);
    }
  }, [response]);

  const handleFacebookLogin = async (accessToken: string) => {
    try {
      setLoading(true);
      await loginWithFacebook(accessToken);
      setLoading(false);
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error.message);
      setLoading(false);
    }
  };

  const loginWithFacebookAsync = async () => {
    setLoading(true);
    await promptAsync();
  };

  return {
    loginWithFacebookAsync,
    loading,
    request,
  };
};
```

#### 5.3 Sử dụng trong Login/Register Screen

```typescript
import { useFacebookAuth } from '@/hooks/useFacebookAuth';

export default function LoginScreen() {
  const { loginWithFacebookAsync, loading: fbLoading } = useFacebookAuth();

  const handleFacebookLogin = async () => {
    await loginWithFacebookAsync();
  };

  return (
    // ... UI code
    <SocialLogin
      onGoogleLogin={handleGoogleLogin}
      onFacebookLogin={handleFacebookLogin}
    />
  );
}
```

### 6. Test Facebook Login

#### Development (Expo Go)

```bash
npx expo start
```

Quét QR code và test trên thiết bị thực.

#### Production Build

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

### 7. Thêm Test Users (Tùy chọn)

Trong lúc phát triển, bạn có thể thêm test users:

1. Vào **Facebook App Dashboard**
2. Chọn **Roles → Test Users**
3. Nhấp **"Add"** để tạo test user
4. Sử dụng test user này để đăng nhập trong quá trình phát triển

## 🔒 Bảo Mật

**⚠️ QUAN TRỌNG:**

1. **KHÔNG** commit `FACEBOOK_APP_ID` và `FACEBOOK_APP_SECRET` lên Git
2. Sử dụng environment variables:
   ```bash
   # .env
   FACEBOOK_APP_ID=your_app_id_here
   ```
3. Thêm `.env` vào `.gitignore`
4. Sử dụng `expo-constants` để đọc env variables:
   ```typescript
   import Constants from "expo-constants";
   const FACEBOOK_APP_ID = Constants.expoConfig?.extra?.facebookAppId;
   ```

## 📱 Các Lỗi Thường Gặp

### 1. "Invalid OAuth Redirect URI"

- Kiểm tra lại Redirect URI trong Facebook App Settings
- Đảm bảo scheme trong `app.json` khớp với code

### 2. "App Not Set Up"

- Đảm bảo Facebook Login đã được thêm vào app
- Kiểm tra OAuth settings đã được cấu hình

### 3. "Token Invalid"

- Kiểm tra App ID có đúng không
- Đảm bảo app đã được public (hoặc dùng test users)

## 🌟 Thêm Tính Năng

### Lấy Thêm Thông Tin User

Sau khi đăng nhập, bạn có thể lấy thêm thông tin:

```typescript
const getUserProfile = async (accessToken: string) => {
  const response = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
  );
  const data = await response.json();
  return data;
};
```

## 📚 Tài Liệu Tham Khảo

- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [expo-auth-session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
