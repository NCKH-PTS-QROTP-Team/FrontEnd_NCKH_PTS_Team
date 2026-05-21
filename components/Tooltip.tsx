import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /**
   * Tooltip content
   */
  content: string;
  
  /**
   * Children element that triggers the tooltip
   */
  children: React.ReactNode;
  
  /**
   * Placement of the tooltip
   * @default 'top'
   */
  placement?: TooltipPlacement;
  
  /**
   * Whether to show arrow
   * @default true
   */
  showArrow?: boolean;
  
  /**
   * Custom style for tooltip container
   */
  style?: ViewStyle;
  
  /**
   * Custom style for text
   */
  textStyle?: TextStyle;
  
  /**
   * Delay before showing tooltip (ms)
   * @default 200
   */
  delay?: number;
}

/**
 * Tooltip component for displaying helpful information on hover/press
 * 
 * Note: On React Native (mobile), tooltip shows on press instead of hover
 * On web, tooltip shows on hover
 * 
 * @example
 * <Tooltip content="Xóa mục này">
 *   <IconButton icon={<TrashIcon />} />
 * </Tooltip>
 * 
 * @example
 * <Tooltip content="Thêm sinh viên mới" placement="bottom">
 *   <PrimaryButton title="Thêm" />
 * </Tooltip>
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  showArrow = true,
  style,
  textStyle,
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getTooltipPosition = (): ViewStyle => {
    const offset = 8; // Distance from trigger element

    switch (placement) {
      case 'top':
        return { bottom: '100%', alignSelf: 'center', marginBottom: offset };
      case 'bottom':
        return { top: '100%', alignSelf: 'center', marginTop: offset };
      case 'left':
        return { right: '100%', alignSelf: 'center', marginRight: offset };
      case 'right':
        return { left: '100%', alignSelf: 'center', marginLeft: offset };
    }
  };

  const getArrowStyle = (): ViewStyle => {
    const arrowSize = 6;

    switch (placement) {
      case 'top':
        return {
          bottom: -arrowSize,
          alignSelf: 'center',
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: Colors.textHeading,
        };
      case 'bottom':
        return {
          top: -arrowSize,
          alignSelf: 'center',
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: Colors.textHeading,
        };
      case 'left':
        return {
          right: -arrowSize,
          alignSelf: 'center',
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: Colors.textHeading,
        };
      case 'right':
        return {
          left: -arrowSize,
          alignSelf: 'center',
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: Colors.textHeading,
        };
    }
  };

  const tooltipContainerStyle: ViewStyle = {
    position: 'absolute',
    backgroundColor: Colors.textHeading,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    maxWidth: 200,
    zIndex: 1000,
    ...getTooltipPosition(),
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        }
      : {
          elevation: 4,
        }),
    ...style,
  };

  const tooltipTextStyle: TextStyle = {
    fontSize: 12,
    color: Colors.white,
    textAlign: 'center',
    ...textStyle,
  };

  return (
    <View style={{ position: 'relative' }}>
      {Platform.OS === 'web' ? (
        <View
          // @ts-ignore - web-specific props
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          {children}
        </View>
      ) : (
        <TouchableOpacity
          onPressIn={showTooltip}
          onPressOut={hideTooltip}
          activeOpacity={0.7}
        >
          {children}
        </TouchableOpacity>
      )}

      {isVisible && (
        <View style={tooltipContainerStyle}>
          <Text style={tooltipTextStyle}>{content}</Text>
          {showArrow && <View style={[{ position: 'absolute' }, getArrowStyle()]} />}
        </View>
      )}
    </View>
  );
}

/**
 * Simple wrapper component for adding tooltips to icons
 * 
 * @example
 * <TooltipIcon content="Xóa">
 *   <TrashIcon />
 * </TooltipIcon>
 */
export function TooltipIcon({
  content,
  children,
  placement = 'top',
}: {
  content: string;
  children: React.ReactNode;
  placement?: TooltipPlacement;
}) {
  return (
    <Tooltip content={content} placement={placement}>
      <View>{children}</View>
    </Tooltip>
  );
}
