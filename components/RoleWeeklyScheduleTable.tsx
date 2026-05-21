import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import type { Schedule } from "@/apis/services/schedule.service";
import {
  SLOT_LABELS,
  getSlotIndexFromStartTime,
} from "@/constants/scheduleSlots";

const DAY_HEADERS = [
  { label: "T2", backend: 2 },
  { label: "T3", backend: 3 },
  { label: "T4", backend: 4 },
  { label: "T5", backend: 5 },
  { label: "T6", backend: 6 },
  { label: "T7", backend: 7 },
  { label: "CN", backend: 8 },
] as const;

export type ScheduleFilterView = "all" | "class" | "exam";

interface RoleWeeklyScheduleTableProps {
  weekLabel: string;
  schedules: Schedule[];
  filterView: ScheduleFilterView;
  onFilterChange: (value: ScheduleFilterView) => void;
  onChangeWeek: (delta: number) => void;
  dayColumnWidthDesktop?: number;
  dayColumnWidthMobile?: number;
}

type DisplayScheduleType = "CLASS" | "PRACTICE" | "EXAM";

function getDisplayScheduleType(schedule: Schedule): DisplayScheduleType {
  if (schedule.scheduleType === "EXAM") {
    return "EXAM";
  }

  const text = [
    schedule.subjectName,
    schedule.className,
    schedule.classCode,
    schedule.courseName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const isPractice =
    text.includes("thực hành") ||
    text.includes("thuc hanh") ||
    /\bth\b/.test(text) ||
    text.includes("_th") ||
    text.includes("-th");

  return isPractice ? "PRACTICE" : "CLASS";
}

function getCellToneBySchedules(cellSchedules: Schedule[]) {
  if (cellSchedules.length === 0) {
    return {
      bg: "#FAFAFA",
      title: "#0F172A",
      subtitle: "#64748B",
      divider: "#E2E8F0",
    };
  }

  const hasExam = cellSchedules.some(
    (s) => getDisplayScheduleType(s) === "EXAM",
  );
  if (hasExam) {
    return {
      bg: "#FEF9C3",
      title: "#854D0E",
      subtitle: "#92400E",
      divider: "#FDE68A",
    };
  }

  const hasPractice = cellSchedules.some(
    (s) => getDisplayScheduleType(s) === "PRACTICE",
  );
  if (hasPractice) {
    return {
      bg: "#DCFCE7",
      title: "#166534",
      subtitle: "#166534",
      divider: "#86EFAC",
    };
  }

  return {
    bg: "#DBEAFE",
    title: "#1E3A8A",
    subtitle: "#1D4ED8",
    divider: "#93C5FD",
  };
}

export default function RoleWeeklyScheduleTable({
  weekLabel,
  schedules,
  filterView,
  onFilterChange,
  onChangeWeek,
  dayColumnWidthDesktop = 188,
  dayColumnWidthMobile = 160,
}: RoleWeeklyScheduleTableProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isWeb = Platform.OS === "web";
  const dayColumnWidth = isDesktop
    ? dayColumnWidthDesktop
    : dayColumnWidthMobile;
  const stickyFirstColumnStyle = isWeb
    ? ({ position: "sticky", left: 0 } as any)
    : undefined;

  const filteredSchedules = useMemo(() => {
    if (filterView === "all") return schedules;
    if (filterView === "exam") {
      return schedules.filter((s) => s.scheduleType === "EXAM");
    }
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

  return (
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
          onPress={() => onChangeWeek(-1)}
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
          numberOfLines={1}
        >
          {weekLabel}
        </Text>

        <TouchableOpacity
          onPress={() => onChangeWeek(1)}
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
          const active = filterView === (item.key as ScheduleFilterView);
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onFilterChange(item.key as ScheduleFilterView)}
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
                zIndex: 30,
                ...stickyFirstColumnStyle,
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
                  zIndex: 20,
                  ...stickyFirstColumnStyle,
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
                const cellTone = getCellToneBySchedules(cellSchedules);

                return (
                  <View
                    key={`${day.backend}-${slotIdx}`}
                    style={{
                      width: dayColumnWidth,
                      minHeight: 94,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      padding: 8,
                      backgroundColor: cellTone.bg,
                    }}
                  >
                    {cellSchedules.length === 0 ? (
                      <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                        Trống
                      </Text>
                    ) : (
                      cellSchedules.map((item, index) => {
                        return (
                          <View
                            key={item.id}
                            style={{
                              paddingBottom:
                                index < cellSchedules.length - 1 ? 6 : 0,
                              marginBottom:
                                index < cellSchedules.length - 1 ? 6 : 0,
                              borderBottomWidth:
                                index < cellSchedules.length - 1 ? 1 : 0,
                              borderBottomColor:
                                index < cellSchedules.length - 1
                                  ? cellTone.divider
                                  : "transparent",
                            }}
                          >
                            <Text
                              numberOfLines={2}
                              style={{
                                fontSize: 12,
                                fontWeight: "800",
                                color: cellTone.title,
                                marginBottom: 2,
                              }}
                            >
                              {item.subjectName}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 11,
                                color: cellTone.subtitle,
                                fontWeight: "700",
                                marginBottom: 1,
                              }}
                            >
                              {item.startTime} - {item.endTime}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 10,
                                color: "#334155",
                                opacity: 0.9,
                                marginBottom: 1,
                              }}
                            >
                              {/* {item.className} */}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 10,
                                color: "#334155",
                                opacity: 0.95,
                                fontWeight: "600",
                              }}
                            >
                              Phòng: {item.room || "N/A"}
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
  );
}
