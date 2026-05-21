import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';
import { StatsCard } from './StatsCard';
import { QuickActions } from './QuickActions';
import { ActivityTimeline } from './ActivityTimeline';
import { ResponsiveGrid, ResponsiveContainer, useScreenSize } from './ResponsiveLayout';
import { PageTransition } from './PageTransition';
import Toast, { useToast } from './Toast';
import {
  UsersIcon,
  SchoolIcon,
  CalendarIcon,
  ChartIcon,
  ClipboardIcon,
  QrCodeIcon,
  HashIcon,
  BellIcon,
} from './Icons';
import { ResponsiveText, ResponsiveSpacing } from '@/utils/responsive';

/**
 * Beautiful Dashboard Demo with:
 * - Stats cards with 32x32 icons
 * - Trend indicators (↑ ↓) with colors
 * - Mini sparklines in stats cards
 * - Quick actions with large touch targets
 * - Activity timeline with avatars
 */
export default function DashboardDemo() {
  const { showToast } = useToast();
  const screenSize = useScreenSize();

  // Sample data
  const statsData = [
    {
      label: 'Tổng sinh viên',
      value: '1,248',
      icon: <UsersIcon size={32} color={Colors.primary} />,
      color: Colors.primary,
      trend: { value: 12.5, period: 'vs tháng trước' },
      sparkline: { values: [30, 40, 35, 50, 49, 60, 70] },
    },
    {
      label: 'Lớp học',
      value: '42',
      icon: <SchoolIcon size={32} color={Colors.success} />,
      color: Colors.success,
      trend: { value: 8.2, period: 'vs tháng trước' },
      sparkline: { values: [20, 30, 25, 40, 45, 50, 48], color: Colors.success },
    },
    {
      label: 'Buổi học hôm nay',
      value: '18',
      icon: <CalendarIcon size={32} color={Colors.warning} />,
      color: Colors.warning,
      trend: { value: -3.1, period: 'vs hôm qua' },
      sparkline: { values: [40, 35, 30, 38, 35, 32, 30], color: Colors.warning },
    },
    {
      label: 'Điểm danh',
      value: '95%',
      icon: <ChartIcon size={32} color={Colors.info} />,
      color: Colors.info,
      trend: { value: 2.4, period: 'vs tuần trước' },
      sparkline: { values: [85, 87, 90, 92, 91, 94, 95], color: Colors.info },
    },
  ];

  const quickActions = [
    {
      key: 'attendance',
      label: 'Điểm danh',
      icon: <ClipboardIcon size={32} color={Colors.primary} />,
      color: Colors.primary,
      onPress: () => showToast('Mở điểm danh', 'info'),
    },
    {
      key: 'qr',
      label: 'Tạo QR',
      icon: <QrCodeIcon size={32} color={Colors.success} />,
      color: Colors.success,
      onPress: () => showToast('Tạo mã QR', 'success'),
    },
    {
      key: 'otp',
      label: 'Tạo OTP',
      icon: <HashIcon size={32} color={Colors.warning} />,
      color: Colors.warning,
      onPress: () => showToast('Tạo mã OTP', 'warning'),
    },
    {
      key: 'notifications',
      label: 'Thông báo',
      icon: <BellIcon size={32} color={Colors.error} />,
      color: Colors.error,
      onPress: () => showToast('Xem thông báo', 'info'),
    },
  ];

  const activityData = [
    {
      id: '1',
      user: {
        name: 'Nguyễn Văn A',
        initials: 'NA',
        color: Colors.primary,
      },
      action: 'đã điểm danh',
      description: 'Lớp Lập trình Web - Buổi 5',
      timestamp: '2 phút trước',
    },
    {
      id: '2',
      user: {
        name: 'Trần Thị B',
        initials: 'TB',
        color: Colors.success,
      },
      action: 'đã tạo mã QR',
      description: 'Lớp Cơ sở dữ liệu - Buổi 3',
      timestamp: '15 phút trước',
    },
    {
      id: '3',
      user: {
        name: 'Lê Văn C',
        initials: 'LC',
        color: Colors.warning,
      },
      action: 'đã vắng',
      description: 'Lớp Mạng máy tính - Buổi 7',
      timestamp: '1 giờ trước',
    },
    {
      id: '4',
      user: {
        name: 'Phạm Thị D',
        initials: 'PD',
        color: Colors.info,
      },
      action: 'đã điểm danh',
      description: 'Lớp Trí tuệ nhân tạo - Buổi 2',
      timestamp: '2 giờ trước',
    },
    {
      id: '5',
      user: {
        name: 'Hoàng Văn E',
        initials: 'HE',
        color: Colors.error,
      },
      action: 'đã được duyệt điểm danh bổ sung',
      description: 'Lớp Phát triển ứng dụng - Buổi 4',
      timestamp: '3 giờ trước',
    },
    {
      id: '6',
      user: {
        name: 'Vũ Thị F',
        initials: 'VF',
        color: '#9333EA',
      },
      action: 'đã tạo lớp học mới',
      description: 'Lớp An toàn thông tin - Học kỳ 2',
      timestamp: '5 giờ trước',
    },
  ];

  return (
    <PageTransition>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <ResponsiveContainer>
          {/* Header */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <Text style={ResponsiveText.display}>
              Dashboard
            </Text>
            <Text style={{ ...ResponsiveText.body, color: Colors.textSecondary, marginTop: 8 }}>
              Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGapLarge }}>
            <Text style={{ ...ResponsiveText.h3, marginBottom: 16 }}>
              Thống kê tổng quan
            </Text>
            <ResponsiveGrid
              columns={{ mobile: 1, tablet: 2, desktop: 4 }}
              gap={16}
            >
              {statsData.map((stat, index) => (
                <StatsCard
                  key={index}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  trend={stat.trend}
                  sparkline={stat.sparkline}
                />
              ))}
            </ResponsiveGrid>
          </View>

          {/* Feature Highlights */}
          <View
            style={{
              backgroundColor: Colors.primary + '10',
              borderRadius: 12,
              padding: 20,
              marginBottom: ResponsiveSpacing.sectionGapLarge,
              borderWidth: 1,
              borderColor: Colors.primary + '30',
            }}
          >
            <Text style={{ ...ResponsiveText.h4, color: Colors.textHeading, marginBottom: 12 }}>
              ✨ Tính năng mới
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, color: Colors.text, marginRight: 8 }}>
                  📊
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Icons size 32x32:</Text> Tất cả icons trong stats cards đã được tăng lên 32x32px để dễ nhìn hơn
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, color: Colors.text, marginRight: 8 }}>
                  📈
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Trend indicators:</Text> Hiển thị xu hướng tăng (↑) hoặc giảm (↓) với màu sắc trực quan (xanh/đỏ)
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, color: Colors.text, marginRight: 8 }}>
                  ✨
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Mini sparklines:</Text> Biểu đồ mini trong mỗi stats card để xem xu hướng theo thời gian
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, color: Colors.text, marginRight: 8 }}>
                  🎯
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Large touch targets:</Text> Quick actions với 64px+ touch target để dễ nhấn hơn
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, color: Colors.text, marginRight: 8 }}>
                  👤
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Activity timeline:</Text> Timeline với avatars đầy màu sắc cho recent activities
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGapLarge }}>
            <Text style={{ ...ResponsiveText.h3, marginBottom: 16 }}>
              Thao tác nhanh
            </Text>
            <QuickActions
              actions={quickActions}
              columns={screenSize.isMobile ? 2 : screenSize.isTablet ? 3 : 4}
            />
          </View>

          {/* Activity Timeline */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={ResponsiveText.h3}>
                Hoạt động gần đây
              </Text>
              <Text style={{ ...ResponsiveText.bodySmall, color: Colors.primary, fontWeight: '600' }}>
                Xem tất cả →
              </Text>
            </View>
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 12,
                padding: 20,
                borderWidth: 1,
                borderColor: Colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <ActivityTimeline items={activityData} maxHeight={500} />
            </View>
          </View>

          {/* Stats Summary */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: ResponsiveSpacing.sectionGap,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text style={{ ...ResponsiveText.h4, marginBottom: 16 }}>
              Tổng kết Dashboard Components
            </Text>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                  Stats Cards
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, fontWeight: '600' }}>
                  4 cards với trends & sparklines
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                  Icon Size
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, fontWeight: '600' }}>
                  32x32px (tăng từ 24x24)
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                  Trend Indicators
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, fontWeight: '600' }}>
                  ↑ Success / ↓ Error colors
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                  Quick Actions
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, fontWeight: '600' }}>
                  4 actions, 64px+ touch target
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                  Activity Timeline
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, fontWeight: '600' }}>
                  6 items với avatars
                </Text>
              </View>
            </View>
          </View>
        </ResponsiveContainer>
      </ScrollView>

      {/* Toast */}
    </PageTransition>
  );
}
