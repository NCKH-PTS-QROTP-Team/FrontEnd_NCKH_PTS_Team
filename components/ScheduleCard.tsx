import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { Schedule } from '@/constants/mockData';
import { isDesktop } from '@/constants/responsive';

interface ScheduleCardProps {
  schedule: Schedule;
  onPress?: () => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onPress,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardPadding = isDesktop ? 24 : 16;
  
  const CardContent = (
    <View
      className="bg-white border border-gray-200"
      style={[
        {
          borderRadius: 8,
          padding: cardPadding,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isHovered && onPress ? 0.08 : 0.03,
          shadowRadius: isHovered && onPress ? 6 : 3,
          elevation: isHovered && onPress ? 3 : 1,
          transform: isHovered && onPress && Platform.OS === 'web' ? [{ scale: 1.015 }] : [],
        },
        Platform.OS === 'web' && {
          transition: 'all 0.2s ease',
        } as any,
      ]}
    >
      <View className="flex-row items-start justify-between" style={{ marginBottom: 12 }}>
        <View className="flex-1">
          <Text 
            className="text-lg font-semibold text-gray-900"
            style={{ lineHeight: 28, marginBottom: 4 }}
            numberOfLines={2}
          >
            {schedule.courseName}
          </Text>
          <Text className="text-sm text-gray-600" style={{ lineHeight: 21 }}>
            {schedule.teacher}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center" style={{ marginBottom: 8 }}>
        <View className="w-1 h-6 bg-primary rounded-full" style={{ marginRight: 12 }} />
        <View className="flex-1">
          <Text className="text-base text-gray-900" style={{ lineHeight: 24 }}>
            {schedule.time}
          </Text>
          <Text className="text-sm text-gray-600" style={{ lineHeight: 21, marginTop: 4 }}>
            Phòng: {schedule.room}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        {...(Platform.OS === 'web' && {
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        } as any)}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

export default ScheduleCard;