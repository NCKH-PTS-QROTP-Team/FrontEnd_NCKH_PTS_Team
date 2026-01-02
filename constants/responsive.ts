import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// Check device type
export const isWeb = Platform.OS === 'web';
export const isMobile = SCREEN_WIDTH < BREAKPOINTS.tablet;
export const isTablet = SCREEN_WIDTH >= BREAKPOINTS.tablet && SCREEN_WIDTH < BREAKPOINTS.desktop;
export const isDesktop = SCREEN_WIDTH >= BREAKPOINTS.desktop;

// Responsive values
export const getResponsiveValue = <T,>(mobile: T, tablet?: T, desktop?: T): T => {
  if (isDesktop && desktop) return desktop;
  if (isTablet && tablet) return tablet;
  return mobile;
};

// Max widths for content
export const MAX_WIDTH = {
  mobile: '100%',
  content: 800,
  contentWide: 1000,
  admin: 1200,
  full: 1400,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Grid columns
export const getColumns = () => {
  if (isDesktop) return 12;
  if (isTablet) return 8;
  return 4;
};

// Card layout
export const getCardColumns = () => {
  if (isDesktop) return 3; // 3 cards per row
  if (isTablet) return 2;  // 2 cards per row
  return 1; // 1 card per row (mobile)
};

// Stats card layout
export const getStatsColumns = () => {
  if (isDesktop) return 4; // 4 stats per row
  if (isTablet) return 2;  // 2 stats per row
  return 2; // 2 stats per row (mobile)
};

// Responsive font sizes
export const FONT_SIZE = {
  xs: getResponsiveValue(10, 11, 12),
  sm: getResponsiveValue(12, 13, 14),
  base: getResponsiveValue(14, 15, 16),
  lg: getResponsiveValue(16, 18, 20),
  xl: getResponsiveValue(18, 20, 24),
  '2xl': getResponsiveValue(24, 28, 32),
  '3xl': getResponsiveValue(28, 32, 36),
};

// Padding/Margin helpers
export const getScreenPadding = () => {
  return getResponsiveValue(SPACING.md, SPACING.lg, SPACING.xl);
};

export const getCardSpacing = () => {
  return getResponsiveValue(SPACING.sm, SPACING.md, SPACING.md);
};

// Layout helpers
export const getContainerStyle = (maxWidth: number = MAX_WIDTH.content) => ({
  maxWidth: isWeb ? maxWidth : '100%',
  width: '100%',
  alignSelf: 'center' as const,
  paddingHorizontal: getScreenPadding(),
});

export const getGridStyle = (columns: number = 2) => {
  const actualColumns = Math.min(columns, getColumns());
  return {
    width: `${100 / actualColumns}%`,
  };
};

// Responsive dimensions
export const dimensions = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isMobile,
  isTablet,
  isDesktop,
  isWeb,
};
