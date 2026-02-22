import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BookIcon, SchoolIcon } from "@/components/Icons";
import WeeklySchedule from "@/components/WeeklySchedule";
import { scheduleService, attendanceService, authService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";
import { Colors } from "@/constants/colors";
import type { Schedule } from "@/apis/services/schedule.service";

interface TodaySchedule {
  id: string;
  subjectName: string;
  teacherName: string;
  time: string;
  room: string;
  status: string;
}

export default function StudentHomeScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const { showToast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [todaySchedules, setTodaySchedules] = useState<TodaySchedule[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({
    totalSessions: 0,
    present: 0,
    absent: 0,
    attendanceRate: 0,
  });
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);

  // Load data từ backend
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading dashboard data...");
      
      const studentId = await getStudentIdFromToken();
      console.log("📝 StudentId:", studentId);
      
      // Lấy thông tin user hiện tại để lấy tên và classId
      const currentUser = await authService.getCurrentUser();
      if (currentUser?.name) {
        setUserName(currentUser.name);
      }
      
      // Load schedules theo lớp của sinh viên để dashboard chỉ hiển thị môn của lớp đó
      let allSchedules: Schedule[] = [];
      try {
        console.log("📅 Loading schedules...");
        if (currentUser?.enrolledClassIds?.length) {
          allSchedules = await scheduleService.getSchedules({
            classIds: currentUser.enrolledClassIds,
          });
        } else if (currentUser?.classId) {
          allSchedules = await scheduleService.getSchedules({
            classId: currentUser.classId,
          });
        } else {
          allSchedules = await scheduleService.getSchedules();
        }
        console.log("✅ Loaded schedules:", allSchedules.length);
      } catch (error: any) {
        console.error("❌ Error loading schedules:", error);
        showToast("Không thể tải lịch học", "error");
      }

      // Load attendance records (cần studentId)
      let allRecords: any[] = [];
      if (studentId) {
        try {
          console.log("📊 Loading attendance records for student:", studentId);
          allRecords = await attendanceService.getRecords({ studentId });
          console.log("✅ Loaded records:", allRecords.length);
        } catch (error: any) {
          console.error("❌ Error loading records:", error);
          // Không hiển thị toast vì có thể không có records
        }
      } else {
        console.warn("⚠️ No studentId, skipping attendance records");
      }

      // Filter schedules cho hôm nay
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday (0) to 7
      console.log("📆 Today is day:", dayOfWeek);
      
      const todayScheds = allSchedules
        .filter((s: Schedule) => s.dayOfWeek === dayOfWeek)
        .map((s: Schedule) => ({
          id: s.id,
          courseName: s.subjectName, // Map subjectName to courseName for UI
          subjectName: s.subjectName,
          teacher: s.teacherName, // Map teacherName to teacher for UI
          teacherName: s.teacherName,
          time: `${s.startTime} - ${s.endTime}`,
          room: s.room,
          status: "upcoming",
        }));

      console.log("📚 Today schedules:", todayScheds.length);
      setTodaySchedules(todayScheds);

      // Tính attendance stats cho "tuần này" (logic app học tập)
      // Tuần tính từ Thứ 2 -> Chủ nhật theo VN
      const now = new Date();
      const todayDow = now.getDay() === 0 ? 7 : now.getDay(); // 1-7, Thứ 2 = 1, Chủ nhật = 7

      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      // Lùi về Thứ 2 của tuần hiện tại
      startOfWeek.setDate(now.getDate() - (todayDow - 1));

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const weeklyRecords = allRecords.filter((r: any) => {
        const dateStr = r.attendedAt || r.createdAt;
        if (!dateStr) return false;

        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;

        return d >= startOfWeek && d <= endOfWeek;
      });

      const totalSessions = weeklyRecords.length;
      const present = weeklyRecords.filter((r: any) => r.status === "PRESENT").length;
      const absent = totalSessions - present;
      const attendanceRate = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0;

      console.log("📈 Stats:", { totalSessions, present, absent, attendanceRate });
      setAttendanceStats({
        totalSessions,
        present,
        absent,
        attendanceRate,
      });
    } catch (error: any) {
      console.error("❌ Error loading dashboard:", error);
      showToast("Không thể tải dữ liệu: " + (error.message || "Lỗi không xác định"), "error");
    } finally {
      setLoading(false);
      console.log("✅ Dashboard loading complete");
    }
  };

  // Auto-rotate lịch học mỗi 3 giây
  useEffect(() => {
    if (todaySchedules.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentScheduleIndex((prev) =>
        prev === todaySchedules.length - 1 ? 0 : prev + 1,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [todaySchedules.length]);

  // Không hiển thị full-screen loading, chỉ hiển thị indicator nhỏ trong content

  // Responsive breakpoints - Dynamic based on window size
  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;

  // Responsive values - Optimized for web
  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const padding = isMobile ? 16 : isTablet ? 24 : 32;

  // Quick action cards: Desktop 3-4 columns, Mobile 2 cards in row
  const quickActionGap = isMobile ? 12 : isDesktop ? 24 : 16;

  // Stats cards: Desktop 4 columns, Mobile 2x2 grid
  const statsGap = isMobile ? 12 : isDesktop ? 20 : 16;

  const content = (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: isDesktop ? 20 : 16,
          paddingBottom: isMobile ? 100 : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner - Full width with padding */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: padding,
            marginBottom: isMobile ? 20 : 32,
            alignSelf: "stretch",
          }}
        >
          <View
            style={{
              maxWidth: contentMaxWidth,
              width: "100%",
              alignSelf: "center",
              flexShrink: 0,
            }}
          >
            {/* Welcome Card - Modern Design */}
            <View
              style={{
                width: "100%",
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
            {/* Gradient Header */}
            <View
              style={[
                {
                  backgroundColor: Colors.primary,
                  padding: isDesktop ? 32 : isMobile ? 20 : 24,
                  paddingBottom: isDesktop ? 24 : isMobile ? 16 : 20,
                  overflow: "hidden",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                },
                isWeb && ({
                  background: `linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryDark} 100%)`,
                } as any),
              ]}
            >
              <View
                style={{
                  flexDirection: isDesktop ? "row" : "column",
                  justifyContent: "space-between",
                  alignItems: isDesktop ? "center" : "flex-start",
                  width: "100%",
                }}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: isDesktop ? 32 : isMobile ? 22 : 26,
                      fontWeight: "700",
                      marginBottom: 8,
                    }}
                  >
                    Xin chào {userName ? userName : ""}!
                  </Text>
                  {loading ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text
                        style={{
                          color: "#FFFFFF",
                          opacity: 0.95,
                          fontSize: isDesktop ? 16 : isMobile ? 14 : 15,
                          lineHeight: isDesktop ? 24 : isMobile ? 20 : 22,
                        }}
                      >
                        Đang tải dữ liệu...
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={{
                        color: "#FFFFFF",
                        opacity: 0.95,
                        fontSize: isDesktop ? 16 : isMobile ? 14 : 15,
                        lineHeight: isDesktop ? 24 : isMobile ? 20 : 22,
                      }}
                    >
                      {todaySchedules.length > 0 
                        ? `Hôm nay bạn có ${todaySchedules.length} buổi học`
                        : "Hôm nay bạn không có lịch học"}
                    </Text>
                  )}
                </View>
                {isDesktop && (
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <SchoolIcon size={40} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </View>
            
            {/* Action Section */}
            <View
              style={{
                padding: isDesktop ? 24 : isMobile ? 16 : 20,
                flexDirection: isDesktop ? "row" : "column",
                justifyContent: "space-between",
                alignItems: isDesktop ? "center" : "stretch",
                gap: isMobile ? 12 : 16,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/student/schedule")}
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 10,
                  paddingVertical: isMobile ? 12 : 14,
                  paddingHorizontal: isDesktop ? 24 : isMobile ? 20 : 22,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  flex: isDesktop ? 0 : 1,
                  minWidth: isDesktop ? 180 : "100%",
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: isDesktop ? 15 : isMobile ? 14 : 15,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  Xem lịch học
                </Text>
                <Text style={{ fontSize: 16, color: "#FFFFFF" }}>→</Text>
              </TouchableOpacity>
              
              {todaySchedules.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingVertical: isMobile ? 8 : 10,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#10B981",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: isDesktop ? 14 : isMobile ? 13 : 14,
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    {todaySchedules.length} buổi học sắp tới
                  </Text>
                </View>
              )}
            </View>
          </View>
          </View>
        </View>

        {/* Content with padding */}
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: padding,
          }}
        >
          {/* Today's Schedule - Single card with auto-rotate */}
          <View style={{ marginBottom: isMobile ? 20 : 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: isMobile ? 16 : 20,
              }}
            >
              <Text
                style={{
                  fontSize: isDesktop ? 18 : isMobile ? 16 : 17,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Lịch học hôm nay
              </Text>
              {todaySchedules.length > 1 && (
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {todaySchedules.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentScheduleIndex(index)}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          index === currentScheduleIndex
                            ? Colors.primary
                            : "#D1D5DB",
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
            {todaySchedules.length > 0 ? (
              <TouchableOpacity
                onPress={() => router.push("/student/schedule")}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: isMobile ? 8 : 12,
                  padding: isMobile ? 16 : 24,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  minHeight: isMobile ? 100 : 120,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: isMobile ? 15 : 18,
                    fontWeight: "600",
                    color: "#111827",
                    lineHeight: isMobile ? 22 : 28,
                    marginBottom: 4,
                  }}
                >
                  {todaySchedules[currentScheduleIndex]?.courseName || 
                   todaySchedules[currentScheduleIndex]?.subjectName || 
                   "Không có thông tin"}
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    color: "#6B7280",
                    lineHeight: 21,
                    marginBottom: isMobile ? 8 : 12,
                  }}
                >
                  Giảng viên: {todaySchedules[currentScheduleIndex]?.teacher || 
                               todaySchedules[currentScheduleIndex]?.teacherName || 
                               "N/A"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 2,
                      height: isMobile ? 20 : 24,
                      backgroundColor: Colors.primary,
                      borderRadius: 1,
                      marginRight: isMobile ? 8 : 12,
                    }}
                  />
                  <View>
                    <Text
                      style={{
                        fontSize: isMobile ? 14 : 16,
                        color: "#111827",
                        lineHeight: isMobile ? 20 : 24,
                        marginBottom: 2,
                      }}
                    >
                      {todaySchedules[currentScheduleIndex]?.time || ""}
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 14,
                        color: "#6B7280",
                        lineHeight: 21,
                      }}
                    >
                      Phòng:{" "}
                      {todaySchedules[currentScheduleIndex]?.room || "N/A"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: isMobile ? 12 : 16,
                  padding: isMobile ? 24 : 32,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                <View
                  style={{
                    width: isMobile ? 48 : 60,
                    height: isMobile ? 48 : 60,
                    backgroundColor: "#F3F4F6",
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{ fontSize: isMobile ? 24 : 28, color: "#6B7280" }}
                  >
                    ☰
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    color: "#6B7280",
                    lineHeight: 21,
                  }}
                >
                  Không có lịch học hôm nay
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions - 2 cards in row on mobile */}
          <View style={{ marginBottom: isMobile ? 24 : 32 }}>
            <Text
              style={{
                fontSize: isDesktop ? 18 : isMobile ? 16 : 17,
                fontWeight: "600",
                color: "#111827",
                marginBottom: isMobile ? 16 : 20,
              }}
            >
              Điểm danh nhanh
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: quickActionGap,
              }}
            >
              {/* OTP Card */}
              <TouchableOpacity
                onPress={() => router.push("/student/otp-attendance")}
                style={{
                  flex: 1,
                  minHeight: isDesktop ? 200 : isMobile ? 120 : 160,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: isDesktop ? 24 : isMobile ? 16 : 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: "#EFF6FF",
                    borderRadius: 10,
                    width: isDesktop ? 56 : isMobile ? 40 : 48,
                    height: isDesktop ? 56 : isMobile ? 40 : 48,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isDesktop ? 16 : isMobile ? 8 : 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isDesktop ? 24 : isMobile ? 18 : 20,
                      fontWeight: "700",
                      color: Colors.primary,
                    }}
                  >
                    OTP
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: isDesktop ? 17 : isMobile ? 14 : 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  Mã OTP
                </Text>
                <Text
                  style={{
                    fontSize: isDesktop ? 14 : isMobile ? 12 : 13,
                    color: "#6B7280",
                  }}
                >
                  Nhập mã từ GV
                </Text>
              </TouchableOpacity>

              {/* QR Card */}
              <TouchableOpacity
                onPress={() => router.push("/student/qr-attendance")}
                style={{
                  flex: 1,
                  minHeight: isDesktop ? 200 : isMobile ? 120 : 160,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: isDesktop ? 24 : isMobile ? 16 : 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: "#ECFDF5",
                    borderRadius: 10,
                    width: isDesktop ? 56 : isMobile ? 40 : 48,
                    height: isDesktop ? 56 : isMobile ? 40 : 48,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isDesktop ? 16 : isMobile ? 8 : 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isDesktop ? 22 : isMobile ? 16 : 18,
                      fontWeight: "700",
                      color: "#10B981",
                    }}
                  >
                    QR
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: isDesktop ? 17 : isMobile ? 14 : 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  QR Code
                </Text>
                <Text
                  style={{
                    fontSize: isDesktop ? 14 : isMobile ? 12 : 13,
                    color: "#6B7280",
                  }}
                >
                  Quét mã trên lớp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Weekly Schedule Table - Full width without padding */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: isDesktop ? 24 : padding,
            marginBottom: isMobile ? 16 : 40,
          }}
        >
          <WeeklySchedule />
        </View>

        {/* Content with padding continues */}
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: padding,
          }}
        >
          {/* Stats - 2x2 grid on mobile, 4 columns on desktop */}
          <View style={{ marginBottom: isMobile ? 24 : 32 }}>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: isDesktop ? 24 : isMobile ? 16 : 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: isDesktop ? 20 : isMobile ? 18 : 19,
                  lineHeight: 28,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: isDesktop ? 20 : isMobile ? 16 : 18,
                }}
              >
                Thống kê tuần này
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: isDesktop ? 16 : isMobile ? 12 : 14,
                }}
              >
                {/* Tổng buổi */}
                <View
                  style={{
                    flex: isMobile ? 0 : 1,
                    width: isMobile ? "48%" : undefined,
                    backgroundColor: "#EFF6FF",
                    borderRadius: 12,
                    padding: isDesktop ? 24 : isMobile ? 16 : 20,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: isDesktop ? 120 : isMobile ? 100 : 110,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isDesktop ? 40 : isMobile ? 36 : 38,
                      lineHeight: isDesktop ? 48 : isMobile ? 44 : 46,
                      fontWeight: "bold",
                      color: Colors.primary,
                      marginBottom: 4,
                    }}
                  >
                    {attendanceStats.totalSessions}
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    Tổng buổi
                  </Text>
                </View>

                {/* Có mặt */}
                <View
                  style={{
                    flex: isMobile ? 0 : 1,
                    width: isMobile ? "48%" : undefined,
                    backgroundColor: "#ECFDF5",
                    borderRadius: 12,
                    padding: isDesktop ? 24 : isMobile ? 16 : 20,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: isDesktop ? 120 : isMobile ? 100 : 110,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isDesktop ? 40 : isMobile ? 36 : 38,
                      lineHeight: isDesktop ? 48 : isMobile ? 44 : 46,
                      fontWeight: "bold",
                      color: "#10B981",
                      marginBottom: 4,
                    }}
                  >
                    {attendanceStats.present}
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    Có mặt
                  </Text>
                </View>

                {/* Vắng */}
                <View
                  style={{
                    flex: isMobile ? 0 : 1,
                    width: isMobile ? "48%" : undefined,
                    backgroundColor: "#FEF2F2",
                    borderRadius: 12,
                    padding: isDesktop ? 24 : isMobile ? 16 : 20,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: isDesktop ? 120 : isMobile ? 100 : 110,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isDesktop ? 40 : isMobile ? 36 : 38,
                      lineHeight: isDesktop ? 48 : isMobile ? 44 : 46,
                      fontWeight: "bold",
                      color: "#EF4444",
                      marginBottom: 4,
                    }}
                  >
                    {attendanceStats.absent}
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    Vắng
                  </Text>
                </View>

                {/* Tỷ lệ */}
                <View
                  style={{
                    flex: isMobile ? 0 : 1,
                    width: isMobile ? "48%" : undefined,
                    backgroundColor: "#F3F4F6",
                    borderRadius: 12,
                    padding: isDesktop ? 24 : isMobile ? 16 : 20,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: isDesktop ? 120 : isMobile ? 100 : 110,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isDesktop ? 40 : isMobile ? 36 : 38,
                      lineHeight: isDesktop ? 48 : isMobile ? 44 : 46,
                      fontWeight: "bold",
                      color: Colors.primary,
                      marginBottom: 4,
                    }}
                  >
                    {attendanceStats.attendanceRate}%
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    Tỷ lệ
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* History Link */}
          <TouchableOpacity
            onPress={() => router.push("/student/history")}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: isMobile ? 12 : 16,
              padding: isMobile ? 14 : 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              height: isMobile ? 56 : 64,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: isMobile ? 36 : 40,
                  height: isMobile ? 36 : 40,
                  backgroundColor: "#F3F4F6",
                  borderRadius: isMobile ? 10 : 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: isMobile ? 10 : 12,
                }}
              >
                <Text
                  style={{ fontSize: isMobile ? 16 : 18, color: "#6B7280" }}
                >
                  ☰
                </Text>
              </View>
              <Text
                style={{
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: "600",
                  color: "#111827",
                  lineHeight: 24,
                }}
              >
                Lịch sử điểm danh
              </Text>
            </View>
            <Text style={{ fontSize: isMobile ? 18 : 20, color: "#9CA3AF" }}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return content;
}
