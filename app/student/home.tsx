import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Image,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { BookIcon, SchoolIcon } from "@/components/Icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { BarChart } from "react-native-chart-kit";
import { scheduleService, attendanceService, authService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import { useToast } from "@/components/ToastProvider";
import { Colors } from "@/constants/colors";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";
import WebFooter from "@/components/WebFooter";
import WeeklySchedule from "@/components/WeeklySchedule";
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
  const [chartData, setChartData] = useState<{labels: string[], data: number[]}>({ labels: ["Chưa có"], data: [0] });

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

      const today = new Date();
      const dateOnly = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // Load schedules theo lớp của sinh viên để dashboard chỉ hiển thị môn của lớp đó
      let allSchedules: Schedule[] = [];
      try {
        console.log("📅 Loading schedules for today:", dateOnly);
        if (currentUser?.enrolledClassIds?.length) {
          allSchedules = await scheduleService.getSchedules({
            classIds: currentUser.enrolledClassIds,
            fromDate: dateOnly,
            toDate: dateOnly,
          });
        } else if (currentUser?.classId) {
          allSchedules = await scheduleService.getSchedules({
            classId: currentUser.classId,
            fromDate: dateOnly,
            toDate: dateOnly,
          });
        } else {
          allSchedules = await scheduleService.getSchedules({
            fromDate: dateOnly,
            toDate: dateOnly,
          });
        }

        // Lọc trùng ID (Backend có thể trả về trùng)
        const seenIds = new Set<string>();
        allSchedules = allSchedules.filter((s) => {
          if (seenIds.has(s.id)) return false;
          seenIds.add(s.id);
          return true;
        });

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

      // Map and dedup today's schedules
      const todayScheds = allSchedules.map((s: Schedule) => ({
        id: s.id,
        courseName: s.subjectName, // Map subjectName to courseName for UI
        subjectName: s.subjectName,
        teacher: s.teacherName, // Map teacherName to teacher for UI
        teacherName: s.teacherName,
        time: `${s.startTime} - ${s.endTime}`,
        startTime: s.startTime, // Store for sorting
        room: s.room,
        status: "upcoming",
      }));

      // Lọc trùng theo slot (Course+Teacher+Time+Room) để tránh lịch định kỳ trùng với lịch bù
      const seenSlots = new Set<string>();
      const dedupedTodayScheds = todayScheds.filter((item) => {
        const slotKey = `${item.courseName}|${item.teacher}|${item.time}|${item.room}`;
        if (seenSlots.has(slotKey)) return false;
        seenSlots.add(slotKey);
        return true;
      });

      // Sắp xếp theo thời gian
      const sortedTodayScheds = dedupedTodayScheds.sort((a, b) => {
        return (a.startTime || "").localeCompare(b.startTime || "");
      });

      console.log("📚 Today schedules:", sortedTodayScheds.length);
      setTodaySchedules(sortedTodayScheds);

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

      // ── Tính dữ liệu biểu đồ BarChart (Số buổi có mặt theo môn học) ──
      const subjectMap: Record<string, number> = {};
      allRecords.forEach((r: any) => {
        if (r.subjectName && (r.status === "PRESENT" || r.status === "LATE")) {
           subjectMap[r.subjectName] = (subjectMap[r.subjectName] || 0) + 1;
        }
      });
      
      let chartLabels: string[] = [];
      let chartValues: number[] = [];
      
      const entries = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]).slice(0, 5); // Lấy top 5 môn học
      
      if (entries.length > 0) {
        entries.forEach(([name, count]) => {
           let shortName = name.split("-")[0].trim(); // Xử lý nếu tên có dấu "-"
           shortName = shortName.split(" ")[0] + (shortName.split(" ").length > 1 ? "..." : ""); // Lấy chữ đầu
           if (shortName.length > 10) shortName = shortName.substring(0, 10) + '...';
           
           chartLabels.push(shortName);
           chartValues.push(count as number);
        });
      } else {
         chartLabels = ["Chưa có"];
         chartValues = [0];
      }
      
      setChartData({ labels: chartLabels, data: chartValues });

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

  const logoNameImage = require("../../assets/logoname.png");

  const content = (
    <View style={{ flex: 1, backgroundColor: "#f8fafc", ...(Platform.OS === "web" ? { height: "100vh" as any, overflow: "hidden" as any } : {}) }}>
      <StatusBar style="light" />

      {/* ── Scrollable Content (Wraps everything including Hero Banner) ── */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Blue Hero Banner (Responsive) ── */}
        <LinearGradient
          colors={["#1E3A8A", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: isDesktop ? 60 : (isMobile ? 48 : 80),
            paddingBottom: isDesktop ? 60 : (isMobile ? 40 : 80),
            paddingHorizontal: padding,
            minHeight: isDesktop ? 360 : 'auto',
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: isDesktop ? "row" : "column",
              alignItems: isDesktop ? "center" : "flex-start",
              justifyContent: "space-between",
              maxWidth: contentMaxWidth,
              width: "100%",
              alignSelf: "center",
              gap: isDesktop ? 40 : 0,
            }}
          >
            {/* ── Left Column: Welcome Text ── */}
            <View style={{ flex: isDesktop ? 1 : undefined, paddingRight: isDesktop ? 40 : 16, width: "100%" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: isDesktop ? 18 : 15,
                      color: "rgba(255,255,255,0.8)",
                      marginBottom: 4,
                    }}
                  >
                    Chào mừng trở lại!
                  </Text>
                  <Text
                    style={{ fontSize: isDesktop ? 28 : 24, fontWeight: "800", color: "#ffffff", marginBottom: isDesktop ? 16 : 0 }}
                    numberOfLines={1}
                  >
                    Xin chào, {userName ? userName : "Sinh viên"}
                  </Text>
                </View>

                {/* Mobile Right Actions (Bell & Calendar) */}
                {!isDesktop && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
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
                          ...getWebCursor(),
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
                            <Text style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}>
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
                        ...getWebCursor(),
                      }}
                    >
                      <Ionicons name="calendar" size={18} color="#fff" />
                      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Xem lịch</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Desktop Hero Text */}
              {isDesktop && (
                <View style={{ marginTop: 24 }}>
                  <Text style={{ fontSize: 48, fontWeight: "900", color: "#ffffff", lineHeight: 56, marginBottom: 16 }}>
                    Hệ Thống Điểm Danh Trực Tuyến
                  </Text>
                  <Text style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", lineHeight: 28, marginBottom: 32 }}>
                    Nền tảng quản lý điểm danh hiện đại dành cho sinh viên và giảng viên Trường Đại học Công nghiệp TP. Hồ Chí Minh.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/student/schedule")}
                    style={{
                      backgroundColor: "#ffffff",
                      paddingHorizontal: 24,
                      paddingVertical: 14,
                      borderRadius: 30,
                      flexDirection: "row",
                      alignItems: "center",
                      alignSelf: "flex-start",
                      gap: 10,
                      ...getWebCursor(),
                      ...(Platform.OS === "web" ? { transition: "all 0.2s ease" } : {}),
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="calendar" size={20} color="#1e3a8a" />
                    <Text style={{ color: "#1e3a8a", fontWeight: "700", fontSize: 16 }}>Xem lịch học</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── Right Column: Glassmorphic Quick Actions (Desktop Only) ── */}
            {isDesktop && (
              <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 20, justifyContent: "flex-end" }}>
                {/* Card 1: OTP */}
                <TouchableOpacity
                  onPress={() => router.push("/student/otp-attendance")}
                  style={{
                    width: "45%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 20,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                    ...getWebCursor(),
                    ...(Platform.OS === "web" ? { backdropFilter: "blur(12px)", transition: "all 0.2s ease" } : {}),
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Ionicons name="keypad" size={24} color="#fff" />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 8 }}>Mã OTP</Text>
                  <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 20 }}>Nhập mã OTP từ giảng viên để điểm danh nhanh chóng.</Text>
                </TouchableOpacity>

                {/* Card 2: QR Code */}
                <TouchableOpacity
                  onPress={() => router.push("/student/qr-attendance")}
                  style={{
                    width: "45%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 20,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                    ...getWebCursor(),
                    ...(Platform.OS === "web" ? { backdropFilter: "blur(12px)", transition: "all 0.2s ease" } : {}),
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Ionicons name="qr-code" size={24} color="#fff" />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 8 }}>Mã QR</Text>
                  <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 20 }}>Quét mã QR hiển thị trên lớp để ghi nhận sự có mặt.</Text>
                </TouchableOpacity>

                {/* Card 3: Nhận diện khuôn mặt (Placeholder for 2x2 grid) */}
                <TouchableOpacity
                  onPress={() => router.push("/student/face-attendance")}
                  style={{
                    width: "45%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 20,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                    ...getWebCursor(),
                    ...(Platform.OS === "web" ? { backdropFilter: "blur(12px)", transition: "all 0.2s ease" } : {}),
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Ionicons name="scan-outline" size={24} color="#fff" />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 8 }}>Nhận diện</Text>
                  <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 20 }}>Điểm danh bằng khuôn mặt (Face ID) bảo mật cao.</Text>
                </TouchableOpacity>

                {/* Card 4: Lịch sử */}
                <TouchableOpacity
                  onPress={() => router.push("/student/history")}
                  style={{
                    width: "45%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 20,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                    ...getWebCursor(),
                    ...(Platform.OS === "web" ? { backdropFilter: "blur(12px)", transition: "all 0.2s ease" } : {}),
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Ionicons name="time-outline" size={24} color="#fff" />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 8 }}>Lịch sử</Text>
                  <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 20 }}>Xem lại lịch sử điểm danh và đánh giá chuyên cần.</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* ── Main Content Area ── */}
        <View style={{ paddingHorizontal: padding, paddingTop: 24, paddingBottom: isMobile ? 100 : 48 }}>
          <View style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            flexDirection: isDesktop ? "row" : "column",
            alignItems: isDesktop ? "flex-start" : "stretch",
            gap: 24,
          }}>

            {/* ───── LEFT COLUMN (desktop 62%, mobile 100%) ───── */}
            <View style={{ flex: isDesktop ? 62 : undefined, width: isDesktop ? undefined : "100%", gap: 20 }}>

              {/* ── 1. STATS STRIP ── */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                {[
                  { label: "Tỷ lệ điểm danh", value: `${attendanceStats.attendanceRate}%`, icon: "stats-chart", color: "#3b82f6", bg: "#eff6ff" },
                  { label: "Có mặt", value: String(attendanceStats.present), icon: "checkmark-circle", color: "#10b981", bg: "#f0fdf4" },
                  { label: "Vắng", value: String(attendanceStats.absent), icon: "close-circle", color: "#ef4444", bg: "#fef2f2" },
                ].map((stat) => (
                  <TouchableOpacity
                    key={stat.label}
                    onPress={() => router.push("/student/history")}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      borderWidth: 1,
                      borderColor: "#f1f5f9",
                      ...getWebShadow("sm"),
                      ...getWebCursor(),
                    }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: stat.bg, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: isMobile ? 20 : 22, fontWeight: "800", color: "#111827" }}>{stat.value}</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280", fontWeight: "500", marginTop: 1 }}>{stat.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── 2. WARNING BANNER (nếu vắng nhiều) ── */}
              {attendanceStats.attendanceRate > 0 && attendanceStats.attendanceRate < 70 && (
                <View style={{
                  backgroundColor: "#fff7ed",
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderWidth: 1,
                  borderColor: "#fed7aa",
                }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#ffedd5", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="warning" size={18} color="#f97316" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#c2410c", marginBottom: 2 }}>Tỷ lệ điểm danh thấp</Text>
                    <Text style={{ fontSize: 12, color: "#ea580c", lineHeight: 18 }}>
                      Bạn chỉ điểm danh được {attendanceStats.attendanceRate}% — dưới mức 70%. Hãy đi học đều hơn!
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push("/student/history")} style={{ ...getWebCursor() }}>
                    <Ionicons name="chevron-forward" size={18} color="#f97316" />
                  </TouchableOpacity>
                </View>
              )}

              {/* ── 3. LỊCH HỌC HÔM NAY ── */}
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ width: 4, height: 18, backgroundColor: "#3b82f6", borderRadius: 2 }} />
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}>Lịch học hôm nay</Text>
                    {loading && <ActivityIndicator size="small" color="#3b82f6" />}
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push("/student/schedule")}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, ...getWebCursor() }}
                  >
                    <Text style={{ fontSize: 13, color: "#3b82f6", fontWeight: "600" }}>Xem tất cả</Text>
                    <Ionicons name="chevron-forward" size={14} color="#3b82f6" />
                  </TouchableOpacity>
                </View>

                {todaySchedules.length > 0 ? (
                  <View style={{
                    backgroundColor: "#fff",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    overflow: "hidden",
                    ...getWebShadow("sm"),
                  }}>
                    {todaySchedules.slice(0, isDesktop ? 8 : 5).map((sched, idx) => {
                      const timeParts = sched.time ? sched.time.split("-").map((t: string) => t.trim()) : ["", ""];
                      const startTime = timeParts[0] || "";
                      const endTime = timeParts[1] || "";
                      const isLast = idx === Math.min(todaySchedules.length, isDesktop ? 8 : 5) - 1;
                      return (
                        <TouchableOpacity
                          key={sched.id}
                          onPress={() => router.push("/student/schedule")}
                          activeOpacity={0.7}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 14,
                            paddingHorizontal: 18,
                            borderBottomWidth: isLast ? 0 : 1,
                            borderBottomColor: "#f3f4f6",
                            ...getWebCursor(),
                          }}
                        >
                          {/* Time pill */}
                          <View style={{
                            width: 68,
                            backgroundColor: "#eff6ff",
                            borderRadius: 10,
                            paddingVertical: 6,
                            alignItems: "center",
                            marginRight: 14,
                          }}>
                            <Text style={{ fontSize: 13, fontWeight: "800", color: "#1e3a8a" }}>{startTime}</Text>
                            {endTime ? <Text style={{ fontSize: 11, color: "#3b82f6", marginTop: 2 }}>{endTime}</Text> : null}
                          </View>

                          {/* Info */}
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 4 }} numberOfLines={1}>
                              {sched.courseName || sched.subjectName || "Không có thông tin"}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <Ionicons name="person-outline" size={12} color="#6b7280" />
                                <Text style={{ fontSize: 12, color: "#4b5563" }} numberOfLines={1}>{sched.teacher || sched.teacherName || "N/A"}</Text>
                              </View>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <Ionicons name="business-outline" size={12} color="#6b7280" />
                                <Text style={{ fontSize: 12, color: "#4b5563" }}>{sched.room || "N/A"}</Text>
                              </View>
                            </View>
                          </View>

                          <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                        </TouchableOpacity>
                      );
                    })}
                    {todaySchedules.length > (isDesktop ? 8 : 5) && (
                      <TouchableOpacity
                        onPress={() => router.push("/student/schedule")}
                        style={{ paddingVertical: 12, alignItems: "center", backgroundColor: "#f9fafb", ...getWebCursor() }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 13, color: "#3b82f6", fontWeight: "600" }}>
                          Xem thêm {todaySchedules.length - (isDesktop ? 8 : 5)} lịch khác →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : !loading ? (
                  <View style={{
                    backgroundColor: "#fff",
                    borderRadius: 20,
                    padding: 32,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    ...getWebShadow("sm"),
                  }}>
                    <View style={{ width: 60, height: 60, backgroundColor: "#eff6ff", borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <Ionicons name="sunny-outline" size={28} color="#3b82f6" />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 6 }}>Hôm nay bạn được nghỉ!</Text>
                    <Text style={{ fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 20 }}>
                      Không có lịch học. Tận hưởng thời gian rảnh nhé!
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* ── 4. QUICK ACTIONS ── */}
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <View style={{ width: 4, height: 18, backgroundColor: "#8b5cf6", borderRadius: 2 }} />
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}>Thao tác nhanh</Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {[
                    { label: "Xem lịch", sub: "Thời khóa biểu", icon: "calendar", color: "#3b82f6", bg: "#eff6ff", route: "/student/schedule" },
                    { label: "Đăng ký OTP", sub: "Nhập mã GV", icon: "keypad", color: "#8b5cf6", bg: "#f5f3ff", route: "/student/otp-attendance" },
                    { label: "Quét QR", sub: "Mã trên lớp", icon: "qr-code", color: "#10b981", bg: "#f0fdf4", route: "/student/qr-attendance" },
                    { label: "Lịch sử", sub: "Xem lại hồ sơ", icon: "time", color: "#f59e0b", bg: "#fffbeb", route: "/student/history" },
                    { label: "Thông báo", sub: unreadNotifs > 0 ? `${unreadNotifs} chưa đọc` : "Không có mới", icon: "notifications", color: "#ef4444", bg: "#fef2f2", route: "/student/notifications" },
                    { label: "Hồ sơ", sub: "Cá nhân", icon: "person-circle", color: "#0ea5e9", bg: "#f0f9ff", route: "/student/profile" },
                  ].map((action) => (
                    <TouchableOpacity
                      key={action.label}
                      onPress={() => {
                        if (action.route === "/student/notifications") setUnreadNotifs(0);
                        router.push(action.route as any);
                      }}
                      activeOpacity={0.7}
                      style={{
                        width: isMobile ? "47%" : isTablet ? "30%" : "14%",
                        minWidth: 100,
                        backgroundColor: "#fff",
                        borderRadius: 16,
                        padding: 14,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "#f1f5f9",
                        ...getWebShadow("sm"),
                        ...getWebCursor(),
                      }}
                    >
                      <View style={{
                        width: 44, height: 44, borderRadius: 13,
                        backgroundColor: action.bg,
                        alignItems: "center", justifyContent: "center",
                        marginBottom: 8,
                      }}>
                        <Ionicons name={action.icon as any} size={22} color={action.color} />
                        {action.icon === "notifications" && unreadNotifs > 0 && (
                          <View style={{
                            position: "absolute", top: -4, right: -4,
                            minWidth: 16, height: 16, borderRadius: 8,
                            backgroundColor: "#ef4444",
                            alignItems: "center", justifyContent: "center",
                            borderWidth: 1.5, borderColor: "#fff",
                          }}>
                            <Text style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}>
                              {unreadNotifs > 9 ? "9+" : unreadNotifs}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#1e293b", textAlign: "center", marginBottom: 2 }}>
                        {action.label}
                      </Text>
                      <Text style={{ fontSize: 10, color: "#64748b", textAlign: "center" }}>{action.sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* ───── RIGHT COLUMN (desktop 36%, mobile hidden/merged above) ───── */}
            <View style={{ flex: isDesktop ? 36 : undefined, width: isDesktop ? undefined : "100%", gap: 20 }}>

              {/* ── 5. VÒNG TRÒN TỶ LỆ ── */}
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <View style={{ width: 4, height: 18, backgroundColor: "#10b981", borderRadius: 2 }} />
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}>Thống kê tuần này</Text>
                  <View style={{ backgroundColor: "#f0fdf4", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: "auto" }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#10b981" }}>{attendanceStats.totalSessions} buổi</Text>
                  </View>
                </View>
                <View style={{
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  padding: 24,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  ...getWebShadow("sm"),
                  gap: 20,
                }}>
                  {/* Circular progress */}
                  <View style={{ position: "relative", alignItems: "center", justifyContent: "center", width: 160, height: 160 }}>
                    <Svg width={160} height={160} viewBox="0 0 160 160">
                      <Circle cx={80} cy={80} r={65} stroke="#F3F4F6" strokeWidth={10} fill="none" />
                      <Circle
                        cx={80} cy={80} r={65}
                        stroke={attendanceStats.attendanceRate >= 80 ? "#10b981" : attendanceStats.attendanceRate >= 70 ? "#f59e0b" : "#ef4444"}
                        strokeWidth={10}
                        fill="none"
                        strokeDasharray={408.41}
                        strokeDashoffset={408.41 - (Math.max(0, Math.min(attendanceStats.attendanceRate, 100)) / 100) * 408.41}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                      />
                    </Svg>
                    <View style={{ position: "absolute", alignItems: "center" }}>
                      <Text style={{ fontSize: 34, fontWeight: "800", color: "#111827" }}>{attendanceStats.attendanceRate}%</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>Tỷ lệ</Text>
                    </View>
                  </View>

                  {/* Stats row */}
                  <View style={{ flexDirection: "row", width: "100%", gap: 12 }}>
                    <View style={{ flex: 1, backgroundColor: "#f0fdf4", borderRadius: 14, padding: 14, alignItems: "center", gap: 4 }}>
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                      <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>{attendanceStats.present}</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>Có mặt</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: "#fef2f2", borderRadius: 14, padding: 14, alignItems: "center", gap: 4 }}>
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                      <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>{attendanceStats.absent}</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>Vắng</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: "#fffbeb", borderRadius: 14, padding: 14, alignItems: "center", gap: 4 }}>
                      <Ionicons name="calendar-outline" size={20} color="#f59e0b" />
                      <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>{attendanceStats.totalSessions}</Text>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>Tổng</Text>
                    </View>
                  </View>

                  {/* CTA */}
                  <TouchableOpacity
                    onPress={() => router.push("/student/history")}
                    style={{
                      width: "100%",
                      backgroundColor: "#eff6ff",
                      borderRadius: 12,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      ...getWebCursor(),
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time-outline" size={16} color="#3b82f6" />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#3b82f6" }}>Xem lịch sử điểm danh</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── BAR CHART CARD ── */}
              <View style={{
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  ...getWebShadow("sm"),
                  gap: 16,
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 4, height: 18, backgroundColor: "#3b82f6", borderRadius: 2 }} />
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}>Tần suất điểm danh (Top 5)</Text>
                </View>
                <View style={{ alignItems: "center", marginLeft: -20 }}>
                  <BarChart
                    data={{
                      labels: chartData.labels,
                      datasets: [
                        {
                          data: chartData.data,
                        },
                      ],
                    }}
                    width={isDesktop ? Math.min(1200 * 0.36 - 48, windowWidth * 0.36 - 48) : windowWidth - 48}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero={true}
                    showValuesOnTopOfBars={true}
                    chartConfig={{
                      backgroundColor: "#fff",
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      barPercentage: 0.5,
                      propsForLabels: {
                        fontSize: 10,
                        fontWeight: "600",
                      }
                    }}
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                  />
                </View>
              </View>

              {/* ── 6. TIP CARD ── */}
              <View style={{
                backgroundColor: "#1e3a8a",
                borderRadius: 20,
                padding: 20,
                gap: 12,
                overflow: "hidden",
              }}>
                <LinearGradient
                  colors={["rgba(59,130,246,0.3)", "rgba(30,58,138,0)"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="bulb" size={18} color="#fbbf24" />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>Mẹo điểm danh</Text>
                </View>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 20 }}>
                  Đi học đúng giờ và điểm danh ngay khi vào lớp. Tỷ lệ điểm danh ≥ 80% giúp bạn được thi cuối kỳ.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/student/schedule")}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                    ...getWebCursor(),
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Xem lịch học ngay →</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </View>

        {/* Footer for Web only */}
        <WebFooter />

      </ScrollView>
    </View>
  );

  return content;
}

