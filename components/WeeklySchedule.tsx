import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Colors } from "@/constants/colors";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";
import { getSlotIndexFromStartTime } from "@/constants/scheduleSlots";
import { scheduleService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import type { Schedule } from "@/apis/services/schedule.service";
import { Ionicons } from "@expo/vector-icons";

interface ScheduleItem {
  id: string;
  subject: string;
  code: string;
  sessions: string;
  room: string;
  teacher: string;
  type: "theory" | "practice" | "exam" | "makeup";
}

/** Cột giống lịch thật: Sáng (tiết 1-6), Chiều (7-12), Tối (13-15). Data map theo giờ vào đúng ca. */
interface DaySchedule {
  [dayName: string]: {
    morning?: ScheduleItem[];
    afternoon?: ScheduleItem[];
    evening?: ScheduleItem[];
  };
}

export default function WeeklySchedule() {
  const [selectedView, setSelectedView] = useState<"all" | "class" | "exam">(
    "all",
  );
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isChangingWeek, setIsChangingWeek] = useState(false);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule>({});
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const { width: windowWidth } = useWindowDimensions();

  // Responsive breakpoints
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Responsive values
  const columnMinWidth = isMobile ? 180 : 240;
  const headerPadding = isMobile ? 10 : 14;
  const headerFontSize = isMobile ? 13 : 15;
  const dayFontSize = isMobile ? 12 : 14;
  const periodFontSize = isMobile ? 12 : 14;

  // Data theo giờ (11:00, 13:30...) → map đúng ca Sáng/Chiều/Tối (tiết 1-6 sáng, 7-12 chiều, 13-15 tối)
  const convertSchedulesToDaySchedule = (
    schedules: Schedule[],
  ): DaySchedule => {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const scheduleMap: DaySchedule = {};
    dayNames.forEach((d) => {
      scheduleMap[d] = { morning: [], afternoon: [], evening: [] };
    });

    schedules.forEach((s: Schedule) => {
      const dayIndex = s.dayOfWeek === 8 ? 0 : (s.dayOfWeek ?? 2) - 1;
      const dayName = dayNames[dayIndex] ?? "monday";
      const slotIndex = getSlotIndexFromStartTime(s.startTime ?? "");
      
      // Phân bổ ca dựa trên giờ thực tế (đảm bảo 16h30 là Chiều, và các giờ tối > 18h là Tối)
      let period: "morning" | "afternoon" | "evening" = "morning";
      const h = parseInt((s.startTime ?? "0").split(":")[0], 10);
      if (h >= 18) period = "evening";
      else if (h >= 12) period = "afternoon";
      else period = "morning";

      const itemType: "theory" | "practice" | "exam" | "makeup" =
        s.scheduleType === "EXAM" ? "exam" : "theory";
      const row = scheduleMap[dayName];
      if (row?.[period])
        row[period].push({
          id: s.id,
          subject: s.subjectName,
          code: `${s.classCode} - ${s.subjectCode}`,
          sessions: `${s.startTime ?? ""} - ${s.endTime ?? ""}`,
          room: `Phòng: ${s.room}`,
          teacher: `GV: ${s.teacherName}`,
          type: itemType,
        } as ScheduleItem);
    });

    // Sắp xếp các môn trong mỗi ca theo giờ bắt đầu
    Object.keys(scheduleMap).forEach((day) => {
      const row = scheduleMap[day];
      if (row.morning) row.morning.sort((a, b) => a.sessions.localeCompare(b.sessions));
      if (row.afternoon) row.afternoon.sort((a, b) => a.sessions.localeCompare(b.sessions));
      if (row.evening) row.evening.sort((a, b) => a.sessions.localeCompare(b.sessions));
    });

    return scheduleMap;
  };

  // Helper function to apply filter and update schedule
  const applyFilter = (
    schedules: Schedule[],
    view: "all" | "class" | "exam",
  ) => {
    // Filter schedules
    const filtered = schedules.filter((s: Schedule) => {
      if (view === "all") return true;
      if (view === "class") return s.scheduleType !== "EXAM";
      if (view === "exam") return s.scheduleType === "EXAM";
      return true;
    });

    // Convert filtered schedules to DaySchedule format
    return convertSchedulesToDaySchedule(filtered);
  };

  // Load schedules từ backend
  useEffect(() => {
    loadSchedules();
  }, [currentWeek]);

  // Filter schedules based on selectedView and allSchedules
  useEffect(() => {
    if (allSchedules.length === 0 && !isChangingWeek) {
      setWeeklySchedule({});
      return;
    }

    // Smooth fade transition khi đổi tuần hoặc filter
    Animated.timing(fadeAnim, {
      toValue: 0.4,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      // Apply filter
      const scheduleMap = applyFilter(allSchedules, selectedView);
      console.log(
        `🔍 Filtered schedules (${selectedView}):`,
        Object.keys(scheduleMap).length,
        "days",
      );
      setWeeklySchedule(scheduleMap);

      // Reset changing week flag
      setIsChangingWeek(false);

      // Fade in animation - mượt hơn
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedView, allSchedules, isChangingWeek]);

  const loadSchedules = async () => {
    try {
      // Chỉ hiển thị loading indicator lớn khi lần đầu load, không hiển thị khi đổi tuần
      if (!isChangingWeek) {
        setLoading(true);
      }
      console.log("📅 Loading weekly schedules...");

      // Tính khoảng ngày của tuần hiện tại (fromDate, toDate - yyyy-MM-dd)
      const startDate = new Date(currentWeek);
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      startDate.setDate(diff);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const toIsoDate = (d: Date) => {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const day = d.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const fromDate = toIsoDate(startDate);
      const toDate = toIsoDate(endDate);

      const params: {
        classId?: string;
        classIds?: string[];
        scheduleType?: "CLASS" | "EXAM";
        fromDate?: string;
        toDate?: string;
      } = { fromDate, toDate };

      // /users/me trả về enrolledClassIds (1 SV nhiều môn) hoặc classId
      try {
        const { authService } = await import("@/apis");
        const currentUser = await authService.getCurrentUser();
        if (currentUser?.enrolledClassIds?.length) {
          params.classIds = currentUser.enrolledClassIds;
          console.log(
            "👨‍🎓 Student enrolledClassIds:",
            currentUser.enrolledClassIds.length,
            "classes",
          );
        } else if (currentUser?.classId) {
          params.classId = currentUser.classId;
          console.log("👨‍🎓 Current student classId:", currentUser.classId);
        } else {
          console.log(
            "⚠️ Không có classId/enrolledClassIds, sẽ load toàn bộ lịch",
          );
        }
      } catch (err) {
        console.warn("⚠️ Không lấy được user, sẽ load toàn bộ lịch:", err);
      }

      if (selectedView === "class") {
        params.scheduleType = "CLASS";
      } else if (selectedView === "exam") {
        params.scheduleType = "EXAM";
      }

      // Nếu không có scheduleType (Tất cả) thì backend trả full, FE chỉ group theo ngày/ca
      const allSchedules = await scheduleService.getSchedules(params);

      console.log("✅ Loaded schedules:", allSchedules.length);
      console.log("📅 Current week:", formatWeekRange());

      // Store all schedules for filtering
      // Filter effect will automatically apply selectedView filter
      setAllSchedules(allSchedules);
    } catch (error: any) {
      console.error("❌ Error loading schedules:", error);
      setWeeklySchedule({});
      setIsChangingWeek(false);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "theory":
        return Colors.success; 
      case "practice":
        return Colors.primary;
      case "exam":
        return Colors.error;
      case "makeup":
        return Colors.warning;
      default:
        return Colors.gray500;
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case "theory":
        return Colors.successLight;
      case "practice":
        return Colors.infoLight;
      case "exam":
        return Colors.errorLight;
      case "makeup":
        return Colors.warningLight;
      default:
        return Colors.gray100;
    }
  };

  const formatWeekRange = () => {
    const startDate = new Date(currentWeek);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startDate.setDate(diff);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Sunday

    return `${startDate.getDate().toString().padStart(2, "0")}/${(startDate.getMonth() + 1).toString().padStart(2, "0")} - ${endDate.getDate().toString().padStart(2, "0")}/${(endDate.getMonth() + 1).toString().padStart(2, "0")}/${endDate.getFullYear()}`;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    // Smooth fade out trước khi đổi tuần
    setIsChangingWeek(true);
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Đổi tuần sau khi fade out
      const newDate = new Date(currentWeek);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      setCurrentWeek(newDate);
      // loadSchedules sẽ được trigger bởi useEffect, và fade in sẽ được handle bởi filter effect
    });
  };

  const renderScheduleCell = (
    day: string,
    period: "morning" | "afternoon" | "evening",
  ) => {
    const schedules = weeklySchedule[day]?.[period] || [];
    const isToday = day === ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];

    return (
      <View
        key={`${day}-${period}`}
        style={{
          flex: 1,
          minWidth: columnMinWidth,
          minHeight: 120,
          padding: 10,
          borderRightWidth: 1,
          borderRightColor: Colors.border,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          backgroundColor: isToday ? "rgba(59, 130, 246, 0.02)" : (schedules.length > 0 ? Colors.white : Colors.surface),
        }}
      >
        {schedules.length === 0 ? (
          <View style={{ flex: 1, opacity: 0.3, alignItems: "center", justifyContent: "center" }}>
             {/* Subtle indicator for empty cell */}
          </View>
        ) : (
          schedules.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={{
                backgroundColor: getTypeBgColor(item.type),
                borderLeftWidth: 4,
                borderLeftColor: getTypeColor(item.type),
                padding: 10,
                borderRadius: 10,
                marginBottom: idx < schedules.length - 1 ? 10 : 0,
                ...getWebShadow("sm"),
                ...getWebCursor(),
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: Colors.textHeading,
                  marginBottom: 4,
                }}
                numberOfLines={2}
              >
                {item.subject}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                 <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                 <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "500" }}>
                   {item.room.replace("Phòng: ", "")}
                 </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                 <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
                 <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "500" }}>
                   {item.sessions}
                 </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  return (
    <View style={{ marginBottom: 24, width: "100%" }}>
      {/* Loading Indicator */}
      {loading && (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={{ marginTop: 8, color: "#6B7280", fontSize: 13 }}>
            Đang tải lịch học...
          </Text>
        </View>
      )}

      {/* Header Controls */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: isMobile ? 12 : 16,
          marginBottom: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <Text
          style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: "bold",
            color: "#111827",
            marginBottom: 12,
          }}
        >
          Lịch học, lịch thi theo tuần
        </Text>

        <View
          style={{
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* View Filter Buttons */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: Colors.gray100,
              borderRadius: 12,
              padding: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedView("all")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: selectedView === "all" ? Colors.white : "transparent",
                ... (selectedView === "all" ? getWebShadow("sm") : {}),
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: selectedView === "all" ? Colors.primary : Colors.textSecondary,
                }}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedView("class")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: selectedView === "class" ? Colors.white : "transparent",
                ... (selectedView === "class" ? getWebShadow("sm") : {}),
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: selectedView === "class" ? Colors.primary : Colors.textSecondary,
                }}
              >
                Lịch học
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedView("exam")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: selectedView === "exam" ? Colors.white : "transparent",
                ... (selectedView === "exam" ? getWebShadow("sm") : {}),
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: selectedView === "exam" ? Colors.primary : Colors.textSecondary,
                }}
              >
                Lịch thi
              </Text>
            </TouchableOpacity>
          </View>

          {/* Week Navigation */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              justifyContent: isMobile ? "center" : "flex-end",
            }}
          >
            <TouchableOpacity
              onPress={() => navigateWeek("prev")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: Colors.white,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: Colors.border,
                ...getWebShadow("sm"),
                ...getWebCursor(),
              }}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.textHeading} />
            </TouchableOpacity>

            <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.white, borderRadius: 20, borderWidth: 1, borderColor: Colors.border }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: Colors.textHeading,
                  textAlign: "center",
                }}
              >
                {formatWeekRange()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigateWeek("next")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: Colors.white,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: Colors.border,
                ...getWebShadow("sm"),
                ...getWebCursor(),
              }}
            >
              <Ionicons name="chevron-forward" size={20} color={Colors.textHeading} />
            </TouchableOpacity>
          </View>
        </View>
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
          <Text style={{ fontSize: 20 }}>👉</Text>
          <Text style={{ fontSize: 12, color: "#1E40AF", flex: 1 }}>
            Vuốt sang ngang để xem lịch các ngày khác
          </Text>
        </View>
      )}

      {/* Schedule Table */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={Platform.OS === "web"}
          style={{
            backgroundColor: Colors.white,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors.border,
            ...getWebShadow("md"),
          }}
          contentContainerStyle={{
            minWidth: "100%",
          }}
        >
          <View style={{ minWidth: "100%" }}>
            {/* Table Header */}
            <View style={{ flexDirection: "row", backgroundColor: "#F9FAFB" }}>
              <View
                style={{
                  width: isMobile ? 80 : 120,
                  padding: headerPadding,
                  borderRightWidth: 1,
                  borderRightColor: "#D1D5DB",
                  borderBottomWidth: 2,
                  borderBottomColor: "#D1D5DB",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: headerFontSize,
                    fontWeight: "700",
                    color: "#111827",
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
                    borderRightColor: "#D1D5DB",
                    borderBottomWidth: 2,
                    borderBottomColor: "#D1D5DB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: dayFontSize,
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    {isMobile ? day.replace("Thứ ", "T") : day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Cột giống lịch thật: Sáng (tiết 1-6), Chiều (7-12), Tối (13-15). Data map theo giờ vào đúng ca. */}
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: isMobile ? 80 : 120,
                  padding: headerPadding,
                  borderRightWidth: 1,
                  borderRightColor: "#D1D5DB",
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  backgroundColor: "#FFFBEB",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 100,
                }}
              >
                <Text
                  style={{
                    fontSize: periodFontSize,
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
                  borderRightColor: "#D1D5DB",
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  backgroundColor: "#FEF3C7",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 100,
                }}
              >
                <Text
                  style={{
                    fontSize: periodFontSize,
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
                  borderRightColor: "#D1D5DB",
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  backgroundColor: "#DBEAFE",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 100,
                }}
              >
                <Text
                  style={{
                    fontSize: periodFontSize,
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
      </Animated.View>

      {/* Legend */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 16,
          marginTop: 12,
          paddingHorizontal: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#D1FAE5",
              borderRadius: 3,
            }}
          />
          <Text style={{ fontSize: 12, color: "#6B7280" }}>
            Lịch học lý thuyết
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#DBEAFE",
              borderRadius: 3,
            }}
          />
          <Text style={{ fontSize: 12, color: "#6B7280" }}>
            Lịch học thực hành
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#FEE2E2",
              borderRadius: 3,
            }}
          />
          <Text style={{ fontSize: 12, color: "#6B7280" }}>Lịch thi</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#FEF3C7",
              borderRadius: 3,
            }}
          />
          <Text style={{ fontSize: 12, color: "#6B7280" }}>Lịch tạm ngưng</Text>
        </View>
      </View>
    </View>
  );
}
