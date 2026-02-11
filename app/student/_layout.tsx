import React from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { Platform, View } from "react-native";
import AppLayout from "@/components/AppLayout";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ChatBox } from "@/components/ChatBox";
import {
  HomeIcon,
  CalendarIcon,
  QrCodeIcon,
  HashIcon,
  ScrollIcon,
  BellIcon,
  UserIcon,
} from "@/components/Icons";
import { Colors } from "@/constants/colors";

export default function StudentLayout() {
  const isWeb = Platform.OS === "web";
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      icon: <HomeIcon size={20} color="#3FA9F5" />,
      label: "Trang chủ",
      route: "/student/home",
    },
    {
      icon: <CalendarIcon size={20} color="#3FA9F5" />,
      label: "Lịch học",
      route: "/student/schedule",
    },
    {
      icon: <QrCodeIcon size={20} color="#3FA9F5" />,
      label: "Điểm danh QR",
      route: "/student/qr-attendance",
    },
    {
      icon: <HashIcon size={20} color="#3FA9F5" />,
      label: "Điểm danh OTP",
      route: "/student/otp-attendance",
    },
    {
      icon: <UserIcon size={20} color="#3FA9F5" />,
      label: "Đăng ký Face",
      route: "/student/register-face",
    },
    {
      icon: <ScrollIcon size={20} color="#3FA9F5" />,
      label: "Lịch sử",
      route: "/student/history",
    },
    {
      icon: <BellIcon size={20} color="#3FA9F5" />,
      label: "Thông báo",
      route: "/student/notifications",
    },
  ];

  const stackContent = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="qr-attendance" />
      <Stack.Screen name="otp-attendance" />
      <Stack.Screen name="face-attendance" />
      <Stack.Screen name="register-face" />
      <Stack.Screen name="history" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="attendance-actions" />
      <Stack.Screen name="profile" />
    </Stack>
  );

  if (!isWeb) {
    // On mobile, render with bottom navigation (4 items + center button)
    const bottomNavItems = [
      {
        key: "/student/home",
        label: "Trang chủ",
        icon: (
          <HomeIcon
            size={24}
            color={
              pathname === "/student/home"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
      {
        key: "/student/schedule",
        label: "Lịch học",
        icon: (
          <CalendarIcon
            size={24}
            color={
              pathname === "/student/schedule"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
      {
        key: "/student/register-face",
        label: "Đăng ký Face",
        icon: (
          <UserIcon
            size={24}
            color={
              pathname === "/student/register-face"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
      {
        key: "/student/profile",
        label: "Tài khoản",
        icon: (
          <UserIcon
            size={24}
            color={
              pathname === "/student/profile"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
    ];

    const currentRoute = pathname || "/student/home";

    return (
      <View style={{ flex: 1 }}>
        {stackContent}
        <BottomNavigation
          items={bottomNavItems}
          activeKey={currentRoute}
          onItemPress={(route) => router.push(route as any)}
          centerButton={{
            icon: <QrCodeIcon size={32} color={Colors.white} />,
            onPress: () => router.push("/student/attendance-actions"),
          }}
        />
        <ChatBox />
      </View>
    );
  }

  // On web, wrap with AppLayout - user info sẽ tự fetch từ API
  return (
    <>
      <AppLayout
        menuItems={menuItems}
        userRole="student"
      >
        {stackContent}
      </AppLayout>
      <ChatBox />
    </>
  );
}
