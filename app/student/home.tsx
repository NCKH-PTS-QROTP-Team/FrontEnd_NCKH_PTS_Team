import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { StatsCard } from '@/components/StatsCard';
import { ScheduleCard } from '@/components/ScheduleCard';
import { mockSchedules } from '@/constants/mockData';

export default function StudentHomeScreen() {
  const router = useRouter();
  const todaySchedules = mockSchedules.filter(s => s.status !== 'completed');

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <AppHeader title="Trang chủ" />
      
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 800, width: '100%', alignSelf: 'center' }}>
          {/* Welcome Card */}
          <View
            style={{
              backgroundColor: '#3FA9F5',
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              shadowColor: '#3FA9F5',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
              Xin chào!
            </Text>
            <Text style={{ color: '#DBEAFE', fontSize: 16, marginBottom: 16 }}>
              Hôm nay bạn có {todaySchedules.length} buổi học
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/student/schedule')}
              className="bg-white rounded-xl py-3 px-4 self-start"
              activeOpacity={0.8}
            >
              <Text className="text-primary font-semibold">
                Xem lịch học →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>
              Điểm danh nhanh
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.push('/student/otp-attendance')}
                style={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: '#DBEAFE',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View style={{ backgroundColor: '#DBEAFE', borderRadius: 12, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3FA9F5' }}>OTP</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                  Mã OTP
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  Nhập mã từ giảng viên
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/student/qr-attendance')}
                style={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: '#D1FAE5',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View style={{ backgroundColor: '#D1FAE5', borderRadius: 12, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>QR</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                  QR Code
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  Quét mã trên lớp
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Thống kê tuần này
            </Text>
            <View className="flex-row -mx-1.5">
              <StatsCard
                title="Tổng buổi"
                value="12"
                color="#3FA9F5"
              />
              <StatsCard
                title="Có mặt"
                value="10"
                color="#10B981"
              />
              <StatsCard
                title="Đi muộn"
                value="2"
                color="#F59E0B"
              />
            </View>
          </View>

          {/* Today's Schedule */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">
                Lịch học hôm nay
              </Text>
              <TouchableOpacity onPress={() => router.push('/student/schedule')}>
                <Text className="text-primary font-semibold">Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {todaySchedules.length > 0 ? (
              <View>
                {todaySchedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onPress={() => router.push('/student/otp-attendance')}
                  />
                ))}
              </View>
            ) : (
              <View className="bg-white rounded-2xl p-8 items-center">
                <View style={{ width: 60, height: 60, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 28, color: '#6B7280' }}>☰</Text>
                </View>
                <Text className="text-gray-500">
                  Không có lịch học hôm nay
                </Text>
              </View>
            )}
          </View>

          {/* History Link */}
          <TouchableOpacity
            onPress={() => router.push('/student/history')}
            className="bg-white rounded-2xl p-4 flex-row items-center justify-between"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="bg-gray-100 rounded-xl w-10 h-10 items-center justify-center mr-3">
                <Text style={{ fontSize: 18, color: '#6B7280' }}>☰</Text>
              </View>
              <Text className="text-base font-semibold text-gray-900">
                Lịch sử điểm danh
              </Text>
            </View>
            <Text className="text-gray-400">→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:08
