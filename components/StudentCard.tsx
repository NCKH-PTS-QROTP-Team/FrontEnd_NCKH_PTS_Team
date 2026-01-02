import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AttendanceStatusTag from './AttendanceStatusTag';
import { Student } from '@/constants/mockData';

interface StudentCardProps {
  student: Student;
  onPress?: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onPress }) => {
  const Container = (onPress ? TouchableOpacity : View) as any;
  
  return (
    <Container
      className="bg-white rounded-xl border border-gray-200 p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {student.name}
          </Text>
          <Text className="text-sm text-gray-500">
            {student.studentId}
          </Text>
          {student.checkInTime && (
            <Text className="text-xs text-gray-400 mt-1">
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