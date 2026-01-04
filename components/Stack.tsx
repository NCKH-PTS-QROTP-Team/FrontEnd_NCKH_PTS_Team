import React from 'react';
import { View, ViewStyle } from 'react-native';

interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  wrap?: boolean;
  style?: ViewStyle;
}

/**
 * Stack component for handling spacing between children
 * Works across all platforms including web (replaces gap property)
 * 
 * @example
 * <Stack direction="row" spacing={12}>
 *   <Text>Item 1</Text>
 *   <Text>Item 2</Text>
 * </Stack>
 */
export function Stack({
  children,
  direction = 'column',
  spacing = 0,
  align,
  justify,
  wrap = false,
  style,
}: StackProps) {
  const childArray = React.Children.toArray(children);

  return (
    <View
      style={[
        {
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
    >
      {childArray.map((child, index) => {
        const isLast = index === childArray.length - 1;
        const marginStyle = !isLast
          ? direction === 'row'
            ? { marginRight: spacing }
            : { marginBottom: spacing }
          : {};

        return (
          <View key={index} style={marginStyle}>
            {child}
          </View>
        );
      })}
    </View>
  );
}
