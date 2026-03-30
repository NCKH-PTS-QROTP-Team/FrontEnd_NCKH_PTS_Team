import { LinearGradient } from "expo-linear-gradient";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scheduleService } from "@/apis/services/schedule.service";
import { ScheduleResponse } from "@/apis/types/schedule.types";
import { teacherService } from "@/apis/services/teacher.service";
import { TeacherResponse } from "@/apis/types/teacher.types";
import {
  ScheduleFormModal,
  ScheduleFormData,
} from "@/components/ScheduleFormModal";
import DeleteScheduleModal from "@/components/DeleteScheduleModal";
import {
  MonthCalendar,
  todayISO,
  jsDayToBackend,
  isoToDate,
} from "@/components/MonthCalendar";
import { WeekCalendar } from "@/components/WeekCalendar";
import { DropdownPicker } from "@/components/DropdownPicker";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#0ea5e9";
const SCREEN_W = Dimensions.get("window").width;
// Grid has paddingHorizontal:4 on each side (8px total) inside a card with marginHorizontal:12 (24px total)
const GRID_PADDING = 8; // headRow/grid paddingHorizontal:4 × 2 sides
const CARD_MARGIN = 24; // cal.wrapper marginHorizontal:12 × 2 sides
const CELL_W = Math.floor((SCREEN_W - CARD_MARGIN - GRID_PADDING) / 7);
const MENU_WIDTH = 180;

/** backend dayOfWeek: 2=Mon … 7=Sat, 8=Sun */
const DAY_LABELS: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ nhật",
};
/** Column headers Mon→Sun */
const COL_HEADS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const SESSION_COLORS: Record<string, string> = {
  morning: "#3b82f6",
  afternoon: "#10b981",
  evening: "#8b5cf6",
};
function getSessionColor(time: string | null) {
  if (!time) return SESSION_COLORS.morning;
  const h = parseInt(time.split(":")[0], 10);
  if (h < 12) return SESSION_COLORS.morning;
  if (h < 17) return SESSION_COLORS.afternoon;
  return SESSION_COLORS.evening;
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <View style={s.emptyBox}>
      <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
      <Text style={s.emptyTitle}>{message}</Text>
    </View>
  );
}

// ─── Schedule Card (with 3-dot menu) ─────────────────────────────────────────

interface CardAction {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  onPress: () => void;
}

function ScheduleCard({
  sc,
  onEdit,
  onDelete,
}: {
  sc: ScheduleResponse;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const dotRef = useRef<View>(null);
  const accent = getSessionColor(sc.startTime);

  const actions: CardAction[] = [
    {
      label: "Chỉnh sửa",
      icon: "create-outline",
      color: "#3b82f6",
      onPress: onEdit,
    },
    {
      label: "Xóa",
      icon: "trash-outline",
      color: "#ef4444",
      onPress: onDelete,
    },
  ];

  const openMenu = () => {
    dotRef.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setMenuTop(py + h + 4);
      setMenuVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 280,
        }),
      ]).start();
    });
  };

  const closeMenu = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.88);
      cb?.();
    });
  };

  return (
    <View style={[s.card, { borderLeftColor: accent }]}>
      <View style={s.cardTop}>
        <View style={[s.sessionDot, { backgroundColor: accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={s.cardSubject} numberOfLines={1}>
            {sc.subjectName ?? "Chưa có môn học"}
          </Text>
          {sc.subjectCode && <Text style={s.cardCode}>{sc.subjectCode}</Text>}
        </View>
        <View
          style={[
            s.timeBadge,
            { backgroundColor: accent + "15", borderColor: accent + "40" },
          ]}
        >
          <Ionicons name="time-outline" size={11} color={accent} />
          <Text style={[s.timeBadgeText, { color: accent }]}>
            {sc.startTime ?? "?"} – {sc.endTime ?? "?"}
          </Text>
        </View>
        <View ref={dotRef} collapsable={false}>
          <TouchableOpacity
            style={s.dotBtn}
            onPress={openMenu}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-vertical" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.cardBody}>
        {sc.className && (
          <CardRow icon="school-outline" text={`Lớp: ${sc.className}`} />
        )}
        {sc.teacherName && (
          <CardRow icon="person-outline" text={`GV: ${sc.teacherName}`} />
        )}
        {sc.room && (
          <CardRow icon="location-outline" text={`Phòng: ${sc.room}`} />
        )}
      </View>

      <Modal
        transparent
        visible={menuVisible}
        animationType="none"
        onRequestClose={() => closeMenu()}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => closeMenu()}>
          <View style={s.menuBackdrop} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            s.menu,
            {
              top: menuTop,
              right: 16,
              width: MENU_WIDTH,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {actions.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={[s.menuItem, i < actions.length - 1 && s.menuItemBorder]}
              activeOpacity={0.75}
              onPress={() => closeMenu(() => setTimeout(a.onPress, 50))}
            >
              <View
                style={[s.menuItemIcon, { backgroundColor: a.color + "18" }]}
              >
                <Ionicons name={a.icon} size={14} color={a.color} />
              </View>
              <Text style={[s.menuItemText, { color: a.color }]}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Modal>
    </View>
  );
}

function CardRow({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
}) {
  return (
    <View style={s.cardRow}>
      <Ionicons name={icon} size={13} color="#94a3b8" />
      <Text style={s.cardRowText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

function CalendarView({
  schedules,
  loading,
  refreshing,
  onRefresh,
  onEdit,
  onDelete,
}: {
  schedules: ScheduleResponse[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEdit: (sc: ScheduleResponse) => void;
  onDelete: (sc: ScheduleResponse) => void;
}) {
  const [selectedISO, setSelectedISO] = useState(todayISO());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // backend dow of selected day
  const selDow = useMemo(() => {
    return jsDayToBackend(isoToDate(selectedISO).getDay());
  }, [selectedISO]);

  const daySchedules = useMemo(
    () =>
      schedules
        .filter((sc) => sc.dayOfWeek === selDow)
        .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? "")),
    [schedules, selDow],
  );

  useEffect(() => {
    setPage(1);
  }, [selectedISO, daySchedules]);

  const totalPages = Math.ceil(daySchedules.length / PAGE_SIZE);

  const paginatedDaySchedules = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return daySchedules.slice(start, start + PAGE_SIZE);
  }, [daySchedules, page]);

  const selDateObj = isoToDate(selectedISO);
  const selLabel = selDateObj.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[TEAL]}
          tintColor={TEAL}
        />
      }
    >
      {/* Full month calendar */}
      <MonthCalendar
        schedules={schedules}
        selectedISO={selectedISO}
        onSelectDay={setSelectedISO}
      />

      {/* Schedules for selected day */}
      <View style={s.daySection}>
        {/* Day label */}
        <View style={s.daySectionHeader}>
          <View style={s.daySectionLine} />
          <View style={s.daySectionLabelWrap}>
            <Ionicons name="calendar" size={14} color={TEAL} />
            <Text style={s.daySectionLabel} numberOfLines={1}>
              {selLabel}
            </Text>
          </View>
          <View style={s.daySectionBadge}>
            <Text style={s.daySectionBadgeText}>
              {daySchedules.length} tiết
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 32, alignItems: "center" }}>
            <ActivityIndicator color={TEAL} />
          </View>
        ) : daySchedules.length === 0 ? (
          <EmptyState message="Không có lịch học ngày này" />
        ) : (
          <>
            {paginatedDaySchedules.map((sc) => (
              <ScheduleCard
                key={sc.id}
                sc={sc}
                onEdit={() => onEdit(sc)}
                onDelete={() => onDelete(sc)}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  marginTop: 12,
                  marginBottom: 16,
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
                    page === 1 && { backgroundColor: "#f8fafc", elevation: 0 },
                  ]}
                  disabled={page === 1}
                  onPress={() => setPage((p) => p - 1)}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: page === 1 ? "#cbd5e1" : TEAL,
                    }}
                  >
                    {"<"}
                  </Text>
                </TouchableOpacity>

                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: "#64748b" }}
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
                      color: page === totalPages ? "#cbd5e1" : TEAL,
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
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── List View ─────────────────────────────────────────────────────────────────

function ListView({
  schedules,
  searchQuery,
  loading,
  refreshing,
  onRefresh,
  onEdit,
  onDelete,
}: {
  schedules: ScheduleResponse[];
  searchQuery: string;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEdit: (sc: ScheduleResponse) => void;
  onDelete: (sc: ScheduleResponse) => void;
}) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    setPage(1);
  }, [searchQuery, schedules, selectedDate]);

  const selDow = selectedDate.getDay() === 0 ? 8 : selectedDate.getDay() + 1;

  const filtered = useMemo(() => {
    let res = schedules.filter((sc) => sc.dayOfWeek === selDow);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(
        (sc) =>
          (sc.subjectName ?? "").toLowerCase().includes(q) ||
          (sc.className ?? "").toLowerCase().includes(q) ||
          (sc.teacherName ?? "").toLowerCase().includes(q) ||
          (sc.room ?? "").toLowerCase().includes(q),
      );
    }
    return res.sort((a, b) =>
      (a.startTime ?? "").localeCompare(b.startTime ?? ""),
    );
  }, [schedules, searchQuery, selDow]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  if (loading) {
    return (
      <View style={s.centerBox}>
        <ActivityIndicator color={TEAL} />
        <Text style={s.centerText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[TEAL]}
          tintColor={TEAL}
        />
      }
    >
      <WeekCalendar
        schedules={schedules}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
      />

      {filtered.length === 0 ? (
        <EmptyState
          message={
            searchQuery
              ? `Không tìm thấy "${searchQuery}"`
              : "Không có lịch học ngày này"
          }
        />
      ) : (
        <>
          {paginated.map((sc) => (
            <ScheduleCard
              key={sc.id}
              sc={sc}
              onEdit={() => onEdit(sc)}
              onDelete={() => onDelete(sc)}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={s.paginationGroup}>
              <TouchableOpacity
                style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
                disabled={page === 1}
                onPress={() => setPage((p) => p - 1)}
              >
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color={page === 1 ? "#cbd5e1" : TEAL}
                />
              </TouchableOpacity>

              <Text style={s.pageText}>
                Trang {page} / {totalPages}
              </Text>

              <TouchableOpacity
                style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]}
                disabled={page === totalPages}
                onPress={() => setPage((p) => p + 1)}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={page === totalPages ? "#cbd5e1" : TEAL}
                />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

// (ScheduleFormModal is now in components/ScheduleFormModal.tsx)

// ─── Main ─────────────────────────────────────────────────────────────────────

type ViewMode = "calendar" | "list";

export default function SchedulesManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);

  // Form
  const todayISO = new Date().toISOString().slice(0, 10);
  const blank: ScheduleFormData = {
    classId: "",
    className: "",
    subjectId: "",
    subjectName: "",
    teacherId: "",
    teacherName: "",
    scheduleType: "CLASS",
    pattern: "RECURRING_WEEKLY",
    dayOfWeek: 2,
    startDate: todayISO,
    endDate: "",
    startPeriod: 1,
    endPeriod: 1,
    startTime: "06:30",
    endTime: "07:20",
    room: "",
  };
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formVisible, setFormVisible] = useState(false);
  const [initialForm, setInitialForm] =
    useState<Partial<ScheduleFormData>>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<ScheduleResponse | null>(
    null,
  );

  const totalClasses = useMemo(
    () => new Set(schedules.map((s) => s.classId).filter(Boolean)).size,
    [schedules],
  );
  const totalTeachers = useMemo(
    () => new Set(schedules.map((s) => s.teacherId).filter(Boolean)).size,
    [schedules],
  );

  const fetchSchedules = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [scheduleData, teacherData] = await Promise.all([
        scheduleService.getAllSchedules(),
        teacherService.getAllTeachers(),
      ]);
      setSchedules(scheduleData);
      setTeachers(teacherData);
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 403)
        setError("Không có quyền truy cập (403). Liên hệ quản trị viên.");
      else if (status === 401)
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      else setError(err?.message || "Không thể tải danh sách lịch học");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const availableDepartments = useMemo(() => {
    const deps = new Set<string>();
    teachers.forEach((t) => {
      if (t.departmentName) deps.add(t.departmentName);
    });
    return Array.from(deps).sort();
  }, [teachers]);

  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    schedules.forEach((s) => {
      if (s.subjectName) subs.add(s.subjectName);
    });
    return Array.from(subs).sort();
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    let result = schedules;
    if (filterSubject) {
      result = result.filter((s) => s.subjectName === filterSubject);
    }
    if (filterDepartment) {
      result = result.filter((s) => {
        const t = teachers.find((teacher) => teacher.id === s.teacherId);
        return t && t.departmentName === filterDepartment;
      });
    }
    return result;
  }, [schedules, teachers, filterSubject, filterDepartment]);

  const handleOpenAdd = () => {
    setFormMode("add");
    setInitialForm(blank);
    setEditingId(null);
    setFormVisible(true);
  };

  const handleOpenEdit = (sc: ScheduleResponse) => {
    setFormMode("edit");
    setEditingId(sc.id);
    // Reverse-map stored HH:mm times back to period numbers
    const findPeriod = (time: string | null | undefined, fallback: number) => {
      if (!time) return fallback;
      const START_TIMES: Record<number, string> = {
        1: "06:30",
        2: "07:20",
        3: "08:10",
        4: "09:10",
        5: "10:00",
        6: "10:50",
        7: "12:30",
        8: "13:20",
        9: "14:10",
        10: "15:10",
        11: "16:00",
        12: "16:50",
        13: "18:00",
        14: "18:50",
        15: "19:50",
        16: "20:40",
      };
      const match = Object.entries(START_TIMES).find(([, t]) => t === time);
      return match ? Number(match[0]) : fallback;
    };
    const sp = findPeriod(sc.startTime, 1);
    const ep = findPeriod(sc.endTime, sp);
    setInitialForm({
      classId: sc.classId ?? "",
      className: sc.className ?? "",
      subjectId: sc.subjectId ?? "",
      subjectName: sc.subjectName ?? "",
      teacherId: sc.teacherId ?? "",
      teacherName: sc.teacherName ?? "",
      scheduleType: sc.scheduleType ?? "CLASS",
      pattern: sc.pattern ?? (sc.date ? "ONE_TIME" : "RECURRING_WEEKLY"),
      dayOfWeek: sc.dayOfWeek ?? 2,
      startDate: sc.date ?? sc.startDate ?? "",
      endDate: sc.endDate ?? "",
      startPeriod: sp,
      endPeriod: ep,
      startTime: sc.startTime ?? "06:30",
      endTime: sc.endTime ?? "07:20",
      room: sc.room ?? "",
    });
    setFormVisible(true);
  };

  const handleSubmit = async (data: ScheduleFormData) => {
    const payload = {
      classId: data.classId,
      subjectId: data.subjectId || undefined,
      teacherId: data.teacherId || undefined,
      scheduleType: data.scheduleType,
      pattern: data.pattern,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room || undefined,
      date: data.pattern === "ONE_TIME" ? data.startDate : undefined,
      startDate:
        data.pattern === "RECURRING_WEEKLY" ? data.startDate : undefined,
      endDate:
        data.pattern === "RECURRING_WEEKLY"
          ? data.endDate || undefined
          : undefined,
    };
    try {
      if (formMode === "add") {
        const created = await scheduleService.createSchedule(payload);
        setSchedules((p) => [created, ...p]);
        Alert.alert("Thành công", "Đã tạo lịch học mới!");
      } else {
        if (!editingId) return;
        const updated = await scheduleService.updateSchedule(
          editingId,
          payload,
        );
        setSchedules((p) =>
          p.map((sc) => (sc.id === updated.id ? updated : sc)),
        );
        Alert.alert("Thành công", "Đã cập nhật lịch học!");
      }
      setFormVisible(false);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Không thể lưu lịch học");
      throw err; // let modal know submit failed
    }
  };

  const handleDelete = (sc: ScheduleResponse) => {
    setDeleteTarget(sc);
  };

  return (
    <View style={[s.container, { padding: 0 }]}>
      <LinearGradient
        colors={["#1E3A8A", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 64,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          zIndex: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff" }}>
              Quản lý Lịch biểu
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                marginTop: 4,
              }}
            >
              Xem và quản lý lịch biểu khoa
            </Text>
          </View>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="calendar" size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      {/* ── Header bar ── */}
      <View style={[s.headerBar, { marginTop: 10, paddingHorizontal: 16 }]}>
        {/* Stats */}
        <View style={s.statsRow}>
          <StatChip
            icon="calendar"
            value={schedules.length}
            label="lịch"
            color={TEAL}
          />
          <StatChip
            icon="school-outline"
            value={totalClasses}
            label="lớp"
            color="#8b5cf6"
          />
          <StatChip
            icon="person-outline"
            value={totalTeachers}
            label="GV"
            color="#f59e0b"
          />
        </View>

        {/* Mode toggle + Add */}
        <View style={s.toolRow}>
          <View style={s.toggleWrap}>
            <ToggleBtn
              icon="calendar-outline"
              label="Lịch"
              active={viewMode === "calendar"}
              onPress={() => setViewMode("calendar")}
            />
            <ToggleBtn
              icon="list-outline"
              label="Danh sách"
              active={viewMode === "list"}
              onPress={() => setViewMode("list")}
            />
          </View>

          {viewMode === "list" && (
            <View style={s.searchBar}>
              <Ionicons name="search" size={14} color="#94a3b8" />
              <TextInput
                style={s.searchInput}
                placeholder="Tìm kiếm..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={14} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity style={s.addBtn} onPress={handleOpenAdd}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter bar */}
      {(availableDepartments.length > 0 || availableSubjects.length > 0) && (
        <View style={s.dropdownFiltersContainer}>
          {availableDepartments.length > 0 && (
            <DropdownPicker
              label="Khoa / Bộ môn"
              options={[
                { label: "Tất cả Khoa", value: null },
                ...availableDepartments.map((d) => ({ label: d, value: d })),
              ]}
              selectedValue={filterDepartment}
              onValueChange={setFilterDepartment}
              placeholder="Tất cả Khoa"
            />
          )}
          {availableSubjects.length > 0 && (
            <DropdownPicker
              label="Môn học"
              options={[
                { label: "Tất cả môn học", value: null },
                ...availableSubjects.map((d) => ({ label: d, value: d })),
              ]}
              selectedValue={filterSubject}
              onValueChange={setFilterSubject}
              placeholder="Tất cả môn học"
            />
          )}
        </View>
      )}

      {/* ── Content ── */}
      {error ? (
        <View style={s.centerBox}>
          <Ionicons name="cloud-offline-outline" size={52} color="#ef4444" />
          <Text
            style={[
              s.centerText,
              {
                color: "#ef4444",
                fontWeight: "600",
                textAlign: "center",
                paddingHorizontal: 24,
              },
            ]}
          >
            {error}
          </Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchSchedules()}>
            <Ionicons name="refresh-outline" size={15} color="#fff" />
            <Text style={s.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : viewMode === "calendar" ? (
        <CalendarView
          schedules={filteredSchedules}
          loading={loading}
          refreshing={refreshing}
          onRefresh={() => fetchSchedules(true)}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      ) : (
        <ListView
          schedules={filteredSchedules}
          searchQuery={searchQuery}
          loading={loading}
          refreshing={refreshing}
          onRefresh={() => fetchSchedules(true)}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <ScheduleFormModal
        mode={formMode}
        initialData={initialForm}
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleSubmit}
      />

      <DeleteScheduleModal
        visible={deleteTarget !== null}
        schedule={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={(id, fullyDeleted, updated) => {
          if (fullyDeleted) {
            setSchedules((p) => p.filter((s) => s.id !== id));
          } else if (updated) {
            setSchedules((p) => p.map((s) => (s.id === id ? updated : s)));
          }
          setDeleteTarget(null);
        }}
      />
    </View>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function StatChip({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={[s.statChip, { backgroundColor: color + "12" }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function ToggleBtn({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.toggleBtn, active && s.toggleBtnActive]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={14} color={active ? "#fff" : "#64748b"} />
      <Text style={[s.toggleBtnText, active && s.toggleBtnTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f9ff" },

  // Header
  headerBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 10,
  },
  statsRow: { flexDirection: "row", gap: 8 },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  statValue: { fontWeight: "800", fontSize: 12 },
  statLabel: { fontSize: 11, color: "#64748b" },
  toolRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  toggleWrap: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  toggleBtnActive: { backgroundColor: TEAL },
  toggleBtnText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  toggleBtnTextActive: { color: "#fff" },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 34,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  searchInput: { flex: 1, fontSize: 13, color: "#1e293b" },
  addBtn: {
    width: 36,
    height: 36,
    backgroundColor: TEAL,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },

  // Dropdown filters
  dropdownFiltersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    gap: 12,
  },
  dropdownWrapper: { flex: 1 },
  dropdownLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
    marginLeft: 4,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
  },
  dropdownButtonText: {
    fontSize: 13,
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 2,
  },
  dropdownItemActive: { backgroundColor: TEAL + "15" },
  dropdownItemText: { fontSize: 14, color: "#475569", flex: 1 },
  dropdownItemTextActive: { color: TEAL, fontWeight: "700" },

  // Day section (below calendar)
  daySection: { paddingHorizontal: 16, paddingBottom: 8 },
  daySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  daySectionLine: {
    width: 3,
    height: 22,
    borderRadius: 2,
    backgroundColor: TEAL,
  },
  daySectionLabelWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  daySectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  daySectionBadge: {
    backgroundColor: TEAL + "18",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  daySectionBadgeText: { fontSize: 12, fontWeight: "700", color: TEAL },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8,
  },
  sessionDot: { width: 9, height: 9, borderRadius: 5, flexShrink: 0 },
  cardSubject: { fontSize: 14, fontWeight: "700", color: "#1e293b", flex: 1 },
  cardCode: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 1,
    gap: 3,
  },
  timeBadgeText: { fontSize: 11, fontWeight: "700" },
  dotBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingLeft: 34,
    paddingBottom: 12,
    gap: 5,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardRowText: { fontSize: 12, color: "#64748b", flex: 1 },

  // 3-dot menu
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  menu: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 9999,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  menuItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: { fontSize: 14, fontWeight: "600" },

  // List view
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
    gap: 8,
  },
  groupAccent: { width: 4, height: 18, borderRadius: 2 },
  groupTitle: { fontSize: 14, fontWeight: "700", color: "#1e293b", flex: 1 },
  groupBadge: {
    backgroundColor: TEAL + "15",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  groupBadgeText: { fontSize: 12, fontWeight: "700", color: TEAL },

  // States
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  centerText: { fontSize: 14, color: "#64748b" },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: TEAL,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyBox: { alignItems: "center", paddingVertical: 36, gap: 10 },
  emptyTitle: { fontSize: 14, color: "#94a3b8", textAlign: "center" },

  // Pagination
  paginationGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
  },
  pageBtn: {
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
  pageBtnDisabled: { backgroundColor: "#f8fafc", elevation: 0 },
  pageText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
});
