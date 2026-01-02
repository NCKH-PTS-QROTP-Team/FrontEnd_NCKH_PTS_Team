import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface StatsCardProps {
  title?: string;
  label?: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  label,
  value,
  icon,
  color = Colors.primary,
  subtitle,
}) => {
  const displayTitle = title || label || '';
  return (
    <View
      className="bg-white rounded-xl border border-gray-200 p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        flex: 1,
      }}
    >
      {icon && (
        <View style={{ marginBottom: 12 }}>
          {icon}
        </View>
      )}
      <Text className="text-sm text-gray-600" style={{ lineHeight: 21, marginBottom: 4 }}>{displayTitle}</Text>
      <Text
        className="text-3xl font-semibold"
        style={{ color, lineHeight: 48, letterSpacing: -0.02 }}
      >
        {value}
      </Text>
      {subtitle && (
        <Text className="text-xs text-gray-500" style={{ lineHeight: 18, marginTop: 4 }}>{subtitle}</Text>
      )}
    </View>
  );
};

export default StatsCard;