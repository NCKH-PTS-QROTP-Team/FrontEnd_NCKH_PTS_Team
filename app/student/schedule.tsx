import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { ScheduleCard } from '@/components/ScheduleCard';
import { mockSchedules } from '@/constants/mockData';

export default function ScheduleScreen() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <AppHeader title="Lịch học" showBack />
      
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 800, width: '100%', alignSelf: 'center' }}>
          {/* Date Header */}
          <View className="bg-white rounded-2xl p-4 mb-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text className="text-sm text-gray-500 mb-1">Hôm nay</Text>
            <Text className="text-2xl font-bold text-gray-900">
              Thứ Năm, 02/01/2026
            </Text>
          </View>

          {/* Schedule List */}
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Lịch học trong ngày
          </Text>
          
          <View>
            {mockSchedules.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
