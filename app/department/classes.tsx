import { LinearGradient } from "expo-linear-gradient";
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
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog, { useConfirmDialog } from "@/components/ConfirmDialog";
import { Ionicons } from "@expo/vector-icons";
import { classService } from "@/apis/services/class.service";
import { semesterService, Semester } from "@/apis/services/semester.service";
import {
  ClassResponse,
  ClassStudentResponse,
  CreateClassRequest,
  UpdateClassRequest,
} from "@/apis/types/class.types";
import { DropdownPicker } from "@/components/DropdownPicker";

// ─── Constants ────────────────────────────────────────────────────────────────

const PINK = "#ec4899";
const MENU_WIDTH = 176;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
}

function getSemesters(classes: ClassResponse[]): string[] {
  const set = new Set<string>();
  classes.forEach((c) => {
    if (c.semester) set.add(c.semester);
  });
  return Array.from(set).sort().reverse();
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <View style={s.emptyBox}>
      <Ionicons name="school-outline" size={52} color="#cbd5e1" />
      <Text style={s.emptyTitle}>
        {query ? "Không tìm thấy kết quả" : "Chưa có lớp học nào"}
      </Text>
      <Text style={s.emptySubtitle}>
        {query ? `Không khớp với "${query}"` : "Nhấn + để tạo lớp học mới"}
      </Text>
    </View>
  );
}

function ClassStudentsModal({
  cls,
  visible,
  onClose,
}: {
  cls: ClassResponse | null;
  visible: boolean;
  onClose: () => void;
}) {
  const [students, setStudents] = useState<ClassStudentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingMode, setAddingMode] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const { showToast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();

  const fetchStudents = useCallback(async () => {
    if (!cls) return;
    try {
      setLoading(true);
      const data = await classService.getStudentsByClass(cls.id);
      setStudents(data);
    } catch (err: any) {
      showToast(err?.message || "Không thể tải danh sách sinh viên", "error");
    } finally {
      setLoading(false);
    }
  }, [cls]);

  useEffect(() => {
    if (visible && cls) {
      fetchStudents();
      setSearchQ("");
      setAddingMode(false);
      setStudentIdInput("");
    }
  }, [visible, cls, fetchStudents]);

  const handleAdd = async () => {
    const sid = studentIdInput.trim();
    if (!sid) {
      showToast("Vui lòng nhập mã số sinh viên.", "error");
      return;
    }
    if (!cls) return;
    try {
      setSubmitting(true);
      const added = await classService.addStudentToClass(cls.id, sid);
      setStudents((prev) => [...prev, added]);
      setStudentIdInput("");
      setAddingMode(false);
      showToast(`Đã thêm sinh viên ${added.name} vào lớp!`, "success");
    } catch (err: any) {
      showToast(err?.message || "Không thể thêm sinh viên", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = (student: ClassStudentResponse) => {
    if (!cls) return;
    confirm({
      title: "Xác nhận",
      message: `Xóa ${student.name} khỏi lớp "${cls.name}"?`,
      confirmText: "Xóa",
      variant: "danger",
      onConfirm: async () => {
        try {
          await classService.removeStudentFromClass(
            cls.id,
            student.studentId ?? student.id,
          );
          setStudents((prev) => prev.filter((sv) => sv.id !== student.id));
        } catch (err: any) {
          showToast(err?.message || "Không thể xóa sinh viên", "error");
        }
      },
    });
  };

  if (!cls) return null;

  const filtered = students.filter((sv) => {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return (
      sv.name.toLowerCase().includes(q) ||
      (sv.studentId ?? "").toLowerCase().includes(q) ||
      sv.email.toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.sheetOverlay}>
        <View style={[s.sheetContent, { maxHeight: "92%" }]}>
          <View style={s.sheetHandle} />

          {/* Header */}
          <View style={s.studentsHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.studentsTitle} numberOfLines={1}>
                {cls.name}
              </Text>
              <Text style={s.studentsSubtitle}>
                {students.length} sinh viên
              </Text>
            </View>
            <TouchableOpacity
              style={s.addStudentBtn}
              onPress={() => setAddingMode((v) => !v)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={addingMode ? "close" : "person-add-outline"}
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity style={s.closeBtnCircle} onPress={onClose}>
              <Ionicons name="close" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Add student form */}
          {addingMode && (
            <View style={s.addStudentForm}>
              <TextInput
                style={s.addStudentInput}
                placeholder="Nhập mã số sinh viên (VD: 20104321)"
                placeholderTextColor="#94a3b8"
                value={studentIdInput}
                onChangeText={setStudentIdInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
              <TouchableOpacity
                style={[
                  s.addStudentConfirmBtn,
                  submitting && { opacity: 0.65 },
                ]}
                onPress={handleAdd}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Search */}
          <View style={s.studentSearchBar}>
            <Ionicons name="search" size={15} color="#94a3b8" />
            <TextInput
              style={s.studentSearchInput}
              placeholder="Tìm tên, mã SV, email..."
              placeholderTextColor="#94a3b8"
              value={searchQ}
              onChangeText={setSearchQ}
            />
            {searchQ.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQ("")}>
                <Ionicons name="close-circle" size={15} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          {loading ? (
            <View style={s.centerBox}>
              <ActivityIndicator color={PINK} />
              <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
                Đang tải...
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {filtered.length === 0 ? (
                <View style={s.centerBox}>
                  <Ionicons name="people-outline" size={44} color="#cbd5e1" />
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#94a3b8",
                      marginTop: 8,
                      textAlign: "center",
                    }}
                  >
                    {searchQ
                      ? `Không khớp với "${searchQ}"`
                      : "Lớp chưa có sinh viên\nNhấn icon + để thêm"}
                  </Text>
                </View>
              ) : (
                filtered.map((sv) => (
                  <View key={sv.id} style={s.studentRow}>
                    <View style={s.studentAvatar}>
                      <Text style={s.studentAvatarText}>
                        {sv.name.trim().charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={s.studentInfo}>
                      <Text style={s.studentName} numberOfLines={1}>
                        {sv.name}
                      </Text>
                      <Text style={s.studentMeta}>
                        {sv.studentId ? `MSSV: ${sv.studentId}` : sv.email}
                      </Text>
                    </View>
                    <View
                      style={[
                        s.studentStatus,
                        {
                          backgroundColor: sv.isActive ? "#dcfce7" : "#fef3c7",
                        },
                      ]}
                    >
                      <View
                        style={[
                          s.statusDot,
                          {
                            backgroundColor: sv.isActive
                              ? "#10b981"
                              : "#f59e0b",
                          },
                        ]}
                      />
                    </View>
                    <TouchableOpacity
                      style={s.removeBtn}
                      onPress={() => handleRemove(sv)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="person-remove-outline"
                        size={17}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
              <View style={{ height: 24 }} />
            </ScrollView>
          )}
        </View>
      </View>
      <ConfirmDialog {...dialogProps} />
    </Modal>
  );
}

// ─── Class Card with 3-dot menu ───────────────────────────────────────────────

interface ClassAction {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  onPress: () => void;
}

function ClassCard({
  cls,
  onEdit,
  onDetail,
  onDelete,
  onStudents,
}: {
  cls: ClassResponse;
  onEdit: () => void;
  onDetail: () => void;
  onDelete: () => void;
  onStudents: () => void;
}) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const menuBtnRef = useRef<View>(null);

  const actions: ClassAction[] = [
    {
      label: "Sinh viên",
      icon: "people-outline",
      color: "#10b981",
      onPress: onStudents,
    },
    {
      label: "Chi tiết",
      icon: "information-circle-outline",
      color: "#8b5cf6",
      onPress: onDetail,
    },
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
    menuBtnRef.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setMenuTop(py + h + 6);
      setMenuVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 160,
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
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.88);
      cb?.();
    });
  };

  const initials = cls.name.trim().charAt(0).toUpperCase();

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.cardAvatar}>
          <Text style={s.cardAvatarText}>{initials}</Text>
        </View>
        <View style={s.cardNameBlock}>
          <Text style={s.cardName} numberOfLines={2}>
            {cls.name}
          </Text>
          <View style={s.cardMeta}>
            <View style={s.codePill}>
              <Text style={s.codeText}>{cls.code}</Text>
            </View>
            {cls.semester && (
              <View style={s.semPill}>
                <Text style={s.semText}>{cls.semester}</Text>
              </View>
            )}
          </View>
        </View>
        <View ref={menuBtnRef} collapsable={false}>
          <TouchableOpacity
            style={s.dotBtn}
            onPress={openMenu}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.cardInfo}>
        {cls.subjectName && (
          <InfoRow icon="book-outline" text={`Môn: ${cls.subjectName}`} />
        )}
        {cls.teacherName && (
          <InfoRow icon="person-outline" text={`GV: ${cls.teacherName}`} />
        )}
        {cls.studentCount != null && (
          <InfoRow
            icon="people-outline"
            text={`Sĩ số: ${cls.studentCount} sinh viên`}
          />
        )}
        <InfoRow
          icon="calendar-outline"
          text={`Tạo: ${fmtDate(cls.createdAt)}`}
        />
      </View>

      {/* Students quick-access strip */}
      <TouchableOpacity
        style={s.studentsStrip}
        onPress={onStudents}
        activeOpacity={0.7}
      >
        <View style={s.studentsStripLeft}>
          <Ionicons name="people" size={14} color={PINK} />
          <Text style={s.studentsStripText}>
            {cls.studentCount != null
              ? `${cls.studentCount} sinh viên`
              : "Xem danh sách sinh viên"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={PINK} />
      </TouchableOpacity>

      {/* 3-dot dropdown */}
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
          {actions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={[s.menuItem, idx < actions.length - 1 && s.menuItemBorder]}
              activeOpacity={0.75}
              onPress={() => closeMenu(() => setTimeout(action.onPress, 50))}
            >
              <View
                style={[
                  s.menuItemIcon,
                  { backgroundColor: action.color + "18" },
                ]}
              >
                <Ionicons name={action.icon} size={15} color={action.color} />
              </View>
              <Text style={[s.menuItemText, { color: action.color }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Modal>
    </View>
  );
}

function InfoRow({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
}) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon} size={13} color="#94a3b8" />
      <Text style={s.infoText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function ClassDetailModal({
  cls,
  visible,
  onClose,
}: {
  cls: ClassResponse | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!cls) return null;
  const rows: {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    value: string;
  }[] = [
    { icon: "barcode-outline", label: "Mã lớp", value: cls.code },
    { icon: "book-outline", label: "Môn học", value: cls.subjectName ?? "—" },
    {
      icon: "person-outline",
      label: "Giảng viên",
      value: cls.teacherName ?? "—",
    },
    { icon: "calendar-outline", label: "Học kỳ", value: cls.semester ?? "—" },
    {
      icon: "people-outline",
      label: "Sĩ số",
      value: cls.studentCount != null ? String(cls.studentCount) : "—",
    },
    {
      icon: "calendar-number-outline",
      label: "Ngày tạo",
      value: fmtDate(cls.createdAt),
    },
    { icon: "finger-print-outline", label: "ID", value: cls.id },
  ];
  const initials = cls.name.trim().charAt(0).toUpperCase();
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.sheetOverlay}>
        <View style={s.sheetContent}>
          <View style={s.sheetHandle} />
          <TouchableOpacity style={s.closeBtnAbs} onPress={onClose}>
            <Ionicons name="close" size={18} color="#64748b" />
          </TouchableOpacity>
          <View style={s.detailHero}>
            <View style={s.detailAvatar}>
              <Text style={s.detailAvatarText}>{initials}</Text>
            </View>
            <Text style={s.detailName}>{cls.name}</Text>
            <View style={s.detailCodeBadge}>
              <Text style={s.detailCodeText}>{cls.code}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {rows.map((row, idx) => (
              <View key={idx} style={s.detailRow}>
                <View style={s.detailRowIcon}>
                  <Ionicons name={row.icon} size={16} color={PINK} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.detailRowLabel}>{row.label}</Text>
                  <Text style={s.detailRowValue} selectable>
                    {row.value}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function ClassFormModal({
  mode,
  form,
  setForm,
  visible,
  loading,
  onClose,
  onSubmit,
  semesterList,
}: {
  mode: "add" | "edit";
  form: any;
  setForm: any;
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  semesterList: Semester[];
}) {
  const isAdd = mode === "add";
  const fields = [
    {
      label: "Mã lớp" + (isAdd ? " *" : ""),
      key: "code",
      placeholder: "VD: CNTT-K18-01",
    },
    {
      label: "Tên lớp" + (isAdd ? " *" : ""),
      key: "name",
      placeholder: "Công nghệ thông tin K18 - Lớp 1",
    },
    {
      label: "Học kỳ",
      key: "semesterId",
      dropdown: true,
    },
    {
      label: "Sĩ số",
      key: "studentCount",
      placeholder: "45",
      keyboard: "numeric",
      numeric: true,
    },
    {
      label: "ID môn học",
      key: "subjectId",
      placeholder: "UUID môn học (tuỳ chọn)",
    },
    {
      label: "ID giảng viên",
      key: "teacherId",
      placeholder: "UUID giảng viên (tuỳ chọn)",
    },
  ];
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.sheetHandle} />
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>
              {isAdd ? "Tạo lớp học mới" : "Chỉnh sửa lớp học"}
            </Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtnSm}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {fields.map((f) => (
              <View key={f.key}>
                {f.dropdown ? (
                  <View style={{ marginBottom: 12 }}>
                    <DropdownPicker
                      label={f.label}
                      options={semesterList.map((d) => ({ label: d.name, value: d.id }))}
                      selectedValue={form[f.key] || null}
                      onValueChange={(val) =>
                        setForm((prev: any) => ({
                          ...prev,
                          [f.key]: val || undefined,
                        }))
                      }
                      placeholder="Chọn học kỳ"
                      themeColor={PINK}
                    />
                  </View>
                ) : (
                  <>
                    <Text style={s.label}>{f.label}</Text>
                    <TextInput
                      style={s.input}
                      placeholder={f.placeholder}
                      placeholderTextColor="#94a3b8"
                      keyboardType={(f as any).keyboard ?? "default"}
                      value={
                        (f as any).numeric
                          ? form[f.key] != null
                            ? String(form[f.key])
                            : ""
                          : (form[f.key] ?? "")
                      }
                      onChangeText={(v) =>
                        setForm((prev: any) => ({
                          ...prev,
                          [f.key]: (f as any).numeric
                            ? v
                              ? parseInt(v, 10)
                              : undefined
                            : v,
                        }))
                      }
                    />
                  </>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={[s.submitBtn, loading && { opacity: 0.65 }]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={isAdd ? "add-circle-outline" : "checkmark-outline"}
                    size={18}
                    color="#fff"
                  />
                  <Text style={s.submitBtnText}>
                    {isAdd ? "Tạo lớp học" : "Lưu thay đổi"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ClassesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [semesterList, setSemesterList] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassResponse | null>(
    null,
  );

  const [addVisible, setAddVisible] = useState(false);
  const [addForm, setAddForm] = useState<CreateClassRequest>({
    code: "",
    name: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();

  const [editVisible, setEditVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassResponse | null>(null);
  const [editForm, setEditForm] = useState<UpdateClassRequest>({});
  const [saving, setSaving] = useState(false);

  const [studentsVisible, setStudentsVisible] = useState(false);
  const [studentsClass, setStudentsClass] = useState<ClassResponse | null>(
    null,
  );

  const fetchClasses = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const [classData, semData] = await Promise.all([
        classService.getAllClasses(),
        semesterService.getAllSemesters().catch(() => [] as Semester[]),
      ]);
      
      setClasses(classData);
      setSemesterList(semData);
    } catch (err: any) {
      if (err?.status === 403)
        setError(
          "Không có quyền truy cập (403). Vui lòng liên hệ quản trị viên.",
        );
      else if (err?.status === 401)
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      else setError(err?.message || "Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const semesters = getSemesters(classes);
  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => {
      if (c.subjectName) set.add(c.subjectName);
    });
    return Array.from(set).sort();
  }, [classes]);

  const filtered = classes.filter((c) => {
    if (selectedSemester && c.semester !== selectedSemester) return false;
    if (selectedSubject && c.subjectName !== selectedSubject) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.teacherName ?? "").toLowerCase().includes(q) ||
      (c.subjectName ?? "").toLowerCase().includes(q)
    );
  });

  const handleAdd = async () => {
    if (!addForm.code.trim() || !addForm.name.trim()) {
      showToast("Vui lòng nhập mã lớp và tên lớp.", "error");
      return;
    }
    try {
      setSubmitting(true);
      const created = await classService.createClass(addForm);
      setClasses((p) => [created, ...p]);
      setAddVisible(false);
      setAddForm({ code: "", name: "" });
      showToast("Đã tạo lớp học mới!", "success");
    } catch (err: any) {
      showToast(err?.message || "Không thể tạo lớp học", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (cls: ClassResponse) => {
    setEditingClass(cls);
    setEditForm({
      code: cls.code,
      name: cls.name,
      semesterId: cls.semesterId ?? "",
      studentCount: cls.studentCount ?? undefined,
      subjectId: cls.subjectId ?? "",
      teacherId: cls.teacherId ?? "",
    });
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingClass) return;
    if (!editForm.code?.trim() || !editForm.name?.trim()) {
      showToast("Vui lòng nhập mã lớp và tên lớp.", "error");
      return;
    }
    try {
      setSaving(true);
      const updated = await classService.updateClass(editingClass.id, editForm);
      setClasses((p) => p.map((c) => (c.id === updated.id ? updated : c)));
      setEditVisible(false);
      showToast("Đã cập nhật lớp học!", "success");
    } catch (err: any) {
      showToast(err?.message || "Không thể cập nhật lớp học", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cls: ClassResponse) => {
    confirm({
      title: "Xác nhận xóa",
      message: `Xóa lớp "${cls.name}"? Hành động này không thể hoàn tác.`,
      confirmText: "Xóa",
      variant: "danger",
      onConfirm: async () => {
        try {
          await classService.deleteClass(cls.id);
          setClasses((p) => p.filter((c) => c.id !== cls.id));
          showToast("Đã xóa lớp học", "success");
        } catch (err: any) {
          showToast(err?.message || "Không thể xóa lớp học", "error");
        }
      },
    });
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
              Quản lý Học phần
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                marginTop: 4,
              }}
            >
              Xem và quản lý các lớp học
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
            <Ionicons name="school" size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      {/* Search + Add */}
      <View style={[s.topBar, { marginTop: 10, paddingHorizontal: 16 }]}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            style={s.searchInput}
            placeholder="Tìm mã lớp, tên lớp, môn học, GV..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setAddVisible(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter bar */}
      <View style={s.dropdownFiltersContainer}>
        {semesters.length > 0 && (
          <DropdownPicker
            label="Học kỳ"
            options={[
              { label: "Tất cả học kỳ", value: null },
              ...semesters.map((d) => ({ label: d, value: d })),
            ]}
            selectedValue={selectedSemester}
            onValueChange={setSelectedSemester}
            placeholder="Tất cả học kỳ"
            themeColor={PINK}
          />
        )}
        {subjects.length > 0 && (
          <DropdownPicker
            label="Môn học"
            options={[
              { label: "Tất cả môn học", value: null },
              ...subjects.map((d) => ({ label: d, value: d })),
            ]}
            selectedValue={selectedSubject}
            onValueChange={setSelectedSubject}
            placeholder="Tất cả môn học"
            themeColor={PINK}
          />
        )}
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={s.countBadge}>
          <Text style={s.countBadgeText}>
            {filtered.length} / {classes.length} lớp học
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color={PINK} />
          <Text style={s.centerText}>Đang tải danh sách lớp học...</Text>
        </View>
      ) : error ? (
        <View style={s.centerBox}>
          <Ionicons name="cloud-offline-outline" size={52} color="#ef4444" />
          <Text
            style={[
              s.centerText,
              { color: "#ef4444", fontWeight: "600", textAlign: "center" },
            ]}
          >
            {error}
          </Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchClasses()}>
            <Ionicons name="refresh-outline" size={15} color="#fff" />
            <Text style={s.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchClasses(true)}
              colors={[PINK]}
              tintColor={PINK}
            />
          }
        >
          {filtered.length === 0 ? (
            <EmptyState query={searchQuery} />
          ) : (
            filtered.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onEdit={() => handleOpenEdit(cls)}
                onDetail={() => {
                  setSelectedClass(cls);
                  setDetailVisible(true);
                }}
                onDelete={() => handleDelete(cls)}
                onStudents={() => {
                  setStudentsClass(cls);
                  setStudentsVisible(true);
                }}
              />
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Add */}
      <ClassFormModal
        mode="add"
        form={addForm}
        setForm={setAddForm}
        visible={addVisible}
        loading={submitting}
        onClose={() => setAddVisible(false)}
        onSubmit={handleAdd}
        semesterList={semesterList}
      />
      {/* Edit */}
      <ClassFormModal
        mode="edit"
        form={editForm}
        setForm={setEditForm}
        visible={editVisible}
        loading={saving}
        onClose={() => setEditVisible(false)}
        onSubmit={handleSaveEdit}
        semesterList={semesterList}
      />
      {/* Detail */}
      <ClassDetailModal
        cls={selectedClass}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
      {/* Students */}
      <ClassStudentsModal
        cls={studentsClass}
        visible={studentsVisible}
        onClose={() => setStudentsVisible(false)}
      />
      <ConfirmDialog {...dialogProps} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  topBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1e293b" },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: PINK,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },

  countBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countBadgeText: { fontSize: 12, color: "#64748b", fontWeight: "600" },

  // Dropdown (sao chép từ students.tsx)
  dropdownFiltersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  dropdownWrapper: {
    flex: 1,
  },
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
  dropdownItemActive: {
    backgroundColor: PINK + "0f",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#475569",
    flex: 1,
  },
  dropdownItemTextActive: {
    color: PINK,
    fontWeight: "700",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 10,
  },
  cardAvatar: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#fdf2f8",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardAvatarText: { fontSize: 20, fontWeight: "800", color: PINK },
  cardNameBlock: { flex: 1, gap: 5 },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 20,
  },
  cardMeta: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  codePill: {
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  codeText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  semPill: {
    backgroundColor: PINK + "12",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  semText: { fontSize: 11, fontWeight: "700", color: PINK },
  dotBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },

  cardInfo: {
    paddingHorizontal: 14,
    paddingLeft: 70,
    paddingBottom: 10,
    gap: 5,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 13, color: "#64748b", flex: 1 },

  studentsStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 14,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: PINK + "0a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PINK + "25",
  },
  studentsStripLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  studentsStripText: { fontSize: 13, color: PINK, fontWeight: "600" },

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
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: { fontSize: 14, fontWeight: "600" },

  list: { flex: 1, paddingHorizontal: 16 },

  // Center states
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  centerText: { fontSize: 14, color: "#64748b", paddingHorizontal: 24 },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: PINK,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyBox: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#475569" },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b" },
  closeBtnSm: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    color: "#1e293b",
  },
  submitBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: PINK,
    borderRadius: 12,
    padding: 15,
    marginTop: 24,
    marginBottom: 8,
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Sheet (bottom slide)
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheetContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    maxHeight: "88%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  closeBtnAbs: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeBtnCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  // Detail
  detailHero: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 20,
    gap: 10,
  },
  detailAvatar: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: "#fdf2f8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  detailAvatarText: { fontSize: 32, fontWeight: "800", color: PINK },
  detailName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 24,
  },
  detailCodeBadge: {
    backgroundColor: "#fdf2f8",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  detailCodeText: { fontSize: 13, fontWeight: "700", color: PINK },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 8 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    gap: 14,
  },
  detailRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fdf2f8",
    alignItems: "center",
    justifyContent: "center",
  },
  detailRowLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailRowValue: { fontSize: 14, color: "#1e293b", fontWeight: "500" },

  // Students modal
  studentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 12,
    gap: 10,
  },
  studentsTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  studentsSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  addStudentBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PINK,
    alignItems: "center",
    justifyContent: "center",
  },
  addStudentForm: { flexDirection: "row", gap: 8, marginBottom: 12 },
  addStudentInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 11,
    fontSize: 14,
    borderWidth: 1,
    borderColor: PINK + "55",
    color: "#1e293b",
  },
  addStudentConfirmBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: PINK,
    alignItems: "center",
    justifyContent: "center",
  },
  studentSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
    marginBottom: 10,
  },
  studentSearchInput: { flex: 1, fontSize: 13, color: "#1e293b" },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    gap: 12,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fdf2f8",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  studentAvatarText: { fontSize: 16, fontWeight: "700", color: PINK },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  studentMeta: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  studentStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },
});
