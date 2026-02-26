import React from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppLayout from "@/components/AppLayout";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ChatBox } from "@/components/ChatBox";
import {
  HomeIcon,
  ClipboardIcon,
  UploadIcon,
  SchoolIcon,
  ChartIcon,
  UserIcon,
  UsersIcon,
  BookIcon,
  CalendarIcon,
  EyeIcon,
} from "@/components/Icons";
import { Colors } from "@/constants/colors";

export default function AcademicStaffLayout() {
  const isWeb = Platform.OS === "web";
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      icon: <HomeIcon size={20} color="#3FA9F5" />,
      label: "Dashboard",
      route: "/academic-staff/dashboard",
    },
    {
      icon: <UsersIcon size={20} color="#3FA9F5" />,
      label: "Quản lý sinh viên",
      route: "/academic-staff/students",
    },
    {
      icon: <SchoolIcon size={20} color="#3FA9F5" />,
      label: "Quản lý lớp học",
      route: "/academic-staff/classes",
    },
    {
      icon: <BookIcon size={20} color="#3FA9F5" />,
      label: "Quản lý môn học",
      route: "/academic-staff/subjects",
    },
    {
      icon: <CalendarIcon size={20} color="#3FA9F5" />,
      label: "Lịch học",
      route: "/academic-staff/schedules",
    },
    {
      icon: <UploadIcon size={20} color="#3FA9F5" />,
      label: "Import dữ liệu",
      route: "/academic-staff/import",
    },
    {
      icon: <EyeIcon size={20} color="#3FA9F5" />,
      label: "Giám sát điểm danh",
      route: "/academic-staff/sessions",
    },
    {
      icon: <ChartIcon size={20} color="#3FA9F5" />,
      label: "Báo cáo",
      route: "/academic-staff/reports",
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
      <Stack.Screen name="classes" />
      <Stack.Screen name="subjects" />
      <Stack.Screen name="schedules" />
      <Stack.Screen name="import" />
      <Stack.Screen name="import-classes" />
      <Stack.Screen name="import-students" />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="profile" />
    </Stack>
  );

  if (!isWeb) {
    // On mobile, render with bottom navigation
    const bottomNavItems = [
      {
        key: "/academic-staff/dashboard",
        label: "Tổng quan",
        icon: (
          <HomeIcon
            size={24}
            color={
              pathname === "/academic-staff/dashboard"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
      {
        key: "/academic-staff/students",
        label: "Sinh viên",
        icon: (
          <UsersIcon
            size={24}
            color={
              pathname === "/academic-staff/students"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
      {
        key: "/academic-staff/classes",
        label: "Lớp học",
        icon: (
          <SchoolIcon
            size={24}
            color={
              pathname === "/academic-staff/classes"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
      {
        key: "/academic-staff/sessions",
        label: "Giám sát",
        icon: (
          <EyeIcon
            size={24}
            color={
              pathname === "/academic-staff/sessions"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
      {
        key: "/academic-staff/profile",
        label: "Tài khoản",
        icon: (
          <UserIcon
            size={24}
            color={
              pathname === "/academic-staff/profile"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
        ),
      },
    ];

    const currentRoute = pathname || "/academic-staff/dashboard";
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        edges={["top", "bottom"]}
      >
        {stackContent}
        <BottomNavigation
          items={bottomNavItems}
          activeKey={currentRoute}
          onItemPress={(route) => router.push(route as any)}
        />
        <ChatBox />
      </SafeAreaView>
    );
  }

  // On web, wrap with AppLayout + ChatBox
  return (
    <>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        edges={["top", "left", "right"]}
      >
        <AppLayout
          menuItems={menuItems}
          userRole="academic-staff"
          userName="Giáo vụ"
        >
          {stackContent}
        </AppLayout>
      </SafeAreaView>
      <ChatBox />
    </>
  );
}

