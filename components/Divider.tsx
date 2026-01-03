import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

export interface DividerProps {
  /**
   * Orientation of the divider
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Thickness of the divider line
   * @default 1
   */
  thickness?: number;
  
  /**
   * Color of the divider
   * @default Colors.border (gray-200)
   */
  color?: string;
  
  /**
   * Margin around the divider
   * For horizontal: margin top/bottom
   * For vertical: margin left/right
   */
  spacing?: number;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
}

/**
 * Subtle divider component for separating content sections
 * 
 * @example
 * // Horizontal divider (default)
 * <Divider />
 * 
 * // With custom spacing
 * <Divider spacing={24} />
 * 
 * // Vertical divider
 * <Divider orientation="vertical" />
 * 
 * // Custom color and thickness
 * <Divider color={Colors.primary} thickness={2} />
 */
export function Divider({
  orientation = 'horizontal',
  thickness = 1,
  color = Colors.border,
  spacing = 16,
  style,
}: DividerProps) {
  const isHorizontal = orientation === 'horizontal';

  const dividerStyle: ViewStyle = {
    backgroundColor: color,
    ...(isHorizontal
      ? {
          height: thickness,
          width: '100%',
          marginVertical: spacing,
        }
      : {
          width: thickness,
          height: '100%',
          marginHorizontal: spacing,
        }),
    ...style,
  };

  return <View style={dividerStyle} />;
}

/**
 * Divider with custom content (e.g., text in the middle)
 * 
 * @example
 * <DividerWithContent>
 *   <Text style={{ color: Colors.textLight }}>Hoặc</Text>
 * </DividerWithContent>
 */
export function DividerWithContent({
  children,
  color = Colors.border,
  thickness = 1,
  spacing = 16,
}: {
  children: React.ReactNode;
  color?: string;
  thickness?: number;
  spacing?: number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing,
      }}
    >
      <View
        style={{
          flex: 1,
          height: thickness,
          backgroundColor: color,
        }}
      />
      <View style={{ paddingHorizontal: 12 }}>{children}</View>
      <View
        style={{
          flex: 1,
          height: thickness,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
