import React from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { ScheduleCard } from '@/components/ScheduleCard';
import { mockSchedules } from '@/constants/mockData';

export default function ScheduleScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 800 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />
      <AppHeader title="Lịch học" showBack showLogout={true} />
      
      <ScrollView
        contentContainerStyle={{ paddingHorizontal, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          {/* Date Header */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280', marginBottom: 8 }}>Hôm nay</Text>
            <Text style={{ fontSize: 24, lineHeight: 32, fontWeight: 'bold', color: '#111827' }}>
              Thứ Năm, 02/01/2026
            </Text>
          </View>

          {/* Schedule List */}
          <Text style={{ fontSize: 18, lineHeight: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
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
