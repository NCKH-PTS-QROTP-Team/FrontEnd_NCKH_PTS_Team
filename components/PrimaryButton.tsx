import React, { useState } from 'react';
import { TouchableOpacity, Text, ViewStyle, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spinner } from './Spinner';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) {
      return variant === 'outline' ? Colors.white : Colors.gray300;
    }
    if (variant === 'outline' || variant === 'ghost') {
      return variant === 'outline' ? Colors.white : 'transparent';
    }
    if (isPressed) return Colors.primaryDark;
    if (isHovered) return Colors.primaryHover;
    return Colors.primary;
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return isDisabled ? Colors.gray300 : Colors.primary;
    }
    return 'transparent';
  };

  const getTextColor = () => {
    if (isDisabled && variant !== 'outline') {
      return Colors.gray500;
    }
    if (variant === 'outline' || variant === 'ghost') {
      return isDisabled ? Colors.gray400 : Colors.primary;
    }
    return Colors.white;
  };

  const getFocusStyle = () => {
    if (!isFocused || isDisabled) return {};
    
    return Platform.OS === 'web' ? {
      outline: `3px solid ${Colors.focusRing}`,
      outlineOffset: '2px',
    } : {};
  };

  const getHoverStyle = () => {
    if (!isHovered || isDisabled) return {};
    
    return {
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
      transform: [{ scale: 0.96 }],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        { 
          borderRadius: 8,
          minHeight: 44, // Minimum touch target
          paddingVertical: 12,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        Platform.OS === 'web' && {
          transition: 'all 0.2s ease',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        } as any,
        getFocusStyle(),
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
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
      } as any)}
    >
      {loading ? (
        <Spinner size={20} color={getTextColor()} />
      ) : (
        <Text
          style={{
            color: getTextColor(),
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: -0.01,
            textAlign: 'center',
            width: '100%',
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;