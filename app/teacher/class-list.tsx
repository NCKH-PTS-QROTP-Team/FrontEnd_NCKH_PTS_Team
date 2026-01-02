import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { StudentCard } from '@/components/StudentCard';
import { AttendanceStatusTag } from '@/components/AttendanceStatusTag';
import { mockStudents } from '@/constants/mockData';

export default function ClassListScreen() {
  const presentCount = mockStudents.filter(s => s.status === 'present').length;
  const lateCount = mockStudents.filter(s => s.status === 'late').length;
  const absentCount = mockStudents.filter(s => s.status === 'absent').length;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <AppHeader title="Danh sách lớp" showBack showLogout={true} />
      
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 800, width: '100%', alignSelf: 'center' }}>
          {/* Class Info */}
          <View className="bg-white rounded-2xl p-5 mb-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Lập trình cơ bản - CS101
            </Text>
            <View className="flex-row items-center">
              <View className="flex-row items-center">
                <View className="bg-green-100 rounded-full w-8 h-8 items-center justify-center mr-2">
                  <Text className="text-green-600 font-bold">{presentCount}</Text>
                </View>
                <Text className="text-sm text-gray-600">Có mặt</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-amber-100 rounded-full w-8 h-8 items-center justify-center mr-2">
                  <Text className="text-amber-600 font-bold">{lateCount}</Text>
                </View>
                <Text className="text-sm text-gray-600">Muộn</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-red-100 rounded-full w-8 h-8 items-center justify-center mr-2">
                  <Text className="text-red-600 font-bold">{absentCount}</Text>
                </View>
                <Text className="text-sm text-gray-600">Vắng</Text>
              </View>
            </View>
          </View>

          {/* Student List */}
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Danh sách sinh viên ({mockStudents.length})
          </Text>
          
          <View>
            {mockStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
