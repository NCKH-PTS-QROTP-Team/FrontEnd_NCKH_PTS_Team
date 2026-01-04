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
      style={[
        {
          width: isDesktop ? 800 : '100%',
          height: 120,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          padding: 24,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        },
        Platform.OS === 'web' && {
          transition: 'all 0.2s ease',
        } as any,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text 
          style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: 4,
            lineHeight: 28,
          }}
          numberOfLines={1}
        >
          {schedule.courseName}
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
          {schedule.teacher}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            width: 2, 
            height: 24, 
            backgroundColor: '#3FA9F5', 
            borderRadius: 1,
            marginRight: 12,
          }} />
          <View>
            <Text style={{ fontSize: 16, color: '#111827', lineHeight: 24 }}>
              {schedule.time}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 21 }}>
              Phòng: {schedule.room}
            </Text>
          </View>
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