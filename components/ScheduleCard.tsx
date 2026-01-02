import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { Schedule } from '@/constants/mockData';

interface ScheduleCardProps {
  schedule: Schedule;
  onPress?: () => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onPress,
}) => {
  const CardContent = (
    <View
      className="bg-white rounded-xl border border-gray-200"
      style={{
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start justify-between" style={{ marginBottom: 12 }}>
        <View className="flex-1">
          <Text 
            className="text-lg font-semibold text-gray-900"
            style={{ lineHeight: 28, marginBottom: 4 }}
            numberOfLines={2}
          >
            {schedule.subject}
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
        activeOpacity={0.7}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

export default ScheduleCard;