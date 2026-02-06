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
import Tabs from "@/components/Tabs";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { Colors } from "@/constants/colors";
import { scheduleService, attendanceService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";
import type { Schedule } from "@/apis/services/schedule.service";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
} from "@/components/Icons";

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
  const [activeTab, setActiveTab] = useState<"overview" | "schedule">(
    "overview",
  );
  const [teacherSchedules, setTeacherSchedules] = useState<TeacherSchedule[]>([]);
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
      const teacherId = await getTeacherIdFromToken();
      
      if (!teacherId) {
        console.warn("No teacherId found, using empty data");
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
        const records = await attendanceService.getRecords({ sessionId: session.id }).catch(() => []);
        console.log("[TeacherDashboard] records for session", session.id, "=", records);
        totalStudents += records.length;
        presentToday += records.filter((r: any) => r.status === "PRESENT").length;
      }

      const absentToday = totalStudents - presentToday;
      const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

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

  // Helper to determine period from time string (e.g., "08:00 - 10:00")
  const getPeriod = (time: string): "morning" | "afternoon" | "evening" => {
    const hour = parseInt(time.split(":")[0]);
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
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
    return days[dayOfWeek];
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

  // Group schedules by day and period
  const scheduleByDayPeriod: {
    [day: string]: { [period: string]: TeacherSchedule[] };
  } = {};
  teacherSchedules.forEach((schedule) => {
    const dayName = getDayName(schedule.dayOfWeek);
    const period = getPeriod(schedule.time);

    if (!scheduleByDayPeriod[dayName]) {
      scheduleByDayPeriod[dayName] = {
        morning: [],
        afternoon: [],
        evening: [],
      };
    }
    if (!scheduleByDayPeriod[dayName][period]) {
      scheduleByDayPeriod[dayName][period] = [];
    }
    scheduleByDayPeriod[dayName][period].push(schedule);
  });

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }} edges={["top"]}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#3FA9F5" />
          <Text style={{ marginTop: 16, color: "#6B7280" }}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderOverview = () => (
    <>
      {/* Banner */}
      <Image
        source={require("@/assets/teacher-banner.png")}
        style={{
          width: "100%",
          height: isMobile ? 150 : isTablet ? 180 : 200,
          borderRadius: 16,
          marginBottom: isMobile ? 16 : 24,
        }}
        resizeMode="contain"
      />

      {/* Weekly Calendar - Mobile Only */}
      {isMobile && (
        <View style={{ marginBottom: 16 }}>
          <WeeklyCalendar />
        </View>
      )}

      {/* Quick Actions */}
      <View style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Text
          style={{
            fontSize: isMobile ? 16 : 18,
            lineHeight: isMobile ? 24 : 28,
            fontWeight: "bold",
            color: "#111827",
            marginBottom: isMobile ? 12 : 16,
          }}
        >
          Tạo phiên điểm danh
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: isMobile ? 8 : 16,
            marginBottom: isDesktop ? 0 : 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/teacher/generate-otp")}
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: isMobile ? 12 : 16,
              padding: isMobile ? 12 : 24,
              borderWidth: 2,
              borderColor: "#DBEAFE",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: isMobile ? 44 : 56,
                height: isMobile ? 44 : 56,
                backgroundColor: "#DBEAFE",
                borderRadius: isMobile ? 10 : 12,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: isMobile ? 8 : 16,
              }}
            >
              <Text
                style={{
                  fontSize: isMobile ? 20 : 24,
                  lineHeight: isMobile ? 28 : 32,
                  fontWeight: "bold",
                  color: "#3FA9F5",
                }}
              >
                123
              </Text>
            </View>
            <Text
              style={{
                fontSize: isMobile ? 15 : 18,
                lineHeight: isMobile ? 20 : 28,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: isMobile ? 4 : 8,
              }}
            >
              {isMobile ? "OTP" : "Tạo mã OTP"}
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 11 : 14,
                lineHeight: isMobile ? 16 : 20,
                color: "#6B7280",
              }}
            >
              {isMobile ? "Sinh mã số" : "Sinh mã số cho sinh viên điểm danh"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/teacher/generate-qr")}
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: isMobile ? 12 : 16,
              padding: isMobile ? 12 : 24,
              borderWidth: 2,
              borderColor: "#D1FAE5",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: isMobile ? 44 : 56,
                height: isMobile ? 44 : 56,
                backgroundColor: "#D1FAE5",
                borderRadius: isMobile ? 10 : 12,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: isMobile ? 8 : 16,
              }}
            >
              <Text
                style={{
                  fontSize: isMobile ? 18 : 22,
                  lineHeight: isMobile ? 24 : 28,
                  fontWeight: "bold",
                  color: "#10B981",
                }}
              >
                QR
              </Text>
            </View>
            <Text
              style={{
                fontSize: isMobile ? 15 : 18,
                lineHeight: isMobile ? 20 : 28,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: isMobile ? 4 : 8,
              }}
            >
              {isMobile ? "QR Code" : "Tạo QR Code"}
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 11 : 14,
                lineHeight: isMobile ? 16 : 20,
                color: "#6B7280",
              }}
            >
              {isMobile ? "Hiển thị mã" : "Hiển thị mã QR trên lớp"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={{ marginBottom: isMobile ? 16 : 24 }}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              lineHeight: 28,
              fontWeight: "bold",
              color: "#111827",
              marginBottom: 20,
            }}
          >
            Thống kê hôm nay
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -8,
            }}
          >
            <View
              style={{
                width: isMobile ? "50%" : "25%",
                paddingHorizontal: 8,
                marginBottom: isMobile ? 16 : 0,
              }}
            >
              <View
                style={{
                  backgroundColor: "#EFF6FF",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 32,
                    lineHeight: 40,
                    fontWeight: "bold",
                    color: "#3FA9F5",
                    marginBottom: 4,
                  }}
                >
                  {stats.totalStudents}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  Tổng SV
                </Text>
              </View>
            </View>
            <View
              style={{
                width: isMobile ? "50%" : "25%",
                paddingHorizontal: 8,
                marginBottom: isMobile ? 16 : 0,
              }}
            >
              <View
                style={{
                  backgroundColor: "#ECFDF5",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 32,
                    lineHeight: 40,
                    fontWeight: "bold",
                    color: "#10B981",
                    marginBottom: 4,
                  }}
                >
                  {stats.presentToday}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  Có mặt
                </Text>
              </View>
            </View>
            <View
              style={{
                width: isMobile ? "50%" : "25%",
                paddingHorizontal: 8,
                marginBottom: isMobile ? 16 : 0,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FEE2E2",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 32,
                    lineHeight: 40,
                    fontWeight: "bold",
                    color: "#EF4444",
                    marginBottom: 4,
                  }}
                >
                  {stats.absentToday}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  Vắng
                </Text>
              </View>
            </View>
            <View
              style={{ width: isMobile ? "50%" : "25%", paddingHorizontal: 8 }}
            >
              <View
                style={{
                  backgroundColor: "#F0F9FF",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 32,
                    lineHeight: 40,
                    fontWeight: "bold",
                    color: "#3FA9F5",
                    marginBottom: 4,
                  }}
                >
                  {stats.attendanceRate}%
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  Tỷ lệ
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Management Links */}
      <View>
        <TouchableOpacity
          onPress={() => router.push("/teacher/class-list")}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: isMobile ? 12 : 16,
            padding: isMobile ? 12 : 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            marginBottom: isMobile ? 8 : 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#DBEAFE",
                borderRadius: isMobile ? 10 : 12,
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  fontSize: isMobile ? 18 : 20,
                  lineHeight: isMobile ? 22 : 24,
                  fontWeight: "bold",
                  color: "#3FA9F5",
                }}
              >
                ≡
              </Text>
            </View>
            <Text
              style={{
                fontSize: isMobile ? 14 : 16,
                lineHeight: isMobile ? 20 : 24,
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Danh sách lớp học
            </Text>
          </View>
          <Text
            style={{
              fontSize: isMobile ? 18 : 20,
              lineHeight: 24,
              color: "#9CA3AF",
            }}
          >
            →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/teacher/reports")}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: isMobile ? 12 : 16,
            padding: isMobile ? 12 : 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#FEF3C7",
                borderRadius: isMobile ? 10 : 12,
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  fontSize: isMobile ? 18 : 20,
                  lineHeight: isMobile ? 22 : 24,
                  fontWeight: "bold",
                  color: "#F59E0B",
                }}
              >
                ☰
              </Text>
            </View>
            <Text
              style={{
                fontSize: isMobile ? 14 : 16,
                lineHeight: isMobile ? 20 : 24,
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Báo cáo & Thống kê
            </Text>
          </View>
          <Text
            style={{
              fontSize: isMobile ? 18 : 20,
              lineHeight: 24,
              color: "#9CA3AF",
            }}
          >
            →
          </Text>
        </TouchableOpacity>
      </View>
    </>
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
          backgroundColor:
            schedules && schedules.length > 0 ? Colors.white : Colors.gray50,
        }}
      >
        {schedules &&
          schedules.length > 0 &&
          schedules.map((item, index) => (
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
                  lineHeight: isMobile ? 16 : 18,
                  marginBottom: isMobile ? 3 : 4,
                }}
              >
                {item.subjectName}
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 10 : 11,
                  color: Colors.primary,
                  lineHeight: isMobile ? 14 : 16,
                  marginBottom: isMobile ? 2 : 3,
                }}
              >
                {item.subjectCode}
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 10 : 11,
                  color: Colors.textLight,
                  lineHeight: isMobile ? 14 : 15,
                  marginBottom: isMobile ? 1 : 2,
                }}
              >
                {item.time}
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 10 : 11,
                  color: Colors.textLight,
                  lineHeight: isMobile ? 14 : 15,
                  marginBottom: isMobile ? 1 : 2,
                }}
              >
                Phòng: {item.room}
              </Text>
              {item.className && (
                <Text
                  style={{
                    fontSize: isMobile ? 10 : 11,
                    color: Colors.textSecondary,
                    lineHeight: isMobile ? 14 : 15,
                    fontWeight: "500",
                  }}
                >
                  {item.className}{" "}
                  {item.studentCount && `• ${item.studentCount} SV`}
                </Text>
              )}
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
            <ChevronLeftIcon
              size={isMobile ? 20 : 18}
              color={Colors.gray700}
            />
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

            {/* Morning Row */}
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

            {/* Afternoon Row */}
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

            {/* Evening Row */}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="dark" />

      {/* Tabs */}
      <View
        style={{
          backgroundColor: Colors.white,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        <Tabs
          tabs={[
            { key: "overview", label: "Tổng quan" },
            { key: "schedule", label: "Lịch dạy" },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as "overview" | "schedule")}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: 24,
          paddingBottom: isDesktop ? 32 : 24,
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
    </SafeAreaView>
  );
}
