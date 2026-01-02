import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { StatsCard } from '@/components/StatsCard';
import { mockStats } from '@/constants/mockData';
import AppLayout from '@/components/AppLayout';
import { isDesktop, isTablet } from '@/constants/responsive';

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const menuItems = [
    { icon: '⌂', label: 'Dashboard', route: '/teacher/dashboard' },
    { icon: 'C', label: 'Danh sách lớp', route: '/teacher/class-list' },
    { icon: 'O', label: 'Tạo OTP', route: '/teacher/generate-otp' },
    { icon: 'Q', label: 'Tạo QR', route: '/teacher/generate-qr' },
    { icon: 'A', label: 'Lớp chủ nhiệm', route: '/teacher/advisee-class' },
    { icon: 'R', label: 'Báo cáo', route: '/teacher/reports' },
  ];

  const statsWidth = isDesktop ? 'w-1/4' : isTablet ? 'w-1/2' : 'w-1/2';

 
  const content = (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <AppHeader title="Dashboard" showLogout={!isWeb} />
      
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          {/* Welcome */}
          <View className="bg-primary rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: '#3FA9F5',
              shadowColor: '#3FA9F5',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}>
            <Text className="text-white text-2xl font-bold mb-2">
              Chào mừng Giảng viên!
            </Text>
            <Text style={{ color: '#DBEAFE', fontSize: 16 }}>
              Quản lý điểm danh lớp học của bạn
            </Text>
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Tạo phiên điểm danh
            </Text>
            <View className="flex-row -mx-2">
              <TouchableOpacity
                onPress={() => router.push('/teacher/generate-otp')}
                className="flex-1 bg-white rounded-2xl p-6 border-2 border-blue-100"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View className="bg-blue-100 rounded-xl w-14 h-14 items-center justify-center mb-4">
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3FA9F5' }}>123</Text>
                </View>
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Tạo mã OTP
                </Text>
                <Text className="text-sm text-gray-500">
                  Sinh mã số cho sinh viên điểm danh
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/teacher/generate-qr')}
                className="flex-1 bg-white rounded-2xl p-6 border-2 border-green-100"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View className="bg-green-100 rounded-xl w-14 h-14 items-center justify-center mb-4">
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#10B981' }}>QR</Text>
                </View>
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Tạo QR Code
                </Text>
                <Text className="text-sm text-gray-500">
                  Hiển thị mã QR trên lớp
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Thống kê hôm nay
            </Text>
            <View className="flex-row -mx-1.5 mb-3">
              <StatsCard
                title="Tổng SV"
                value={mockStats.totalStudents}
                color="#3FA9F5"
              />
              <StatsCard
                title="Có mặt"
                value={mockStats.presentToday}
                color="#10B981"
              />
            </View>
            <View className="flex-row -mx-1.5">
              <StatsCard
                title="Vắng"
                value={mockStats.absentToday}
                color="#EF4444"
              />
              <StatsCard
                title="Tỷ lệ"
                value={`${mockStats.attendanceRate}%`}
                color="#3FA9F5"
              />
            </View>
          </View>

          {/* Management Links */}
          <View>
            <TouchableOpacity
              onPress={() => router.push('/teacher/class-list')}
              className="bg-white rounded-2xl p-4 flex-row items-center justify-between"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center">
                <View className="bg-blue-100 rounded-xl w-12 h-12 items-center justify-center mr-3">
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#3FA9F5' }}>≡</Text>
                </View>
                <Text className="text-base font-semibold text-gray-900">
                  Danh sách lớp học
                </Text>
              </View>
              <Text className="text-gray-400">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/teacher/reports')}
              className="bg-white rounded-2xl p-4 flex-row items-center justify-between"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center">
                <View className="bg-amber-100 rounded-xl w-12 h-12 items-center justify-center mr-3">
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F59E0B' }}>☰</Text>
                </View>
                <Text className="text-base font-semibold text-gray-900">
                  Báo cáo & Thống kê
                </Text>
              </View>
              <Text className="text-gray-400">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <AppLayout
      menuItems={menuItems}
      userRole="teacher"
      userName="Giảng viên"
    >
      {content}
    </AppLayout>
  );
}
