import React from "react";
import {
  View,
  Text,
  ScrollView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import { AppHeader } from "@/components/AppHeader";
import { StatsCard } from "@/components/StatsCard";
import Card from "@/components/Card";
import AppLayout from "@/components/AppLayout";
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

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const isWeb = Platform.OS === "web";

  const contentMaxWidth = isDesktop ? 1400 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;
  const cardGap = isMobile ? 12 : 16;

  // Calculate widths based on items per row
  const statsWidth = isDesktop ? "w-1/4" : "w-1/2";
  const actionWidth = isDesktop ? "w-1/3" : isTablet ? "w-1/2" : "w-full";

  const menuItems = [
    {
      icon: <HomeIcon size={20} color={Colors.primary} />,
      label: "Dashboard",
      route: "/admin/dashboard",
    },
    {
      icon: <UsersIcon size={20} color={Colors.primary} />,
      label: "Người dùng",
      route: "/admin/users",
    },
    {
      icon: <SchoolIcon size={20} color={Colors.primary} />,
      label: "Lớp học",
      route: "/admin/classes",
    },
    {
      icon: <BookIcon size={20} color={Colors.primary} />,
      label: "Môn học",
      route: "/admin/subjects",
    },
    {
      icon: <CalendarIcon size={20} color={Colors.primary} />,
      label: "Lịch học",
      route: "/admin/schedules",
    },
    {
      icon: <EyeIcon size={20} color={Colors.primary} />,
      label: "Giám sát",
      route: "/admin/sessions",
    },
    {
      icon: <ChartIcon size={20} color={Colors.primary} />,
      label: "Báo cáo",
      route: "/admin/reports",
    },
    {
      icon: <SettingsIcon size={20} color={Colors.primary} />,
      label: "Cài đặt",
      route: "/admin/settings",
    },
  ];
  const stats = [
    {
      label: "Tổng người dùng",
      value: "1,234",
      icon: <Text style={{ fontSize: 20, color: Colors.primary }}>U</Text>,
      color: Colors.primary,
    },
    {
      label: "Tổng lớp học",
      value: "45",
      icon: <Text style={{ fontSize: 20, color: Colors.success }}>C</Text>,
      color: Colors.success,
    },
    {
      label: "Buổi học hôm nay",
      value: "23",
      icon: <Text style={{ fontSize: 20, color: Colors.warning }}>▶</Text>,
      color: Colors.warning,
    },
    {
      label: "Tỷ lệ điểm danh",
      value: "87%",
      icon: <Text style={{ fontSize: 20, color: Colors.primary }}>%</Text>,
      color: Colors.primary,
    },
  ];

  const todayStats = [
    { label: "Có mặt", value: "856", color: Colors.success },
    { label: "Muộn", value: "45", color: Colors.warning },
    { label: "Vắng", value: "123", color: Colors.error },
  ];

  const quickActions = [
    {
      title: "Người dùng",
      route: "/admin/users",
      icon: UsersIcon,
      color: "#3FA9F5",
    },
    {
      title: "Lớp học",
      route: "/admin/classes",
      icon: SchoolIcon,
      color: "#10B981",
    },
    {
      title: "Môn học",
      route: "/admin/subjects",
      icon: BookIcon,
      color: "#8B5CF6",
    },
    {
      title: "Lịch học",
      route: "/admin/schedules",
      icon: CalendarIcon,
      color: "#F59E0B",
    },
    {
      title: "Giám sát",
      route: "/admin/sessions",
      icon: EyeIcon,
      color: "#EF4444",
    },
    {
      title: "Báo cáo",
      route: "/admin/reports",
      icon: ChartIcon,
      color: "#06B6D4",
    },
    {
      title: "Cài đặt",
      route: "/admin/settings",
      icon: SettingsIcon,
      color: "#6B7280",
    },
  ];

  const content = (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      <AppHeader title="Dashboard" showBack={false} showLogout={!isWeb} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: isMobile ? 100 : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal,
            paddingVertical: 24,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Welcome Section */}
          <Card className="mb-6" style={{ backgroundColor: Colors.primary }}>
            <Text
              className="text-2xl font-bold mb-2"
              style={{ color: Colors.white, letterSpacing: 0 }}
            >
              Chào mừng Admin
            </Text>
            <Text
              className="text-base"
              style={{ color: Colors.white, opacity: 0.9, letterSpacing: 0 }}
            >
              Quản lý toàn bộ hệ thống điểm danh điện tử
            </Text>
          </Card>

          {/* Main Stats Grid */}
          <View style={{ marginBottom: isMobile ? 24 : 32 }}>
            <Text
              style={{
                fontSize: isMobile ? 16 : 18,
                fontWeight: "600",
                color: "#111827",
                marginBottom: isMobile ? 16 : 20,
              }}
            >
              Tổng quan hệ thống
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginHorizontal: -cardGap / 2,
              }}
            >
              {stats.map((stat, index) => (
                <View
                  key={index}
                  style={{
                    width: isDesktop ? "25%" : "50%",
                    paddingHorizontal: cardGap / 2,
                    marginBottom: cardGap,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: isMobile ? 8 : 12,
                      padding: isMobile ? 16 : 20,
                      borderLeftWidth: 3,
                      borderLeftColor: stat.color,
                      minHeight: isMobile ? 100 : 120,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.03,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: "#6B7280",
                        marginBottom: isMobile ? 4 : 8,
                        fontWeight: "500",
                      }}
                    >
                      {stat.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? 32 : 40,
                        fontWeight: "700",
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Today's Attendance Stats */}
          <View style={{ marginBottom: isMobile ? 24 : 32 }}>
            <Text
              style={{
                fontSize: isMobile ? 16 : 18,
                fontWeight: "600",
                color: "#111827",
                marginBottom: isMobile ? 16 : 20,
              }}
            >
              Điểm danh hôm nay
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: cardGap,
              }}
            >
              {todayStats.map((stat, index) => (
                <View key={index} style={{ flex: 1 }}>
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: isMobile ? 8 : 12,
                      padding: isMobile ? 16 : 20,
                      borderLeftWidth: 3,
                      borderLeftColor: stat.color,
                      minHeight: isMobile ? 80 : 100,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.03,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: "#6B7280",
                        marginBottom: isMobile ? 4 : 8,
                        fontWeight: "500",
                      }}
                    >
                      {stat.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? 28 : 32,
                        fontWeight: "700",
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: isMobile ? 24 : 32 }}>
            <Text
              style={{
                fontSize: isMobile ? 16 : 18,
                fontWeight: "600",
                color: "#111827",
                marginBottom: isMobile ? 16 : 20,
              }}
            >
              Thao tác nhanh
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginHorizontal: -cardGap / 2,
              }}
            >
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <View
                    key={index}
                    style={{
                      width: isDesktop ? "20%" : isTablet ? "25%" : "33.333%",
                      paddingHorizontal: cardGap / 2,
                      marginBottom: cardGap,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => router.push(action.route as any)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: isMobile ? 8 : 12,
                        padding: isMobile ? 12 : 16,
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: isMobile ? 80 : 100,
                        borderWidth: 1,
                        borderColor: "#F3F4F6",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.02,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={{
                          width: isMobile ? 40 : 48,
                          height: isMobile ? 40 : 48,
                          borderRadius: isMobile ? 10 : 12,
                          backgroundColor: action.color + "15",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: isMobile ? 8 : 12,
                        }}
                      >
                        <IconComponent
                          size={isMobile ? 20 : 24}
                          color={action.color}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: isMobile ? 12 : 14,
                          fontWeight: "600",
                          color: "#111827",
                          textAlign: "center",
                        }}
                        numberOfLines={2}
                      >
                        {action.title}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={{ marginBottom: isMobile ? 24 : 32 }}>
            <Text
              style={{
                fontSize: isMobile ? 16 : 18,
                fontWeight: "600",
                color: Colors.text,
                marginBottom: isMobile ? 16 : 20,
              }}
            >
              Hoạt động gần đây
            </Text>
            <Card>
              {[
                {
                  text: "Thêm mới 15 sinh viên vào lớp CNTT01",
                  time: "5 phút trước",
                },
                { text: "Tạo lịch học tuần 2 HK1-2026", time: "1 giờ trước" },
                {
                  text: "Cập nhật thông tin giảng viên GV001",
                  time: "2 giờ trước",
                },
              ].map((activity, index) => (
                <View
                  key={index}
                  style={{
                    paddingVertical: isMobile ? 12 : 16,
                    borderBottomWidth: index === 2 ? 0 : 1,
                    borderBottomColor: Colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? 14 : 15,
                      color: Colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {activity.text}
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: Colors.textSecondary,
                    }}
                  >
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

  return (
    <AppLayout menuItems={menuItems} userRole="admin" userName="Admin Hệ thống">
      {content}
    </AppLayout>
  );
}

// Updated: 2026-01-02 13:16:05
