import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import WeeklySchedule from "@/components/WeeklySchedule";
import { MonthCalendar, todayISO, isoToDate } from "@/components/MonthCalendar";
import { useRouter } from "expo-router";
import { scheduleService, authService } from "@/apis";
import { removeAuthToken } from "@/apis/config/apiClient";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import type { Schedule as ApiSchedule } from "@/apis/services/schedule.service";
import { LinearGradient } from "expo-linear-gradient";

interface DayScheduleItem {
  id: string;
  courseName: string;
  teacher: string;
  time: string;
  room: string;
  scheduleType?: "CLASS" | "EXAM";
  pattern?: "RECURRING_WEEKLY" | "ONE_TIME";
  date?: string;
  dayOfWeekStr?: string;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<"all" | "class" | "exam">(
    "all",
  );
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">("day");
  const [loading, setLoading] = useState(true);
  const [daySchedules, setDaySchedules] = useState<DayScheduleItem[]>([]);
  const [rawSchedules, setRawSchedules] = useState<ApiSchedule[]>([]);
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<DayScheduleItem | null>(null);
  const PAGE_SIZE = 15;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const cardPadding = isDesktop ? 24 : 16;
  const BLUE = "#3b82f6";

  // Get selected date info
  const weekdays = [
    "Chủ nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const dayName = weekdays[selectedDate.getDay()];
  const dateStr = `${dayName}, ${String(selectedDate.getDate()).padStart(
    2,
    "0",
  )}/${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${selectedDate.getFullYear()}`;

  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  // Helper: convert Date -> yyyy-MM-dd
  const toIsoDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setPage(1);
  }, [daySchedules]);

  const totalPages = Math.ceil(daySchedules.length / PAGE_SIZE);
  const paginatedSchedules = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return daySchedules.slice(start, start + PAGE_SIZE);
  }, [daySchedules, page]);

  // Load schedules từ backend cho ngày đã chọn
  useEffect(() => {
    const loadSchedulesForDate = async () => {
      try {
        setLoading(true);

        const dateOnly = toIsoDate(selectedDate);

        const studentId = await getStudentIdFromToken();
        if (!studentId) {
          throw new Error("Missing studentId");
        }

        const studentSchedules = await scheduleService.getStudentSchedules(studentId);

        // Helper filter function
        const filterSchedulesByDateRange = (schedules: ApiSchedule[], fromStr: string, toStr: string) => {
          return schedules.filter((s) => {
            // Apply scheduleType filter
            if (selectedView === "class" && s.scheduleType !== "CLASS") return false;
            if (selectedView === "exam" && s.scheduleType !== "EXAM") return false;

            if (s.pattern === "ONE_TIME") {
              return !!(s.date && s.date >= fromStr && s.date <= toStr);
            }
            
            if (s.dayOfWeek) {
              const start = new Date(fromStr);
              const end = new Date(toStr);
              // Iterate dates in the range to find any matching day of week
              for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dow = d.getDay() === 0 ? 8 : d.getDay() + 1;
                if (dow === s.dayOfWeek) {
                  const dISO = toIsoDate(d);
                  if (s.startDate && dISO < s.startDate) continue;
                  if (s.endDate && dISO > s.endDate) continue;
                  if (s.excludedDates && s.excludedDates.includes(dISO)) continue;
                  return true;
                }
              }
            }
            return false;
          });
        };

        const listSchedules = filterSchedulesByDateRange(studentSchedules, dateOnly, dateOnly);

        // Dedup by id
        const seenIds = new Set<string>();
        const uniqueList = listSchedules.filter((s) => {
          if (seenIds.has(s.id)) return false;
          seenIds.add(s.id);
          return true;
        });

        const backendDayMap: Record<number, string> = {
          2: "Thứ hai",
          3: "Thứ ba",
          4: "Thứ tư",
          5: "Thứ năm",
          6: "Thứ sáu",
          7: "Thứ bảy",
          8: "Chủ nhật",
        };

        const mapped: DayScheduleItem[] = uniqueList.map((s) => ({
          id: s.id,
          courseName: s.subjectName,
          teacher: s.teacherName,
          time: `${s.startTime} - ${s.endTime}`,
          room: s.room,
          scheduleType: s.scheduleType,
          pattern: s.pattern,
          date: s.date,
          dayOfWeekStr: s.dayOfWeek ? backendDayMap[s.dayOfWeek] : undefined,
        }));

        // Slot-level dedup
        const seenSlots = new Set<string>();
        const dedupedMapped = mapped.filter((item) => {
          const slotKey = `${item.courseName}|${item.teacher}|${item.time}|${item.room}|${dateOnly}`;
          if (seenSlots.has(slotKey)) return false;
          seenSlots.add(slotKey);
          return true;
        });

        setDaySchedules(dedupedMapped);

        // ── 2. Fetch month range cho MonthCalendar dots ──────────────────────
        if (isDesktop || timeFilter === "month") {
          const monthStart = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            1,
          );
          const monthEnd = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            0,
          );
          const monthSchedules = filterSchedulesByDateRange(
            studentSchedules,
            toIsoDate(monthStart),
            toIsoDate(monthEnd)
          );
          setRawSchedules(monthSchedules);
        } else {
          setRawSchedules(uniqueList);
        }

      } catch (error: any) {
        console.error("Error loading schedules for date:", error);
        // JWT hết hạn hoặc user không tồn tại trong DB → đăng xuất
        if (error?.status === 401) {
          await removeAuthToken();
          router.replace("/auth/login");
          return;
        }
        setDaySchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedulesForDate();
  }, [selectedDate, selectedView, timeFilter]);

  // ── Render schedule list (shared between mobile & desktop) ──────────────
  const renderScheduleList = () => {

    if (loading) {
      return (
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: cardPadding, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", paddingVertical: 40, flexDirection: "row", gap: 10 }}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={{ fontSize: 15, color: Colors.textSecondary }}>Đang tải lịch học...</Text>
        </View>
      );
    }
    if (daySchedules.length === 0) {
      return (
        <View style={{ backgroundColor: Colors.white, borderRadius: 24, padding: isDesktop ? 60 : 40, borderWidth: 1, borderColor: Colors.borderLight, alignItems: "center", justifyContent: "center", ...getWebShadow("lg") }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.infoLight, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ionicons name="sparkles" size={48} color={Colors.primary} />
          </View>
          <Text style={{ fontSize: isDesktop ? 22 : 18, fontWeight: "800", color: Colors.textHeading, marginBottom: 10, textAlign: "center" }}>
            {isToday ? "Hôm nay bạn được nghỉ!" : "Ngày này không có lịch học"}
          </Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: "center", maxWidth: 360, lineHeight: 22 }}>
            {isToday ? "Tận hưởng thời gian rảnh để nạp lại năng lượng nhé!" : "Không có lịch học hoặc lịch thi vào ngày này."}
          </Text>
          <TouchableOpacity
            onPress={() => setTimeFilter("week")}
            style={{ marginTop: 24, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8, ...getWebShadow("md"), ...getWebCursor() }}
          >
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Xem lịch tuần</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <>
        {paginatedSchedules.map((schedule) => (
          <TouchableOpacity
            key={schedule.id}
            activeOpacity={0.8}
            onPress={() => { setSelectedSchedule(schedule); setModalVisible(true); }}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 20,
              padding: cardPadding,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: Colors.border,
              borderLeftWidth: 4,
              borderLeftColor: schedule.scheduleType === "EXAM" ? Colors.error : Colors.primary,
              ...getWebShadow("md"),
              ...getWebCursor(),
            }}
          >
            {/* Top row: course name + type badge + day */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <Text style={{ fontSize: isMobile ? 15 : 17, fontWeight: "700", color: Colors.textHeading, flex: 1, marginRight: 8 }} numberOfLines={2}>
                {schedule.courseName}
              </Text>
              <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                {schedule.scheduleType === "EXAM" && (
                  <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.error }}>THI</Text>
                  </View>
                )}
                {timeFilter !== "day" && schedule.dayOfWeekStr && (
                  <View style={{ backgroundColor: Colors.infoLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.primary }}>{schedule.dayOfWeekStr}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Teacher row */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.infoLight, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="person" size={14} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 13, color: Colors.textHeading, fontWeight: "500" }}>{schedule.teacher.replace("GV: ", "")}</Text>
            </View>

            {/* Time & Room */}
            <View style={{ backgroundColor: Colors.surface, borderRadius: 10, padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="time-outline" size={16} color={Colors.primary} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.textHeading }}>{schedule.time}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="business-outline" size={16} color={Colors.success} />
                <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textHeading }}>{schedule.room.replace("Phòng: ", "")}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              disabled={page === 1}
              onPress={() => setPage((p) => p - 1)}
              style={[{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border, ...getWebShadow("sm"), ...getWebCursor() }, page === 1 && { opacity: 0.4, backgroundColor: Colors.gray100 }]}
            >
              <Ionicons name="chevron-back" size={20} color={page === 1 ? Colors.textSecondary : Colors.primary} />
            </TouchableOpacity>
            <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.white, borderRadius: 20, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.textSecondary }}>Trang {page} / {totalPages}</Text>
            </View>
            <TouchableOpacity
              disabled={page === totalPages}
              onPress={() => setPage((p) => p + 1)}
              style={[{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border, ...getWebShadow("sm"), ...getWebCursor() }, page === totalPages && { opacity: 0.4, backgroundColor: Colors.gray100 }]}
            >
              <Ionicons name="chevron-forward" size={20} color={page === totalPages ? Colors.textSecondary : Colors.primary} />

            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="light" />

      {/* ─── Desktop: Calendar App Layout ─── */}
      {isDesktop ? (
        <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#F8FAFC" }}>

          {/* ── LEFT PANEL: MonthCalendar (sticky) ── */}
          <View
            style={{
              width: 300,
              flexShrink: 0,
              backgroundColor: Colors.white,
              borderRightWidth: 1,
              borderRightColor: Colors.border,
              ...(Platform.OS === "web"
                ? { position: "sticky" as any, top: 0, height: "100vh" as any, overflowY: "auto" as any }
                : { alignSelf: "flex-start" }
              ),
            }}
          >
            {/* Panel header */}
            <LinearGradient
              colors={["#1E3A8A", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="calendar" size={18} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 }}>Thời khóa biểu</Text>
                  <Text style={{ fontSize: 17, fontWeight: "800", color: "#fff" }}>Lịch học của tôi</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Month calendar — always show, dùng rawSchedules để hiển thị dots */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <MonthCalendar
                schedules={rawSchedules as any}
                selectedISO={toIsoDate(selectedDate)}
                onSelectDay={(iso) => {
                  setSelectedDate(isoToDate(iso));
                }}
                themeColor={BLUE}
              />

              {/* Divider + quick stats */}
              <View style={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}>
                <View style={{ height: 1, backgroundColor: Colors.border, marginBottom: 16 }} />
                <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Ngày đang chọn</Text>
                <View style={{ backgroundColor: Colors.infoLight, borderRadius: 12, padding: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.primary }}>{dateStr}</Text>
                  {isToday && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary }} />
                      <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: "600" }}>Hôm nay</Text>
                    </View>
                  )}
                </View>

                {/* Jump to today */}
                {!isToday && (
                  <TouchableOpacity
                    onPress={() => setSelectedDate(new Date())}
                    style={{ marginTop: 10, alignItems: "center", paddingVertical: 8, backgroundColor: Colors.infoLight, borderRadius: 10, ...getWebCursor() }}
                  >
                    <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: "600" }}>↩ Về hôm nay</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>

          {/* ── RIGHT PANEL: Weekly timetable ── */}
          <View style={{ flex: 1, overflow: "hidden" }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            >
              {/* WeeklySchedule tự fetch + có sẵn filter Tất cả/Lịch học/Lịch thi + nav tuần */}
              {/* targetDate: khi MonthCalendar chọn ngày → WeeklySchedule tự navigate đến tuần chứa ngày đó */}
              <WeeklySchedule targetDate={selectedDate} />

            </ScrollView>
          </View>
        </View>
      ) : (
        /* ─── Mobile / Tablet layout ─── */
        <View style={{ flex: 1 }}>

          {/* ── Fixed Header (gradient) ── */}
          <LinearGradient
            colors={["#1E3A8A", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: isMobile ? 52 : 36,
              paddingHorizontal: paddingHorizontal,
              paddingBottom: 16,
              shadowColor: "#1E3A8A",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Title row */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="calendar" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "500" }}>Thời khóa biểu</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }} numberOfLines={1}>{dateStr}</Text>
              </View>
              {isToday && (
                <View style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ fontSize: 12, color: "#fff", fontWeight: "700" }}>Hôm nay</Text>
                </View>
              )}
            </View>

            {/* ── Time filter: Ngày / Tuần / Tháng ── */}
            <View style={{ flexDirection: "row", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 14, padding: 4, gap: 4 }}>
              {[
                { id: "day", label: "Ngày", icon: "today-outline" },
                { id: "week", label: "Tuần", icon: "calendar-outline" },
                { id: "month", label: "Tháng", icon: "calendar-number-outline" },
              ].map((f) => {
                const isActive = timeFilter === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setTimeFilter(f.id as any)}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: isActive ? "#fff" : "transparent",
                      ...getWebCursor(),
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={f.icon as any}
                      size={15}
                      color={isActive ? Colors.primary : "rgba(255,255,255,0.85)"}
                    />
                    <Text style={{
                      fontSize: 13,
                      fontWeight: isActive ? "800" : "600",
                      color: isActive ? Colors.primary : "rgba(255,255,255,0.85)",
                    }}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>

          {/* ── Type filter bar (below header, sticky) ── */}
          <View style={{
            flexDirection: "row",
            backgroundColor: Colors.white,
            paddingHorizontal: paddingHorizontal,
            paddingVertical: 10,
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            {[
              { id: "all", label: "Tất cả", icon: "apps-outline" },
              { id: "class", label: "Lịch học", icon: "book-outline" },
              { id: "exam", label: "Lịch thi", icon: "document-text-outline" },
            ].map((tab) => {
              const isActive = selectedView === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setSelectedView(tab.id as any)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: isActive ? Colors.infoLight : Colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? Colors.primary : Colors.border,
                    ...getWebCursor(),
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={14}
                    color={isActive ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? Colors.primary : Colors.textSecondary,
                  }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Scrollable content ── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal, paddingTop: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Calendar component for week/month */}
            {timeFilter !== "day" && (
              <View style={{ marginBottom: 16 }}>
                {timeFilter === "month" ? (
                  <MonthCalendar
                    schedules={rawSchedules as any}
                    selectedISO={toIsoDate(selectedDate)}
                    onSelectDay={(iso) => setSelectedDate(isoToDate(iso))}
                    themeColor={BLUE}
                  />
                ) : (
                  <WeeklyCalendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    onPrevWeek={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); }}
                    onNextWeek={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); }}
                  />
                )}
              </View>
            )}

            {/* Day mode: prev/next nav + jump to today */}
            {timeFilter === "day" && (
              <View style={{ marginBottom: 16 }}>
                {/* Date navigator */}
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: Colors.white,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  overflow: "hidden",
                  ...getWebShadow("sm"),
                }}>
                  <TouchableOpacity
                    onPress={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }}
                    style={{ padding: 14, alignItems: "center", justifyContent: "center", ...getWebCursor() }}
                  >
                    <Ionicons name="chevron-back" size={20} color={Colors.primary} />
                  </TouchableOpacity>

                  <View style={{ flex: 1, alignItems: "center", paddingVertical: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: Colors.textHeading }}>{dateStr}</Text>
                    {isToday ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary }} />
                        <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: "600" }}>Hôm nay</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setSelectedDate(new Date())}
                        style={{ marginTop: 3, ...getWebCursor() }}
                      >
                        <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: "600" }}>↩ Về hôm nay</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }}
                    style={{ padding: 14, alignItems: "center", justifyContent: "center", ...getWebCursor() }}
                  >
                    <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* List header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textHeading }}>
                {timeFilter === "day" ? "Lịch trong ngày" : timeFilter === "week" ? "Lịch trong tuần" : "Lịch trong tháng"}
              </Text>
              {!loading && (
                <View style={{ backgroundColor: Colors.infoLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.primary }}>{daySchedules.length} lịch</Text>
                </View>
              )}
            </View>

            {renderScheduleList()}
          </ScrollView>
        </View>

      )}

      {/* Schedule Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>

        <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 16 }} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={{ width: "100%", maxWidth: 380, backgroundColor: Colors.white, borderRadius: 20, padding: 24, ...getWebShadow("lg") }}>
            {selectedSchedule && (
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: Colors.textHeading, lineHeight: 28, marginBottom: 4 }}>{selectedSchedule.courseName}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: selectedSchedule.scheduleType === "EXAM" ? "#FEE2E2" : Colors.infoLight }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: selectedSchedule.scheduleType === "EXAM" ? Colors.error : Colors.primary }}>
                          {selectedSchedule.scheduleType === "EXAM" ? "LỊCH THI" : "LỊCH HỌC"}
                        </Text>
                      </View>
                      {selectedSchedule.dayOfWeekStr && <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{selectedSchedule.dayOfWeekStr}</Text>}
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                    <Ionicons name="close" size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={{ gap: 16 }}>
                  {[
                    { icon: "person-outline", label: "Giảng viên", value: selectedSchedule.teacher.replace("GV: ", "") },
                    { icon: "business-outline", label: "Phòng học", value: selectedSchedule.room.replace("Phòng: ", "") },
                    { icon: "time-outline", label: "Thời gian", value: selectedSchedule.time },
                  ].map((row) => (
                    <View key={row.label} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                      <Ionicons name={row.icon as any} size={20} color={Colors.textSecondary} style={{ marginTop: 2 }} />
                      <View>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 2 }}>{row.label}</Text>
                        <Text style={{ fontSize: 15, fontWeight: "500", color: Colors.textHeading }}>{row.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

