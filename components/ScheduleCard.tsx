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
      className="bg-white rounded-xl border border-gray-200 p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text 
            className="text-lg font-semibold text-gray-900 mb-1"
            numberOfLines={2}
          >
            {schedule.subject}
          </Text>
          <Text className="text-sm text-gray-500">
            {schedule.teacher}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        <View className="w-1 h-6 bg-primary rounded-full mr-3" />
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-700">
            {schedule.time}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
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