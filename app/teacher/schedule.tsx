import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import MobileGradientHeader from "@/components/MobileGradientHeader";
import {
  scheduleService,
  type Schedule,
} from "@/apis/services/schedule.service";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import {
  SLOT_LABELS,
  getSlotIndexFromStartTime,
} from "@/constants/scheduleSlots";
import Toast, { useToast } from "@/components/Toast";

const DAY_HEADERS = [
  { label: "T2", backend: 2 },
  { label: "T3", backend: 3 },
  { label: "T4", backend: 4 },
  { label: "T5", backend: 5 },
  { label: "T6", backend: 6 },
  { label: "T7", backend: 7 },
  { label: "CN", backend: 8 },
] as const;

type FilterView = "all" | "class" | "exam";

function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatWeekRange(baseDate: Date) {
  const start = startOfWeekMonday(baseDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("vi-VN")} - ${end.toLocaleDateString("vi-VN")}`;
}

function getScheduleAccent(type?: "CLASS" | "EXAM") {
  return type === "EXAM"
    ? { border: "#DC2626", bg: "#FEF2F2", text: "#7F1D1D" }
    : { border: "#2563EB", bg: "#EFF6FF", text: "#1E3A8A" };
}

export default function TeacherScheduleScreen() {
  const router = useRouter();
  const { showToast, hideToast, toast } = useToast();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 1024;
  const isWeb = Platform.OS === "web";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weekDate, setWeekDate] = useState(new Date());
  const [filterView, setFilterView] = useState<FilterView>("all");
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const contentPadding = isDesktop ? 24 : isMobile ? 16 : 20;
  const dayColumnWidth = isDesktop ? 188 : 160;

  const weekLabel = useMemo(() => formatWeekRange(weekDate), [weekDate]);

  const filteredSchedules = useMemo(() => {
    if (filterView === "all") return schedules;
    if (filterView === "exam")
      return schedules.filter((s) => s.scheduleType === "EXAM");
    return schedules.filter((s) => s.scheduleType !== "EXAM");
  }, [schedules, filterView]);

  const tableData = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const day of DAY_HEADERS) {
      for (let slotIndex = 0; slotIndex < SLOT_LABELS.length; slotIndex++) {
        map.set(`${day.backend}-${slotIndex}`, []);
      }
    }

    filteredSchedules.forEach((s) => {
      const day = s.dayOfWeek;
      if (!DAY_HEADERS.some((d) => d.backend === day)) return;
      const slotIndex = getSlotIndexFromStartTime(s.startTime || "");
      const key = `${day}-${slotIndex}`;
      const arr = map.get(key) || [];
      arr.push(s);
      map.set(key, arr);
    });

    return map;
  }, [filteredSchedules]);

  const loadWeeklySchedules = async (showPageLoading = true) => {
    try {
      if (showPageLoading) setLoading(true);
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) {
        showToast("Không tìm thấy thông tin giảng viên", "error");
        return;
      }

      const fromDate = toIsoDate(startOfWeekMonday(weekDate));
      const toDateObj = new Date(startOfWeekMonday(weekDate));
      toDateObj.setDate(toDateObj.getDate() + 6);
      const toDate = toIsoDate(toDateObj);

      const data = await scheduleService.getSchedules({
        teacherId,
        fromDate,
        toDate,
      });

      setSchedules(data || []);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải lịch theo tuần.";
      showToast(msg, "error");
    } finally {
      if (showPageLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklySchedules();
  }, [weekDate]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadWeeklySchedules(false);
    } finally {
      setRefreshing(false);
    }
  };

  const changeWeek = (delta: number) => {
    setWeekDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * 7);
      return next;
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F1F5F9" }}
        edges={["top"]}
      >
        <StatusBar style="dark" />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={{ marginTop: 10, color: Colors.textSecondary }}>
            Đang tải lịch theo tuần...
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
      <StatusBar style={isMobile ? "light" : "dark"} />

      {isMobile ? (
        <MobileGradientHeader
          title="Lịch theo tuần"
          subtitle={weekLabel}
          icon="calendar"
          actions={[
            {
              icon: "notifications",
              onPress: () => router.push("/teacher/notifications"),
              accessibilityLabel: "Mở thông báo",
            },
            {
              icon: "person",
              onPress: () => router.push("/teacher/profile"),
              accessibilityLabel: "Mở hồ sơ",
            },
          ]}
          style={{ marginHorizontal: 0, marginTop: 0, marginBottom: 12 }}
        />
      ) : null}

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
          paddingHorizontal: contentPadding,
          paddingTop: isMobile ? 0 : 14,
          paddingBottom: isMobile ? 108 : 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: 1400,
            width: "100%",
            alignSelf: "center",
            gap: 12,
          }}
        >
          {!isMobile ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                padding: 16,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}
              >
                Lịch theo tuần
              </Text>
              <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                {weekLabel}
              </Text>
            </View>
          ) : null}

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              padding: 12,
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
              <TouchableOpacity
                onPress={() => changeWeek(-1)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#EFF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="chevron-back" size={18} color="#1E3A8A" />
              </TouchableOpacity>

              <Text
                style={{ fontSize: 13, fontWeight: "700", color: "#1E293B" }}
              >
                {weekLabel}
              </Text>

              <TouchableOpacity
                onPress={() => changeWeek(1)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#EFF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="chevron-forward" size={18} color="#1E3A8A" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              {[
                { key: "all", label: "Tất cả" },
                { key: "class", label: "Lịch học" },
                { key: "exam", label: "Lịch thi" },
              ].map((item) => {
                const active = filterView === (item.key as FilterView);
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setFilterView(item.key as FilterView)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: active ? "#1E3A8A" : "#CBD5E1",
                      backgroundColor: active ? "#EFF6FF" : "#FFFFFF",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: active ? "#1E3A8A" : "#475569",
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: 108,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      paddingVertical: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F8FAFC",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#334155",
                      }}
                    >
                      Ca học
                    </Text>
                  </View>
                  {DAY_HEADERS.map((day) => (
                    <View
                      key={day.backend}
                      style={{
                        width: dayColumnWidth,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        paddingVertical: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#F8FAFC",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "800",
                          color: "#0F172A",
                        }}
                      >
                        {day.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {SLOT_LABELS.map((slotLabel, slotIdx) => (
                  <View key={slotLabel} style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        width: 108,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        paddingHorizontal: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#F8FAFC",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#334155",
                        }}
                      >
                        {slotLabel}
                      </Text>
                    </View>

                    {DAY_HEADERS.map((day) => {
                      const cellSchedules =
                        tableData.get(`${day.backend}-${slotIdx}`) || [];

                      return (
                        <View
                          key={`${day.backend}-${slotIdx}`}
                          style={{
                            width: dayColumnWidth,
                            minHeight: 94,
                            borderWidth: 1,
                            borderColor: "#E2E8F0",
                            padding: 6,
                            backgroundColor:
                              cellSchedules.length > 0 ? "#FFFFFF" : "#FAFAFA",
                          }}
                        >
                          {cellSchedules.length === 0 ? (
                            <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                              Trống
                            </Text>
                          ) : (
                            cellSchedules.map((item) => {
                              const accent = getScheduleAccent(
                                item.scheduleType,
                              );
                              return (
                                <View
                                  key={item.id}
                                  style={{
                                    borderRadius: 8,
                                    borderLeftWidth: 3,
                                    borderLeftColor: accent.border,
                                    backgroundColor: accent.bg,
                                    padding: 6,
                                    marginBottom: 6,
                                  }}
                                >
                                  <Text
                                    numberOfLines={2}
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "800",
                                      color: "#0F172A",
                                      marginBottom: 2,
                                    }}
                                  >
                                    {item.subjectName}
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      fontSize: 10,
                                      color: accent.text,
                                      fontWeight: "700",
                                    }}
                                  >
                                    {item.startTime} - {item.endTime}
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    style={{ fontSize: 10, color: "#475569" }}
                                  >
                                    {item.className} • {item.room || "N/A"}
                                  </Text>
                                </View>
                              );
                            })
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
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
