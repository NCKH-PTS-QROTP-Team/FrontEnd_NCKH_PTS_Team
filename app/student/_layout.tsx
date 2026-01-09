import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import AppLayout from '@/components/AppLayout';
import { HomeIcon, CalendarIcon, QrCodeIcon, HashIcon, ScrollIcon, BellIcon } from '@/components/Icons';

export default function StudentLayout() {
  const isWeb = Platform.OS === 'web';

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
    // On mobile, just render the stack without sidebar
    return stackContent;
  }

  // On web, wrap with AppLayout
  return (
    <AppLayout
      menuItems={menuItems}
      userRole="student"
      userName="Sinh viên"
    >
      {stackContent}
    </AppLayout>
  );
}

