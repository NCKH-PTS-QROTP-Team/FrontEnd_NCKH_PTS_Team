import React from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { Platform, View } from 'react-native';
import AppLayout from '@/components/AppLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { HomeIcon, CalendarIcon, QrCodeIcon, HashIcon, ScrollIcon, BellIcon } from '@/components/Icons';

export default function StudentLayout() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { icon: <HomeIcon size={20} color="#3FA9F5" />, label: 'Trang chủ', route: '/student/home' },
    { icon: <CalendarIcon size={20} color="#3FA9F5" />, label: 'Lịch học', route: '/student/schedule' },
    { icon: <QrCodeIcon size={20} color="#3FA9F5" />, label: 'Điểm danh QR', route: '/student/qr-attendance' },
    { icon: <HashIcon size={20} color="#3FA9F5" />, label: 'Điểm danh OTP', route: '/student/otp-attendance' },
    { icon: <ScrollIcon size={20} color="#3FA9F5" />, label: 'Lịch sử', route: '/student/history' },
    { icon: <BellIcon size={20} color="#3FA9F5" />, label: 'Thông báo', route: '/student/notifications' },
  ];

  const stackContent = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="qr-attendance" />
      <Stack.Screen name="otp-attendance" />
      <Stack.Screen name="history" />
      <Stack.Screen name="notifications" />
    </Stack>
  );

  if (!isWeb) {
    // On mobile, render with bottom navigation (5 main items)
    const bottomNavItems = [
      { key: '/student/home', label: 'Trang chủ', icon: <HomeIcon size={24} color="#3FA9F5" /> },
      { key: '/student/schedule', label: 'Lịch học', icon: <CalendarIcon size={24} color="#3FA9F5" /> },
      { key: '/student/qr-attendance', label: 'QR', icon: <QrCodeIcon size={24} color="#3FA9F5" /> },
      { key: '/student/otp-attendance', label: 'OTP', icon: <HashIcon size={24} color="#3FA9F5" /> },
      { key: '/student/history', label: 'Lịch sử', icon: <ScrollIcon size={24} color="#3FA9F5" /> },
    ];

    const currentRoute = pathname || '/student/home';

    return (
      <View style={{ flex: 1 }}>
        {stackContent}
        <BottomNavigation
          items={bottomNavItems}
          activeKey={currentRoute}
          onItemPress={(route) => router.push(route as any)}
        />
      </View>
    );
  }

  // On web, wrap with AppLayout
  return (
    <AppLayout
      menuItems={menuItems}
      userRole="student"
      userName="Nguyễn Văn An"
      userEmail="nguyenvanan@student.edu.vn"
    >
      {stackContent}
    </AppLayout>
  );
}

