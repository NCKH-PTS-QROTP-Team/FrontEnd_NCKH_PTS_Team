import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { studentService } from '@/apis/services/student.service';
import { StudentResponse, CreateStudentRequest, UpdateStudentRequest } from '@/apis/types/student.types';
import { UserCard } from '@/components/UserCard';


// ─── Filter Tab Config ────────────────────────────────────────────────────────
const FILTER_TABS = [
    { key: 'all', label: 'Tất cả', icon: 'people', color: '#3b82f6' },
    { key: 'active', label: 'Hoạt động', icon: 'checkmark-circle', color: '#10b981' },
    { key: 'inactive', label: 'Tạm khóa', icon: 'pause-circle', color: '#f59e0b' },
] as const;

type FilterKey = 'all' | 'active' | 'inactive';




// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
    return (
        <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={52} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>
                {query ? 'Không tìm thấy kết quả' : 'Chưa có sinh viên'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {query
                    ? `Không khớp với "${query}"`
                    : 'Nhấn nút + để thêm sinh viên mới'}
            </Text>
        </View>
    );
}

// ─── Student Detail Modal ────────────────────────────────────────────────────
function StudentDetailModal({
    student,
    visible,
    onClose,
}: {
    student: StudentResponse | null;
    visible: boolean;
    onClose: () => void;
}) {
    if (!student) return null;

    const accent = student.isActive ? '#10b981' : '#f59e0b';
    const initials = student.name.trim().charAt(0).toUpperCase();

    const rows: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }[] = [
        { icon: 'id-card-outline', label: 'Mã sinh viên', value: student.studentId ?? '—' },
        { icon: 'mail-outline', label: 'Email', value: student.email },
        { icon: 'business-outline', label: 'Khoa / Bộ môn', value: student.departmentName ?? '—' },
        { icon: 'calendar-outline', label: 'Ngày tham gia', value: student.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : '—' },
        { icon: 'finger-print-outline', label: 'User ID', value: student.id },
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

                    {/* Handle */}
                    <View style={styles.detailHandle} />

                    {/* Close button */}
                    <TouchableOpacity style={styles.detailCloseBtn} onPress={onClose} activeOpacity={0.7}>
                        <Ionicons name="close" size={18} color="#64748b" />
                    </TouchableOpacity>

                    {/* Avatar + Name header */}
                    <View style={styles.detailHero}>
                        <View style={[styles.detailAvatar, { backgroundColor: accent + '20' }]}>
                            <Text style={[styles.detailAvatarText, { color: accent }]}>{initials}</Text>
                        </View>
                        <Text style={styles.detailName}>{student.name}</Text>

                        {/* Status badge */}
                        <View style={[styles.detailStatusBadge, { backgroundColor: accent + '18' }]}>
                            <View style={[styles.detailStatusDot, { backgroundColor: accent }]} />
                            <Text style={[styles.detailStatusText, { color: accent }]}>
                                {student.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.detailDivider} />

                    {/* Info rows */}
                    <ScrollView
                        style={styles.detailScroll}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 32 }}
                    >
                        {rows.map((row, idx) => (
                            <View key={idx} style={styles.detailRow}>
                                <View style={styles.detailRowIcon}>
                                    <Ionicons name={row.icon} size={16} color="#3b82f6" />
                                </View>
                                <View style={styles.detailRowContent}>
                                    <Text style={styles.detailRowLabel}>{row.label}</Text>
                                    <Text style={styles.detailRowValue} selectable>{row.value}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ─── Edit Student Modal ──────────────────────────────────────────────────────
function EditStudentModal({
    student,
    form,
    setForm,
    visible,
    saving,
    onClose,
    onSave,
}: {
    student: StudentResponse | null;
    form: UpdateStudentRequest;
    setForm: React.Dispatch<React.SetStateAction<UpdateStudentRequest>>;
    visible: boolean;
    saving: boolean;
    onClose: () => void;
    onSave: () => void;
}) {
    if (!student) return null;

    const fields: { label: string; key: keyof UpdateStudentRequest; placeholder: string; keyboard?: any; secure?: boolean }[] = [
        { label: 'Họ và tên *', key: 'name', placeholder: 'Nguyễn Văn A' },
        { label: 'Email *', key: 'email', placeholder: 'sv@student.edu.vn', keyboard: 'email-address' },
        { label: 'Khoa / Bộ môn', key: 'departmentName', placeholder: 'VD: Khoa CNTT' },
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
                        <Text style={styles.modalTitle}>Chỉnh sửa sinh viên</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {fields.map((field) => (
                            <View key={field.key}>
                                <Text style={styles.label}>{field.label}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={field.placeholder}
                                    placeholderTextColor="#94a3b8"
                                    keyboardType={field.keyboard ?? 'default'}
                                    secureTextEntry={field.secure ?? false}
                                    value={(form as any)[field.key] ?? ''}
                                    onChangeText={(v) =>
                                        setForm((prev) => ({ ...prev, [field.key]: v }))
                                    }
                                />
                            </View>
                        ))}

                        {/* Active status toggle */}
                        <Text style={styles.label}>Trạng thái</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                            {[
                                { label: 'Hoạt động', value: true, color: '#10b981' },
                                { label: 'Tạm khóa', value: false, color: '#f59e0b' },
                            ].map((opt) => {
                                const active = form.isActive === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={String(opt.value)}
                                        onPress={() => setForm((prev) => ({ ...prev, isActive: opt.value }))}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 10,
                                            borderRadius: 10,
                                            borderWidth: 1.5,
                                            borderColor: active ? opt.color : '#e2e8f0',
                                            backgroundColor: active ? opt.color + '15' : '#f8fafc',
                                            alignItems: 'center',
                                        }}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={{ color: active ? opt.color : '#94a3b8', fontWeight: '600', fontSize: 14 }}>
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

// ─── Dropdown Component ─────────────────────────────────────────────────────────
function DropdownPicker({
    label,
    options,
    selectedValue,
    onValueChange,
    placeholder
}: {
    label: string;
    options: { label: string; value: string | null }[];
    selectedValue: string | null;
    onValueChange: (val: string | null) => void;
    placeholder: string;
}) {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find(o => o.value === selectedValue);

    return (
        <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                activeOpacity={0.7}
                onPress={() => setOpen(true)}
            >
                <Text style={[styles.dropdownButtonText, !selectedValue && { color: '#94a3b8' }]} numberOfLines={1}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
                    <View style={styles.dropdownMenu}>
                        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 8 }}>
                            {options.map((opt, idx) => {
                                const isSelected = selectedValue === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                                        onPress={() => { onValueChange(opt.value); setOpen(false); }}
                                    >
                                        <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]} numberOfLines={1}>
                                            {opt.label}
                                        </Text>
                                        {isSelected && <Ionicons name="checkmark" size={18} color="#3b82f6" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentsManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterKey>('all');
    const [filterDepartment, setFilterDepartment] = useState<string | null>(null);
    const [filterYear, setFilterYear] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [students, setStudents] = useState<StudentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 15;

    // Detail modal state
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);

    // Edit modal state
    const [editVisible, setEditVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentResponse | null>(null);
    const [editForm, setEditForm] = useState<UpdateStudentRequest>({});
    const [saving, setSaving] = useState(false);

    // Add-form state
    const [form, setForm] = useState<CreateStudentRequest>({
        studentId: '',
        name: '',
        email: '',
        password: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // ── Fetch ──
    const fetchStudents = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);

            const data = await studentService.getAllStudents();
            setStudents(data);
        } catch (err: any) {
            setError(err?.message || 'Không thể tải danh sách sinh viên');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    // Calc available departments & years
    const availableDepartments = useMemo(() => {
        const deps = new Set<string>();
        students.forEach(s => {
            if (s.departmentName) deps.add(s.departmentName);
        });
        return Array.from(deps).sort();
    }, [students]);

    const availableYears = useMemo(() => {
        const years = new Set<string>();
        students.forEach(s => {
            if (s.studentId && s.studentId.length >= 2) {
                const prefix = s.studentId.substring(0, 2);
                if (!isNaN(Number(prefix))) {
                    years.add(`20${prefix}`);
                }
            }
        });
        return Array.from(years).sort((a, b) => b.localeCompare(a));
    }, [students]);

    // ── Client-side filter & search ──
    const filteredStudents = students.filter((s) => {
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'active' && s.isActive) ||
            (filterStatus === 'inactive' && !s.isActive);

        if (!matchesFilter) return false;

        if (filterDepartment && s.departmentName !== filterDepartment) return false;

        if (filterYear) {
            if (!s.studentId || s.studentId.length < 2) return false;
            const prefix = s.studentId.substring(0, 2);
            if (!isNaN(Number(prefix))) {
                const year = `20${prefix}`;
                if (year !== filterYear) return false;
            } else {
                return false;
            }
        }

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            s.name.toLowerCase().includes(q) ||
            (s.studentId ?? '').toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        );
    });

    useEffect(() => {
        setPage(1);
    }, [searchQuery, filterStatus, filterDepartment, filterYear, students]);

    const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
    const paginatedStudents = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredStudents.slice(start, start + PAGE_SIZE);
    }, [filteredStudents, page]);

    // ── Add student ──
    const handleAddStudent = async () => {
        if (!form.studentId || !form.name || !form.email || !form.password) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ mã SV, tên, email và mật khẩu.');
            return;
        }
        try {
            setSubmitting(true);
            const created = await studentService.createStudent(form);
            setStudents((prev) => [created, ...prev]);
            setModalVisible(false);
            setForm({ studentId: '', name: '', email: '', password: '' });
            Alert.alert('Thành công', 'Đã thêm sinh viên mới!');
        } catch (err: any) {
            Alert.alert('Lỗi', err?.message || 'Không thể thêm sinh viên');
        } finally {
            setSubmitting(false);
        }
    };

    // ── View detail ──
    const handleViewDetail = (student: StudentResponse) => {
        setSelectedStudent(student);
        setDetailVisible(true);
    };

    // ── Open edit ──
    const handleEdit = (student: StudentResponse) => {
        setEditingStudent(student);
        setEditForm({
            name: student.name,
            email: student.email,
            departmentName: student.departmentName ?? '',
            isActive: student.isActive,
        });
        setEditVisible(true);
    };

    // ── Save edit ──
    const handleSaveEdit = async () => {
        if (!editingStudent) return;
        if (!editForm.name?.trim() || !editForm.email?.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tên và email.');
            return;
        }
        try {
            setSaving(true);
            const updated = await studentService.updateStudent(editingStudent.id, editForm);
            setStudents((prev) =>
                prev.map((s) => (s.id === updated.id ? updated : s))
            );
            setEditVisible(false);
            Alert.alert('Thành công', 'Đã cập nhật thông tin sinh viên!');
        } catch (err: any) {
            Alert.alert('Lỗi', err?.message || 'Không thể cập nhật sinh viên');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ──
    const handleDelete = (student: StudentResponse) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa sinh viên "${student.name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await studentService.deleteStudent(student.id);
                            setStudents((prev) => prev.filter((s) => s.id !== student.id));
                        } catch (err: any) {
                            Alert.alert('Lỗi', err?.message || 'Không thể xóa sinh viên');
                        }
                    },
                },
            ]
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>

            {/* ── Search + Add ── */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm theo tên, mã SV, email..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
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

            {/* ── Filter Chips (auto-fit, no height stretch) ── */}
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
                                color={isActive ? '#fff' : tab.color}
                                style={styles.chipIcon}
                            />
                            <Text
                                style={[
                                    styles.filterChipText,
                                    { color: isActive ? '#fff' : tab.color },
                                ]}
                            >
                                {tab.label}
                            </Text>
                            {/* Badge count */}
                            {tab.key !== 'all' && (
                                <View style={[
                                    styles.chipBadge,
                                    { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : tab.color + '22' },
                                ]}>
                                    <Text style={[
                                        styles.chipBadgeText,
                                        { color: isActive ? '#fff' : tab.color },
                                    ]}>
                                        {tab.key === 'active'
                                            ? students.filter(s => s.isActive).length
                                            : students.filter(s => !s.isActive).length}
                                    </Text>
                                </View>
                            )}
                            {tab.key === 'all' && (
                                <View style={[
                                    styles.chipBadge,
                                    { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : tab.color + '22' },
                                ]}>
                                    <Text style={[
                                        styles.chipBadgeText,
                                        { color: isActive ? '#fff' : tab.color },
                                    ]}>
                                        {students.length}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* ── Dropdown Filters ── */}
            {(availableDepartments.length > 0 || availableYears.length > 0) && (
                <View style={styles.dropdownFiltersContainer}>
                    {availableDepartments.length > 0 && (
                        <DropdownPicker
                            label="Khoa / Bộ môn"
                            options={[{ label: 'Tất cả Khoa', value: null }, ...availableDepartments.map(d => ({ label: d, value: d }))]}
                            selectedValue={filterDepartment}
                            onValueChange={setFilterDepartment}
                            placeholder="Tất cả Khoa"
                        />
                    )}
                    {availableYears.length > 0 && (
                        <DropdownPicker
                            label="Niên khóa"
                            options={[{ label: 'Tất cả Khóa', value: null }, ...availableYears.map(y => ({ label: `Khóa ${y}`, value: y }))]}
                            selectedValue={filterYear}
                            onValueChange={setFilterYear}
                            placeholder="Tất cả Khóa"
                        />
                    )}
                </View>
            )}


            {/* ── Content ── */}
            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.centerText}>Đang tải danh sách...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerBox}>
                    <Ionicons name="cloud-offline-outline" size={48} color="#ef4444" />
                    <Text style={[styles.centerText, { color: '#ef4444', fontWeight: '600' }]}>
                        {error}
                    </Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => fetchStudents()}>
                        <Text style={styles.retryBtnText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchStudents(true)}
                            colors={['#3b82f6']}
                            tintColor="#3b82f6"
                        />
                    }
                >
                    {filteredStudents.length === 0 ? (
                        <EmptyState query={searchQuery} />
                    ) : (
                        paginatedStudents.map((student) => (
                            <UserCard
                                key={student.id}
                                name={student.name}
                                code={student.studentId ?? '—'}
                                codeLabel="MSSV"
                                email={student.email}
                                isActive={student.isActive}
                                department={student.departmentName}
                                joinedAt={student.createdAt}
                                actions={[
                                    {
                                        label: 'Sửa',
                                        icon: 'create-outline',
                                        color: '#3b82f6',
                                        onPress: () => handleEdit(student),
                                    },
                                    {
                                        label: 'Chi tiết',
                                        icon: 'information-circle-outline',
                                        color: '#8b5cf6',
                                        onPress: () => handleViewDetail(student),
                                    },
                                    {
                                        label: 'Xóa',
                                        icon: 'trash-outline',
                                        color: '#ef4444',
                                        onPress: () => handleDelete(student),
                                    },
                                ]}
                            />
                        ))
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12, marginBottom: 16 }}>
                            <TouchableOpacity
                                style={[{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }, page === 1 && { backgroundColor: '#f8fafc', elevation: 0 }]}
                                disabled={page === 1}
                                onPress={() => setPage(p => p - 1)}
                            >
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: page === 1 ? '#cbd5e1' : '#3b82f6' }}>{'<'}</Text>
                            </TouchableOpacity>

                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b' }}>Trang {page} / {totalPages}</Text>

                            <TouchableOpacity
                                style={[{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }, page === totalPages && { backgroundColor: '#f8fafc', elevation: 0 }]}
                                disabled={page === totalPages}
                                onPress={() => setPage(p => p + 1)}
                            >
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: page === totalPages ? '#cbd5e1' : '#3b82f6' }}>{'>'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 24 }} />
                </ScrollView>
            )}

            {/* ── Edit Student Modal ── */}
            <EditStudentModal
                student={editingStudent}
                form={editForm}
                setForm={setEditForm}
                visible={editVisible}
                saving={saving}
                onClose={() => setEditVisible(false)}
                onSave={handleSaveEdit}
            />

            {/* ── Add Student Modal ── */}
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
                            <Text style={styles.modalTitle}>Thêm sinh viên mới</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeBtn}
                            >
                                <Ionicons name="close" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {([
                                { label: 'Mã sinh viên *', key: 'studentId', placeholder: 'VD: SV001' },
                                { label: 'Họ và tên *', key: 'name', placeholder: 'Nguyễn Văn A' },
                                { label: 'Email *', key: 'email', placeholder: 'sv@student.edu.vn', keyboard: 'email-address' },
                                { label: 'Mật khẩu *', key: 'password', placeholder: '••••••••', secure: true },
                                { label: 'Khoa / Bộ môn', key: 'departmentName', placeholder: 'VD: Khoa CNTT' },
                            ] as const).map((field) => (
                                <View key={field.key}>
                                    <Text style={styles.label}>{field.label}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={'placeholder' in field ? field.placeholder : ''}
                                        placeholderTextColor="#94a3b8"
                                        keyboardType={('keyboard' in field ? (field as any).keyboard : 'default')}
                                        secureTextEntry={('secure' in field ? (field as any).secure : false)}
                                        value={(form as any)[field.key] ?? ''}
                                        onChangeText={(v) =>
                                            setForm((prev) => ({ ...prev, [field.key]: v }))
                                        }
                                    />
                                </View>
                            ))}

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && { opacity: 0.65 }]}
                                onPress={handleAddStudent}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="person-add-outline" size={18} color="#fff" />
                                        <Text style={styles.submitButtonText}>Thêm sinh viên</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ── Student Detail Modal ── */}
            <StudentDetailModal
                student={selectedStudent}
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
        backgroundColor: '#f8fafc',
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 44,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
    },
    addButton: {
        width: 44,
        height: 44,
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 5,
    },

    // Filter Chips
    filterScroll: {
        flexGrow: 0,        // Không co dãn theo trục dọc
        flexShrink: 0,      // Không bị nén
        marginBottom: 12,
    },
    filterList: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',    // ← Chìa khóa: co chiều cao theo nội dung
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    chipIcon: {
        marginRight: 4,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    chipBadge: {
        marginLeft: 6,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    chipBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    filterScrollSub: {
        flexGrow: 0,
        flexShrink: 0,
        marginBottom: 12,
    },
    dropdownFiltersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 12,
    },
    dropdownWrapper: {
        flex: 1,
    },
    dropdownLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 4,
        marginLeft: 4,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 38,
    },
    dropdownButtonText: {
        fontSize: 13,
        color: '#1e293b',
        flex: 1,
        marginRight: 8,
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    dropdownMenu: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '100%',
        maxWidth: 320,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 2,
    },
    dropdownItemActive: {
        backgroundColor: '#eff6ff',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#334155',
        flex: 1,
    },
    dropdownItemTextActive: {
        color: '#3b82f6',
        fontWeight: '600',
    },

    // List
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },

    // (Card styles moved to components/UserCard.tsx)

    // Empty / Error
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    centerText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    retryBtn: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 4,
    },
    retryBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 10,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#94a3b8',
        textAlign: 'center',
        paddingHorizontal: 32,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 20,
        maxHeight: '92%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
        marginTop: 14,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        color: '#1e293b',
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        padding: 15,
        marginTop: 24,
        marginBottom: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },

    // ── Detail Modal ──
    detailOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    detailSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        maxHeight: '88%',
    },
    detailHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    detailCloseBtn: {
        position: 'absolute',
        top: 16,
        right: 20,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    detailHero: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 20,
        gap: 10,
    },
    detailAvatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    detailAvatarText: {
        fontSize: 30,
        fontWeight: '800',
    },
    detailName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
    },
    detailStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
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
        fontWeight: '700',
    },
    detailDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 8,
    },
    detailScroll: {
        flexGrow: 0,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
        gap: 14,
    },
    detailRowIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailRowContent: {
        flex: 1,
    },
    detailRowLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    detailRowValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '500',
    },
});
