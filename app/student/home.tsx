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
    <View style={{ flex: 1, backgroundColor: "#f8fafc", ...(Platform.OS === "web" ? { height: "calc(100vh - 64px)", overflow: "hidden" } : {}) }}>
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
          borderBottomLeftRadius: isMobile ? 32 : 0,
          borderBottomRightRadius: isMobile ? 32 : 0,
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
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
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
        <View
          style={{
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
            ...(isDesktop
              ? {
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "stretch",
                  justifyContent: "space-between",
                  gap: 24,
                }
              : {
                  flexDirection: "column",
                  gap: 24,
                }),
          }}
        >
          {/* Lịch học hôm nay block */}
          <View style={{ width: isDesktop ? (Platform.OS === "web" ? "calc(60% - 12px)" : "58%") : "100%" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", flexShrink: 0 }}
              >
                Lịch học hôm nay
              </Text>
              {!isDesktop && todaySchedules.length > 1 && (
                <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1, justifyContent: "flex-end" }}>
                  {todaySchedules.slice(0, 8).map((_, index) => (
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
                  {todaySchedules.length > 8 && (
                    <Text style={{ fontSize: 10, color: "#94a3b8", alignSelf: "center" }}>+{todaySchedules.length - 8}</Text>
                  )}
                </View>
              )}
            </View>
            {todaySchedules.length > 0 ? (
              isDesktop ? (
                <View style={{ 
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  overflow: "hidden",
                  flex: 1,
                  ...getWebShadow("sm"),
                }}>
                  <ScrollView style={{ ...(Platform.OS === "web" ? { maxHeight: 500 } : { maxHeight: 500 }) }} showsVerticalScrollIndicator={false}>
                    {todaySchedules.slice(0, 10).map((sched, idx) => {
                      const timeParts = sched.time ? sched.time.split('-').map(t => t.trim()) : ["", ""];
                      const startTime = timeParts[0] || "";
                      const endTime = timeParts[1] || "";
                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => router.push("/student/schedule")}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 16,
                            paddingHorizontal: 20,
                            borderBottomWidth: idx === Math.min(todaySchedules.length, 10) - 1 ? 0 : 1,
                            borderColor: '#F3F4F6',
                            backgroundColor: '#FFFFFF',
                            ...getWebCursor(),
                            ...(Platform.OS === "web" ? { transition: "background-color 0.2s" } : {})
                          }}
                          onMouseEnter={(e: any) => { e.target.style.backgroundColor = "#F9FAFB"; }}
                          onMouseLeave={(e: any) => { e.target.style.backgroundColor = "#FFFFFF"; }}
                          activeOpacity={0.7}
                        >
                          {/* Time Block */}
                          <View style={{ width: 70, paddingRight: 16, marginRight: 16, alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>{startTime}</Text>
                            {endTime ? <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4, fontWeight: "500" }}>{endTime}</Text> : null}
                          </View>

                          {/* Info Block */}
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 6 }} numberOfLines={1}>
                              {sched.courseName || sched.subjectName || "Không có thông tin"}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                               <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                  <Ionicons name="person-circle-outline" size={16} color="#6B7280" />
                                  <Text style={{ fontSize: 13, color: "#4B5563", fontWeight: "500" }}>{sched.teacher || sched.teacherName || "N/A"}</Text>
                               </View>
                               <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                                  <Text style={{ fontSize: 13, color: "#4B5563", fontWeight: "500" }}>{sched.room || "N/A"}</Text>
                               </View>
                            </View>
                          </View>
                          
                          {/* Action Icon */}
                          <View style={{ 
                            width: 32, height: 32, borderRadius: 16, 
                            alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => router.push("/student/schedule")}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: "#f1f5f9",
                    ...getWebShadow("md"),
                    ...getWebCursor(),
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
              )
            ) : (
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 20,
                  padding: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: Colors.border,
                  ...getWebShadow("md"),
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: Colors.infoLight,
                    borderRadius: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="sparkles" size={32} color={Colors.primary} />
                </View>
                <Text
                  style={{ fontSize: 18, fontWeight: "800", color: Colors.textHeading, marginBottom: 8 }}
                >
                  Hôm nay bạn được nghỉ!
                </Text>
                <Text
                  style={{ fontSize: 13, color: Colors.textSecondary, textAlign: "center", lineHeight: 20 }}
                >
                  Không có lịch học nào được tìm thấy. Tận hưởng ngày nghỉ của bạn nhé!
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions (Mobile/Tablet Only) */}
          {!isDesktop && (
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
                    ...getWebShadow("md"),
                    ...getWebCursor(),
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
                    ...getWebShadow("md"),
                    ...getWebCursor(),
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
          )}

          {/* Stats below quick actions */}
          <View style={{ width: isDesktop ? (Platform.OS === "web" ? "calc(40% - 12px)" : "38%") : "100%" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}>Thống kê tuần này</Text>
              <View style={{ backgroundColor: "#eff6ff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#3b82f6" }}>Tuần {attendanceStats.totalSessions} buổi</Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 24,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                flex: 1,
                justifyContent: "center",
                ...getWebShadow("sm"),
              }}
            >
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isDesktop ? 40 : 24, flex: 1, paddingVertical: 12 }}>
                {/* SVG Circular Progress - BIG */}
                <View style={{ position: "relative", alignItems: "center", justifyContent: "center", width: isDesktop ? 220 : 160, height: isDesktop ? 220 : 160 }}>
                  <Svg width={isDesktop ? 220 : 160} height={isDesktop ? 220 : 160} viewBox={isDesktop ? "0 0 240 240" : "0 0 160 160"}>
                    <Circle cx={isDesktop ? 120 : 80} cy={isDesktop ? 120 : 80} r={isDesktop ? 100 : 65} stroke="#F3F4F6" strokeWidth={isDesktop ? 12 : 8} fill="none" />
                    <Circle 
                      cx={isDesktop ? 120 : 80} cy={isDesktop ? 120 : 80} r={isDesktop ? 100 : 65} 
                      stroke="#2563EB" 
                      strokeWidth={isDesktop ? 12 : 8} 
                      fill="none" 
                      strokeDasharray={isDesktop ? 628.32 : 408.41} 
                      strokeDashoffset={(isDesktop ? 628.32 : 408.41) - (Math.max(0, Math.min(attendanceStats.attendanceRate, 100)) / 100) * (isDesktop ? 628.32 : 408.41)} 
                      strokeLinecap="round" 
                      transform={isDesktop ? "rotate(-90 120 120)" : "rotate(-90 80 80)"}
                    />
                  </Svg>
                  <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: isDesktop ? 48 : 36, fontWeight: "800", color: "#111827" }}>{attendanceStats.attendanceRate}%</Text>
                    <Text style={{ fontSize: isDesktop ? 13 : 11, color: "#6B7280", fontWeight: "600", textTransform: "uppercase", marginTop: isDesktop ? 4 : 2, letterSpacing: 1 }}>Tỷ lệ</Text>
                  </View>
                </View>

                {/* Stats Details - BIGGER */}
                <View style={{ flexDirection: "row", width: "100%", gap: isDesktop ? 20 : 12 }}>
                  {/* Có mặt */}
                  <View style={{ flex: 1, backgroundColor: "#FAFAFA", borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 16, padding: isDesktop ? 20 : 16, alignItems: "center", flexDirection: isDesktop ? "row" : "column", gap: isDesktop ? 16 : 8 }}>
                    <View style={{ width: isDesktop ? 44 : 40, height: isDesktop ? 44 : 40, borderRadius: 12, backgroundColor: "#E0F2FE", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="checkmark-outline" size={isDesktop ? 24 : 20} color="#0284C7" />
                    </View>
                    <View style={{ alignItems: isDesktop ? "flex-start" : "center" }}>
                      <Text style={{ fontSize: isDesktop ? 24 : 20, fontWeight: "800", color: "#111827" }}>{attendanceStats.present}</Text>
                      <Text style={{ fontSize: isDesktop ? 13 : 12, fontWeight: "500", color: "#4B5563" }}>Có mặt</Text>
                    </View>
                  </View>

                  {/* Vắng mặt */}
                  <View style={{ flex: 1, backgroundColor: "#FAFAFA", borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 16, padding: isDesktop ? 20 : 16, alignItems: "center", flexDirection: isDesktop ? "row" : "column", gap: isDesktop ? 16 : 8 }}>
                    <View style={{ width: isDesktop ? 44 : 40, height: isDesktop ? 44 : 40, borderRadius: 12, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="close-outline" size={isDesktop ? 24 : 20} color="#EF4444" />
                    </View>
                    <View style={{ alignItems: isDesktop ? "flex-start" : "center" }}>
                      <Text style={{ fontSize: isDesktop ? 24 : 20, fontWeight: "800", color: "#111827" }}>{attendanceStats.absent}</Text>
                      <Text style={{ fontSize: isDesktop ? 13 : 12, fontWeight: "500", color: "#4B5563" }}>Vắng mặt</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* History Link */}
          <TouchableOpacity
            onPress={() => router.push("/student/history")}
            style={{
              width: isDesktop ? (Platform.OS === "web" ? "calc(60% - 12px)" : "58%") : "100%",
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              ...getWebShadow("sm"),
              ...getWebCursor(),
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

        {/* Weekly Schedule Section */}
        <View style={{ marginTop: isDesktop ? 32 : 24 }}>
          <WeeklySchedule />
        </View>

        </View>
        
        {/* Footer for Web only */}
        <WebFooter />
      </ScrollView>
    </View>
  );

  return content;
}
