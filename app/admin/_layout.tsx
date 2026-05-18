import React from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppLayout from "@/components/AppLayout";
import { BottomNavigation } from "@/components/BottomNavigation";
import { RoleGuard } from "@/components/RoleGuard";
import { UserRole } from "@/apis/types/auth.types";
import {
  HomeIcon,
  UsersIcon,
  SchoolIcon,
  BookIcon,
  CalendarIcon,
  EyeIcon,
  ChartIcon,
  SettingsIcon,
} from "@/components/Icons";

export default function AdminLayout() {
  const isWeb = Platform.OS === "web";
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      icon: <HomeIcon size={20} color="#3FA9F5" />,
      label: "Dashboard",
      route: "/admin/dashboard",
    },
    {
      icon: <UsersIcon size={20} color="#3FA9F5" />,
      label: "Người dùng",
      route: "/admin/users",
    },
    {
      icon: <SchoolIcon size={20} color="#3FA9F5" />,
      label: "Lớp học",
      route: "/admin/classes",
    },
    {
      icon: <BookIcon size={20} color="#3FA9F5" />,
      label: "Môn học",
      route: "/admin/subjects",
    },
    {
      icon: <CalendarIcon size={20} color="#3FA9F5" />,
      label: "Lịch học",
      route: "/admin/schedules",
    },
    {
      icon: <EyeIcon size={20} color="#3FA9F5" />,
      label: "Giám sát",
      route: "/admin/sessions",
    },
    {
      icon: <ChartIcon size={20} color="#3FA9F5" />,
      label: "Báo cáo",
      route: "/admin/reports",
    },
    {
      icon: <SettingsIcon size={20} color="#3FA9F5" />,
      label: "Cài đặt",
      route: "/admin/settings",
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
      <Stack.Screen name="users" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="subjects" />
      <Stack.Screen name="schedules" />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="settings" />
    </Stack>
  );

  if (!isWeb) {
    // On mobile, render with bottom navigation
    const bottomNavItems = [
      {
        key: "/admin/dashboard",
        label: "Dashboard",
        icon: <HomeIcon size={24} color="#3FA9F5" />,
      },
      {
        key: "/admin/users",
        label: "Người dùng",
        icon: <UsersIcon size={24} color="#3FA9F5" />,
      },
      {
        key: "/admin/classes",
        label: "Lớp học",
        icon: <SchoolIcon size={24} color="#3FA9F5" />,
      },
      {
        key: "/admin/schedules",
        label: "Lịch học",
        icon: <CalendarIcon size={24} color="#3FA9F5" />,
      },
      {
        key: "/admin/settings",
        label: "Cài đặt",
        icon: <SettingsIcon size={24} color="#3FA9F5" />,
      },
    ];

    const currentRoute = pathname || "/admin/dashboard";

    return (
      <RoleGuard allowedRoles={[UserRole.ADMIN]}>
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
        </SafeAreaView>
      </RoleGuard>
    );
  }

  // On web, wrap with AppLayout and SafeAreaView
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        edges={["top", "left", "right"]}
      >
        <AppLayout
          menuItems={menuItems}
          userRole="admin"
          userName="Admin Hệ thống"
        >
          {stackContent}
        </AppLayout>
      </SafeAreaView>
    </RoleGuard>
  );
}
