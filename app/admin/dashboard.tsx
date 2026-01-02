import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import AppHeader from '../../components/AppHeader';
import StatsCard from '../../components/StatsCard';
import Card from '../../components/Card';

export default function AdminDashboard() {
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
    <View className="flex-1 bg-white">
      <AppHeader title="Admin Dashboard" showBack={false} />
      
      <ScrollView className="flex-1">
        <View className="p-4" style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          
          {/* Welcome Section */}
          <Card className="mb-6" style={{ backgroundColor: Colors.primary }}>
            <Text className="text-2xl font-bold mb-2" style={{ color: Colors.white }}>
              Chào mừng Admin
            </Text>
            <Text className="text-base" style={{ color: Colors.white, opacity: 0.9 }}>
              Quản lý toàn bộ hệ thống điểm danh điện tử
            </Text>
          </Card>

          {/* Main Stats Grid */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
              Tổng quan hệ thống
            </Text>
            <View className="flex-row flex-wrap -mx-2">
              {stats.map((stat, index) => (
                <View key={index} className="w-1/2 px-2 mb-3">
                  <StatsCard {...stat} />
                </View>
              ))}
            </View>
          </View>

          {/* Today's Attendance Stats */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
              Điểm danh hôm nay
            </Text>
            <View className="flex-row -mx-2">
              {todayStats.map((stat, index) => (
                <View key={index} className="flex-1 px-2">
                  <Card className="items-center">
                    <Text className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                      {stat.value}
                    </Text>
                    <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                      {stat.label}
                    </Text>
                  </Card>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
              Thao tác nhanh
            </Text>
            <View className="flex-row flex-wrap -mx-2">
              {quickActions.map((action, index) => (
                <View key={index} className="w-1/2 px-2 mb-3">
                  <Card onPress={() => router.push(action.route as any)}>
                    <View className="flex-row items-center mb-2">
                      <View 
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: Colors.infoLight }}
                      >
                        <Text style={{ fontSize: 20 }}>{action.icon}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold mb-1" style={{ color: Colors.text }}>
                          {action.title}
                        </Text>
                        <Text className="text-xs" style={{ color: Colors.textSecondary }}>
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
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
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
                  className="py-3 border-b"
                  style={{ borderBottomColor: index === 2 ? 'transparent' : Colors.border }}
                >
                  <Text className="mb-1" style={{ color: Colors.text }}>
                    {activity.text}
                  </Text>
                  <Text className="text-xs" style={{ color: Colors.textSecondary }}>
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
