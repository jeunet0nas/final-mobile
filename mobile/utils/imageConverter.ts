import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Image } from "react-native";
import { Buffer } from "buffer";
import jpeg from "jpeg-js";

// Polyfill Buffer for React Native
if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

/**
 * Validate image dimensions from metadata (không decode full image)
 * Step 1 của pipeline
 */
export const validateImageDimensions = async (
  uri: string
): Promise<{
  valid: boolean;
  error?: string;
  dimensions?: { width: number; height: number };
}> => {
  return new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => {
        const MIN_SIZE = 400;
        const MAX_SIZE = 4000;

        if (width < MIN_SIZE || height < MIN_SIZE) {
          resolve({
            valid: false,
            error: `Ảnh quá nhỏ (${width}×${height}). Tối thiểu ${MIN_SIZE}×${MIN_SIZE}px`,
            dimensions: { width, height },
          });
          return;
        }

        if (width > MAX_SIZE || height > MAX_SIZE) {
          resolve({
            valid: false,
            error: `Ảnh quá lớn (${width}×${height}). Tối đa ${MAX_SIZE}×${MAX_SIZE}px`,
            dimensions: { width, height },
          });
          return;
        }

        resolve({ valid: true, dimensions: { width, height } });
      },
      (error) => {
        resolve({
          valid: false,
          error: "Không thể đọc thông tin ảnh",
        });
      }
    );
  });
};

/**
 * Decode base64 JPEG to RGBA pixel array
 * Dùng jpeg-js để decode thật sự (không phải JPEG bytes)
 */
const decodeJpegToPixels = (
  base64: string
): { data: Uint8Array; width: number; height: number } | null => {
  try {
    // Remove data URI prefix if exists
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");

    // Decode base64 to JPEG bytes using Buffer (React Native safe)
    const jpegBytes = Buffer.from(cleanBase64, "base64");

    // Decode JPEG → RGBA pixels
    const rawImage = jpeg.decode(jpegBytes, { useTArray: true });

    return {
      data: rawImage.data, // Uint8Array of RGBA pixels
      width: rawImage.width,
      height: rawImage.height,
    };
  } catch (error) {
    console.error("❌ [DecodeJpeg] Error:", error);
    return null;
  }
};

/**
 * Calculate average luminance from RGBA pixel data
 * Formula: Y = 0.299*R + 0.587*G + 0.114*B (ITU-R BT.601)
 * Sample every Nth pixel for speed
 */
const calculateLuminance = (
  pixels: Uint8Array,
  width: number,
  height: number
): number => {
  const SAMPLE_RATE = 10; // Sample every 10th pixel
  let sum = 0;
  let count = 0;

  // RGBA format: [R, G, B, A, R, G, B, A, ...]
  // Each pixel = 4 bytes
  const totalPixels = width * height;
  for (let i = 0; i < totalPixels; i += SAMPLE_RATE) {
    const offset = i * 4; // RGBA offset
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];

    // ITU-R BT.601 luminance formula
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    sum += luma;
    count++;
  }

  return count > 0 ? sum / count : 128;
};

/**
 * Calculate Laplacian variance for blur detection
 * Proper 2D convolution on grayscale pixels with safe sampling
 *
 * @returns Laplacian variance (higher = sharper) or null if cannot calculate
 */
const calculateLaplacianVariance = (
  pixels: Uint8Array,
  width: number,
  height: number
): number | null => {
  const SAMPLE_ROWS = 32; // Target 32 rows
  const SAMPLE_COLS = 32; // Target 32 cols

  // Harden sampling: prevent step = 0
  const rowStep = Math.max(1, Math.floor(height / SAMPLE_ROWS));
  const colStep = Math.max(1, Math.floor(width / SAMPLE_COLS));

  // Calculate actual grid dimensions (correct formula)
  const grayWidth = Math.floor((width - 1) / colStep) + 1;
  const grayHeight = Math.floor((height - 1) / rowStep) + 1;

  // Need at least 3x3 for Laplacian
  if (grayWidth < 3 || grayHeight < 3) {
    console.warn("⚠️ [Blur] Grid too small, skipping blur check");
    return null; // Cannot calculate, skip check
  }

  // Convert to grayscale grid (loop by grid index, not pixel coords)
  const gray = new Array(grayWidth * grayHeight);
  for (let gy = 0; gy < grayHeight; gy++) {
    const y = Math.min(height - 1, gy * rowStep);
    for (let gx = 0; gx < grayWidth; gx++) {
      const x = Math.min(width - 1, gx * colStep);
      const offset = (y * width + x) * 4; // RGBA offset

      // Bounds check
      if (offset + 2 >= pixels.length) {
        gray[gy * grayWidth + gx] = 128; // Fallback
        continue;
      }

      const r = pixels[offset];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      gray[gy * grayWidth + gx] = luma;
    }
  }

  let sum = 0;
  let sumSq = 0;
  let count = 0;

  // Apply Laplacian kernel (skip borders)
  for (let y = 1; y < grayHeight - 1; y++) {
    for (let x = 1; x < grayWidth - 1; x++) {
      const idx = y * grayWidth + x;

      // Bounds check all neighbors
      if (
        idx - 1 >= 0 &&
        idx + 1 < gray.length &&
        idx - grayWidth >= 0 &&
        idx + grayWidth < gray.length
      ) {
        // Laplacian kernel: center - 4 neighbors
        const laplacian = Math.abs(
          4 * gray[idx] -
            gray[idx - 1] - // left
            gray[idx + 1] - // right
            gray[idx - grayWidth] - // top
            gray[idx + grayWidth] // bottom
        );

        sum += laplacian;
        sumSq += laplacian * laplacian;
        count++;
      }
    }
  }

  if (count === 0) {
    console.warn("⚠️ [Blur] No valid samples, skipping blur check");
    return null; // Cannot calculate, skip check
  }

  const mean = sum / count;
  const variance = sumSq / count - mean * mean;

  return variance;
};

/**
 * Check image quality: brightness & blur (soft gate, demo-friendly)
 * Step 1.5 của pipeline
 *
 * Strategy: Chỉ chặn ảnh "rõ ràng xấu", cho qua những ảnh "hơi" xấu
 * - Brightness: chỉ chặn khi rất tối (< 35) hoặc cháy sáng (> 235)
 * - Blur: chỉ chặn khi rất mờ (< 40), warning khi hơi mờ (40-80)
 * - Decode fail: soft gate, vẫn cho qua
 */
export const checkImageQuality = async (
  uri: string
): Promise<{
  valid: boolean;
  error?: string;
  warning?: string;
  metrics?: {
    luminance: number;
    blurScore: number | null;
    width: number;
  };
}> => {
  try {
    console.log("🔍 [Quality] Checking...", { uri });

    // Resize về 128px, compress 1.0 để đo chính xác
    const tiny = await manipulateAsync(uri, [{ resize: { width: 128 } }], {
      compress: 1.0,
      format: SaveFormat.JPEG,
      base64: true,
    });

    if (!tiny.base64) {
      console.warn("⚠️ [Quality] No base64 data, skipping check");
      return { valid: true };
    }

    // Decode JPEG → RGBA pixels
    const decoded = decodeJpegToPixels(tiny.base64);
    if (!decoded) {
      console.warn("⚠️ [Quality] Cannot decode JPEG, skipping check");
      return { valid: true };
    }

    // Calculate metrics from real pixels
    const luminance = calculateLuminance(
      decoded.data,
      decoded.width,
      decoded.height
    );
    const blurScore = calculateLaplacianVariance(
      decoded.data,
      decoded.width,
      decoded.height
    );

    console.log("📊 [Quality] Metrics:", {
      luminance: luminance.toFixed(2),
      blurScore: blurScore !== null ? blurScore.toFixed(2) : "skipped",
      dimensions: `${decoded.width}×${decoded.height}`,
    });

    // === SOFT GATE THRESHOLDS ===
    // Mục tiêu: Chỉ chặn ảnh "rõ ràng xấu", không chặn nhầm
    // Độ rộng thresholds cho phép demo/learn không bị khó chịu

    // Brightness (0-255 scale, ITU-R BT.601)
    const TOO_DARK = 35; // Chỉ chặn khi RẤT tối (đen thui)
    const TOO_BRIGHT = 235; // Chỉ chặn khi RẤT sáng (trắng xóa/flash)

    // Blur (Laplacian variance on 128px image)
    const TOO_BLURRY = 40; // Chỉ chặn mờ NẶNG
    const BLUR_WARNING = 80; // Cảnh báo khi hơi mờ (40-80)

    let warning: string | undefined;

    // === CHECK 1: BRIGHTNESS ===
    if (luminance < TOO_DARK) {
      return {
        valid: false,
        error: "Ảnh quá tối. Vui lòng chụp ở nơi có ánh sáng tốt hơn",
        metrics: { luminance, blurScore, width: 128 },
      };
    }

    if (luminance > TOO_BRIGHT) {
      return {
        valid: false,
        error: "Ảnh quá sáng. Vui lòng giảm ánh sáng hoặc tránh flash",
        metrics: { luminance, blurScore, width: 128 },
      };
    }

    // === CHECK 2: BLUR ===
    if (blurScore !== null) {
      if (blurScore < TOO_BLURRY) {
        // Mờ nặng → REJECT
        return {
          valid: false,
          error: "Ảnh bị mờ quá mức. Vui lòng giữ máy chắc và chụp lại",
          metrics: { luminance, blurScore, width: 128 },
        };
      }

      if (blurScore < BLUR_WARNING) {
        // Hơi mờ → WARNING (vẫn cho phân tích)
        warning = "⚠️ Ảnh hơi mờ. Kết quả phân tích có thể không chính xác";
        console.warn("[Quality] Blur warning:", blurScore.toFixed(2));
      }
    }

    console.log("✅ [Quality] All critical checks passed");
    return {
      valid: true,
      warning,
      metrics: { luminance, blurScore, width: 128 },
    };
  } catch (error) {
    console.error("❌ [Quality] Error:", error);
    // Non-critical: soft gate, nếu fail thì vẫn cho qua
    return { valid: true };
  }
};

/**
 * Legacy function - deprecated, use checkImageQuality instead
 * @deprecated Use checkImageQuality for better accuracy
 */
export const checkBrightness = checkImageQuality;

/**
 * Convert ảnh từ ImagePicker URI → Base64 với data URI prefix
 * Step 2 của pipeline (Upload)
 *
 * Flow:
 * 1. Resize ảnh về maxWidth (tăng lên 1280px cho detail tốt hơn)
 * 2. Compress quality (0.85 - cân bằng quality/size)
 * 3. Đọc file thành base64
 * 4. Thêm prefix "data:image/jpeg;base64,"
 *
 * @param uri - Local file URI (file:///path/to/image.jpg)
 * @param maxWidth - Resize về width tối đa (default: 1280px)
 * @param quality - JPEG quality 0-1 (default: 0.85)
 * @returns Base64 string với prefix (ready cho API)
 *
 * Example:
 * ```ts
 * const imageUri = result.assets[0].uri;
 * const base64 = await convertImageToBase64(imageUri);
 * // → "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 * ```
 */
export const convertImageToBase64 = async (
  uri: string,
  maxWidth: number = 1280,
  quality: number = 0.85
): Promise<string> => {
  try {
    console.log("📸 [Convert] Starting...", { uri, maxWidth, quality });

    // Bước 1: Resize và compress ảnh
    const manipulated = await manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }], // Resize về 1024px width (giữ tỷ lệ)
      {
        compress: quality, // Quality 0.8 = 80%
        format: SaveFormat.JPEG, // Luôn output JPEG
      }
    );

    console.log("✅ [Convert] Resized to:", manipulated.uri);

    // Bước 2: Đọc file thành base64
    const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
      encoding: "base64",
    });

    console.log("✅ [Convert] Base64 length:", base64.length);

    // Bước 3: Thêm data URI prefix (backend yêu cầu)
    const dataUri = `data:image/jpeg;base64,${base64}`;

    console.log("✅ [Convert] Complete! Total length:", dataUri.length);

    return dataUri;
  } catch (error) {
    console.error("❌ [Convert] Error:", error);
    throw new Error("Không thể xử lý ảnh. Vui lòng thử lại.");
  }
};

/**
 * Lấy kích thước file ảnh (KB)
 * Dùng để validate hoặc hiển thị info
 */
export const getImageSize = async (uri: string): Promise<number> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && "size" in info) {
      return info.size / 1024; // Bytes → KB
    }
    return 0;
  } catch (error) {
    console.error("❌ [Size] Error:", error);
    return 0;
  }
};

/**
 * Validate ảnh trước khi upload
 * Kiểm tra: File có tồn tại? Có quá lớn không?
 */
export const validateImage = async (
  uri: string,
  maxSizeMB: number = 10
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);

    // Check exists
    if (!info.exists) {
      return { valid: false, error: "File không tồn tại" };
    }

    // Check size
    if ("size" in info) {
      const sizeMB = info.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        return {
          valid: false,
          error: `Ảnh quá lớn (${sizeMB.toFixed(2)}MB). Tối đa ${maxSizeMB}MB`,
        };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error("❌ [Validate] Error:", error);
    return { valid: false, error: "Không thể kiểm tra ảnh" };
  }
};
