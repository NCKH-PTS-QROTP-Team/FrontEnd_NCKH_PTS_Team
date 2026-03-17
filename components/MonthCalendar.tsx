import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScheduleResponse } from "@/apis/types/schedule.types";

const DEFAULT_TEAL = "#0ea5e9";
const SCREEN_W = Dimensions.get("window").width;
const GRID_PADDING = 8;
const CARD_MARGIN = 24;
const CELL_W = Math.floor((SCREEN_W - CARD_MARGIN - GRID_PADDING) / 7);
const COL_HEADS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function jsDayToBackend(jsDay: number): number {
  return jsDay === 0 ? 8 : jsDay + 1;
}

export function isoToDate(iso: string) {
  return new Date(iso + "T00:00:00");
}

function dateToISO(d: Date) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

interface DayCell {
  iso: string;
  date: number;
  dow: number;
  isCurrentMonth: boolean;
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const cells: DayCell[] = [];
  const cur = new Date(year, month, 1 - startOffset);
  for (let i = 0; i < 42; i++) {
    cells.push({
      iso: dateToISO(cur),
      date: cur.getDate(),
      dow: jsDayToBackend(cur.getDay()),
      isCurrentMonth: cur.getMonth() === month,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return cells;
}

interface MonthCalendarProps {
  schedules: ScheduleResponse[];
  selectedISO: string;
  onSelectDay: (iso: string) => void;
  themeColor?: string;
}

export function MonthCalendar({
  schedules,
  selectedISO,
  onSelectDay,
  themeColor = DEFAULT_TEAL,
}: MonthCalendarProps) {
  const todayStr = todayISO();
  const selDate = isoToDate(selectedISO);
  const [viewYear, setViewYear] = useState(selDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selDate.getMonth());

  const isRecurring = (sc: ScheduleResponse) =>
    sc.pattern === "RECURRING_WEEKLY" ||
    (!sc.pattern && !!sc.dayOfWeek && !sc.date);
  const isOneTime = (sc: ScheduleResponse) =>
    sc.pattern === "ONE_TIME" || (!sc.pattern && !!sc.date);

  // Recurring schedules: dayOfWeek set, no specific date → dots on all matching weekdays
  const activeDows = useMemo(() => {
    const s = new Set<number>();
    schedules.forEach((sc) => {
      if (isRecurring(sc) && sc.dayOfWeek != null) s.add(sc.dayOfWeek);
    });
    return s;
  }, [schedules]);

  const dowCount = useMemo(() => {
    const map: Record<number, number> = {};
    schedules.forEach((sc) => {
      if (isRecurring(sc) && sc.dayOfWeek != null)
        map[sc.dayOfWeek] = (map[sc.dayOfWeek] ?? 0) + 1;
    });
    return map;
  }, [schedules]);

  // One-time schedules: dot on specific date only
  const specificDates = useMemo(() => {
    const s = new Set<string>();
    schedules.forEach((sc) => {
      if (isOneTime(sc) && sc.date) s.add(sc.date);
    });
    return s;
  }, [schedules]);

  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };
  const goToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    onSelectDay(todayStr);
  };

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString("vi-VN", {
    month: "long",
  });

  return (
    <View style={cal.wrapper}>
      {/* ── Month navigation ── */}
      <View style={cal.navRow}>
        <TouchableOpacity
          style={[cal.navBtn, { backgroundColor: themeColor + "15" }]}
          onPress={prevMonth}
        >
          <Ionicons name="chevron-back" size={18} color={themeColor} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToday} style={{ alignItems: "center" }}>
          <Text style={cal.navTitle}>
            {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {viewYear}
          </Text>
          <Text style={cal.navSub}>Nhấn để về hôm nay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[cal.navBtn, { backgroundColor: themeColor + "15" }]}
          onPress={nextMonth}
        >
          <Ionicons name="chevron-forward" size={18} color={themeColor} />
        </TouchableOpacity>
      </View>

      {/* ── Day-of-week headers ── */}
      <View style={cal.headRow}>
        {COL_HEADS.map((h, i) => (
          <View key={i} style={[cal.headCell, i === 6 && cal.sundayHead]}>
            <Text style={[cal.headText, i === 6 && cal.sundayText]}>{h}</Text>
          </View>
        ))}
      </View>

      {/* ── Day grid ── */}
      <View style={cal.grid}>
        {cells.map((cell) => {
          const isToday = cell.iso === todayStr;
          const isSelected = cell.iso === selectedISO;
          const recurringHas = activeDows.has(cell.dow) && cell.isCurrentMonth;
          const specificHas = specificDates.has(cell.iso);
          const hasScheds = recurringHas || specificHas;
          const isSunday = cell.dow === 8;
          const recurringCount = cell.isCurrentMonth
            ? (dowCount[cell.dow] ?? 0)
            : 0;
          const specificCount = specificHas ? 1 : 0;
          const count = recurringCount + specificCount;

          return (
            <TouchableOpacity
              key={cell.iso}
              style={[
                cal.cell,
                isSelected && { backgroundColor: themeColor },
                isToday &&
                  !isSelected && { borderColor: themeColor, borderWidth: 2 },
                !cell.isCurrentMonth && cal.cellOtherMonth,
              ]}
              onPress={() => onSelectDay(cell.iso)}
              activeOpacity={0.65}
            >
              <Text
                style={[
                  cal.cellDate,
                  isSelected && cal.cellDateSelected,
                  isToday &&
                    !isSelected && { color: themeColor, fontWeight: "800" },
                  !cell.isCurrentMonth && cal.cellDateOther,
                  isSunday && !isSelected && cal.cellDateSunday,
                ]}
              >
                {cell.date}
              </Text>

              {/* Dots showing how many schedule slots */}
              {hasScheds && count > 0 && (
                <View style={cal.dotsRow}>
                  {Array.from({ length: Math.min(count, 3) }).map((_, di) => (
                    <View
                      key={di}
                      style={[
                        cal.dot,
                        { backgroundColor: isSelected ? "#fff" : themeColor },
                      ]}
                    />
                  ))}
                  {count > 3 && (
                    <Text
                      style={[
                        cal.dotMore,
                        { color: isSelected ? "#fff" : themeColor },
                      ]}
                    >
                      +
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Legend ── */}
      <View style={cal.legend}>
        <View style={cal.legendItem}>
          <View style={[cal.legendDot, { backgroundColor: themeColor }]} />
          <Text style={cal.legendText}>Có lịch học</Text>
        </View>
        <View style={cal.legendItem}>
          <View style={[cal.legendRing, { borderColor: themeColor }]} />
          <Text style={cal.legendText}>Hôm nay</Text>
        </View>
        <View style={cal.legendItem}>
          <View style={[cal.legendFill, { backgroundColor: themeColor }]} />
          <Text style={cal.legendText}>Đang chọn</Text>
        </View>
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 12,
    marginVertical: 10,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
  },
  navSub: { fontSize: 10, color: "#94a3b8", marginTop: 1, textAlign: "center" },

  headRow: { flexDirection: "row", paddingHorizontal: 4, marginBottom: 2 },
  headCell: { flex: 1, alignItems: "center", paddingVertical: 4 },
  sundayHead: {},
  headText: { fontSize: 11, fontWeight: "700", color: "#64748b" },
  sundayText: { color: "#ef4444" },

  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 4 },
  cell: {
    width: `${100 / 7}%` as any,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginBottom: 2,
  },
  cellSelected: { backgroundColor: DEFAULT_TEAL },
  cellToday: { borderWidth: 2, borderColor: DEFAULT_TEAL },
  cellOtherMonth: { opacity: 0.3 },
  cellDate: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  cellDateSelected: { color: "#fff", fontWeight: "800" },
  cellDateToday: { color: DEFAULT_TEAL, fontWeight: "800" },
  cellDateOther: { color: "#94a3b8" },
  cellDateSunday: { color: "#ef4444" },

  dotsRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotMore: { fontSize: 9, fontWeight: "800", marginTop: -1 },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingTop: 6,
    paddingBottom: 2,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: DEFAULT_TEAL,
  },
  legendFill: { width: 14, height: 14, borderRadius: 7 },
  legendText: { fontSize: 11, fontWeight: "600", color: "#64748b" },
});
