import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import {
  HomeIcon,
  SchoolIcon,
  UsersIcon,
  BookIcon,
  EyeIcon,
  ChartIcon,
  UploadIcon,
  ClipboardIcon,
} from "@/components/Icons";
import Toast, { useToast } from "@/components/Toast";
import { classService, userService, attendanceService, reportService } from "@/apis";

export default function AcademicStaffDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalSubjects: 0,
    todaySessions: 0,
  });
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [classes, students, sessions] = await Promise.all([
        classService.getClasses().catch(() => []),
        userService.getStudents().catch(() => []),
        attendanceService.getSessions({ status: "ACTIVE" }).catch(() => []),
      ]);
      
      setStats({
        totalClasses: classes.length,
        totalStudents: students.length,
        totalSubjects: 0, // TODO: Add subject service
        todaySessions: sessions.length,
      });
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      showToast("Không thể tải dữ liệu dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      label: "Tổng số lớp",
      value: stats.totalClasses.toString(),
      icon: <SchoolIcon size={24} color={Colors.primary} />,
      color: "#3FA9F5",
    },
    {
      label: "Tổng sinh viên",
      value: stats.totalStudents.toString(),
      icon: <UsersIcon size={24} color="#10B981" />,
      color: "#10B981",
    },
    {
      label: "Môn học",
      value: stats.totalSubjects.toString(),
      icon: <BookIcon size={24} color="#F59E0B" />,
      color: "#F59E0B",
    },
    {
      label: "Phiên điểm danh hôm nay",
      value: stats.todaySessions.toString(),
      icon: <EyeIcon size={24} color="#8B5CF6" />,
      color: "#8B5CF6",
    },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: isDesktop ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: isDesktop ? 1200 : "100%",
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: isDesktop ? 32 : 28,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Dashboard - Giáo vụ
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
              }}
            >
              Quản lý và import lớp học
            </Text>
          </View>

          {/* Loading State */}
          {loading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 48,
              }}
            >
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Đang tải dữ liệu...
              </Text>
            </View>
          ) : (
            <>
              {/* Stats Grid */}
              <View
                style={{
                  flexDirection: isDesktop ? "row" : isTablet ? "row" : "column",
                  gap: 16,
                  marginBottom: 24,
                  flexWrap: isTablet ? "wrap" : "nowrap",
                }}
              >
                {statsData.map((stat, index) => (
                  <View
                    key={index}
                    style={{
                      flex: isDesktop ? 1 : isTablet ? "0 0 calc(50% - 8px)" : undefined,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 12,
                      padding: isMobile ? 16 : 20,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: stat.color + "15",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {stat.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "700",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {stat.value}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6B7280",
                      }}
                    >
                      {stat.label}
                    </Text>
                  </View>
                </View>
                  </View>
                ))}
              </View>

          {/* Quick Actions */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 24,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Thao tác nhanh
            </Text>
              <View
                style={{
                  flexDirection: isDesktop ? "row" : "column",
                  gap: 12,
                  flexWrap: isTablet ? "wrap" : "nowrap",
                }}
              >
                <TouchableOpacity
                  onPress={() => router.push("/academic-staff/import" as any)}
                  style={{
                    flex: isDesktop ? 1 : undefined,
                    minWidth: isDesktop ? 200 : undefined,
                    backgroundColor: "#F0F9FF",
                    borderRadius: 8,
                    padding: isMobile ? 12 : 16,
                    borderWidth: 1,
                    borderColor: "#BAE6FD",
                  }}
                >
                  <UploadIcon size={isMobile ? 20 : 24} color={Colors.primary} />
                  <Text
                    style={{
                      fontSize: isMobile ? 14 : 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginTop: 8,
                      marginBottom: 4,
                    }}
                  >
                    Import dữ liệu
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? 12 : 14,
                      color: "#6B7280",
                    }}
                  >
                    Import lớp học hoặc sinh viên từ Excel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/academic-staff/classes" as any)}
                  style={{
                    flex: isDesktop ? 1 : undefined,
                    minWidth: isDesktop ? 200 : undefined,
                    backgroundColor: "#F0FDF4",
                    borderRadius: 8,
                    padding: isMobile ? 12 : 16,
                    borderWidth: 1,
                    borderColor: "#86EFAC",
                  }}
                >
                  <SchoolIcon size={isMobile ? 20 : 24} color="#10B981" />
                  <Text
                    style={{
                      fontSize: isMobile ? 14 : 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginTop: 8,
                      marginBottom: 4,
                    }}
                  >
                    Quản lý lớp học
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? 12 : 14,
                      color: "#6B7280",
                    }}
                  >
                    Xem và quản lý danh sách lớp học
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/academic-staff/students" as any)}
                  style={{
                    flex: isDesktop ? 1 : undefined,
                    minWidth: isDesktop ? 200 : undefined,
                    backgroundColor: "#FEF3C7",
                    borderRadius: 8,
                    padding: isMobile ? 12 : 16,
                    borderWidth: 1,
                    borderColor: "#FDE68A",
                  }}
                >
                  <UsersIcon size={isMobile ? 20 : 24} color="#F59E0B" />
                  <Text
                    style={{
                      fontSize: isMobile ? 14 : 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginTop: 8,
                      marginBottom: 4,
                    }}
                  >
                    Quản lý sinh viên
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? 12 : 14,
                      color: "#6B7280",
                    }}
                  >
                    Xem và quản lý danh sách sinh viên
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/academic-staff/sessions" as any)}
                  style={{
                    flex: isDesktop ? 1 : undefined,
                    minWidth: isDesktop ? 200 : undefined,
                    backgroundColor: "#F3E8FF",
                    borderRadius: 8,
                    padding: isMobile ? 12 : 16,
                    borderWidth: 1,
                    borderColor: "#C4B5FD",
                  }}
                >
                  <EyeIcon size={isMobile ? 20 : 24} color="#8B5CF6" />
                  <Text
                    style={{
                      fontSize: isMobile ? 14 : 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginTop: 8,
                      marginBottom: 4,
                    }}
                  >
                    Giám sát điểm danh
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? 12 : 14,
                      color: "#6B7280",
                    }}
                  >
                    Xem các phiên điểm danh đang diễn ra
                  </Text>
                </TouchableOpacity>
              </View>
          </View>
            </>
          )}
        </View>
      </ScrollView>
      
      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}

