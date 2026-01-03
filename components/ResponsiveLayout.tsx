import React, { ReactNode } from 'react';
import { View, Dimensions, Platform } from 'react-native';

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
}

/**
 * Responsive grid layout:
 * - Mobile (<768px): 1 column by default
 * - Tablet (768-1024px): 2 columns by default
 * - Desktop (>1024px): 3+ columns by default
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
}) => {
  const windowWidth = Dimensions.get('window').width;

  const getColumns = () => {
    if (windowWidth < 768) return columns.mobile || 1;
    if (windowWidth < 1024) return columns.tablet || 2;
    return columns.desktop || 3;
  };

  const cols = getColumns();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -gap / 2,
      }}
    >
      {React.Children.map(children, (child) => (
        <View
          style={{
            width: `${100 / cols}%`,
            paddingHorizontal: gap / 2,
            marginBottom: gap,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: number;
  padding?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

/**
 * Responsive container with adaptive padding:
 * - Mobile: 16px padding
 * - Tablet: 24px padding
 * - Desktop: 32px padding
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 1280,
  padding = { mobile: 16, tablet: 24, desktop: 32 },
}) => {
  const windowWidth = Dimensions.get('window').width;

  const getPadding = () => {
    if (windowWidth < 768) return padding.mobile || 16;
    if (windowWidth < 1024) return padding.tablet || 24;
    return padding.desktop || 32;
  };

  return (
    <View
      style={{
        width: '100%',
        maxWidth,
        marginHorizontal: 'auto',
        paddingHorizontal: getPadding(),
      }}
    >
      {children}
    </View>
  );
};

interface ResponsiveStackProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  breakpoint?: number;
  gap?: number;
}

/**
 * Responsive stack that switches between row and column based on screen size
 * - Below breakpoint: column (stacked)
 * - Above breakpoint: row (horizontal)
 */
export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = 'row',
  breakpoint = 768,
  gap = 16,
}) => {
  const windowWidth = Dimensions.get('window').width;
  const isMobile = windowWidth < breakpoint;

  return (
    <View
      style={{
        flexDirection: isMobile ? 'column' : direction,
        gap,
      }}
    >
      {children}
    </View>
  );
};

/**
 * Hook to get current screen size category
 */
export const useScreenSize = () => {
  const windowWidth = Dimensions.get('window').width;

  return {
    isMobile: windowWidth < 768,
    isTablet: windowWidth >= 768 && windowWidth < 1024,
    isDesktop: windowWidth >= 1024,
    width: windowWidth,
  };
};

/**
 * Hook to get responsive value based on screen size
 */
export const useResponsiveValue = <T,>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T => {
  const { isMobile, isTablet } = useScreenSize();

  if (isMobile) return values.mobile;
  if (isTablet) return values.tablet || values.mobile;
  return values.desktop || values.tablet || values.mobile;
};
