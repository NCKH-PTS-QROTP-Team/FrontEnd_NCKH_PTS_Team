import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import AppLayout from '@/components/AppLayout';
import { HomeIcon, ClipboardIcon, HashIcon, QrCodeIcon, GraduationIcon, ChartIcon } from '@/components/Icons';

export default function TeacherLayout() {
  const isWeb = Platform.OS === 'web';

  const menuItems = [
    { icon: <HomeIcon size={20} color="#3FA9F5" />, label: 'Dashboard', route: '/teacher/dashboard' },
    { icon: <ClipboardIcon size={20} color="#3FA9F5" />, label: 'Danh sách lớp', route: '/teacher/class-list' },
    { icon: <HashIcon size={20} color="#3FA9F5" />, label: 'Tạo OTP', route: '/teacher/generate-otp' },
    { icon: <QrCodeIcon size={20} color="#3FA9F5" />, label: 'Tạo QR', route: '/teacher/generate-qr' },
    { icon: <GraduationIcon size={20} color="#3FA9F5" />, label: 'Lớp chủ nhiệm', route: '/teacher/advisee-class' },
    { icon: <ChartIcon size={20} color="#3FA9F5" />, label: 'Báo cáo', route: '/teacher/reports' },
  ];

  const stackContent = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="class-list" />
      <Stack.Screen name="generate-otp" />
      <Stack.Screen name="generate-qr" />
      <Stack.Screen name="advisee-class" />
      <Stack.Screen name="reports" />
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
      userRole="teacher"
      userName="Giảng viên"
    >
      {stackContent}
    </AppLayout>
  );
}
