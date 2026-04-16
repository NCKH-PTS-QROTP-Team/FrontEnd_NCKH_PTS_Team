import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshControl,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { attendanceService, authService, scheduleService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";
import type { Schedule } from "@/apis/services/schedule.service";

interface TeacherStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
  totalClasses: number;
}

interface CalendarCell {
  iso: string;
  day: number;
  isCurrentMonth: boolean;
}

const WEEK_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function dateToISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getBackendDayOfWeek(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 8 : jsDay + 1;
}

function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  let startOffset = first.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const startDate = new Date(year, month, 1 - startOffset);
  const result: CalendarCell[] = [];

  for (let i = 0; i < 42; i++) {
    const cur = new Date(startDate);
    cur.setDate(startDate.getDate() + i);
    result.push({
      iso: dateToISO(cur),
      day: cur.getDate(),
      isCurrentMonth: cur.getMonth() === month,
    });
  }

  return result;
}

function scheduleAppliesOnDate(schedule: Schedule, isoDate: string): boolean {
  const target = new Date(`${isoDate}T00:00:00`);

  const isOneTime =
    schedule.pattern === "ONE_TIME" ||
    (!!schedule.date && schedule.pattern !== "RECURRING_WEEKLY");

  if (isOneTime) {
    return schedule.date === isoDate;
  }

  if (schedule.excludedDates?.includes(isoDate)) {
    return false;
  }

  if (schedule.startDate && isoDate < schedule.startDate) {
    return false;
  }

  if (schedule.endDate && isoDate > schedule.endDate) {
    return false;
  }

  return schedule.dayOfWeek === getBackendDayOfWeek(target);
}

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktopWeb = isWeb && width >= 1100;
  const isTablet = width >= 768 && width < 1100;
  const isMobile = width < 768;
  const { showToast, toast, hideToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("Giảng viên");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
    totalClasses: 0,
  });

  const todayISO = useMemo(() => dateToISO(new Date()), []);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedISO, setSelectedISO] = useState(todayISO);

  const dayListRef = useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const monthCells = useMemo(
    () => buildMonthGrid(calendarMonth.year, calendarMonth.month),
    [calendarMonth],
  );

  const monthLabel = useMemo(() => {
    const d = new Date(calendarMonth.year, calendarMonth.month, 1);
    const label = d.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [calendarMonth]);

  const schedulesForSelectedDay = useMemo(() => {
    return schedules
      .filter((s) => scheduleAppliesOnDate(s, selectedISO))
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }, [schedules, selectedISO]);

  useEffect(() => {
    if (!isDesktopWeb || schedulesForSelectedDay.length < 4) return;

    const rowHeight = 78;
    const visibleRows = 3;
    const maxOffset = Math.max(
      0,
      schedulesForSelectedDay.length * rowHeight - visibleRows * rowHeight,
    );

    const timer = setInterval(() => {
      setScrollOffset((prev) => {
        const next = prev + rowHeight;
        const finalOffset = next > maxOffset ? 0 : next;
        dayListRef.current?.scrollTo({ y: finalOffset, animated: true });
        return finalOffset;
      });
    }, 2200);

    return () => clearInterval(timer);
  }, [isDesktopWeb, schedulesForSelectedDay.length]);

  const loadData = async (showPageLoading = true) => {
    try {
      if (showPageLoading) {
        setLoading(true);
      }

      let teacherId = await getTeacherIdFromToken();
      const currentUser = await authService.getCurrentUser().catch(() => null);

      if (currentUser?.name) {
        setTeacherName(currentUser.name);
      }

      if (!teacherId) {
        teacherId = currentUser?.teacherId ?? null;
      }

      if (!teacherId) {
        showToast("Không tìm thấy thông tin giảng viên", "error");
        if (showPageLoading) {
          setLoading(false);
        }
        return;
      }

      const [allSchedules, sessions] = await Promise.all([
        scheduleService
          .getSchedules({ teacherId })
          .catch(() => [] as Schedule[]),
        attendanceService
          .getSessions({ teacherId, active: true })
          .catch(() => []),
      ]);

      setSchedules(allSchedules);

      let totalStudents = 0;
      let presentToday = 0;

      for (const session of sessions) {
        const records = await attendanceService
          .getRecords({ sessionId: session.id })
          .catch(() => []);

        totalStudents += records.length;
        presentToday += records.filter(
          (r: any) => r.status === "PRESENT",
        ).length;
      }

      const absentToday = Math.max(0, totalStudents - presentToday);
      const attendanceRate =
        totalStudents > 0
          ? Math.round((presentToday / totalStudents) * 100)
          : 0;

      const uniqueClasses = new Set(allSchedules.map((s) => s.classId)).size;

      setStats({
        totalStudents,
        presentToday,
        absentToday,
        attendanceRate,
        totalClasses: uniqueClasses,
      });
    } catch (error) {
      console.error("Teacher dashboard load error:", error);
      showToast("Không thể tải dữ liệu dashboard", "error");
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData(false);
    } finally {
      setRefreshing(false);
    }
  };

  const changeMonth = (direction: "prev" | "next") => {
    setCalendarMonth((prev) => {
      if (direction === "prev") {
        if (prev.month === 0) {
          return { year: prev.year - 1, month: 11 };
        }
        return { year: prev.year, month: prev.month - 1 };
      }

      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const statCard = (
    icon: React.ComponentProps<typeof Ionicons>["name"],
    label: string,
    value: string | number,
    tone: string,
  ) => (
    <View
      style={{
        flex: 1,
        minWidth: 140,
        borderRadius: 14,
        padding: 14,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E5ECF6",
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${tone}18`,
          marginBottom: 8,
        }}
      >
        <Ionicons name={icon} size={18} color={tone} />
      </View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: "#0F172A",
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>
        {label}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F8FAFC" }}
        edges={["top"]}
      >
        <StatusBar style="dark" />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 12, color: "#64748B" }}>
            Đang tải dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F1F5F9" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          isMobile ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1E3A8A"]}
              tintColor="#1E3A8A"
            />
          ) : undefined
        }
        contentContainerStyle={{
          paddingHorizontal: isDesktopWeb ? 20 : isTablet ? 16 : 12,
          paddingTop: 14,
          paddingBottom: isMobile ? 96 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 1360, width: "100%", alignSelf: "center" }}>
          <View
            style={{
              flexDirection: isDesktopWeb ? "row" : "column",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            {/* Left side - wider */}
            <View
              style={{ flex: isDesktopWeb ? 1.65 : 1, width: "100%", gap: 16 }}
            >
              {/* Gradient banner */}
              <LinearGradient
                colors={["#1E3A8A", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 18,
                  padding: 20,
                  minHeight: isDesktopWeb ? 180 : 160,
                  justifyContent: "space-between",
                  boxShadow: "0 10px 24px rgba(30, 58, 138, 0.25)",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.82)",
                      marginBottom: 6,
                    }}
                  >
                    Teacher workspace
                  </Text>
                  <Text
                    style={{
                      fontSize: isDesktopWeb ? 30 : 24,
                      fontWeight: "800",
                      color: "#FFFFFF",
                    }}
                  >
                    Xin chào, {teacherName}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 14,
                    }}
                  >
                    Quản lý điểm danh, lớp học và lịch giảng dạy trong một màn
                    hình.
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => router.push("/teacher/notifications")}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.35)",
                    }}
                  >
                    <Ionicons name="notifications" size={20} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/teacher/profile")}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.35)",
                    }}
                  >
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* QR + OTP cluster */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E5ECF6",
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: "#0F172A",
                    marginBottom: 12,
                  }}
                >
                  Khởi tạo điểm danh
                </Text>

                <View
                  style={{
                    flexDirection: isMobile ? "column" : "row",
                    gap: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => router.push("/teacher/generate-qr")}
                    style={{
                      flex: 1,
                      borderRadius: 14,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: "#DCE7FB",
                    }}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={["#1F3D8E", "#3B82F6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 14 }}
                    >
                      <Ionicons
                        name="qr-code"
                        size={22}
                        color="#FFFFFF"
                        style={{ marginBottom: 8 }}
                      />
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 16,
                          fontWeight: "800",
                          marginBottom: 2,
                        }}
                      >
                        Tạo mã QR
                      </Text>
                      <Text
                        style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}
                      >
                        Tạo mã quét điểm danh nhanh cho lớp.
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/teacher/generate-otp")}
                    style={{
                      flex: 1,
                      borderRadius: 14,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: "#DCE7FB",
                    }}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={["#23479F", "#5B9AFB"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 14 }}
                    >
                      <Ionicons
                        name="keypad"
                        size={22}
                        color="#FFFFFF"
                        style={{ marginBottom: 8 }}
                      />
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 16,
                          fontWeight: "800",
                          marginBottom: 2,
                        }}
                      >
                        Tạo mã OTP
                      </Text>
                      <Text
                        style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}
                      >
                        Tạo mã OTP cho buổi học hiện tại.
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stats cluster */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E5ECF6",
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: "#0F172A",
                    marginBottom: 12,
                  }}
                >
                  Thống kê nhanh
                </Text>

                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  {statCard(
                    "people",
                    "Tổng sinh viên",
                    stats.totalStudents,
                    "#1F3D8E",
                  )}
                  {statCard(
                    "checkmark-circle",
                    "Có mặt hôm nay",
                    stats.presentToday,
                    "#2563EB",
                  )}
                  {statCard(
                    "close-circle",
                    "Vắng hôm nay",
                    stats.absentToday,
                    "#1D4ED8",
                  )}
                  {statCard(
                    "stats-chart",
                    "Tỷ lệ điểm danh",
                    `${stats.attendanceRate}%`,
                    "#3B82F6",
                  )}
                </View>
              </View>
            </View>

            {/* Right side */}
            <View
              style={{ flex: isDesktopWeb ? 1 : 1, width: "100%", gap: 16 }}
            >
              {/* Mini month calendar */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E5ECF6",
                  padding: 14,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "800",
                      color: "#0F172A",
                    }}
                  >
                    Lịch tháng
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => changeMonth("prev")}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#EEF2FF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="chevron-back" size={16} color="#1F3D8E" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => changeMonth("next")}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#EEF2FF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#1F3D8E"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text
                  style={{ fontSize: 13, color: "#64748B", marginBottom: 10 }}
                >
                  {monthLabel}
                </Text>

                <View style={{ flexDirection: "row", marginBottom: 6 }}>
                  {WEEK_HEADERS.map((h) => (
                    <View
                      key={h}
                      style={{ width: `${100 / 7}%`, alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#64748B",
                        }}
                      >
                        {h}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {monthCells.map((cell) => {
                    const isToday = cell.iso === todayISO;
                    const isSelected = cell.iso === selectedISO;
                    const hasClass = schedules.some((s) =>
                      scheduleAppliesOnDate(s, cell.iso),
                    );
                    return (
                      <TouchableOpacity
                        key={cell.iso}
                        onPress={() => setSelectedISO(cell.iso)}
                        style={{
                          width: `${100 / 7}%`,
                          height: 34,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 9,
                          backgroundColor: isSelected
                            ? "#1F3D8E"
                            : "transparent",
                          opacity: cell.isCurrentMonth ? 1 : 0.35,
                          borderWidth: isToday && !isSelected ? 1.5 : 0,
                          borderColor: "#3B82F6",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: isSelected ? "800" : "600",
                            color: isSelected ? "#FFFFFF" : "#1E293B",
                          }}
                        >
                          {cell.day}
                        </Text>
                        {hasClass ? (
                          <View
                            style={{
                              position: "absolute",
                              bottom: 4,
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: isSelected
                                ? "#FFFFFF"
                                : "#3B82F6",
                            }}
                          />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Auto-scrolling day classes */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E5ECF6",
                  padding: 14,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "800",
                      color: "#0F172A",
                    }}
                  >
                    Lớp học trong ngày
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#EEF2FF",
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#1F3D8E",
                        fontWeight: "700",
                      }}
                    >
                      {schedulesForSelectedDay.length} lớp
                    </Text>
                  </View>
                </View>

                {schedulesForSelectedDay.length === 0 ? (
                  <View
                    style={{
                      borderRadius: 12,
                      backgroundColor: "#F8FAFC",
                      padding: 14,
                    }}
                  >
                    <Text style={{ color: "#64748B", fontSize: 13 }}>
                      Ngày đã chọn chưa có lịch dạy.
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    ref={dayListRef}
                    style={{ maxHeight: 234 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={(e) =>
                      setScrollOffset(e.nativeEvent.contentOffset.y)
                    }
                    scrollEventThrottle={16}
                  >
                    <View style={{ gap: 8 }}>
                      {schedulesForSelectedDay.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => router.push("/teacher/class-list")}
                          activeOpacity={0.82}
                          style={{
                            borderWidth: 1,
                            borderColor: "#E2E8F0",
                            borderRadius: 12,
                            padding: 10,
                            backgroundColor: "#F8FAFC",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "800",
                                color: "#0F172A",
                                flex: 1,
                              }}
                              numberOfLines={1}
                            >
                              {item.subjectName}
                            </Text>
                            <Text
                              style={{
                                fontSize: 11,
                                color: "#1F3D8E",
                                fontWeight: "700",
                              }}
                            >
                              {item.startTime} - {item.endTime}
                            </Text>
                          </View>
                          <Text
                            style={{ fontSize: 12, color: "#475569" }}
                            numberOfLines={1}
                          >
                            {item.className} • Phòng {item.room || "N/A"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>

              {/* Right quick actions */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E5ECF6",
                  padding: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: "#0F172A",
                    marginBottom: 10,
                  }}
                >
                  Quick actions
                </Text>

                <View style={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => router.push("/teacher/schedule")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      padding: 11,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#DBEAFE",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                      }}
                    >
                      <Ionicons name="calendar" size={16} color="#1F3D8E" />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      Lịch theo tuần
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/teacher/advisee-class")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      padding: 11,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#DBEAFE",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                      }}
                    >
                      <Ionicons name="school" size={16} color="#1F3D8E" />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      Quản lý lớp chủ nhiệm
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/teacher/class-list")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      padding: 11,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#DBEAFE",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                      }}
                    >
                      <Ionicons name="list" size={16} color="#1F3D8E" />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      Danh sách lớp học
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/teacher/reports")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      padding: 11,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#DBEAFE",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                      }}
                    >
                      <Ionicons name="bar-chart" size={16} color="#1F3D8E" />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      Báo cáo & thống kê
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/teacher/notifications")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      padding: 11,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#DBEAFE",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                      }}
                    >
                      <Ionicons
                        name="notifications"
                        size={16}
                        color="#1F3D8E"
                      />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      Thông báo
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}
