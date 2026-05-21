import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
import {
  userService,
  classService,
  subjectService,
  reportService,
} from "@/apis";
import { attendanceService } from "@/apis/services/attendance.service";
import { useToast } from "@/components/ToastProvider";

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const isWeb = Platform.OS === "web";
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalSessions: 0,
  });
  const [todayPresent, setTodayPresent] = useState(0);
  const [todayLate, setTodayLate] = useState(0);
  const [todayAbsent, setTodayAbsent] = useState(0);
  const [recentActivities, setRecentActivities] = useState<
    { text: string; time: string }[]
  >([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [users, classes, subjects, summary, sessions] = await Promise.all([
        userService.getUsers().catch(() => []),
        classService.getAllClasses().catch(() => []),
        subjectService.getSubjects().catch(() => []),
        reportService.getAttendanceSummary().catch(() => null),
        attendanceService.getSessions().catch(() => []),
      ]);

      setStats({
        totalUsers: users.length,
        totalClasses: classes.length,
        totalSubjects: subjects.length,
        totalSessions: summary?.totalSessions || 0,
      });

      // Today's attendance from summary
      if (summary) {
        setTodayPresent(summary.totalPresent || 0);
        setTodayLate(summary.totalLate || 0);
        setTodayAbsent(summary.totalAbsent || 0);
      }

      // Recent activities from latest sessions
      if (sessions.length > 0) {
        const recent = sessions
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
          .map((s) => {
            const ago = getTimeAgo(s.createdAt);
            return {
              text: `${s.status === "ACTIVE" ? "Đang điểm danh" : "Đã hoàn thành"} - ${s.subjectName || s.className || "Phên điểm danh"}`,
              time: ago,
            };
          });
        setRecentActivities(recent);
      } else {
        setRecentActivities([
          { text: "Chưa có hoạt động nào", time: "" },
        ]);
      }
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      showToast("Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  const contentMaxWidth = isDesktop ? 1400 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;
  const cardGap = isMobile ? 12 : 16;

  // Calculate widths based on items per row
  const statsWidth = isDesktop ? "w-1/4" : "w-1/2";
  const actionWidth = isDesktop ? "w-1/3" : isTablet ? "w-1/2" : "w-full";

  const statsData = [
    {
      label: "Tổng người dùng",
      value: stats.totalUsers.toString(),
      icon: <Text style={{ fontSize: 20, color: Colors.primary }}>U</Text>,
      color: Colors.primary,
    },
    {
      label: "Tổng lớp học",
      value: stats.totalClasses.toString(),
      icon: <Text style={{ fontSize: 20, color: Colors.success }}>C</Text>,
      color: Colors.success,
    },
    {
      label: "Tổng môn học",
      value: stats.totalSubjects.toString(),
      icon: <Text style={{ fontSize: 20, color: Colors.warning }}>B</Text>,
      color: Colors.warning,
    },
    {
      label: "Tổng phiên điểm danh",
      value: stats.totalSessions.toString(),
      icon: <Text style={{ fontSize: 20, color: Colors.primary }}>▶</Text>,
      color: Colors.primary,
    },
  ];

  // Today stats from API
  const todayStats = [
    { label: "Có mặt", value: todayPresent.toString(), color: Colors.success },
    { label: "Muộn", value: todayLate.toString(), color: Colors.warning },
    { label: "Vắng", value: todayAbsent.toString(), color: Colors.error },
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

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        edges={["top"]}
      >
        <StatusBar style="dark" />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3FA9F5" />
          <Text style={{ marginTop: 16, color: "#6B7280" }}>
            Đang tải dữ liệu...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const content = (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />

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
          <View
            style={{
              marginBottom: isMobile ? 24 : 32,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Image
              source={require("@/assets/admin-banner.png")}
              style={{
                width: "100%",
                height: isMobile ? 120 : isTablet ? 150 : 180,
                resizeMode: "cover",
              }}
            />
          </View>

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
              {statsData.map((stat, index) => (
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
              {recentActivities.map((activity, index) => (
                <View
                  key={index}
                  style={{
                    paddingVertical: isMobile ? 12 : 16,
                    borderBottomWidth: index === recentActivities.length - 1 ? 0 : 1,
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
                  {activity.time ? (
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: Colors.textSecondary,
                      }}
                    >
                      {activity.time}
                    </Text>
                  ) : null}
                </View>
              ))}
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  return content;
}

// Updated: 2026-01-02 13:16:05
