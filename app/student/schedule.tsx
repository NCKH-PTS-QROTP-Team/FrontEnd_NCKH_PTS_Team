import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { CalendarIcon } from "@/components/Icons";
import { scheduleService, authService } from "@/apis";
import type { Schedule as ApiSchedule } from "@/apis/services/schedule.service";

interface DayScheduleItem {
  id: string;
  courseName: string;
  teacher: string;
  time: string;
  room: string;
}

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<"all" | "class" | "exam">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [daySchedules, setDaySchedules] = useState<DayScheduleItem[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 800 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const cardPadding = isDesktop ? 24 : 16;

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

        const params: {
          scheduleType?: "CLASS" | "EXAM";
          fromDate?: string;
          toDate?: string;
          classId?: string;
          classIds?: string[];
        } = {
          fromDate: dateOnly,
          toDate: dateOnly,
        };

        // 1 SV nhiều môn: ưu tiên enrolledClassIds, không có thì classId
        if (currentUser?.enrolledClassIds?.length) {
          params.classIds = currentUser.enrolledClassIds;
        } else if (currentUser?.classId) {
          params.classId = currentUser.classId;
        }

        if (selectedView === "class") {
          params.scheduleType = "CLASS";
        } else if (selectedView === "exam") {
          params.scheduleType = "EXAM";
        }

        const apiSchedules: ApiSchedule[] =
          await scheduleService.getSchedules(params);

        const mapped: DayScheduleItem[] = apiSchedules.map((s) => ({
          id: s.id,
          courseName: s.subjectName,
          teacher: s.teacherName,
          time: `${s.startTime} - ${s.endTime}`,
          room: s.room,
        }));

        setDaySchedules(mapped);
      } catch (error) {
        console.error("Error loading schedules for date:", error);
        setDaySchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedulesForDate();
  }, [selectedDate, selectedView]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: isDesktop ? 24 : 20,
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
          {/* Weekly Calendar (ngày trong tuần) */}
          {/* Weekly Calendar */}
          <View style={{ marginBottom: isDesktop ? 24 : 20 }}>
            <WeeklyCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </View>

          {/* Date Header + tabs lọc lịch */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: cardPadding,
              marginBottom: isDesktop ? 24 : 20,
              borderWidth: 1,
              borderColor: Colors.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              gap: 12,
            }}
          >
            {/* Date text */}
            <View>
              <Text
                style={{
                  fontSize: isMobile ? 12 : 14,
                  lineHeight: isMobile ? 18 : 20,
                  color: Colors.textLight,
                  marginBottom: 4,
                }}
              >
                {isToday ? "Hôm nay" : "Ngày đã chọn"}
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 20 : isDesktop ? 24 : 22,
                  lineHeight: isMobile ? 28 : isDesktop ? 32 : 30,
                  fontWeight: "700",
                  color: Colors.textHeading,
                }}
              >
                {dateStr}
              </Text>
            </View>

            {/* Tabs lọc: Tất cả / Lịch học / Lịch thi */}
            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <View
                style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedView("all")}
                  style={{
                    paddingHorizontal: isMobile ? 12 : 16,
                    paddingVertical: isMobile ? 6 : 8,
                    borderRadius: 999,
                    backgroundColor:
                      selectedView === "all" ? Colors.primary : "#F3F4F6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: "600",
                      color:
                        selectedView === "all" ? Colors.white : Colors.textLight,
                    }}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedView("class")}
                  style={{
                    paddingHorizontal: isMobile ? 12 : 16,
                    paddingVertical: isMobile ? 6 : 8,
                    borderRadius: 999,
                    backgroundColor:
                      selectedView === "class" ? Colors.primary : "#F3F4F6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: "600",
                      color:
                        selectedView === "class"
                          ? Colors.white
                          : Colors.textLight,
                    }}
                  >
                    Lịch học
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedView("exam")}
                  style={{
                    paddingHorizontal: isMobile ? 12 : 16,
                    paddingVertical: isMobile ? 6 : 8,
                    borderRadius: 999,
                    backgroundColor:
                      selectedView === "exam" ? Colors.primary : "#F3F4F6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: "600",
                      color:
                        selectedView === "exam"
                          ? Colors.white
                          : Colors.textLight,
                    }}
                  >
                    Lịch thi
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Schedule List */}
          <Text
            style={{
              fontSize: isMobile ? 16 : 18,
              lineHeight: isMobile ? 24 : 28,
              fontWeight: "700",
              color: Colors.textHeading,
              marginBottom: isDesktop ? 16 : 12,
            }}
          >
            Lịch học trong ngày
          </Text>

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
                    {/* Course Name */}
                    <Text
                      style={{
                        fontSize: isMobile ? 16 : 18,
                        lineHeight: isMobile ? 24 : 28,
                        fontWeight: "600",
                        color: Colors.textHeading,
                        marginBottom: isMobile ? 6 : 8,
                      }}
                    >
                      {schedule.courseName}
                    </Text>

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
                          backgroundColor: Colors.primary,
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20 }}>
                    <TouchableOpacity
                      style={[{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }, page === 1 && { backgroundColor: '#f8fafc', elevation: 0 }]}
                      disabled={page === 1}
                      onPress={() => setPage(p => p - 1)}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: page === 1 ? '#cbd5e1' : Colors.primary }}>{'<'}</Text>
                    </TouchableOpacity>

                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b' }}>Trang {page} / {totalPages}</Text>

                    <TouchableOpacity
                      style={[{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }, page === totalPages && { backgroundColor: '#f8fafc', elevation: 0 }]}
                      disabled={page === totalPages}
                      onPress={() => setPage(p => p + 1)}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: page === totalPages ? '#cbd5e1' : Colors.primary }}>{'>'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
