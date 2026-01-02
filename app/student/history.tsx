import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { AttendanceStatusTag } from '@/components/AttendanceStatusTag';
import { mockAttendanceHistory } from '@/constants/mockData';

export default function HistoryScreen() {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'qr': return 'QR';
      case 'otp': return '123';
      default: return '-';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <AppHeader title="Lịch sử điểm danh" showBack />
      
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 800, width: '100%', alignSelf: 'center' }}>
          {/* Stats Summary */}
          <View className="bg-white rounded-2xl p-5 mb-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text className="text-base font-semibold text-gray-900 mb-4">
              Tổng quan
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">75%</Text>
                <Text className="text-sm text-gray-500 mt-1">Có mặt</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-amber-600">10%</Text>
                <Text className="text-sm text-gray-500 mt-1">Đi muộn</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-red-600">15%</Text>
                <Text className="text-sm text-gray-500 mt-1">Vắng</Text>
              </View>
            </View>
          </View>

          {/* History List */}
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Lịch sử chi tiết
          </Text>
          
          <View>
            {mockAttendanceHistory.map((record) => (
              <View
                key={record.id}
                className="bg-white rounded-2xl p-4"
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
                    <Text className="text-base font-bold text-gray-900 mb-1">
                      {record.courseName}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {record.courseCode}
                    </Text>
                  </View>
                  <AttendanceStatusTag status={record.status} size="sm" />
                </View>
                
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-500">
                      {record.date}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {record.time}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm font-semibold text-gray-700">{getMethodIcon(record.method)}</Text>
                    <Text className="text-sm text-gray-500 capitalize">
                      {record.method}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:08
