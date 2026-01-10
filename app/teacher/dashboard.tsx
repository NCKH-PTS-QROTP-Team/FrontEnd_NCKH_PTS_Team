import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { StatsCard } from '@/components/StatsCard';
import { mockStats } from '@/constants/mockData';

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 1200 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const quickActionWidth = isDesktop ? '48%' : '100%';

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar style="dark" />
      <AppHeader title="Dashboard" showLogout={!isWeb} />
      
      <ScrollView
        contentContainerStyle={{ paddingHorizontal, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          {/* Welcome */}
          <View style={{
            backgroundColor: '#3FA9F5',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            shadowColor: '#3FA9F5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 24, lineHeight: 32, fontWeight: 'bold', marginBottom: 8 }}>
              Chào mừng Giảng viên!
            </Text>
            <Text style={{ color: '#DBEAFE', fontSize: 16, lineHeight: 24 }}>
              Quản lý điểm danh lớp học của bạn
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, lineHeight: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
              Tạo phiên điểm danh
            </Text>
            <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 16 }}>
              <TouchableOpacity
                onPress={() => router.push('/teacher/generate-otp')}
                style={{
                  width: quickActionWidth,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 24,
                  borderWidth: 2,
                  borderColor: '#DBEAFE',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 56, height: 56, backgroundColor: '#DBEAFE', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 24, lineHeight: 32, fontWeight: 'bold', color: '#3FA9F5' }}>123</Text>
                </View>
                <Text style={{ fontSize: 18, lineHeight: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
                  Tạo mã OTP
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280' }}>
                  Sinh mã số cho sinh viên điểm danh
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/teacher/generate-qr')}
                style={{
                  width: quickActionWidth,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 24,
                  borderWidth: 2,
                  borderColor: '#D1FAE5',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 56, height: 56, backgroundColor: '#D1FAE5', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 22, lineHeight: 28, fontWeight: 'bold', color: '#10B981' }}>QR</Text>
                </View>
                <Text style={{ fontSize: 18, lineHeight: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
                  Tạo QR Code
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280' }}>
                  Hiển thị mã QR trên lớp
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, lineHeight: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
              Thống kê hôm nay
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
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
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
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
          <View style={{ gap: 16 }}>
            <TouchableOpacity
              onPress={() => router.push('/teacher/class-list')}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#DBEAFE', borderRadius: 12, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 20, lineHeight: 24, fontWeight: 'bold', color: '#3FA9F5' }}>≡</Text>
                </View>
                <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '600', color: '#111827' }}>
                  Danh sách lớp học
                </Text>
              </View>
              <Text style={{ fontSize: 20, lineHeight: 24, color: '#9CA3AF' }}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/teacher/reports')}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 20, lineHeight: 24, fontWeight: 'bold', color: '#F59E0B' }}>☰</Text>
                </View>
                <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '600', color: '#111827' }}>
                  Báo cáo & Thống kê
                </Text>
              </View>
              <Text style={{ fontSize: 20, lineHeight: 24, color: '#9CA3AF' }}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
