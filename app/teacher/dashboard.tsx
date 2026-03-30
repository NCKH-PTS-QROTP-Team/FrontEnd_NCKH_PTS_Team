import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Tabs from "@/components/Tabs";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { Colors } from "@/constants/colors";
import { getSlotIndexFromStartTime } from "@/constants/scheduleSlots";
import { scheduleService, attendanceService, authService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";
import type { Schedule } from "@/apis/services/schedule.service";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
} from "@/components/Icons";
import { LinearGradient } from "expo-linear-gradient";

interface TeacherSchedule {
  id: string;
  subjectCode?: string;
  subjectName: string;
  className: string;
  time: string;
  room: string;
  dayOfWeek: number;
  studentCount?: number;
}

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(3); // demo – 3 thông báo chưa đọc
  const [activeTab, setActiveTab] = useState<"overview" | "schedule">(
    "overview",
  );
  const [teacherSchedules, setTeacherSchedules] = useState<TeacherSchedule[]>(
    [],
  );
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  });

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const quickActionWidth = isDesktop ? "48%" : "100%";
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, [currentWeek]);

  const getWeekRangeISO = () => {
    const startDate = new Date(currentWeek);
    // Move to Monday
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Sunday

    const formatISO = (d: Date) =>
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
        .getDate()
        .toString()
        .padStart(2, "0")}`;

    return {
      fromDate: formatISO(startDate),
      toDate: formatISO(endDate),
    };
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      let teacherId = await getTeacherIdFromToken();

      if (!teacherId) {
        // Fallback: take teacherId from /users/me (JWT decoding might miss claim)
        console.warn(
          "No teacherId found in token, falling back to /users/me",
        );
        const tokenUser = await authService.getCurrentUser().catch(() => null);
        teacherId = tokenUser?.teacherId ?? null;
      }

      if (!teacherId) {
        console.warn("No teacherId available, using empty dashboard data");
        setLoading(false);
        return;
      }

      const { fromDate, toDate } = getWeekRangeISO();

      // Load schedules (theo tuần hiện tại) và sessions song song
      const [allSchedules, todaySessions] = await Promise.all([
        scheduleService
          .getSchedules({ teacherId, fromDate, toDate })
          .catch(() => []),
        attendanceService
          .getSessions({ teacherId, active: true })
          .catch(() => []),
      ]);

      // Debug logs để xem data thực tế từ backend
      console.log("[TeacherDashboard] teacherId =", teacherId);
      console.log("[TeacherDashboard] week range =", { fromDate, toDate });
      console.log("[TeacherDashboard] schedules from API =", allSchedules);
      console.log("[TeacherDashboard] sessions from API =", todaySessions);

      // Convert schedules to TeacherSchedule format (dữ liệu từ DB)
      const schedules = allSchedules.map((s: Schedule) => ({
        id: s.id,
        subjectCode: s.subjectCode,
        subjectName: s.subjectName,
        className: s.className,
        time: `${s.startTime} - ${s.endTime}`,
        room: s.room,
        dayOfWeek: s.dayOfWeek,
      }));

      setTeacherSchedules(schedules);

      // Tính stats từ sessions
      let totalStudents = 0;
      let presentToday = 0;

      for (const session of todaySessions) {
        const records = await attendanceService
          .getRecords({ sessionId: session.id })
          .catch(() => []);
        console.log(
          "[TeacherDashboard] records for session",
          session.id,
          "=",
          records,
        );
        totalStudents += records.length;
        presentToday += records.filter(
          (r: any) => r.status === "PRESENT",
        ).length;
      }

      const absentToday = totalStudents - presentToday;
      const attendanceRate =
        totalStudents > 0
          ? Math.round((presentToday / totalStudents) * 100)
          : 0;

      setStats({
        totalStudents,
        presentToday,
        absentToday,
        attendanceRate,
      });

      console.log("[TeacherDashboard] computed stats =", {
        totalStudents,
        presentToday,
        absentToday,
        attendanceRate,
      });
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      showToast("Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  // Convert dayOfWeek (0=Sunday, 1=Monday, ...) to day name
  const getDayName = (dayOfWeek: number): string => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    // Backend convention: 2=Mon ... 7=Sat, 8=Sun (FE expects day names)
    if (dayOfWeek === 8) return "sunday";
    // For Mon..Sat, convert 2..7 -> index 1..6 in `days`
    const idx = dayOfWeek - 1;
    return days[idx] ?? "monday";
  };

  // Format week range
  const formatWeekRange = () => {
    const startDate = new Date(currentWeek);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Monday
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Sunday
    return `${startDate.getDate().toString().padStart(2, "0")}/${(
      startDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")} - ${endDate.getDate().toString().padStart(2, "0")}/${(
      endDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${endDate.getFullYear()}`;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  // Cột Sáng/Chiều/Tối như lịch thật; data theo giờ map đúng ca (tiết 1-6 sáng, 7-12 chiều, 13-15 tối)
  const scheduleByDayPeriod: {
    [day: string]: {
      morning: TeacherSchedule[];
      afternoon: TeacherSchedule[];
      evening: TeacherSchedule[];
    };
  } = {};
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  dayNames.forEach((d) => {
    scheduleByDayPeriod[d] = { morning: [], afternoon: [], evening: [] };
  });
  teacherSchedules.forEach((schedule) => {
    const dayName = getDayName(schedule.dayOfWeek);
    const slotIndex = getSlotIndexFromStartTime(schedule.time ?? "");
    const period: "morning" | "afternoon" | "evening" =
      slotIndex <= 2 ? "morning" : slotIndex <= 5 ? "afternoon" : "evening";
    scheduleByDayPeriod[dayName][period].push(schedule);
  });

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F9FAFB" }}
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

  const renderOverview = () => (
    <View style={{ gap: 24 }}>
      {/* ── Progress Bar Card (Thống kê hôm nay) ── */}
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
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}>
            Tiến độ điểm danh hôm nay
          </Text>
          <View
            style={{
              backgroundColor: "#ecfdf5",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#10b981" }}>
              Tốt
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
            {stats.attendanceRate}%
          </Text>
          <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}>
            {stats.presentToday} / {stats.totalStudents} sinh viên có mặt
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
              width: `${Math.max(0, Math.min(stats.attendanceRate, 100))}%`,
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
              backgroundColor: "#f8fafc",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Ionicons name="people" size={18} color="#6366f1" />
            <View>
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: "#1e293b" }}
              >
                {stats.totalStudents}
              </Text>
              <Text style={{ fontSize: 11, color: "#64748b" }}>Tổng số</Text>
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
                style={{ fontSize: 13, fontWeight: "700", color: "#ef4444" }}
              >
                {stats.absentToday}
              </Text>
              <Text style={{ fontSize: 11, color: "#ef4444" }}>Vắng mặt</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Quick Actions (Khởi tạo điểm danh) ── */}
      <View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: 12,
          }}
        >
          Khởi tạo điểm danh
        </Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity
            onPress={() => router.push("/teacher/generate-otp")}
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
              style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}
            >
              Tạo mã số 6 số cho lớp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/teacher/generate-qr")}
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
              style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}
            >
              Quét mã nhanh chóng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Management Links ── */}
      <View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: 12,
          }}
        >
          Quản lý chung
        </Text>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 1,
            borderWidth: 1,
            borderColor: "#f1f5f9",
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/teacher/advisee-class")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#f1f5f9",
            }}
          >
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
              <Ionicons name="school" size={20} color="#8b5cf6" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Lớp chủ nhiệm
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/teacher/class-list")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#f1f5f9",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#eff6ff",
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="list" size={20} color="#3b82f6" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Danh sách lớp học
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/teacher/reports")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#f1f5f9",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#fffbeb",
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="pie-chart" size={20} color="#f59e0b" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Báo cáo &amp; Thống kê
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setUnreadNotifs(0);
              router.push("/teacher/notifications");
            }}
            style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#eef2ff",
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
                position: "relative",
              }}
            >
              <Ionicons name="notifications" size={20} color="#6366f1" />
              {unreadNotifs > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: "#ef4444",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: "#fff",
                  }}
                >
                  <Text
                    style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}
                  >
                    {unreadNotifs > 9 ? "9+" : unreadNotifs}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Thông báo
            </Text>
            {unreadNotifs > 0 && (
              <View
                style={{
                  backgroundColor: "#ef4444",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}
                >
                  {unreadNotifs} mới
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderScheduleCell = (
    day: string,
    period: "morning" | "afternoon" | "evening",
  ) => {
    const schedules = scheduleByDayPeriod[day]?.[period] || [];
    const columnMinWidth = isMobile ? 180 : 240;
    const cellPadding = isMobile ? 8 : 10;
    const cellMinHeight = isMobile ? 100 : 120;
    return (
      <View
        key={`${day}-${period}`}
        style={{
          flex: 1,
          minWidth: columnMinWidth,
          minHeight: cellMinHeight,
          padding: cellPadding,
          borderRightWidth: 1,
          borderRightColor: Colors.border,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          backgroundColor: schedules.length > 0 ? Colors.white : Colors.gray50,
        }}
      >
        {schedules.map((item, index) => (
          <View
            key={item.id}
            style={{
              backgroundColor: "#DBEAFE",
              borderLeftWidth: 3,
              borderLeftColor: Colors.primary,
              padding: isMobile ? 6 : 8,
              borderRadius: 4,
              marginBottom:
                index < schedules.length - 1 ? (isMobile ? 6 : 8) : 0,
            }}
          >
            <Text
              style={{
                fontSize: isMobile ? 12 : 13,
                fontWeight: "700",
                color: Colors.textHeading,
                marginBottom: 2,
              }}
            >
              {item.subjectName}
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 10 : 11,
                color: Colors.primary,
                marginBottom: 1,
              }}
            >
              {item.subjectCode}
            </Text>
            <Text
              style={{ fontSize: isMobile ? 10 : 11, color: Colors.textLight }}
            >
              {item.time} • Phòng: {item.room}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSchedule = () => {
    const headerPadding = isMobile ? 10 : 14;
    const headerFontSize = isMobile ? 13 : 15;
    const dayFontSize = isMobile ? 12 : 14;
    const periodFontSize = isMobile ? 12 : 14;
    const columnMinWidth = isMobile ? 180 : 240;

    return (
      <View style={{ marginBottom: 24, width: "100%" }}>
        {/* Week Navigation - Simple and Clean */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: isMobile ? 16 : 20,
            paddingVertical: isMobile ? 12 : 16,
            paddingHorizontal: isMobile ? 16 : 0,
          }}
        >
          <TouchableOpacity
            onPress={() => navigateWeek("prev")}
            activeOpacity={0.7}
            style={{
              width: isMobile ? 44 : 36,
              height: isMobile ? 44 : 36,
              borderRadius: isMobile ? 22 : 18,
              backgroundColor: Colors.gray100,
              alignItems: "center",
              justifyContent: "center",
              marginRight: isMobile ? 12 : 16,
              minWidth: 44, // Touch-friendly minimum
            }}
          >
            <ChevronLeftIcon size={isMobile ? 20 : 18} color={Colors.gray700} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: isMobile ? 13 : 15,
              fontWeight: "600",
              color: Colors.textHeading,
              minWidth: isMobile ? 130 : 160,
              textAlign: "center",
              flex: isMobile ? 1 : 0,
            }}
          >
            {formatWeekRange()}
          </Text>

          <TouchableOpacity
            onPress={() => navigateWeek("next")}
            activeOpacity={0.7}
            style={{
              width: isMobile ? 44 : 36,
              height: isMobile ? 44 : 36,
              borderRadius: isMobile ? 22 : 18,
              backgroundColor: Colors.gray100,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: isMobile ? 12 : 16,
              minWidth: 44, // Touch-friendly minimum
            }}
          >
            <ChevronRightIcon
              size={isMobile ? 20 : 18}
              color={Colors.gray700}
            />
          </TouchableOpacity>
        </View>

        {/* Mobile Hint */}
        {isMobile && (
          <View
            style={{
              backgroundColor: "#EFF6FF",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <InfoIcon size={20} color="#1E40AF" />
            <Text style={{ fontSize: 12, color: "#1E40AF", flex: 1 }}>
              Vuốt sang ngang để xem lịch các ngày khác
            </Text>
          </View>
        )}

        {/* Schedule Table */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={Platform.OS === "web"}
          style={{
            backgroundColor: Colors.white,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View style={{ minWidth: "100%" }}>
            {/* Table Header */}
            <View
              style={{ flexDirection: "row", backgroundColor: Colors.gray50 }}
            >
              <View
                style={{
                  width: isMobile ? 80 : 120,
                  padding: headerPadding,
                  borderRightWidth: 1,
                  borderRightColor: Colors.border,
                  borderBottomWidth: 2,
                  borderBottomColor: Colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: headerFontSize,
                    fontWeight: "700",
                    color: Colors.textHeading,
                  }}
                >
                  {isMobile ? "Ca" : "Ca học"}
                </Text>
              </View>
              {[
                "Thứ 2",
                "Thứ 3",
                "Thứ 4",
                "Thứ 5",
                "Thứ 6",
                "Thứ 7",
                "Chủ nhật",
              ].map((day, index) => (
                <View
                  key={day}
                  style={{
                    flex: 1,
                    minWidth: columnMinWidth,
                    padding: headerPadding,
                    borderRightWidth: index < 6 ? 1 : 0,
                    borderRightColor: Colors.border,
                    borderBottomWidth: 2,
                    borderBottomColor: Colors.border,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: dayFontSize,
                      fontWeight: "600",
                      color: Colors.gray700,
                    }}
                  >
                    {isMobile ? day.replace("Thứ ", "T") : day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Cột Sáng / Chiều / Tối như lịch thật; data map theo giờ vào đúng ca */}
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: isMobile ? 80 : 120,
                  padding: headerPadding,
                  borderRightWidth: 1,
                  borderRightColor: Colors.border,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.border,
                  backgroundColor: "#FFFBEB",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: isMobile ? 100 : 120,
                }}
              >
                <Text
                  style={{
                    fontSize: isMobile ? 11 : periodFontSize,
                    fontWeight: "600",
                    color: "#92400E",
                  }}
                >
                  Sáng
                </Text>
              </View>
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => renderScheduleCell(day, "morning"))}
            </View>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: isMobile ? 80 : 120,
                  padding: headerPadding,
                  borderRightWidth: 1,
                  borderRightColor: Colors.border,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.border,
                  backgroundColor: "#FEF3C7",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: isMobile ? 100 : 120,
                }}
              >
                <Text
                  style={{
                    fontSize: isMobile ? 11 : periodFontSize,
                    fontWeight: "600",
                    color: "#92400E",
                  }}
                >
                  Chiều
                </Text>
              </View>
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => renderScheduleCell(day, "afternoon"))}
            </View>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: isMobile ? 80 : 120,
                  padding: headerPadding,
                  borderRightWidth: 1,
                  borderRightColor: Colors.border,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.border,
                  backgroundColor: "#DBEAFE",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: isMobile ? 100 : 120,
                }}
              >
                <Text
                  style={{
                    fontSize: isMobile ? 11 : periodFontSize,
                    fontWeight: "600",
                    color: "#1E3A8A",
                  }}
                >
                  Tối
                </Text>
              </View>
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => renderScheduleCell(day, "evening"))}
            </View>
          </View>
        </ScrollView>

        {teacherSchedules.length === 0 && (
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: isDesktop ? 20 : 16,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 40,
              marginTop: 12,
            }}
          >
            <CalendarIcon size={48} color={Colors.primary} />
            <Text
              style={{
                fontSize: isMobile ? 14 : 16,
                lineHeight: isMobile ? 20 : 24,
                fontWeight: "600",
                color: Colors.text,
                marginBottom: 4,
              }}
            >
              Không có lịch dạy
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 12 : 14,
                lineHeight: isMobile ? 18 : 20,
                color: Colors.textSecondary,
              }}
            >
              Tuần này bạn không có lịch dạy
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
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
          paddingHorizontal: paddingHorizontal,
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
          <View>
            <Text
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.8)",
                marginBottom: 4,
              }}
            >
              Chào mừng trở lại!
            </Text>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#ffffff" }}>
              Xin chào, Giảng viên
            </Text>
          </View>

          {/* Bell + Profile icons */}
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            {/* Notification Bell */}
            <TouchableOpacity
              onPress={() => router.push("/teacher/notifications")}
              style={{ position: "relative" }}
              activeOpacity={0.75}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Ionicons name="notifications-outline" size={22} color="#fff" />
              </View>
              {unreadNotifs > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -3,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: "#ef4444",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 4,
                    borderWidth: 2,
                    borderColor: "#3b82f6",
                  }}
                >
                  <Text
                    style={{ fontSize: 10, fontWeight: "800", color: "#fff" }}
                  >
                    {unreadNotifs > 9 ? "9+" : unreadNotifs}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile avatar */}
            <TouchableOpacity
              onPress={() => router.push("/teacher/profile")}
              activeOpacity={0.75}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Ionicons name="person" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* ── Tabs (Overlapping the banner) ── */}
      <View
        style={{
          paddingHorizontal: paddingHorizontal,
          marginTop: -24,
          zIndex: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {(
            [
              { key: "overview", label: "Tổng quan", icon: "grid-outline" },
              { key: "schedule", label: "Lịch học", icon: "calendar-outline" },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                }}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={isActive ? "#3b82f6" : "#64748b"}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: isActive ? "#3b82f6" : "#64748b",
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal,
          paddingTop: 24,
          paddingBottom: isDesktop ? 40 : isMobile ? 100 : 64,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {activeTab === "overview" ? renderOverview() : renderSchedule()}
        </View>
      </ScrollView>
    </View>
  );
}
