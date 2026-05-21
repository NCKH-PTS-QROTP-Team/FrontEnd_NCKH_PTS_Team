import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  /**
   * Text content of the badge
   */
  children: React.ReactNode;
  
  /**
   * Visual variant of the badge
   * @default 'neutral'
   */
  variant?: BadgeVariant;
  
  /**
   * Size of the badge
   * @default 'medium'
   */
  size?: BadgeSize;
  
  /**
   * Whether to use outlined style
   * @default false
   */
  outlined?: boolean;
  
  /**
   * Custom style for container
   */
  style?: ViewStyle;
  
  /**
   * Custom style for text
   */
  textStyle?: TextStyle;
}

const variantColors: Record<BadgeVariant, { background: string; text: string; border: string }> = {
  success: {
    background: Colors.success + '15',
    text: Colors.success,
    border: Colors.success + '30',
  },
  warning: {
    background: Colors.warning + '15',
    text: Colors.warning,
    border: Colors.warning + '30',
  },
  error: {
    background: Colors.error + '15',
    text: Colors.error,
    border: Colors.error + '30',
  },
  info: {
    background: Colors.info + '15',
    text: Colors.info,
    border: Colors.info + '30',
  },
  primary: {
    background: Colors.primary + '15',
    text: Colors.primary,
    border: Colors.primary + '30',
  },
  neutral: {
    background: Colors.text + '10',
    text: Colors.text,
    border: Colors.text + '20',
  },
};

const sizeStyles: Record<BadgeSize, { paddingHorizontal: number; paddingVertical: number; fontSize: number; borderRadius: number }> = {
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 11,
    borderRadius: 4,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    borderRadius: 6,
  },
  large: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    borderRadius: 8,
  },
};

/**
 * Badge component for labels, tags, and status indicators
 * 
 * @example
 * // Success badge
 * <Badge variant="success">Hoàn thành</Badge>
 * 
 * // Outlined warning badge
 * <Badge variant="warning" outlined>Cảnh báo</Badge>
 * 
 * // Large error badge
 * <Badge variant="error" size="large">Lỗi</Badge>
 * 
 * // Small info badge
 * <Badge variant="info" size="small">Mới</Badge>
 */
export function Badge({
  children,
  variant = 'neutral',
  size = 'medium',
  outlined = false,
  style,
  textStyle,
}: BadgeProps) {
  const colors = variantColors[variant];
  const sizes = sizeStyles[size];

  const containerStyle: ViewStyle = {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: sizes.paddingVertical,
    borderRadius: sizes.borderRadius,
    backgroundColor: outlined ? 'transparent' : colors.background,
    borderWidth: outlined ? 1 : 0,
    borderColor: colors.border,
    alignSelf: 'flex-start',
    ...style,
  };

  const textStyles: TextStyle = {
    fontSize: sizes.fontSize,
    fontWeight: '600',
    color: colors.text,
    ...textStyle,
  };

  return (
    <View style={containerStyle}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
}

/**
 * Badge with dot indicator (useful for status)
 * 
 * @example
 * <DotBadge variant="success">Online</DotBadge>
 */
export function DotBadge({
  children,
  variant = 'neutral',
  size = 'medium',
  style,
}: Omit<BadgeProps, 'outlined'>) {
  const colors = variantColors[variant];
  const sizes = sizeStyles[size];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: sizes.paddingHorizontal,
        paddingVertical: sizes.paddingVertical,
        borderRadius: sizes.borderRadius,
        backgroundColor: colors.background,
        alignSelf: 'flex-start',
        ...style,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.text,
          marginRight: 6,
        }}
      />
      <Text
        style={{
          fontSize: sizes.fontSize,
          fontWeight: '600',
          color: colors.text,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

/**
 * Numeric badge (useful for counts, notifications)
 * 
 * @example
 * <NumericBadge variant="error">5</NumericBadge>
 */
export function NumericBadge({
  children,
  variant = 'error',
  style,
}: {
  children: number | string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}) {
  const colors = variantColors[variant];

  return (
    <View
      style={{
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.text,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        ...style,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: Colors.white,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

// Legacy default export for backward compatibility
export default Badge;
