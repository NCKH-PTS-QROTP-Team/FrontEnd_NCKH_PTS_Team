import { Dimensions } from 'react-native';

/**
 * Responsive text utilities
 * Mobile devices get 10% smaller text sizes for better readability and space efficiency
 */

const windowWidth = Dimensions.get('window').width;
const isMobile = windowWidth < 768;
const scaleFactor = isMobile ? 0.9 : 1.0;

export const ResponsiveText = {
  // Display sizes (32-40px)
  display: {
    fontSize: Math.round(40 * scaleFactor), // 36px mobile, 40px desktop
    lineHeight: Math.round(48 * scaleFactor),
    fontWeight: '700' as const,
    letterSpacing: -0.02,
  },
  displayMd: {
    fontSize: Math.round(36 * scaleFactor), // 32px mobile, 36px desktop
    lineHeight: Math.round(44 * scaleFactor),
    fontWeight: '700' as const,
    letterSpacing: -0.02,
  },
  displaySm: {
    fontSize: Math.round(32 * scaleFactor), // 29px mobile, 32px desktop
    lineHeight: Math.round(40 * scaleFactor),
    fontWeight: '700' as const,
    letterSpacing: -0.02,
  },

  // Heading sizes (20-28px)
  h1: {
    fontSize: Math.round(28 * scaleFactor), // 25px mobile, 28px desktop
    lineHeight: Math.round(36 * scaleFactor),
    fontWeight: '700' as const,
    letterSpacing: -0.01,
  },
  h2: {
    fontSize: Math.round(24 * scaleFactor), // 22px mobile, 24px desktop
    lineHeight: Math.round(32 * scaleFactor),
    fontWeight: '600' as const,
    letterSpacing: -0.01,
  },
  h3: {
    fontSize: Math.round(20 * scaleFactor), // 18px mobile, 20px desktop
    lineHeight: Math.round(28 * scaleFactor),
    fontWeight: '600' as const,
    letterSpacing: -0.01,
  },
  h4: {
    fontSize: Math.round(18 * scaleFactor), // 16px mobile, 18px desktop
    lineHeight: Math.round(27 * scaleFactor),
    fontWeight: '600' as const,
    letterSpacing: -0.01,
  },

  // Body sizes (14-16px)
  body: {
    fontSize: Math.round(16 * scaleFactor), // 14px mobile, 16px desktop
    lineHeight: Math.round(24 * scaleFactor),
    fontWeight: '400' as const,
  },
  bodyLarge: {
    fontSize: Math.round(18 * scaleFactor), // 16px mobile, 18px desktop
    lineHeight: Math.round(27 * scaleFactor),
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: Math.round(14 * scaleFactor), // 13px mobile, 14px desktop
    lineHeight: Math.round(21 * scaleFactor),
    fontWeight: '400' as const,
  },

  // Caption & labels (12-13px)
  caption: {
    fontSize: Math.round(12 * scaleFactor), // 11px mobile, 12px desktop
    lineHeight: Math.round(18 * scaleFactor),
    fontWeight: '400' as const,
  },
  label: {
    fontSize: Math.round(13 * scaleFactor), // 12px mobile, 13px desktop
    lineHeight: Math.round(20 * scaleFactor),
    fontWeight: '500' as const,
  },

  // Button text
  button: {
    fontSize: Math.round(16 * scaleFactor), // 14px mobile, 16px desktop
    lineHeight: Math.round(24 * scaleFactor),
    fontWeight: '600' as const,
    letterSpacing: -0.01,
  },
  buttonSmall: {
    fontSize: Math.round(14 * scaleFactor), // 13px mobile, 14px desktop
    lineHeight: Math.round(21 * scaleFactor),
    fontWeight: '600' as const,
    letterSpacing: -0.01,
  },
};

/**
 * Responsive spacing utilities
 * Ensures minimum 44px touch targets on mobile
 */
export const ResponsiveSpacing = {
  // Touch-friendly minimum sizes
  minTouchTarget: 44,
  minInputHeight: 48,
  
  // Container padding
  containerPadding: isMobile ? 16 : 24,
  containerPaddingLarge: isMobile ? 20 : 32,
  
  // Element spacing
  elementGap: isMobile ? 12 : 16,
  elementGapLarge: isMobile ? 16 : 24,
  elementGapSmall: isMobile ? 8 : 12,
  
  // Section spacing
  sectionGap: isMobile ? 24 : 32,
  sectionGapLarge: isMobile ? 32 : 48,
  
  // Card padding
  cardPadding: isMobile ? 12 : 16,
  cardPaddingLarge: isMobile ? 16 : 20,
};

/**
 * Get responsive value based on screen size
 */
export const getResponsiveSize = (size: number): number => {
  return Math.round(size * scaleFactor);
};

/**
 * Check if current device is mobile
 */
export const isMobileDevice = (): boolean => {
  return isMobile;
};

/**
 * Get responsive font size with fallback
 */
export const getResponsiveFontSize = (
  baseSize: number,
  options?: {
    minSize?: number;
    maxSize?: number;
  }
): number => {
  let size = Math.round(baseSize * scaleFactor);
  
  if (options?.minSize && size < options.minSize) {
    size = options.minSize;
  }
  if (options?.maxSize && size > options.maxSize) {
    size = options.maxSize;
  }
  
  return size;
};
