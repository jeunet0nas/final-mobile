/**
 * Image processing utilities
 */

/**
 * Extract base64 data and mime type from a data URL
 * @param dataUrl - Data URL string (e.g., "data:image/png;base64,...")
 * @returns Object containing base64 string and mimeType
 */
export const dataUrlToBase64 = (dataUrl: string): { base64: string; mimeType: string } => {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);

  if (!mimeMatch || !mimeMatch[1] || !parts[1]) {
    throw new Error('Invalid data URL format');
  }

  return {
    base64: parts[1],
    mimeType: mimeMatch[1],
  };
};

/**
 * Convert risk level string to number for comparison
 */
export const riskLevelToNumber = (riskLevel: string): number => {
  switch (riskLevel) {
    case 'High':
      return 3;
    case 'Medium':
      return 2;
    case 'Low':
      return 1;
    default:
      return 0;
  }
};
