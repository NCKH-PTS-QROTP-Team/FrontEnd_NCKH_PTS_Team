import React from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { Platform, View } from "react-native";
import AppLayout from "@/components/AppLayout";
import { BottomNavigation } from "@/components/BottomNavigation";
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardIcon,
  CalendarIcon,
  ChartIcon,
  UserIcon,
  CogIcon,
} from "@/components/Icons";
import { Colors } from "@/constants/colors";

export default function DepartmentLayout() {
  const isWeb = Platform.OS === "web";
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      icon: <HomeIcon size={20} color="#2563eb" />,
      label: "Dashboard",
      route: "/department/dashboard",
    },
    {
      icon: <UserGroupIcon size={20} color="#2563eb" />,
      label: "Quản lý sinh viên",
      route: "/department/students",
    },
    {
      icon: <AcademicCapIcon size={20} color="#2563eb" />,
      label: "Quản lý giảng viên",
      route: "/department/teachers",
    },
    {
      icon: <ClipboardIcon size={20} color="#2563eb" />,
      label: "Quản lý lớp học",
      route: "/department/classes",
    },
    {
      icon: <CalendarIcon size={20} color="#2563eb" />,
      label: "Quản lý lịch học",
      route: "/department/schedules",
    },
    {
      icon: <ChartIcon size={20} color="#2563eb" />,
      label: "Báo cáo & Thống kê",
      route: "/department/reports",
    },
  ];

  const stackContent = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="students" />
      <Stack.Screen name="teachers" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="courses" />
      <Stack.Screen name="schedules" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
    </Stack>
  );

  if (!isWeb) {
    // On mobile, render with bottom navigation
    const bottomNavItems = [
      {
        key: "/department/dashboard",
        label: "Tổng quan",
        icon: (
          <HomeIcon
            size={24}
            color={
              pathname === "/department/dashboard"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
      {
        key: "/department/students",
        label: "Sinh viên",
        icon: (
          <UserGroupIcon
            size={24}
            color={
              pathname === "/department/students"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
      {
        key: "/department/reports",
        label: "Báo cáo",
        icon: (
          <ChartIcon
            size={24}
            color={
              pathname === "/department/reports"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
      {
        key: "/department/profile",
        label: "Tài khoản",
        icon: (
          <UserIcon
            size={24}
            color={
              pathname === "/department/profile"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
    ];

    const currentRoute = pathname || "/department/dashboard";
    return (
      <View style={{ flex: 1 }}>
        {stackContent}
        <BottomNavigation
          items={bottomNavItems}
          activeKey={currentRoute}
          onItemPress={(route) => router.push(route as any)}
          centerButton={{
            icon: <CogIcon size={32} color={Colors.white} />,
            onPress: () => router.push("/department/settings"),
          }}
        />
      </View>
    );
  }

  // On web, wrap with AppLayout
  return (
    <AppLayout
      menuItems={menuItems}
      userRole="department"
      userName="Giáo vụ khoa"
      userEmail="department@iuh.edu.vn"
    >
      {stackContent}
    </AppLayout>
  );
}
