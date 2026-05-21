/**
 * ScheduleFormModal — Smart form with searchable pickers for:
 *   - Subject selection
 *   - Course selection by subject
 *   - Teacher auto-populated from selected course (LT + TH)
 *   - Day-of-week chip selector
 *   - Start/End time pickers
 *   - Building/Room selection
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { subjectService } from "@/apis/services/subject.service";
import { courseService, type Course } from "@/apis/services/course.service";

// ── types ──────────────────────────────────────────────────────────────────────

interface SubjectOption {
  id: string;
  code: string;
  name: string;
  teacherLTId: string | null;
  teacherLTName: string | null;
  teacherTHId: string | null;
  teacherTHName: string | null;
}

interface TeacherOption {
  id: string;
  name: string;
  role: "LT" | "TH";
}

interface BuildingOption {
  id: string;
  name: string;
}

interface RoomOption {
  id: string;
  name: string;
  buildingId: string;
  buildingName?: string;
}

export interface ScheduleFormData {
  courseId?: string;
  courseName?: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  buildingId?: string;
  buildingName?: string;
  roomId?: string;
  scheduleType: "CLASS" | "EXAM";
  pattern: "RECURRING_WEEKLY" | "ONE_TIME";
  /** Derived from startDate by backend */
  dayOfWeek: number;
  /** yyyy-MM-dd — required */
  startDate: string;
  /** yyyy-MM-dd — optional end date */
  endDate: string;
  /** Tiết bắt đầu 1–16 */
  startPeriod: number;
  /** Tiết kết thúc 1–16 */
  endPeriod: number;
  /** Auto-derived HH:mm from startPeriod */
  startTime: string;
  /** Auto-derived HH:mm from endPeriod */
  endTime: string;
  room: string;
}

// ── helpers ────────────────────────────────────────────────────────────────────

const TEAL = "#0ea5e9";

const DAY_LABELS: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "CN",
};

/** Bảng tiết học (16 tiết)
 *  Sáng  : T1–6 (06:30), nghỉ 10p sau T3
 *  Chiều : T7–12 (12:30), nghỉ 10p sau T9
 *  Tối   : T13–16 (18:00), nghỉ 10p sau T14
 */
const PERIOD_MAP: Record<
  number,
  { start: string; end: string; session: "morning" | "afternoon" | "evening" }
> = {
  // — Sáng —
  1: { start: "06:30", end: "07:20", session: "morning" },
  2: { start: "07:20", end: "08:10", session: "morning" },
  3: { start: "08:10", end: "09:00", session: "morning" },
  // [giải lao 09:00–09:10]
  4: { start: "09:10", end: "10:00", session: "morning" },
  5: { start: "10:00", end: "10:50", session: "morning" },
  6: { start: "10:50", end: "11:40", session: "morning" },
  // — Chiều —
  7: { start: "12:30", end: "13:20", session: "afternoon" },
  8: { start: "13:20", end: "14:10", session: "afternoon" },
  9: { start: "14:10", end: "15:00", session: "afternoon" },
  // [giải lao 15:00–15:10]
  10: { start: "15:10", end: "16:00", session: "afternoon" },
  11: { start: "16:00", end: "16:50", session: "afternoon" },
  12: { start: "16:50", end: "17:40", session: "afternoon" },
  // — Tối —
  13: { start: "18:00", end: "18:50", session: "evening" },
  14: { start: "18:50", end: "19:40", session: "evening" },
  // [giải lao 19:40–19:50]
  15: { start: "19:50", end: "20:40", session: "evening" },
  16: { start: "20:40", end: "21:30", session: "evening" },
};

const SESSION_COLORS: Record<string, string> = {
  morning: "#3b82f6",
  afternoon: "#10b981",
  evening: "#8b5cf6",
};

function periodToTime(period: number) {
  return PERIOD_MAP[period] ?? { start: "", end: "" };
}

/** Date → yyyy-MM-dd */
function dateToISO(d: Date): string {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
/** JS getDay() (0=Sun..6=Sat) → backend dow (2=Mon..8=Sun) */
function jsDayToBackend(jsDay: number): number {
  return jsDay === 0 ? 8 : jsDay + 1;
}
/** yyyy-MM-dd → dayOfWeek label */
function isoToDayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return DAY_LABELS[jsDayToBackend(d.getDay())] ?? "";
}

// ── Mini Calendar (date picker) ────────────────────────────────────────────

const CAL_HEADS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function buildGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let offset = firstDay.getDay() - 1;
  if (offset < 0) offset = 6;
  const cells: { iso: string; date: number; inMonth: boolean }[] = [];
  const cur = new Date(year, month, 1 - offset);
  for (let i = 0; i < 42; i++) {
    cells.push({
      iso: dateToISO(cur),
      date: cur.getDate(),
      inMonth: cur.getMonth() === month,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return cells;
}

function MiniCalendar({
  selected,
  onSelect,
  label,
  accent,
  clearable,
  onClear,
  zIndex = 1,
}: {
  selected: string;
  onSelect: (iso: string) => void;
  label?: string;
  accent?: string;
  clearable?: boolean;
  onClear?: () => void;
  zIndex?: number;
}) {
  const color = accent ?? TEAL;
  const today = dateToISO(new Date());
  const initDate = selected ? new Date(selected + "T00:00:00") : new Date();
  const [open, setOpen] = React.useState(false);
  const [year, setYear] = React.useState(initDate.getFullYear());
  const [month, setMonth] = React.useState(initDate.getMonth());
  const cells = React.useMemo(() => buildGrid(year, month), [year, month]);
  const monthName = new Date(year, month, 1).toLocaleString("vi-VN", {
    month: "long",
  });
  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  // Calendar is capped at 300px wide; on small screens it uses available space
  const { width: winW } = useWindowDimensions();
  const CAL_MAX_W = 300;
  const calW = Math.min(winW - 40 - 20, CAL_MAX_W); // modal:40px + wrapper:20px padding
  const cellSize = Math.floor(calW / 7);

  const displayText = selected
    ? (() => {
        const d = new Date(selected + "T00:00:00");
        const dow = DAY_LABELS[jsDayToBackend(d.getDay())] ?? "";
        return `${dow}, ${selected}`;
      })()
    : null;

  return (
    <View
      style={{ marginTop: 4, zIndex, elevation: zIndex, position: "relative" }}
    >
      {label && (
        <Text style={[fm.label, { zIndex, elevation: zIndex }]}>{label}</Text>
      )}

      {/* Compact trigger */}
      <TouchableOpacity
        style={[
          mc.trigger,
          { maxWidth: CAL_MAX_W, alignSelf: "stretch" },
          selected && { borderColor: color, backgroundColor: color + "0d" },
          open && {
            borderColor: color,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
        ]}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.75}
      >
        <View style={[mc.triggerIcon, { backgroundColor: color + "18" }]}>
          <Ionicons name="calendar-outline" size={16} color={color} />
        </View>
        <Text
          style={[
            mc.triggerText,
            !selected && mc.triggerPlaceholder,
            selected && { color },
          ]}
        >
          {displayText ?? "Nhấn để chọn ngày..."}
        </Text>
        {/* Clear button */}
        {clearable && selected ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onClear?.();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color="#ef4444" />
          </TouchableOpacity>
        ) : (
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color="#94a3b8"
          />
        )}
      </TouchableOpacity>

      {/* Expandable calendar */}
      {open && (
        <View
          style={[
            mc.wrapper,
            { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
            {
              maxWidth: CAL_MAX_W,
              alignSelf: "stretch",
              position: "absolute",
              top: label ? 70 : 46,
              left: 0,
              zIndex: 9999,
              elevation: 9999,
            },
          ]}
        >
          {/* Nav */}
          <View style={mc.nav}>
            <TouchableOpacity style={mc.navBtn} onPress={prev}>
              <Ionicons name="chevron-back" size={16} color={color} />
            </TouchableOpacity>
            <Text style={mc.navTitle}>
              {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
            </Text>
            <TouchableOpacity style={mc.navBtn} onPress={next}>
              <Ionicons name="chevron-forward" size={16} color={color} />
            </TouchableOpacity>
          </View>
          {/* Heads */}
          <View style={mc.headRow}>
            {CAL_HEADS.map((h, i) => (
              <Text
                key={i}
                style={[mc.headText, i === 6 && { color: "#ef4444" }]}
              >
                {h}
              </Text>
            ))}
          </View>
          {/* Grid */}
          <View style={mc.grid}>
            {cells.map((c) => {
              const isSel = c.iso === selected;
              const isToday = c.iso === today;
              const isSun =
                jsDayToBackend(new Date(c.iso + "T00:00:00").getDay()) === 8;
              return (
                <TouchableOpacity
                  key={c.iso}
                  style={[
                    mc.cell,
                    { width: cellSize, height: cellSize },
                    isSel && { ...mc.cellSel, backgroundColor: color },
                    isToday && !isSel && mc.cellToday,
                    !c.inMonth && mc.cellOther,
                  ]}
                  onPress={() => {
                    onSelect(c.iso);
                    setOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      mc.cellText,
                      isSel && mc.cellTextSel,
                      isToday && !isSel && { ...mc.cellTextToday, color },
                      !c.inMonth && mc.cellTextOther,
                      isSun && !isSel && mc.cellTextSun,
                    ]}
                  >
                    {c.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

interface PickerItem {
  id: string;
  primary: string;
  secondary?: string;
  badge?: string;
}

function PickerModal({
  visible,
  title,
  items,
  selectedId,
  onSelect,
  onClose,
  loading,
  emptyText,
}: {
  visible: boolean;
  title: string;
  items: PickerItem[];
  selectedId: string;
  onSelect: (item: PickerItem) => void;
  onClose: () => void;
  loading?: boolean;
  emptyText?: string;
}) {
  const [query, setQuery] = useState("");
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      setQuery("");
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 260,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const filtered = items.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.primary.toLowerCase().includes(q) ||
      (item.secondary ?? "").toLowerCase().includes(q) ||
      (item.badge ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={pm.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[pm.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={pm.handle} />
        {/* Header */}
        <View style={pm.header}>
          <Text style={pm.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={pm.closeBtn}>
            <Ionicons name="close" size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={pm.searchBar}>
          <Ionicons name="search" size={15} color="#94a3b8" />
          <TextInput
            style={pm.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={15} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        {loading ? (
          <View style={pm.loadingBox}>
            <ActivityIndicator color={TEAL} />
            <Text style={pm.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 340 }}
            ListEmptyComponent={
              <View style={pm.emptyBox}>
                <Ionicons name="search-outline" size={36} color="#cbd5e1" />
                <Text style={pm.emptyText}>
                  {emptyText ?? "Không có kết quả"}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item.id === selectedId;
              return (
                <TouchableOpacity
                  style={[pm.item, isSelected && pm.itemSelected]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      pm.itemAvatar,
                      { backgroundColor: isSelected ? TEAL : TEAL + "18" },
                    ]}
                  >
                    <Text
                      style={[
                        pm.itemAvatarText,
                        { color: isSelected ? "#fff" : TEAL },
                      ]}
                    >
                      {item.primary.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[pm.itemPrimary, isSelected && { color: TEAL }]}
                      numberOfLines={1}
                    >
                      {item.primary}
                    </Text>
                    {item.secondary && (
                      <Text style={pm.itemSecondary} numberOfLines={1}>
                        {item.secondary}
                      </Text>
                    )}
                  </View>
                  {item.badge && (
                    <View style={pm.badge}>
                      <Text style={pm.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={TEAL}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
        <View style={{ height: 24 }} />
      </Animated.View>
    </Modal>
  );
}

const pm = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 10,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { flex: 1, fontSize: 16, fontWeight: "700", color: "#1e293b" },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1e293b" },
  loadingBox: { alignItems: "center", paddingVertical: 32, gap: 8 },
  loadingText: { fontSize: 13, color: "#94a3b8" },
  emptyBox: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    gap: 12,
  },
  itemSelected: { backgroundColor: TEAL + "08", borderRadius: 10 },
  itemAvatar: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemAvatarText: { fontSize: 15, fontWeight: "700" },
  itemPrimary: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  itemSecondary: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  badge: {
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#64748b" },
});

// ── Picker Button (select field) ──────────────────────────────────────────────

function PickerButton({
  label,
  value,
  placeholder,
  onPress,
  icon,
  accent,
  disabled,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  accent?: string;
  disabled?: boolean;
}) {
  const color = accent ?? TEAL;
  const hasValue = value.trim().length > 0;

  return (
    <View style={{ marginTop: 14 }}>
      <Text style={fm.label}>{label}</Text>
      <TouchableOpacity
        style={[
          fm.pickerBtn,
          hasValue && { borderColor: color + "55" },
          disabled && { opacity: 0.45 },
        ]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.75}
      >
        <View style={[fm.pickerIcon, { backgroundColor: color + "12" }]}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text
          style={[fm.pickerText, !hasValue && fm.pickerPlaceholder]}
          numberOfLines={1}
        >
          {hasValue ? value : placeholder}
        </Text>
        {hasValue ? (
          <Ionicons name="checkmark-circle" size={18} color={color} />
        ) : (
          <Ionicons name="chevron-down" size={16} color="#94a3b8" />
        )}
      </TouchableOpacity>
    </View>
  );
}

// ── Period Picker ──────────────────────────────────────────────────────────────

function PeriodPicker({
  label,
  selected,
  onSelect,
  highlightColor,
}: {
  label: string;
  selected: number;
  onSelect: (period: number) => void;
  highlightColor?: string;
}) {
  const color = highlightColor ?? TEAL;
  return (
    <View style={{ marginTop: 4 }}>
      <Text style={fm.label}>{label}</Text>
      <View style={pp.grid}>
        {Array.from({ length: 16 }, (_, i) => i + 1).map((p) => {
          const isSelected = selected === p;
          const session = PERIOD_MAP[p].session;
          const sessionColor = isSelected ? "#fff" : SESSION_COLORS[session];
          return (
            <TouchableOpacity
              key={p}
              style={[
                pp.cell,
                isSelected && { backgroundColor: color, borderColor: color },
                !isSelected && {
                  borderColor: SESSION_COLORS[session] + "40",
                  backgroundColor: SESSION_COLORS[session] + "08",
                },
              ]}
              onPress={() => onSelect(p)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  pp.cellNum,
                  {
                    color: sessionColor,
                    fontWeight: isSelected ? "800" : "600",
                  },
                ]}
              >
                {p}
              </Text>
              <Text
                style={[
                  pp.cellTime,
                  { color: isSelected ? "#e0f2fe" : "#94a3b8" },
                ]}
              >
                {PERIOD_MAP[p].start}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {/* Session legend */}
      <View style={pp.legend}>
        {(["morning", "afternoon", "evening"] as const).map((s) => (
          <View key={s} style={pp.legendItem}>
            <View
              style={[pp.legendDot, { backgroundColor: SESSION_COLORS[s] }]}
            />
            <Text style={pp.legendText}>
              {s === "morning"
                ? "Sáng (T1–6)"
                : s === "afternoon"
                  ? "Chiều (T7–12)"
                  : "Tối (T13–16)"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Main ScheduleFormModal ─────────────────────────────────────────────────────

interface ScheduleFormModalProps {
  mode: "add" | "edit";
  initialData?: Partial<ScheduleFormData>;
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleFormData) => Promise<void>;
}

export function ScheduleFormModal({
  mode,
  initialData,
  visible,
  onClose,
  onSubmit,
}: ScheduleFormModalProps) {
  const isAdd = mode === "add";
  const { width: winW } = useWindowDimensions();
  const isLargeScreen = winW >= 600;

  // ── form state ──
  const today = dateToISO(new Date());
  const blank: ScheduleFormData = {
    courseId: "",
    courseName: "",
    classId: "",
    className: "",
    subjectId: "",
    subjectName: "",
    teacherId: "",
    teacherName: "",
    buildingId: "",
    buildingName: "",
    roomId: "",
    dayOfWeek: 2,
    scheduleType: "CLASS",
    pattern: "RECURRING_WEEKLY",
    startDate: today,
    endDate: "",
    startPeriod: 1,
    endPeriod: 1,
    startTime: "06:30",
    endTime: "07:20",
    room: "",
  };
  const [form, setForm] = useState<ScheduleFormData>(blank);
  const [submitting, setSubmitting] = useState(false);

  // ── data ──
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSubj, setLoadingSubj] = useState(false);

  // ── picker visibility ──
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showTeacherPicker, setShowTeacherPicker] = useState(false);
  const [showBuildingPicker, setShowBuildingPicker] = useState(false);
  const [showRoomPicker, setShowRoomPicker] = useState(false);

  // ── init on open ──
  useEffect(() => {
    if (!visible) return;
    if (initialData) {
      setForm({ ...blank, ...initialData });
    } else {
      setForm(blank);
    }
  }, [visible]);

  // ── fetch subjects on open ──
  useEffect(() => {
    if (!visible) return;
    setLoadingSubj(true);
    subjectService
      .getSubjects()
      .then((data) => {
        setSubjects(
          data.map((s) => ({
            id: s.id,
            code: s.code ?? "",
            name: s.name ?? "",
            teacherLTId: s.teacherLTId ?? null,
            teacherLTName: s.teacherLTName ?? null,
            teacherTHId: s.teacherTHId ?? null,
            teacherTHName: s.teacherTHName ?? null,
          })),
        );
      })
      .finally(() => setLoadingSubj(false));
  }, [visible]);

  // ── fetch buildings on open ──
  useEffect(() => {
    if (!visible) return;
    setLoadingBuildings(true);
    import("@/apis/config/apiClient")
      .then(({ default: apiClient }) => apiClient.get("/buildings"))
      .then((res: any) => {
        const data: any[] = res.data?.data ?? [];
        setBuildings(
          data.map((b) => ({
            id: b.id,
            name: b.name ?? "",
          })),
        );
      })
      .finally(() => setLoadingBuildings(false));
  }, [visible]);

  // ── when subject changes → fetch courses by subject ──
  useEffect(() => {
    if (!form.subjectId) {
      setCourses([]);
      setForm((p) => ({
        ...p,
        courseId: "",
        courseName: "",
        classId: "",
        className: "",
      }));
      return;
    }

    setLoadingCourses(true);
    courseService
      .getAllCourses({ subjectId: form.subjectId })
      .then((data) => {
        setCourses(data);
      })
      .finally(() => setLoadingCourses(false));
  }, [form.subjectId]);

  // ── when building changes → fetch rooms by building ──
  useEffect(() => {
    if (!form.buildingId) {
      setRooms([]);
      setForm((p) => ({ ...p, roomId: "", room: "" }));
      return;
    }

    setLoadingRooms(true);
    import("@/apis/config/apiClient")
      .then(({ default: apiClient }) =>
        apiClient.get("/rooms", { params: { buildingId: form.buildingId } }),
      )
      .then((res: any) => {
        const data: any[] = res.data?.data ?? [];
        setRooms(
          data.map((r) => ({
            id: r.id,
            name: r.name ?? "",
            buildingId: r.buildingId ?? "",
            buildingName: r.buildingName ?? "",
          })),
        );
      })
      .finally(() => setLoadingRooms(false));
  }, [form.buildingId]);

  // ── edit mode helper: infer building/room from existing room name ──
  useEffect(() => {
    if (!visible || !form.room || form.roomId || form.buildingId) return;

    import("@/apis/config/apiClient")
      .then(({ default: apiClient }) => apiClient.get("/rooms"))
      .then((res: any) => {
        const data: any[] = res.data?.data ?? [];
        const matched = data.find(
          (r) =>
            String(r.name ?? "")
              .trim()
              .toLowerCase() ===
            String(form.room ?? "")
              .trim()
              .toLowerCase(),
        );
        if (!matched) return;
        setForm((p) => ({
          ...p,
          buildingId: matched.buildingId ?? "",
          buildingName: matched.buildingName ?? "",
          roomId: matched.id ?? "",
          room: matched.name ?? p.room,
        }));
      })
      .catch(() => undefined);
  }, [visible, form.room, form.roomId, form.buildingId]);

  // ── when course changes → populate teachers ──
  useEffect(() => {
    if (!form.courseId) {
      setTeachers([]);
      return;
    }
    const selectedCourse = courses.find((c) => c.id === form.courseId);
    if (!selectedCourse) {
      setTeachers([]);
      return;
    }

    const list: TeacherOption[] = [];
    if (selectedCourse.theoryLectureId && selectedCourse.theoryLectureName) {
      list.push({
        id: selectedCourse.theoryLectureId,
        name: `${selectedCourse.theoryLectureName} (LT)`,
        role: "LT",
      });
    }
    if (
      selectedCourse.practiceTeacherId &&
      selectedCourse.practiceTeacherName
    ) {
      list.push({
        id: selectedCourse.practiceTeacherId,
        name: `${selectedCourse.practiceTeacherName} (TH)`,
        role: "TH",
      });
    }

    const uniqueList = list.filter(
      (teacher, index, arr) =>
        arr.findIndex((t) => t.id === teacher.id) === index,
    );

    setTeachers(uniqueList);
    // reset teacher if course changed and old teacher not in list
    if (form.teacherId && !uniqueList.find((t) => t.id === form.teacherId)) {
      setForm((p) => ({ ...p, teacherId: "", teacherName: "" }));
    }
  }, [form.courseId, courses]);

  const handleSubmit = async () => {
    if (!form.subjectId) {
      alert("Vui lòng chọn môn học.");
      return;
    }
    if (!form.courseId) {
      alert("Vui lòng chọn học phần (course).");
      return;
    }
    if (!form.teacherId) {
      alert("Vui lòng chọn giảng viên.");
      return;
    }
    if (!form.buildingId) {
      alert("Vui lòng chọn tòa nhà.");
      return;
    }
    if (!form.roomId || !form.room) {
      alert("Vui lòng chọn phòng học.");
      return;
    }
    if (!form.startDate) {
      alert(
        form.pattern === "ONE_TIME"
          ? "Vui lòng chọn ngày diễn ra."
          : "Vui lòng chọn ngày bắt đầu.",
      );
      return;
    }
    if (!form.startPeriod || !form.endPeriod) {
      alert("Vui lòng chọn tiết bắt đầu và kết thúc.");
      return;
    }
    if (form.endPeriod < form.startPeriod) {
      alert("Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu.");
      return;
    }
    if (
      form.pattern === "RECURRING_WEEKLY" &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      alert("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  // ── pickers item lists ──
  const courseItems: PickerItem[] = courses.map((c) => ({
    id: c.id,
    primary: c.name,
    secondary: `${c.semesterName ?? ""} • ${c.subjectName ?? ""}`
      .replace(/^ • | • $/g, "")
      .replace(/^•|•$/, "")
      .trim(),
    badge: c.subjectName ?? "",
  }));

  const subjectItems: PickerItem[] = subjects.map((s) => ({
    id: s.id,
    primary: s.name,
    secondary: `LT: ${s.teacherLTName ?? "—"} | TH: ${s.teacherTHName ?? "—"}`,
    badge: s.code,
  }));

  const teacherItems: PickerItem[] = teachers.map((t) => ({
    id: t.id,
    primary: t.name,
    secondary:
      t.role === "LT" ? "Giảng viên Lý thuyết" : "Giảng viên Thực hành",
  }));

  const buildingItems: PickerItem[] = buildings.map((b) => ({
    id: b.id,
    primary: b.name,
  }));

  const roomItems: PickerItem[] = rooms.map((r) => ({
    id: r.id,
    primary: r.name,
    secondary: r.buildingName ?? "",
  }));

  return (
    <>
      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={fm.overlay}>
          <View style={fm.sheet}>
            <View style={fm.handle} />
            {/* Header */}
            <View style={fm.header}>
              <View style={fm.headerIcon}>
                <Ionicons
                  name={isAdd ? "add-circle" : "create"}
                  size={22}
                  color={TEAL}
                />
              </View>
              <Text style={fm.title}>
                {isAdd ? "Tạo lịch học mới" : "Chỉnh sửa lịch học"}
              </Text>
              <TouchableOpacity onPress={onClose} style={fm.closeBtn}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── Step 1: Subject ── */}
              <SectionHeader step={1} label="Chọn môn học" />
              <PickerButton
                label="Môn học *"
                value={form.subjectName}
                placeholder="Nhấn để chọn môn học..."
                icon="book-outline"
                onPress={() => setShowSubjectPicker(true)}
              />
              {/* ── Step 2: Course by subject ── */}
              <SectionHeader step={2} label="Chọn học phần theo môn học" />
              <PickerButton
                label="Học phần (Course) *"
                value={form.courseName || form.className}
                placeholder={
                  form.subjectId
                    ? loadingCourses
                      ? "Đang tải học phần..."
                      : "Nhấn để chọn học phần..."
                    : "Chọn môn học trước"
                }
                icon="school-outline"
                onPress={() => setShowCoursePicker(true)}
                disabled={!form.subjectId || loadingCourses}
              />
              {/* ── Step 3: Teacher (from subject) ── */}
              <SectionHeader step={3} label="Chọn giảng viên của môn học" />
              {form.courseId && teachers.length === 0 && (
                <View style={fm.infoBox}>
                  <Ionicons
                    name="information-circle-outline"
                    size={15}
                    color="#f59e0b"
                  />
                  <Text style={fm.infoText}>
                    Học phần này chưa có giảng viên được gán.
                  </Text>
                </View>
              )}
              <PickerButton
                label="Giảng viên *"
                value={form.teacherName}
                placeholder={
                  form.courseId
                    ? teachers.length
                      ? "Chọn giảng viên..."
                      : "Không có GV nào"
                    : "Chọn học phần trước"
                }
                icon="person-circle-outline"
                accent="#8b5cf6"
                onPress={() => setShowTeacherPicker(true)}
                disabled={!form.courseId || teachers.length === 0}
              />
              {/* ── Step 4: Schedule details ── */}
              <SectionHeader step={4} label="Thời gian & địa điểm" />
              <Text style={[fm.label, { marginTop: 2 }]}>Địa điểm</Text>
              <PickerButton
                label="Tòa nhà *"
                value={form.buildingName ?? ""}
                placeholder={
                  loadingBuildings
                    ? "Đang tải tòa nhà..."
                    : "Nhấn để chọn tòa nhà..."
                }
                icon="business-outline"
                accent="#0f766e"
                onPress={() => setShowBuildingPicker(true)}
                disabled={loadingBuildings || buildings.length === 0}
              />
              <PickerButton
                label="Phòng học *"
                value={form.room}
                placeholder={
                  form.buildingId
                    ? loadingRooms
                      ? "Đang tải phòng..."
                      : "Nhấn để chọn phòng..."
                    : "Chọn tòa nhà trước"
                }
                icon="location-outline"
                accent="#0369a1"
                onPress={() => setShowRoomPicker(true)}
                disabled={
                  !form.buildingId || loadingRooms || rooms.length === 0
                }
              />
              <Text style={[fm.label, { marginTop: 2 }]}>Loại lịch</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                <TouchableOpacity
                  style={[
                    fm.choiceChip,
                    form.scheduleType === "CLASS" && fm.choiceChipActive,
                  ]}
                  onPress={() =>
                    setForm((p) => ({ ...p, scheduleType: "CLASS" }))
                  }
                >
                  <Text
                    style={[
                      fm.choiceChipText,
                      form.scheduleType === "CLASS" && fm.choiceChipTextActive,
                    ]}
                  >
                    Lịch học
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    fm.choiceChip,
                    form.scheduleType === "EXAM" && fm.choiceChipActive,
                  ]}
                  onPress={() =>
                    setForm((p) => ({
                      ...p,
                      scheduleType: "EXAM",
                      pattern: "ONE_TIME",
                      endDate: "",
                    }))
                  }
                >
                  <Text
                    style={[
                      fm.choiceChipText,
                      form.scheduleType === "EXAM" && fm.choiceChipTextActive,
                    ]}
                  >
                    Lịch thi
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[fm.label, { marginTop: 2 }]}>Kiểu lịch</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                <TouchableOpacity
                  style={[
                    fm.choiceChip,
                    form.pattern === "RECURRING_WEEKLY" && fm.choiceChipActive,
                  ]}
                  onPress={() =>
                    setForm((p) => ({ ...p, pattern: "RECURRING_WEEKLY" }))
                  }
                  disabled={form.scheduleType === "EXAM"}
                >
                  <Text
                    style={[
                      fm.choiceChipText,
                      form.pattern === "RECURRING_WEEKLY" &&
                        fm.choiceChipTextActive,
                    ]}
                  >
                    Lặp hằng tuần
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    fm.choiceChip,
                    form.pattern === "ONE_TIME" && fm.choiceChipActive,
                  ]}
                  onPress={() =>
                    setForm((p) => ({ ...p, pattern: "ONE_TIME", endDate: "" }))
                  }
                >
                  <Text
                    style={[
                      fm.choiceChipText,
                      form.pattern === "ONE_TIME" && fm.choiceChipTextActive,
                    ]}
                  >
                    Một lần
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Start & End dates */}
              <View
                style={{
                  flexDirection: isLargeScreen ? "row" : "column",
                  gap: isLargeScreen ? 16 : 0,
                  zIndex: 100,
                  elevation: 100,
                }}
              >
                <View
                  style={{
                    flex: isLargeScreen ? 1 : undefined,
                    zIndex: 100,
                    elevation: 100,
                  }}
                >
                  <MiniCalendar
                    label={
                      form.pattern === "ONE_TIME"
                        ? "Ngày diễn ra *"
                        : "Ngày bắt đầu *"
                    }
                    selected={form.startDate}
                    accent={TEAL}
                    zIndex={100}
                    onSelect={(iso) => {
                      const dow = jsDayToBackend(
                        new Date(iso + "T00:00:00").getDay(),
                      );
                      setForm((p) => ({
                        ...p,
                        startDate: iso,
                        dayOfWeek: dow,
                        endDate: p.endDate && p.endDate < iso ? "" : p.endDate,
                      }));
                    }}
                  />
                </View>

                {form.pattern === "RECURRING_WEEKLY" && (
                  <View
                    style={{
                      flex: isLargeScreen ? 1 : undefined,
                      zIndex: 90,
                      elevation: 90,
                    }}
                  >
                    <MiniCalendar
                      label="Ngày kết thúc (tùy chọn)"
                      selected={form.endDate}
                      accent="#8b5cf6"
                      clearable
                      zIndex={90}
                      onClear={() => setForm((p) => ({ ...p, endDate: "" }))}
                      onSelect={(iso) =>
                        setForm((p) => ({ ...p, endDate: iso }))
                      }
                    />
                  </View>
                )}
              </View>
              {/* Spacing wrapper so the content flow isn't completely messed up since we made modals absolute */}
              <View style={{ zIndex: 10, elevation: 10 }}>
                {/* Period pickers */}
                <PeriodPicker
                  label="Tiết bắt đầu *"
                  selected={form.startPeriod}
                  highlightColor={TEAL}
                  onSelect={(p) => {
                    const t = periodToTime(p);
                    setForm((prev) => ({
                      ...prev,
                      startPeriod: p,
                      startTime: t.start,
                      // auto-advance endPeriod if it's less than startPeriod
                      endPeriod: Math.max(prev.endPeriod, p),
                      endTime: periodToTime(Math.max(prev.endPeriod, p)).end,
                    }));
                  }}
                />
                <PeriodPicker
                  label="Tiết kết thúc *"
                  selected={form.endPeriod}
                  highlightColor="#8b5cf6"
                  onSelect={(p) => {
                    const t = periodToTime(p);
                    setForm((prev) => ({
                      ...prev,
                      endPeriod: p,
                      endTime: t.end,
                      // auto-retreat startPeriod if it's more than endPeriod
                      startPeriod: Math.min(prev.startPeriod, p),
                      startTime: periodToTime(Math.min(prev.startPeriod, p))
                        .start,
                    }));
                  }}
                />

                {/* Preview */}
                {(form.className || form.subjectName) && (
                  <PreviewCard form={form} />
                )}
              </View>{" "}
              {/* End spacing wrapper */}
              {/* Submit */}
              <TouchableOpacity
                style={[fm.submitBtn, submitting && { opacity: 0.65 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name={isAdd ? "add-circle-outline" : "checkmark-outline"}
                      size={18}
                      color="#fff"
                    />
                    <Text style={fm.submitBtnText}>
                      {isAdd ? "Tạo lịch học" : "Lưu thay đổi"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Course Picker */}
      <PickerModal
        visible={showCoursePicker}
        title="Chọn học phần"
        items={courseItems}
        selectedId={form.courseId ?? ""}
        loading={loadingCourses}
        emptyText={
          form.subjectId
            ? "Môn học này chưa có học phần"
            : "Vui lòng chọn môn học trước"
        }
        onClose={() => setShowCoursePicker(false)}
        onSelect={(item) =>
          setForm((p) => ({
            ...p,
            courseId: item.id,
            courseName: item.primary,
            teacherId: "",
            teacherName: "",
          }))
        }
      />

      {/* Subject Picker */}
      <PickerModal
        visible={showSubjectPicker}
        title="Chọn môn học"
        items={subjectItems}
        selectedId={form.subjectId}
        loading={loadingSubj}
        emptyText="Chưa có môn học nào"
        onClose={() => setShowSubjectPicker(false)}
        onSelect={(item) =>
          setForm((p) => ({
            ...p,
            subjectId: item.id,
            subjectName: item.primary,
            // reset dependent selections when subject changes
            courseId: "",
            courseName: "",
            teacherId: "",
            teacherName: "",
          }))
        }
      />

      {/* Teacher Picker */}
      <PickerModal
        visible={showTeacherPicker}
        title="Chọn giảng viên"
        items={teacherItems}
        selectedId={form.teacherId}
        loading={false}
        emptyText={
          form.courseId
            ? "Học phần này chưa có giảng viên"
            : "Vui lòng chọn học phần trước"
        }
        onClose={() => setShowTeacherPicker(false)}
        onSelect={(item) =>
          setForm((p) => ({
            ...p,
            teacherId: item.id,
            teacherName: item.primary,
          }))
        }
      />

      {/* Building Picker */}
      <PickerModal
        visible={showBuildingPicker}
        title="Chọn tòa nhà"
        items={buildingItems}
        selectedId={form.buildingId ?? ""}
        loading={loadingBuildings}
        emptyText="Chưa có tòa nhà"
        onClose={() => setShowBuildingPicker(false)}
        onSelect={(item) =>
          setForm((p) => ({
            ...p,
            buildingId: item.id,
            buildingName: item.primary,
            roomId: "",
            room: "",
          }))
        }
      />

      {/* Room Picker */}
      <PickerModal
        visible={showRoomPicker}
        title="Chọn phòng học"
        items={roomItems}
        selectedId={form.roomId ?? ""}
        loading={loadingRooms}
        emptyText={
          form.buildingId
            ? "Tòa nhà này chưa có phòng"
            : "Vui lòng chọn tòa nhà trước"
        }
        onClose={() => setShowRoomPicker(false)}
        onSelect={(item) =>
          setForm((p) => ({
            ...p,
            roomId: item.id,
            room: item.primary,
          }))
        }
      />
    </>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ step, label }: { step: number; label: string }) {
  return (
    <View style={fm.sectionHeader}>
      <View style={fm.stepBadge}>
        <Text style={fm.stepText}>{step}</Text>
      </View>
      <Text style={fm.sectionLabel}>{label}</Text>
    </View>
  );
}

// ── Preview card ───────────────────────────────────────────────────────────────

function PreviewCard({ form }: { form: ScheduleFormData }) {
  const periodRange =
    form.startPeriod && form.endPeriod
      ? form.startPeriod === form.endPeriod
        ? `Tiết ${form.startPeriod} (${form.startTime}–${form.endTime})`
        : `Tiết ${form.startPeriod}–${form.endPeriod} (${form.startTime}–${form.endTime})`
      : "";
  const dateRange = form.startDate
    ? form.endDate
      ? `${form.startDate} → ${form.endDate}`
      : `Từ ${form.startDate}`
    : "";
  return (
    <View style={fm.preview}>
      <Text style={fm.previewTitle}>Xem trước lịch học</Text>
      <View style={fm.previewRow}>
        <Ionicons name="school-outline" size={13} color={TEAL} />
        <Text style={fm.previewText} numberOfLines={1}>
          {form.className || "—"}
        </Text>
      </View>
      <View style={fm.previewRow}>
        <Ionicons name="book-outline" size={13} color={TEAL} />
        <Text style={fm.previewText} numberOfLines={1}>
          {form.subjectName || "—"}
        </Text>
      </View>
      {form.teacherName && (
        <View style={fm.previewRow}>
          <Ionicons name="person-outline" size={13} color={TEAL} />
          <Text style={fm.previewText} numberOfLines={1}>
            {form.teacherName}
          </Text>
        </View>
      )}
      <View style={fm.previewRow}>
        <Ionicons name="calendar-outline" size={13} color={TEAL} />
        <Text style={fm.previewText}>
          {DAY_LABELS[form.dayOfWeek] ?? "—"}
          {periodRange ? `  •  ${periodRange}` : ""}
          {form.room
            ? `  •  ${form.buildingName ? `${form.buildingName} - ` : ""}Phòng ${form.room}`
            : ""}
        </Text>
      </View>
      {dateRange !== "" && (
        <View style={fm.previewRow}>
          <Ionicons name="today-outline" size={13} color={TEAL} />
          <Text style={fm.previewText}>{dateRange}</Text>
        </View>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const fm = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 4,
    maxHeight: "94%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: TEAL + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, fontSize: 17, fontWeight: "800", color: "#1e293b" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 4,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginTop: 10,
  },

  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 10,
  },
  pickerIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pickerText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1e293b" },
  pickerPlaceholder: { color: "#94a3b8", fontWeight: "400" },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginTop: 6,
  },
  infoText: { flex: 1, fontSize: 12, color: "#92400e" },

  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  choiceChipActive: { backgroundColor: TEAL + "14", borderColor: TEAL },
  choiceChipText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  choiceChipTextActive: { color: TEAL, fontWeight: "700" },

  dowChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  dowChipActive: { backgroundColor: TEAL + "15", borderColor: TEAL },
  dowChipText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  dowChipTextActive: { color: TEAL, fontWeight: "700" },

  timeInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  timeInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: 1,
  },

  roomInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  roomTextInput: { flex: 1, fontSize: 14, color: "#1e293b" },

  preview: {
    backgroundColor: TEAL + "08",
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: TEAL + "25",
    gap: 7,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: TEAL,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewText: { fontSize: 13, color: "#1e293b", fontWeight: "500", flex: 1 },

  submitBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: TEAL,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

// ── Mini Calendar styles ────────────────────────────────────────────────────

const mc = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  triggerIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1e293b" },
  triggerPlaceholder: { color: "#94a3b8", fontWeight: "400" },

  wrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 10,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: TEAL + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  headRow: { flexDirection: "row", marginBottom: 4 },
  headText: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  cellSel: { backgroundColor: TEAL },
  cellToday: { borderWidth: 1.5, borderColor: TEAL },
  cellOther: { opacity: 0.3 },
  cellText: { fontSize: 12, fontWeight: "600", color: "#1e293b" },
  cellTextSel: { color: "#fff", fontWeight: "800" },
  cellTextToday: { color: TEAL, fontWeight: "800" },
  cellTextOther: { color: "#94a3b8" },
  cellTextSun: { color: "#ef4444" },
});

// ── Period Picker styles ─────────────────────────────────────────────────────────

const pp = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: {
    width: 64,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cellNum: { fontSize: 16, fontWeight: "700" },
  cellTime: { fontSize: 9, fontWeight: "500" },
  legend: { flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: "#94a3b8" },
});
