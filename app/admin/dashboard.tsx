import React from 'react';
import { View, Text, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { StatsCard } from '@/components/StatsCard';
import Card from '@/components/Card';
import { HomeIcon, UsersIcon, SchoolIcon, BookIcon, CalendarIcon, EyeIcon, ChartIcon, SettingsIcon } from '@/components/Icons';

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const isWeb = Platform.OS === 'web';

  const contentMaxWidth = isDesktop ? 1400 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  const stats = [
    { label: 'Tổng người dùng', value: '1,234', icon: <Text style={{ fontSize: 20, color: Colors.primary }}>U</Text>, color: Colors.primary },
    { label: 'Tổng lớp học', value: '45', icon: <Text style={{ fontSize: 20, color: Colors.success }}>C</Text>, color: Colors.success },
    { label: 'Buổi học hôm nay', value: '23', icon: <Text style={{ fontSize: 20, color: Colors.warning }}>▶</Text>, color: Colors.warning },
    { label: 'Tỷ lệ điểm danh', value: '87%', icon: <Text style={{ fontSize: 20, color: Colors.primary }}>%</Text>, color: Colors.primary },
  ];

  const todayStats = [
    { label: 'Có mặt', value: '856', color: Colors.success },
    { label: 'Muộn', value: '45', color: Colors.warning },
    { label: 'Vắng', value: '123', color: Colors.error },
  ];

  const quickActions = [
    { title: 'Quản lý người dùng', subtitle: 'Thêm, sửa, xóa user', route: '/admin/users', icon: 'U' },
    { title: 'Quản lý lớp học', subtitle: 'Tạo và quản lý lớp', route: '/admin/classes', icon: 'C' },
    { title: 'Quản lý môn học', subtitle: 'Danh sách môn học', route: '/admin/subjects', icon: 'S' },
    { title: 'Lịch học', subtitle: 'Xem và tạo lịch', route: '/admin/schedules', icon: 'L' },
    { title: 'Giám sát điểm danh', subtitle: 'Theo dõi real-time', route: '/admin/sessions', icon: 'M' },
    { title: 'Báo cáo', subtitle: 'Thống kê và export', route: '/admin/reports', icon: 'R' },
    { title: 'Cài đặt', subtitle: 'Cấu hình hệ thống', route: '/admin/settings', icon: 'S' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal, paddingVertical, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          
          {/* Welcome Section */}
          <Card style={{ backgroundColor: Colors.primary, marginBottom: isMobile ? 16 : 24 }}>
            <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: 'bold', marginBottom: 8, color: Colors.white }}>
              Chào mừng Admin
            </Text>
            <Text style={{ fontSize: isMobile ? 14 : 16, color: Colors.white, opacity: 0.9 }}>
              Quản lý toàn bộ hệ thống điểm danh điện tử
            </Text>
          </Card>

          {/* Main Stats Grid */}
          <View style={{ marginBottom: isMobile ? 16 : 24 }}>
            <Text style={{ fontSize: isMobile ? 16 : 18, fontWeight: '600', marginBottom: 12, color: Colors.text }}>
              Tổng quan hệ thống
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
              {stats.map((stat, index) => (
                <View 
                  key={index} 
                  style={{ 
                    width: isDesktop ? '25%' : isTablet ? '50%' : '100%',
                    paddingHorizontal: 8, 
                    marginBottom: isMobile ? 8 : 12 
                  }}
                >
                  <StatsCard {...stat} />
                </View>
              ))}
            </View>
          </View>

          {/* Today's Attendance Stats */}
          <View style={{ marginBottom: isMobile ? 16 : 24 }}>
            <Text style={{ fontSize: isMobile ? 16 : 18, fontWeight: '600', marginBottom: 12, color: Colors.text }}>
              Điểm danh hôm nay
            </Text>
            <View style={{ flexDirection: isMobile ? 'column' : 'row', marginHorizontal: -8, gap: isMobile ? 8 : 0 }}>
              {todayStats.map((stat, index) => (
                <View key={index} style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8, marginBottom: isMobile ? 8 : 0 }}>
                  <Card style={{ alignItems: 'center', paddingVertical: isMobile ? 16 : undefined }}>
                    <Text style={{ fontSize: isMobile ? 24 : 30, fontWeight: 'bold', marginBottom: 4, color: stat.color }}>
                      {stat.value}
                    </Text>
                    <Text style={{ fontSize: isMobile ? 13 : 14, color: Colors.textSecondary }}>
                      {stat.label}
                    </Text>
                  </Card>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: isMobile ? 16 : 24 }}>
            <Text style={{ fontSize: isMobile ? 16 : 18, fontWeight: '600', marginBottom: 12, color: Colors.text }}>
              Thao tác nhanh
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
              {quickActions.map((action, index) => (
                <View 
                  key={index} 
                  style={{ 
                    width: isDesktop ? '33.333%' : isTablet ? '50%' : '100%',
                    paddingHorizontal: 8, 
                    marginBottom: isMobile ? 8 : 12 
                  }}
                >
                  <Card onPress={() => router.push(action.route as any)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View 
                        style={{ 
                          width: isMobile ? 36 : 40, 
                          height: isMobile ? 36 : 40, 
                          borderRadius: 12, 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          marginRight: 12,
                          backgroundColor: Colors.infoLight 
                        }}
                      >
                        <Text style={{ fontSize: isMobile ? 18 : 20 }}>{action.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', marginBottom: 4, color: Colors.text, fontSize: isMobile ? 14 : 16 }}>
                          {action.title}
                        </Text>
                        <Text style={{ fontSize: isMobile ? 11 : 12, color: Colors.textSecondary }}>
                          {action.subtitle}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: Colors.text }}>
              Hoạt động gần đây
            </Text>
            <Card>
              {[
                { text: 'Thêm mới 15 sinh viên vào lớp CNTT01', time: '5 phút trước' },
                { text: 'Tạo lịch học tuần 2 HK1-2026', time: '1 giờ trước' },
                { text: 'Cập nhật thông tin giảng viên GV001', time: '2 giờ trước' },
              ].map((activity, index) => (
                <View
                  key={index}
                  style={{ 
                    paddingVertical: 12, 
                    borderBottomWidth: index === 2 ? 0 : 1,
                    borderBottomColor: index === 2 ? 'transparent' : Colors.border 
                  }}
                >
                  <Text style={{ marginBottom: 4, color: Colors.text }}>
                    {activity.text}
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                    {activity.time}
                  </Text>
                </View>
              ))}
            </Card>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:05
