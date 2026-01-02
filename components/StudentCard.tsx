import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import AttendanceStatusTag from './AttendanceStatusTag';
import { Student } from '@/constants/mockData';
import { isDesktop } from '@/constants/responsive';

interface StudentCardProps {
  student: Student;
  onPress?: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onPress }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Container = (onPress ? TouchableOpacity : View) as any;
  const cardPadding = isDesktop ? 20 : 16;
  
  return (
    <Container
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
          transform: isHovered && onPress && Platform.OS === 'web' ? [{ scale: 1.01 }] : [],
        },
        Platform.OS === 'web' && {
          transition: 'all 0.2s ease',
        } as any,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      {...(Platform.OS === 'web' && {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } as any)}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900" style={{ lineHeight: 24, marginBottom: 4 }}>
            {student.name}
          </Text>
          <Text className="text-sm text-gray-600" style={{ lineHeight: 21 }}>
            {student.studentId}
          </Text>
          {student.checkInTime && (
            <Text className="text-xs text-gray-500" style={{ lineHeight: 18, marginTop: 4 }}>
              Điểm danh lúc: {student.checkInTime}
            </Text>
          )}
        </View>
        <AttendanceStatusTag status={student.status} />
      </View>
    </Container>
  );
};

export default StudentCard;