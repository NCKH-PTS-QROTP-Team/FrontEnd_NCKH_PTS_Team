import React, { useState } from 'react';
import { TouchableOpacity, Text, ViewStyle, Platform, TextStyle } from 'react-native';

interface InteractiveButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeOpacity?: number;
  disabled?: boolean;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  onPress,
  children,
  className = '',
  style,
  textStyle,
  activeOpacity = 0.8,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getHoverStyle = (): ViewStyle => {
    if (!isHovered || disabled) return {};
    
    return {
      transform: [{ scale: 1.02 }],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    };
  };

  const getPressedStyle = (): ViewStyle => {
    if (!isPressed || disabled) return {};
    
    return {
      transform: [{ scale: 0.95 }],
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={className}
      style={[
        {
          minHeight: 44,
        },
        Platform.OS === 'web' && {
          transition: 'all 0.2s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
        } as any,
        style,
        getHoverStyle(),
        getPressedStyle(),
        disabled && { opacity: 0.5 },
      ]}
      activeOpacity={activeOpacity}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...(Platform.OS === 'web' && {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } as any)}
    >
      {children}
    </TouchableOpacity>
  );
};

export default InteractiveButton;
