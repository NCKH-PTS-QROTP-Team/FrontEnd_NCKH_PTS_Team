import React from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { Platform, View } from 'react-native';
import AppLayout from '@/components/AppLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { HomeIcon, ClipboardIcon, HashIcon, QrCodeIcon, GraduationIcon, ChartIcon } from '@/components/Icons';

export default function TeacherLayout() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const pathname = usePathname();

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
    // On mobile, render with bottom navigation (5 main items)
    const bottomNavItems = [
      { key: '/teacher/dashboard', label: 'Tổng quan', icon: <HomeIcon size={24} color="#3FA9F5" /> },
      { key: '/teacher/class-list', label: 'Lớp học', icon: <ClipboardIcon size={24} color="#3FA9F5" /> },
      { key: '/teacher/generate-otp', label: 'OTP', icon: <HashIcon size={24} color="#3FA9F5" /> },
      { key: '/teacher/generate-qr', label: 'QR', icon: <QrCodeIcon size={24} color="#3FA9F5" /> },
      { key: '/teacher/advisee-class', label: 'Chủ nhiệm', icon: <GraduationIcon size={24} color="#3FA9F5" /> },
    ];

    const currentRoute = pathname || '/teacher/dashboard';

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
      userRole="teacher"
      userName="Trần Thị Bình"
      userEmail="tranthib@teacher.edu.vn"
    >
      {stackContent}
    </AppLayout>
  );
}
