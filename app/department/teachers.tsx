import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { teacherService } from "@/apis/services/teacher.service";
import {
  TeacherResponse,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherStatus,
} from "@/apis/types/teacher.types";
import { UserCard } from "@/components/UserCard";
import { DropdownPicker } from "@/components/DropdownPicker";

// ─── Filter Tab Config ────────────────────────────────────────────────────────

type FilterKey = "all" | "active" | "inactive" | "on_leave";

const FILTER_TABS: {
  key: FilterKey;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: "all", label: "Tất cả", icon: "people", color: "#8b5cf6" },
  {
    key: "active",
    label: "Hoạt động",
    icon: "checkmark-circle",
    color: "#10b981",
  },
  {
    key: "on_leave",
    label: "Nghỉ phép",
    icon: "airplane-outline",
    color: "#3b82f6",
  },
  {
    key: "inactive",
    label: "Tạm khóa",
    icon: "pause-circle",
    color: "#f59e0b",
  },
];

/**
 * Suy ra `TeacherStatus` từ dữ liệu backend.
 * Backend hiện tại chưa có trường teacherStatus nên:
 *  - isActive = true  → ACTIVE
 *  - isActive = false + teacherStatus = ON_LEAVE → ON_LEAVE
 *  - isActive = false + khác → INACTIVE
 */
function resolveStatus(t: TeacherResponse): TeacherStatus {
  if (t.teacherStatus === "ON_LEAVE") return "ON_LEAVE";
  return t.isActive ? "ACTIVE" : "INACTIVE";
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={52} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>
        {query ? "Không tìm thấy kết quả" : "Chưa có giảng viên"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {query
          ? `Không khớp với "${query}"`
          : "Nhấn nút + để thêm giảng viên mới"}
      </Text>
    </View>
  );
}

// ─── Teacher Detail Modal ─────────────────────────────────────────────────────

const STATUS_META: Record<TeacherStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Đang hoạt động", color: "#10b981" },
  INACTIVE: { label: "Tạm khóa", color: "#f59e0b" },
  ON_LEAVE: { label: "Nghỉ phép", color: "#3b82f6" },
};

function TeacherDetailModal({
  teacher,
  visible,
  onClose,
}: {
  teacher: TeacherResponse | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!teacher) return null;

  const status = resolveStatus(teacher);
  const { label: statusLabel, color: accent } = STATUS_META[status];
  const initials = teacher.name.trim().charAt(0).toUpperCase();

  const rows: {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    value: string;
  }[] = [
    {
      icon: "id-card-outline",
      label: "Mã giảng viên",
      value: teacher.teacherId ?? "—",
    },
    { icon: "mail-outline", label: "Email", value: teacher.email },
    {
      icon: "call-outline",
      label: "Số điện thoại",
      value: teacher.phone ?? "—",
    },
    {
      icon: "business-outline",
      label: "Khoa / Bộ môn",
      value: teacher.departmentName ?? "—",
    },
    {
      icon: "calendar-outline",
      label: "Ngày tham gia",
      value: teacher.createdAt
        ? new Date(teacher.createdAt).toLocaleDateString("vi-VN")
        : "—",
    },
    { icon: "finger-print-outline", label: "User ID", value: teacher.id },
  ];

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.detailOverlay}>
        <View style={styles.detailSheet}>
          <View style={styles.detailHandle} />

          <TouchableOpacity
            style={styles.detailCloseBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color="#64748b" />
          </TouchableOpacity>

          <View style={styles.detailHero}>
            <View
              style={[styles.detailAvatar, { backgroundColor: accent + "20" }]}
            >
              <Text style={[styles.detailAvatarText, { color: accent }]}>
                {initials}
              </Text>
            </View>
            <Text style={styles.detailName}>{teacher.name}</Text>
            <View
              style={[
                styles.detailStatusBadge,
                { backgroundColor: accent + "18" },
              ]}
            >
              <View
                style={[styles.detailStatusDot, { backgroundColor: accent }]}
              />
              <Text style={[styles.detailStatusText, { color: accent }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <ScrollView
            style={styles.detailScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {rows.map((row, idx) => (
              <View key={idx} style={styles.detailRow}>
                <View style={styles.detailRowIcon}>
                  <Ionicons name={row.icon} size={16} color="#8b5cf6" />
                </View>
                <View style={styles.detailRowContent}>
                  <Text style={styles.detailRowLabel}>{row.label}</Text>
                  <Text style={styles.detailRowValue} selectable>
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

// ─── Edit Teacher Modal ───────────────────────────────────────────────────────

const STATUS_OPTIONS: { label: string; value: TeacherStatus; color: string }[] =
  [
    { label: "Hoạt động", value: "ACTIVE", color: "#10b981" },
    { label: "Nghỉ phép", value: "ON_LEAVE", color: "#3b82f6" },
    { label: "Tạm khóa", value: "INACTIVE", color: "#f59e0b" },
  ];

function EditTeacherModal({
  teacher,
  form,
  setForm,
  editStatus,
  setEditStatus,
  visible,
  saving,
  onClose,
  onSave,
}: {
  teacher: TeacherResponse | null;
  form: UpdateTeacherRequest;
  setForm: React.Dispatch<React.SetStateAction<UpdateTeacherRequest>>;
  editStatus: TeacherStatus;
  setEditStatus: React.Dispatch<React.SetStateAction<TeacherStatus>>;
  visible: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!teacher) return null;

  const fields: {
    label: string;
    key: keyof UpdateTeacherRequest;
    placeholder: string;
    keyboard?: any;
  }[] = [
    { label: "Họ và tên *", key: "name", placeholder: "TS. Nguyễn Văn A" },
    {
      label: "Email *",
      key: "email",
      placeholder: "gv@university.edu.vn",
      keyboard: "email-address",
    },
    {
      label: "Số điện thoại",
      key: "phone",
      placeholder: "0123456789",
      keyboard: "phone-pad",
    },
    {
      label: "Khoa / Bộ môn",
      key: "departmentName",
      placeholder: "VD: Khoa CNTT",
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chỉnh sửa giảng viên</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {fields.map((field) => (
              <View key={field.key as string}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94a3b8"
                  keyboardType={field.keyboard ?? "default"}
                  value={(form as any)[field.key] ?? ""}
                  onChangeText={(v) =>
                    setForm((prev) => ({ ...prev, [field.key]: v }))
                  }
                />
              </View>
            ))}

            {/* Status selector — 3 trạng thái */}
            <Text style={styles.label}>Trạng thái</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => {
                const active = editStatus === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setEditStatus(opt.value)}
                    style={[
                      styles.statusOption,
                      active && {
                        borderColor: opt.color,
                        backgroundColor: opt.color + "15",
                      },
                    ]}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.statusDotSmall,
                        { backgroundColor: opt.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusOptionText,
                        { color: active ? opt.color : "#94a3b8" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, saving && { opacity: 0.65 }]}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function TeachersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterKey>("all");
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // Detail modal
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] =
    useState<TeacherResponse | null>(null);

  // Edit modal
  const [editVisible, setEditVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherResponse | null>(
    null,
  );
  const [editForm, setEditForm] = useState<UpdateTeacherRequest>({});
  const [editStatus, setEditStatus] = useState<TeacherStatus>("ACTIVE");
  const [saving, setSaving] = useState(false);

  // Add form
  const [form, setForm] = useState<CreateTeacherRequest>({
    teacherId: "",
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch ──
  const fetchTeachers = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách giảng viên");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Calc available departments
  const availableDepartments = useMemo(() => {
    const deps = new Set<string>();
    teachers.forEach((t) => {
      if (t.departmentName) deps.add(t.departmentName);
    });
    return Array.from(deps).sort();
  }, [teachers]);

  // ── Badge counts ──
  const countAll = teachers.length;
  const countActive = teachers.filter(
    (t) => resolveStatus(t) === "ACTIVE",
  ).length;
  const countOnLeave = teachers.filter(
    (t) => resolveStatus(t) === "ON_LEAVE",
  ).length;
  const countInactive = teachers.filter(
    (t) => resolveStatus(t) === "INACTIVE",
  ).length;

  const badgeCount = (key: FilterKey) => {
    switch (key) {
      case "all":
        return countAll;
      case "active":
        return countActive;
      case "on_leave":
        return countOnLeave;
      case "inactive":
        return countInactive;
    }
  };

  // ── Client-side filter & search ──
  const filteredTeachers = teachers.filter((t) => {
    const status = resolveStatus(t);
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && status === "ACTIVE") ||
      (filterStatus === "on_leave" && status === "ON_LEAVE") ||
      (filterStatus === "inactive" && status === "INACTIVE");

    if (!matchesFilter) return false;

    if (filterDepartment && t.departmentName !== filterDepartment) return false;

    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.teacherId ?? "").toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStatus, filterDepartment, teachers]);

  const totalPages = Math.ceil(filteredTeachers.length / PAGE_SIZE);
  const paginatedTeachers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTeachers.slice(start, start + PAGE_SIZE);
  }, [filteredTeachers, page]);

  // ── Add teacher ──
  const handleAddTeacher = async () => {
    if (!form.teacherId || !form.name || !form.email || !form.password) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ mã GV, tên, email và mật khẩu.",
      );
      return;
    }
    try {
      setSubmitting(true);
      const created = await teacherService.createTeacher(form);
      setTeachers((prev) => [created, ...prev]);
      setModalVisible(false);
      setForm({ teacherId: "", name: "", email: "", password: "" });
      Alert.alert("Thành công", "Đã thêm giảng viên mới!");
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Không thể thêm giảng viên");
    } finally {
      setSubmitting(false);
    }
  };

  // ── View detail ──
  const handleViewDetail = (teacher: TeacherResponse) => {
    setSelectedTeacher(teacher);
    setDetailVisible(true);
  };

  // ── Open edit ──
  const handleEdit = (teacher: TeacherResponse) => {
    setEditingTeacher(teacher);
    setEditForm({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone ?? "",
      departmentName: teacher.departmentName ?? "",
    });
    setEditStatus(resolveStatus(teacher));
    setEditVisible(true);
  };

  // ── Save edit ──
  const handleSaveEdit = async () => {
    if (!editingTeacher) return;
    if (!editForm.name?.trim() || !editForm.email?.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ tên và email.");
      return;
    }
    try {
      setSaving(true);
      const payload: UpdateTeacherRequest = {
        ...editForm,
        isActive: editStatus === "ACTIVE",
        teacherStatus: editStatus,
      };
      const updated = await teacherService.updateTeacher(
        editingTeacher.id,
        payload,
      );
      // Lưu lại teacherStatus ở phía client (backend có thể chưa phản hồi field này)
      const merged: TeacherResponse = { ...updated, teacherStatus: editStatus };
      setTeachers((prev) => prev.map((t) => (t.id === merged.id ? merged : t)));
      setEditVisible(false);
      Alert.alert("Thành công", "Đã cập nhật thông tin giảng viên!");
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Không thể cập nhật giảng viên");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = (teacher: TeacherResponse) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa giảng viên "${teacher.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await teacherService.deleteTeacher(teacher.id);
              setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
            } catch (err: any) {
              Alert.alert("Lỗi", err?.message || "Không thể xóa giảng viên");
            }
          },
        },
      ],
    );
  };

  // ── Accent color per status ──
  const accentForTeacher = (t: TeacherResponse) => {
    const s = resolveStatus(t);
    return STATUS_META[s].color;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#1E3A8A", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 64,
          paddingBottom: 24,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff" }}>
          Quản lý Giảng viên
        </Text>
        <Text
          style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 }}
        >
          Danh sách giảng viên trong khoa
        </Text>
      </LinearGradient>

      {/* ── Search + Add ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, mã GV, email..."
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Filter Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        style={styles.filterScroll}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = filterStatus === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterChip,
                isActive && {
                  backgroundColor: tab.color,
                  borderColor: tab.color,
                },
              ]}
              onPress={() => setFilterStatus(tab.key)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={tab.icon as any}
                size={13}
                color={isActive ? "#fff" : tab.color}
                style={styles.chipIcon}
              />
              <Text
                style={[
                  styles.filterChipText,
                  { color: isActive ? "#fff" : tab.color },
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.chipBadge,
                  {
                    backgroundColor: isActive
                      ? "rgba(255,255,255,0.3)"
                      : tab.color + "22",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipBadgeText,
                    { color: isActive ? "#fff" : tab.color },
                  ]}
                >
                  {badgeCount(tab.key)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Dropdown Filters ── */}
      {availableDepartments.length > 0 && (
        <View style={styles.dropdownFiltersContainer}>
          <DropdownPicker
            label="Khoa / Bộ môn"
            options={[
              { label: "Tất cả Khoa", value: null },
              ...availableDepartments.map((d) => ({ label: d, value: d })),
            ]}
            selectedValue={filterDepartment}
            onValueChange={setFilterDepartment}
            placeholder="Tất cả Khoa"
            themeColor="#8b5cf6"
          />
        </View>
      )}

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.centerText}>Đang tải danh sách...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Ionicons name="cloud-offline-outline" size={48} color="#ef4444" />
          <Text
            style={[styles.centerText, { color: "#ef4444", fontWeight: "600" }]}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchTeachers()}
          >
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchTeachers(true)}
              colors={["#8b5cf6"]}
              tintColor="#8b5cf6"
            />
          }
        >
          {filteredTeachers.length === 0 ? (
            <EmptyState query={searchQuery} />
          ) : (
            paginatedTeachers.map((teacher) => (
              <UserCard
                key={teacher.id}
                name={teacher.name}
                code={teacher.teacherId ?? "—"}
                codeLabel="MGV"
                email={teacher.email}
                isActive={teacher.isActive}
                department={teacher.departmentName}
                joinedAt={teacher.createdAt}
                accentColor={accentForTeacher(teacher)}
                extraDetails={
                  teacher.phone
                    ? [{ icon: "call-outline", text: teacher.phone }]
                    : []
                }
                actions={[
                  {
                    label: "Sửa",
                    icon: "create-outline",
                    color: "#3b82f6",
                    onPress: () => handleEdit(teacher),
                  },
                  {
                    label: "Chi tiết",
                    icon: "information-circle-outline",
                    color: "#8b5cf6",
                    onPress: () => handleViewDetail(teacher),
                  },
                  {
                    label: "Xóa",
                    icon: "trash-outline",
                    color: "#ef4444",
                    onPress: () => handleDelete(teacher),
                  },
                ]}
              />
            ))
          )}

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
                    color: page === 1 ? "#cbd5e1" : "#8b5cf6",
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
                    color: page === totalPages ? "#cbd5e1" : "#8b5cf6",
                  }}
                >
                  {">"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* ── Edit Teacher Modal ── */}
      <EditTeacherModal
        teacher={editingTeacher}
        form={editForm}
        setForm={setEditForm}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        visible={editVisible}
        saving={saving}
        onClose={() => setEditVisible(false)}
        onSave={handleSaveEdit}
      />

      {/* ── Add Teacher Modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm giảng viên mới</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {(
                [
                  {
                    label: "Mã giảng viên *",
                    key: "teacherId",
                    placeholder: "VD: GV001",
                  },
                  {
                    label: "Họ và tên *",
                    key: "name",
                    placeholder: "TS. Nguyễn Văn A",
                  },
                  {
                    label: "Email *",
                    key: "email",
                    placeholder: "gv@university.edu.vn",
                    keyboard: "email-address",
                  },
                  {
                    label: "Mật khẩu *",
                    key: "password",
                    placeholder: "••••••••",
                    secure: true,
                  },
                  {
                    label: "Số điện thoại",
                    key: "phone",
                    placeholder: "0123456789",
                    keyboard: "phone-pad",
                  },
                  {
                    label: "Khoa / Bộ môn",
                    key: "departmentName",
                    placeholder: "VD: Khoa CNTT",
                  },
                ] as const
              ).map((field) => (
                <View key={field.key}>
                  <Text style={styles.label}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      "placeholder" in field ? field.placeholder : ""
                    }
                    placeholderTextColor="#94a3b8"
                    keyboardType={
                      "keyboard" in field ? (field as any).keyboard : "default"
                    }
                    secureTextEntry={
                      "secure" in field ? (field as any).secure : false
                    }
                    value={(form as any)[field.key] ?? ""}
                    onChangeText={(v) =>
                      setForm((prev) => ({ ...prev, [field.key]: v }))
                    }
                  />
                </View>
              ))}

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.65 }]}
                onPress={handleAddTeacher}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="person-add-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.submitButtonText}>Thêm giảng viên</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Teacher Detail Modal ── */}
      <TeacherDetailModal
        teacher={selectedTeacher}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },

  // Filter Chips
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  chipIcon: {
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipBadge: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // List
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Empty / Error
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  centerText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryBtn: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: "92%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  closeBtn: {
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
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
    padding: 15,
    marginTop: 24,
    marginBottom: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  // Status selector (3 options)
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  statusOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  statusDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Detail Modal
  detailOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  detailSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    maxHeight: "88%",
  },
  detailHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  detailCloseBtn: {
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
  detailHero: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 20,
    gap: 10,
  },
  detailAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  detailAvatarText: {
    fontSize: 30,
    fontWeight: "800",
  },
  detailName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
  },
  detailStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  detailStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  detailStatusText: {
    fontSize: 13,
    fontWeight: "700",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 8,
  },
  detailScroll: {
    flexGrow: 0,
  },
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
    backgroundColor: "#f5f3ff",
    alignItems: "center",
    justifyContent: "center",
  },
  detailRowContent: {
    flex: 1,
  },
  detailRowLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailRowValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },

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
    backgroundColor: "#f5f3ff", // Màu tím nhạt cho teacher
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#475569",
    flex: 1,
  },
  dropdownItemTextActive: {
    color: "#8b5cf6", // Màu tím cho teacher
    fontWeight: "700",
  },
});
