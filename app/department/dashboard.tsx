import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

interface StatCard {
  id: string;
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

export default function DepartmentDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const paddingH = isDesktop ? 32 : isTablet ? 24 : 16;

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([
    { id: "1", title: "Tổng sinh viên", value: "—", icon: "people", color: "#2563EB" },
    { id: "2", title: "Giảng viên", value: "—", icon: "person", color: "#7C3AED" },
    { id: "3", title: "Lớp học", value: "—", icon: "school", color: "#EC4899" },
    { id: "4", title: "Khóa học", value: "—", icon: "book", color: "#D97706" },
  ]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { statsService } = await import("@/apis/statsService");
      const data = await statsService.getDepartmentStats();
      setStats([
        { id: "1", title: "Tổng sinh viên", value: (data.totalStudents ?? 0).toLocaleString(), icon: "people", color: "#2563EB" },
        { id: "2", title: "Giảng viên", value: (data.totalTeachers ?? 0).toLocaleString(), icon: "person", color: "#7C3AED" },
        { id: "3", title: "Lớp học", value: (data.totalClasses ?? 0).toLocaleString(), icon: "school", color: "#EC4899" },
        { id: "4", title: "Khóa học", value: (data.totalSubjects ?? 0).toLocaleString(), icon: "book", color: "#D97706" },
      ]);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const statColumns = isDesktop ? 4 : isTablet ? 4 : 2;

  const quickActions: QuickAction[] = [
    { id: "1", title: "Quản lý sinh viên", description: "Xem, tìm kiếm và quản lý danh sách sinh viên", icon: "people-outline", route: "/department/students", color: "#2563EB" },
    { id: "2", title: "Quản lý giảng viên", description: "Quản lý thông tin giảng viên trong khoa", icon: "person-outline", route: "/department/teachers", color: "#7C3AED" },
    { id: "3", title: "Quản lý lớp học", description: "Tạo, sửa và phân lớp học phần", icon: "school-outline", route: "/department/classes", color: "#EC4899" },
    { id: "4", title: "Lịch học", description: "Xem và quản lý thời khóa biểu", icon: "calendar-outline", route: "/department/schedules", color: "#059669" },
    { id: "5", title: "Import dữ liệu", description: "Nhập danh sách lớp hoặc sinh viên từ Excel", icon: "cloud-upload-outline", route: "/department/import-data", color: "#0EA5E9" },
    { id: "6", title: "Giám sát điểm danh", description: "Theo dõi phiên điểm danh theo thời gian thực", icon: "checkmark-circle-outline", route: "/department/attendance", color: "#F59E0B" },
    { id: "7", title: "Báo cáo & Thống kê", description: "Xem báo cáo tổng hợp điểm danh và học vụ", icon: "stats-chart-outline", route: "/department/reports", color: "#EF4444" },
    { id: "8", title: "Khóa học", description: "Quản lý danh sách khóa học theo kỳ", icon: "book-outline", route: "/department/courses", color: "#D97706" },
  ];

  const actionColumns = isDesktop ? 4 : isTablet ? 2 : 1;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: paddingH, paddingTop: 28, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 1100, width: "100%", alignSelf: "center" }}>
          {/* Header */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 4 }}>
              Giáo vụ Khoa
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              Tổng quan hệ thống quản lý điểm danh
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 32 }}>
            {stats.map((stat) => (
              <View
                key={stat.id}
                style={{
                  flex: statColumns === 1 ? 1 : 0,
                  flexBasis: statColumns === 1 ? "100%" : `${100 / statColumns - 2}%`,
                  minWidth: 160,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: stat.color + "12",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <Ionicons name={stat.icon} size={22} color={stat.color} />
                </View>
                {loading ? (
                  <ActivityIndicator size="small" color={stat.color} />
                ) : (
                  <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 4 }}>
                    {stat.value}
                  </Text>
                )}
                <Text style={{ fontSize: 13, color: "#6B7280", fontWeight: "500" }}>{stat.title}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 16 }}>
            Chức năng chính
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
                style={{
                  flex: actionColumns === 1 ? 1 : 0,
                  flexBasis: actionColumns === 1 ? "100%" : `${100 / actionColumns - 2}%`,
                  minWidth: 200,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  ...(Platform.OS === "web" ? { cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s" } as any : {}),
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: action.color + "12",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 2 }}>
                    {action.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#9CA3AF" }} numberOfLines={1}>
                    {action.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
