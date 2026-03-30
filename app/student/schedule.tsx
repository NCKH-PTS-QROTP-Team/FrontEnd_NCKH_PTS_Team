import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { MonthCalendar, todayISO, isoToDate } from "@/components/MonthCalendar";
import { CalendarIcon } from "@/components/Icons";
import { useRouter } from "expo-router";
import { scheduleService, authService } from "@/apis";
import { removeAuthToken } from "@/apis/config/apiClient";
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
  const PAGE_SIZE = 15;

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 800 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const cardPadding = isDesktop ? 24 : 16;

  const BLUE = "#3b82f6";

  const HEADER_MAX_HEIGHT = isDesktop ? 180 : isMobile ? 200 : 190;
  const HEADER_MIN_HEIGHT = isMobile ? 120 : HEADER_MAX_HEIGHT;
  const HEADER_SCROLL_DISTANCE = Math.max(
    1,
    HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
  );

  const headerHeight = isMobile
    ? scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: "clamp",
      })
    : HEADER_MAX_HEIGHT;

  const contentOpacity = isMobile
    ? scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 0.2, 0],
        extrapolate: "clamp",
      })
    : 1;

  const contentTranslateY = isMobile
    ? scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -10],
        extrapolate: "clamp",
      })
    : 0;

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

        // Lấy thông tin user hiện tại để biết classId
        const currentUser = await authService.getCurrentUser();

        // ── 1. LUÔN fetch list với fromDate=toDate=selectedDate ─────────────
        // Backend tự xử lý đúng ngày cho cả RECURRING_WEEKLY (dayOfWeek) và
        // ONE_TIME (date). Không filter client-side → tránh lỗi convention và
        // duplicate do có cả RECURRING + ONE_TIME cho cùng buổi.
        const baseParams: {
          scheduleType?: "CLASS" | "EXAM";
          fromDate?: string;
          toDate?: string;
          classId?: string;
          classIds?: string[];
        } = {};

        // 1 SV nhiều môn: ưu tiên enrolledClassIds, không có thì classId
        if (currentUser?.enrolledClassIds?.length) {
          baseParams.classIds = currentUser.enrolledClassIds;
        } else if (currentUser?.classId) {
          baseParams.classId = currentUser.classId;
        }

        if (selectedView === "class") {
          baseParams.scheduleType = "CLASS";
        } else if (selectedView === "exam") {
          baseParams.scheduleType = "EXAM";
        }

        const listSchedules = await scheduleService.getSchedules({
          ...baseParams,
          fromDate: dateOnly,
          toDate: dateOnly,
        });

        // Dedup by id (phòng backend trả trùng)
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

        // Slot-level dedup: tránh hiển thị trùng buổi khi DB có cả recurring + one-time cùng khung giờ.
        const seenSlots = new Set<string>();
        const dedupedMapped = mapped.filter((item) => {
          const slotKey = `${item.courseName}|${item.teacher}|${item.time}|${item.room}|${dateOnly}`;
          if (seenSlots.has(slotKey)) return false;
          seenSlots.add(slotKey);
          return true;
        });

        setDaySchedules(dedupedMapped);

        // ── 2. Fetch month range chỉ cho MonthCalendar dots ─────────────────
        if (timeFilter === "month") {
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
          const monthSchedules = await scheduleService.getSchedules({
            ...baseParams,
            fromDate: toIsoDate(monthStart),
            toDate: toIsoDate(monthEnd),
          });
          setRawSchedules(monthSchedules);
        } else {
          // week/day: WeeklyCalendar không dùng schedule data (chỉ là date picker)
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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="light" />

      {/* ── Parallax Animated Hero Header ── */}
      <Animated.View
        style={{
          paddingTop: isMobile ? 48 : 64,
          paddingHorizontal: paddingHorizontal,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          zIndex: 10,
          overflow: "hidden",
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={["#1E3A8A", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            flex: 1,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="calendar" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  marginBottom: 2,
                  fontWeight: "500",
                }}
              >
                {isToday ? "Hôm nay" : "Ngày đang chọn"}
              </Text>
              <Text
                style={{ fontSize: 20, fontWeight: "800", color: "#fff" }}
                numberOfLines={1}
              >
                {dateStr}
              </Text>
            </View>
          </View>

          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            }}
          >
            {/* Filter Tabs in Header */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: 4,
                marginTop: 8,
              }}
            >
              {[
                { id: "all", label: "Tất cả" },
                { id: "class", label: "Lịch học" },
                { id: "exam", label: "Lịch thi" },
              ].map((tab) => {
                const isActive = selectedView === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setSelectedView(tab.id as any)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      alignItems: "center",
                      borderRadius: 10,
                      backgroundColor: isActive ? "#fff" : "transparent",
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? "700" : "600",
                        color: isActive ? BLUE : "rgba(255,255,255,0.8)",
                      }}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal,
          paddingTop: HEADER_MAX_HEIGHT + 24,
          paddingBottom: isDesktop ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Calendar Views */}
          {timeFilter !== "day" && (
            <View style={{ marginBottom: isDesktop ? 24 : 20 }}>
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
                  onPrevWeek={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() - 7);
                    setSelectedDate(d);
                  }}
                  onNextWeek={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + 7);
                    setSelectedDate(d);
                  }}
                />
              )}
            </View>
          )}

          {/* Schedule List Header with Time Filters */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: isDesktop ? 16 : 12,
            }}
          >
            <Text
              style={{
                fontSize: isMobile ? 16 : 18,
                lineHeight: isMobile ? 24 : 28,
                fontWeight: "700",
                color: Colors.textHeading,
              }}
            >
              Danh sách lịch học
            </Text>

            <View style={{ flexDirection: "row", gap: 6 }}>
              {["day", "week", "month"].map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setTimeFilter(f as "day" | "week" | "month")}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: timeFilter === f ? BLUE : Colors.white,
                    borderWidth: 1,
                    borderColor: timeFilter === f ? BLUE : Colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: timeFilter === f ? Colors.white : Colors.text,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {f === "day" ? "Ngày" : f === "week" ? "Tuần" : "Tháng"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            {loading ? (
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 12,
                  padding: cardPadding,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 32,
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    color: Colors.textSecondary,
                  }}
                >
                  Đang tải lịch học...
                </Text>
              </View>
            ) : daySchedules.length === 0 ? (
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 12,
                  padding: cardPadding,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 40,
                }}
              >
                <View style={{ marginBottom: 12 }}>
                  <CalendarIcon size={40} color={Colors.primary} />
                </View>
                <Text
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    lineHeight: isMobile ? 20 : 24,
                    fontWeight: "600",
                    color: Colors.text,
                    marginBottom: 4,
                  }}
                >
                  Không có lịch học
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    lineHeight: isMobile ? 18 : 20,
                    color: Colors.textSecondary,
                  }}
                >
                  Không có lịch học {isToday ? "hôm nay" : "ngày này"}
                </Text>
              </View>
            ) : (
              <>
                {paginatedSchedules.map((schedule, index) => (
                  <TouchableOpacity
                    key={schedule.id}
                    activeOpacity={0.95}
                    style={{
                      backgroundColor: Colors.white,
                      borderRadius: 12,
                      padding: cardPadding,
                      marginBottom:
                        index < paginatedSchedules.length - 1
                          ? isDesktop
                            ? 12
                            : 10
                          : 0,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    {/* Course Name & Day of Week */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: isMobile ? 6 : 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isMobile ? 16 : 18,
                          lineHeight: isMobile ? 24 : 28,
                          fontWeight: "600",
                          color: Colors.textHeading,
                          flex: 1,
                        }}
                      >
                        {schedule.courseName}
                      </Text>
                      {timeFilter !== "day" && schedule.dayOfWeekStr && (
                        <View
                          style={{
                            backgroundColor: "#eff6ff",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            marginLeft: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: BLUE,
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {schedule.dayOfWeekStr}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Teacher */}
                    <Text
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        lineHeight: isMobile ? 20 : 21,
                        color: Colors.textLight,
                        marginBottom: isMobile ? 10 : 12,
                      }}
                    >
                      {schedule.teacher}
                    </Text>

                    {/* Time & Room */}
                    <View
                      style={{ flexDirection: "row", alignItems: "flex-start" }}
                    >
                      {/* Blue vertical line */}
                      <View
                        style={{
                          width: 3,
                          height: isMobile ? 40 : 44,
                          backgroundColor: BLUE,
                          borderRadius: 2,
                          marginRight: isMobile ? 10 : 12,
                        }}
                      />

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: isMobile ? 15 : 16,
                            lineHeight: isMobile ? 22 : 24,
                            fontWeight: "500",
                            color: Colors.textHeading,
                            marginBottom: isMobile ? 2 : 4,
                          }}
                        >
                          {schedule.time}
                        </Text>
                        <Text
                          style={{
                            fontSize: isMobile ? 13 : 14,
                            lineHeight: isMobile ? 20 : 21,
                            color: Colors.textSecondary,
                          }}
                        >
                          Phòng: {schedule.room}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 16,
                      marginTop: 20,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        {
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#fff",
                          alignItems: "center",
                          justifyContent: "center",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        },
                        page === 1 && {
                          backgroundColor: "#f8fafc",
                          elevation: 0,
                        },
                      ]}
                      disabled={page === 1}
                      onPress={() => setPage((p) => p - 1)}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: page === 1 ? "#cbd5e1" : Colors.primary,
                        }}
                      >
                        {"<"}
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#64748b",
                      }}
                    >
                      Trang {page} / {totalPages}
                    </Text>

                    <TouchableOpacity
                      style={[
                        {
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#fff",
                          alignItems: "center",
                          justifyContent: "center",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        },
                        page === totalPages && {
                          backgroundColor: "#f8fafc",
                          elevation: 0,
                        },
                      ]}
                      disabled={page === totalPages}
                      onPress={() => setPage((p) => p + 1)}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color:
                            page === totalPages ? "#cbd5e1" : Colors.primary,
                        }}
                      >
                        {">"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
