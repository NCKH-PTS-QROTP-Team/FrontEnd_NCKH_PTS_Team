import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
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

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${getButtonStyle()}
        rounded-xl
        py-4
        px-6
        items-center
        justify-center
        ${isDisabled ? 'opacity-50' : ''}
        ${className || ''}
      `}
      style={style}
      activeOpacity={0.7}
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