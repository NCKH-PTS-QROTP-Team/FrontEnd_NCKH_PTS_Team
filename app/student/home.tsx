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
import { Ionicons } from "@expo/vector-icons";
import { BookIcon, SchoolIcon } from "@/components/Icons";
import { LinearGradient } from "expo-linear-gradient";
import { scheduleService, attendanceService, authService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";
import { Colors } from "@/constants/colors";
import type { Schedule } from "@/apis/services/schedule.service";

interface TodaySchedule {
  id: string;
  courseName?: string;
  subjectName: string;
  teacher?: string;
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
  const [unreadNotifs, setUnreadNotifs] = useState(3); // demo – 3 thông báo chưa đọc

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
      const present = weeklyRecords.filter(
        (r: any) => r.status === "PRESENT",
      ).length;
      const absent = totalSessions - present;
      const attendanceRate =
        totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0;

      console.log("📈 Stats:", {
        totalSessions,
        present,
        absent,
        attendanceRate,
      });
      setAttendanceStats({
        totalSessions,
        present,
        absent,
        attendanceRate,
      });
    } catch (error: any) {
      console.error("❌ Error loading dashboard:", error);
      showToast(
        "Không thể tải dữ liệu: " + (error.message || "Lỗi không xác định"),
        "error",
      );
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
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="light" />

      {/* ── Blue Hero Banner (Fixed at top) ── */}
      <LinearGradient
        colors={["#1E3A8A", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: isMobile ? 48 : 64, // leave space for status bar manually if needed
          paddingBottom: 40,
          paddingHorizontal: padding,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.8)",
                marginBottom: 4,
              }}
            >
              Chào mừng trở lại!
            </Text>
            <Text
              style={{ fontSize: 24, fontWeight: "800", color: "#ffffff" }}
              numberOfLines={1}
            >
              Xin chào,
            </Text>
            <Text
              style={{ fontSize: 24, fontWeight: "800", color: "#ffffff" }}
              numberOfLines={1}
            >
              {userName ? userName : "Sinh viên"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* Notification Bell (chỉ hiện trên mobile) */}
            {isMobile && (
              <TouchableOpacity
                onPress={() => {
                  setUnreadNotifs(0);
                  router.push("/student/notifications" as any);
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                  position: "relative",
                }}
              >
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                {unreadNotifs > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: "#ef4444",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1.5,
                      borderColor: "#3b82f6",
                    }}
                  >
                    <Text
                      style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}
                    >
                      {unreadNotifs > 9 ? "9+" : unreadNotifs}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => router.push("/student/schedule")}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="calendar" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
                Xem lịch
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* ── Scrollable Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: padding,
          paddingTop: 24,
          paddingBottom: isMobile ? 100 : 40,
        }}
      >
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            gap: 24,
          }}
        >
          {/* Lịch học hôm nay block */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}
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
                            ? "#3b82f6"
                            : "#cbd5e1",
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
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "#f1f5f9",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#1e293b",
                    marginBottom: 4,
                  }}
                >
                  {todaySchedules[currentScheduleIndex]?.courseName ||
                    todaySchedules[currentScheduleIndex]?.subjectName ||
                    "Không có thông tin"}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#64748b",
                    marginBottom: 12,
                  }}
                >
                  Giảng viên:{" "}
                  {todaySchedules[currentScheduleIndex]?.teacher ||
                    todaySchedules[currentScheduleIndex]?.teacherName ||
                    "N/A"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 3,
                      height: 24,
                      backgroundColor: "#3b82f6",
                      borderRadius: 2,
                      marginRight: 10,
                    }}
                  />
                  <View>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#1e293b",
                      }}
                    >
                      {todaySchedules[currentScheduleIndex]?.time || ""}
                    </Text>
                    <Text
                      style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}
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
                  borderRadius: 16,
                  padding: 24,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#f1f5f9",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "#f8fafc",
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="calendar-outline" size={24} color="#94a3b8" />
                </View>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#64748b" }}
                >
                  Không có lịch học hôm nay
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: 12,
              }}
            >
              Điểm danh nhanh
            </Text>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <TouchableOpacity
                onPress={() => router.push("/student/otp-attendance")}
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#f1f5f9",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "#eff6ff",
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="keypad" size={24} color="#3b82f6" />
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#1e293b",
                    marginBottom: 4,
                  }}
                >
                  Mã OTP
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    textAlign: "center",
                  }}
                >
                  Nhập mã từ GV
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/student/qr-attendance")}
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#f1f5f9",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "#f0fdf4",
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="qr-code" size={24} color="#10b981" />
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#1e293b",
                    marginBottom: 4,
                  }}
                >
                  Mã QR
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    textAlign: "center",
                  }}
                >
                  Quét mã trên lớp
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats below quick actions */}
          <View>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 20,
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
                borderWidth: 1,
                borderColor: "#eff6ff",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}
                >
                  Thống kê tuần này
                </Text>
                <View
                  style={{
                    backgroundColor: "#eff6ff",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#3b82f6",
                    }}
                  >
                    Tuần {attendanceStats.totalSessions} buổi
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginBottom: 16,
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: "800",
                    color: "#3b82f6",
                    lineHeight: 40,
                  }}
                >
                  {attendanceStats.attendanceRate}%
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}
                >
                  Tỷ lệ có mặt
                </Text>
              </View>

              {/* Custom Progress Bar */}
              <View
                style={{
                  height: 10,
                  backgroundColor: "#e2e8f0",
                  borderRadius: 5,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.max(0, Math.min(attendanceStats.attendanceRate, 100))}%`,
                    backgroundColor: "#3b82f6",
                    borderRadius: 5,
                  }}
                />
              </View>

              {/* Small stats under bar */}
              <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "#ecfdf5",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                  <View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#10b981",
                      }}
                    >
                      {attendanceStats.present}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#10b981" }}>
                      Có mặt
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "#fef2f2",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                  <View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#ef4444",
                      }}
                    >
                      {attendanceStats.absent}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#ef4444" }}>
                      Vắng mặt
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* History Link */}
          <TouchableOpacity
            onPress={() => router.push("/student/history")}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: "#f1f5f9",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#f5f3ff",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Ionicons name="time" size={20} color="#8b5cf6" />
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                Lịch sử điểm danh
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  return content;
}
