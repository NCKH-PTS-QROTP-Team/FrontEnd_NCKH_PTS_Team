import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, Platform, Animated } from 'react-native';
import { Colors } from '@/constants/colors';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    if (variant === 'outline') {
      return 'bg-white border-2 border-primary';
    }
    if (variant === 'ghost') {
      return 'bg-transparent';
    }
    return 'bg-primary';
  };

  const getTextStyle = () => {
    if (variant === 'outline') {
      return 'text-primary';
    }
    if (variant === 'ghost') {
      return 'text-primary';
    }
    return 'text-white';
  };

  const getHoverStyle = () => {
    if (!isHovered || isDisabled) return {};
    
    return {
      transform: [{ scale: 1.02 }],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    };
  };

  const getPressedStyle = () => {
    if (!isPressed || isDisabled) return {};
    
    return {
      transform: [{ scale: 0.95 }],
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${getButtonStyle()}
        px-6
        items-center
        justify-center
        ${isDisabled ? 'opacity-50' : ''}
        ${className || ''}
      `}
      style={[
        { 
          borderRadius: 8,
          minHeight: 44,
          paddingVertical: 12,
        },
        Platform.OS === 'web' && {
          transition: 'all 0.2s ease',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        } as any,
        getHoverStyle(),
        getPressedStyle(),
        style,
      ]}
      activeOpacity={0.8}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...(Platform.OS === 'web' && {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } as any)}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? Colors.white : Colors.primary} 
          size="small"
        />
      ) : (
        <Text 
          className={`
            ${getTextStyle()}
            text-base
            font-semibold
          `}
          style={{ lineHeight: 24 }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;