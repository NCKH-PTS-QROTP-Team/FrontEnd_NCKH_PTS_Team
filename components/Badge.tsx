import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md';
}

export default function Badge({ label, variant = 'primary', size = 'md' }: BadgeProps) {
  const variants = {
    primary: { bg: Colors.infoLight, text: Colors.primary },
    success: { bg: Colors.successLight, text: Colors.success },
    warning: { bg: Colors.warningLight, text: Colors.warning },
    error: { bg: Colors.errorLight, text: Colors.error },
    gray: { bg: Colors.gray100, text: Colors.gray700 },
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const colors = variants[variant];

  return (
    <View
      className={`rounded-full ${sizes[size]}`}
      style={{ backgroundColor: colors.bg }}
    >
      <Text className="font-medium" style={{ color: colors.text, fontSize: size === 'sm' ? 12 : 14 }}>
        {label}
      </Text>
    </View>
  );
}
