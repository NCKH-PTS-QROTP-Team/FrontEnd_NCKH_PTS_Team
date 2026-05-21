import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import PrimaryButton from "@/components/PrimaryButton";
import Table from "@/components/Table";
import { DropdownPicker } from "@/components/DropdownPicker";
import { CalendarIcon, CloseIcon } from "@/components/Icons";
import { Ionicons } from "@expo/vector-icons";
import MobileGradientHeader from "@/components/MobileGradientHeader";
import {
  courseService,
  reportService,
  scheduleService,
  semesterService,
} from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import { useToast } from "@/components/ToastProvider";
import type { Course } from "@/apis/services/course.service";
import type { Semester as SemesterItem } from "@/apis/services/semester.service";
import type {
  ClassAttendanceReport,
  StudentAttendanceReport,
} from "@/apis/services/report.service";
import type { Schedule } from "@/apis/services/schedule.service";
import type { AttendanceRecordResponse } from "@/apis/types/attendance.types";

interface TeacherClassCard {
  id: string;
  code: string;
  name: string;
  subject?: string;
  semesterId?: string;
  semester?: string;
  scheduleText: string;
  room?: string;
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
}

interface SummaryStats {
  totalClasses: number;
  totalStudents: number;
  averageRate: number;
}

export default function ClassListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const { showToast } = useToast();

  const [classes, setClasses] = useState<TeacherClassCard[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    totalClasses: 0,
    totalStudents: 0,
    averageRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState<TeacherClassCard | null>(
    null,
  );
  const [students, setStudents] = useState<StudentAttendanceReport[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Thêm state cho history của một sinh viên
  const [selectedStudent, setSelectedStudent] =
    useState<StudentAttendanceReport | null>(null);
  const [studentHistoryVisible, setStudentHistoryVisible] = useState(false);
  const [studentRecords, setStudentRecords] = useState<
    AttendanceRecordResponse[]
  >([]);
  const [studentRecordsLoading, setStudentRecordsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [modalTab, setModalTab] = useState<"overview" | "students">("overview");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentRateFilter, setStudentRateFilter] = useState<"all" | "good" | "warning" | "bad">("all");

  const contentMaxWidth = "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  useEffect(() => {
    loadClasses();
  }, []);

  const getDayLabel = (dayOfWeek?: number) => {
    const map: Record<number, string> = {
      1: "Thứ 2",
      2: "Thứ 3",
      3: "Thứ 4",
      4: "Thứ 5",
      5: "Thứ 6",
      6: "Thứ 7",
      7: "Chủ nhật",
    };
    return dayOfWeek ? map[dayOfWeek] || "" : "";
  };

  const formatSchedule = (schedule?: Schedule) => {
    if (!schedule) return "Chưa có lịch dạy";
    const dayLabel = getDayLabel(schedule.dayOfWeek);
    if (schedule.startTime && schedule.endTime) {
      return `${dayLabel}, ${schedule.startTime} - ${schedule.endTime}`;
    }
    return dayLabel || "Chưa có lịch dạy";
  };

  const loadClasses = async () => {
    try {
      setLoading(true);
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) {
        console.warn("No teacherId found for class list");
        setLoading(false);
        return;
      }

      const [allCourses, classReports, teacherSchedules, semesterList] =
        await Promise.all([
          courseService.getAllCourses().catch(() => [] as Course[]),
          reportService
            .getClassReports()
            .catch(() => [] as ClassAttendanceReport[]),
          scheduleService
            .getSchedules({ teacherId })
            .catch(() => [] as Schedule[]),
          semesterService.getAllSemesters().catch(() => [] as SemesterItem[]),
        ]);

      setSemesters(semesterList || []);
      const semesterMap = new Map((semesterList || []).map((s) => [s.id, s.name]));

      const scheduledCourseIds = new Set(
        teacherSchedules
          .map((s) => s.courseId || s.classId)
          .filter(Boolean) as string[],
      );

      const teacherCourseList = allCourses.filter(
        (c) =>
          c.theoryLectureId === teacherId ||
          c.practiceTeacherId === teacherId ||
          scheduledCourseIds.has(c.id),
      );

      const teacherCourseIds = new Set(teacherCourseList.map((c) => c.id));

      const reportMap = new Map<string, ClassAttendanceReport>();
      classReports
        .filter((r) => teacherCourseIds.has(r.classId))
        .forEach((r) => {
          reportMap.set(r.classId, r);
        });

      const scheduleMap = new Map<string, Schedule[]>();
      teacherSchedules.forEach((s) => {
        const key = s.courseId || s.classId;
        if (!key || !teacherCourseIds.has(key)) return;
        const arr = scheduleMap.get(key) || [];
        arr.push(s);
        scheduleMap.set(key, arr);
      });

      const cards: TeacherClassCard[] = teacherCourseList.map((course) => {
        const report = reportMap.get(course.id);
        const schedules = scheduleMap.get(course.id) || [];
        const primarySchedule = schedules[0];

        const totalStudents = report?.totalStudents || 0;
        const totalPresent = report?.totalPresent || 0;
        const totalAbsent = report?.totalAbsent || 0;
        const totalLate = report?.totalLate || 0;
        const attendanceRate = report ? Math.round(report.attendanceRate) : 0;

        return {
          id: course.id,
          code: course.subjectId
            ? `CRS-${course.id.slice(-6).toUpperCase()}`
            : course.id,
          name: course.name,
          subject: course.subjectName || undefined,
          semesterId: course.semesterId || undefined,
          semester:
            course.semesterName ||
            (course.semesterId
              ? semesterMap.get(course.semesterId)
              : undefined),
          scheduleText: formatSchedule(primarySchedule),
          room: primarySchedule?.room,
          totalStudents,
          presentCount: totalPresent,
          lateCount: totalLate,
          absentCount: totalAbsent,
          attendanceRate,
        };
      });

      setClasses(cards);

      const totalClasses = cards.length;
      const totalStudents = cards.reduce(
        (sum, c) => sum + (c.totalStudents || 0),
        0,
      );
      const averageRate =
        totalClasses > 0
          ? Math.round(
              cards.reduce((sum, c) => sum + (c.attendanceRate || 0), 0) /
                totalClasses,
            )
          : 0;

      setSummary({
        totalClasses,
        totalStudents,
        averageRate,
      });

      console.log("[ClassList] classes =", cards);
    } catch (error) {
      console.error("Error loading teacher classes:", error);
      showToast("Không thể tải danh sách lớp", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadClasses();
    } finally {
      setRefreshing(false);
    }
  };

  const handleClassPress = (classItem: TeacherClassCard) => {
    setSelectedClass(classItem);
    setModalVisible(true);
    loadStudentReports(classItem.id);
  };

  const loadStudentReports = async (classId: string) => {
    try {
      setStudentsLoading(true);
      const reports = await reportService.getStudentReports(classId);
      setStudents(reports);
      console.log("[ClassList] student reports for class", classId, reports);
    } catch (error) {
      console.error("Error loading student reports:", error);
      showToast("Không thể tải danh sách sinh viên", "error");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedClass(null), 300);
  };

  const handleCloseHistoryModal = () => {
    setStudentHistoryVisible(false);
    setTimeout(() => {
      setSelectedStudent(null);
      setStudentRecords([]);
    }, 300);
  };

  const handleStudentPress = async (student: StudentAttendanceReport) => {
    if (!selectedClass?.id) {
      showToast("Không xác định được lớp học hiện tại", "error");
      return;
    }

    setSelectedStudent(student);
    setStudentHistoryVisible(true);
    setStudentRecordsLoading(true);
    try {
      const { attendanceService } = await import("@/apis");

      const records = await attendanceService.getRecords({
        courseId: selectedClass.id,
        studentId: student.studentId,
      });

      const sorted = [...(records || [])].sort((a, b) => {
        const ta = new Date(a.attendedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.attendedAt || b.createdAt || 0).getTime();
        return tb - ta;
      });

      setStudentRecords(sorted);
    } catch (error) {
      console.error("Error loading student history:", error);
      showToast("Lỗi khi tải lịch sử điểm danh", "error");
    } finally {
      setStudentRecordsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "#10b981";
      case "LATE":
        return "#f59e0b";
      case "ABSENT":
        return "#ef4444";
      default:
        return "#94a3b8";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "Có mặt";
      case "LATE":
        return "Muộn";
      case "ABSENT":
        return "Vắng";
      default:
        return "Không rõ";
    }
  };

  const subjectOptions = useMemo(() => {
    const subjects = Array.from(
      new Set((classes || []).map((item) => item.subject).filter(Boolean) as string[]),
    );

    return [
      { label: "Tất cả môn học", value: null },
      ...subjects.map((subject) => ({ label: subject, value: subject })),
    ];
  }, [classes]);

  const semesterOptions = useMemo(() => {
    return [
      { label: "Tất cả học kỳ", value: null },
      ...(semesters || []).map((semester) => ({
        label: semester.name,
        value: semester.id,
      })),
    ];
  }, [semesters]);

  const filteredClasses = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return (classes || []).filter((item) => {
      const matchesKeyword =
        keyword.length === 0 ||
        [item.name, item.code, item.subject, item.semester, item.scheduleText]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));

      const matchesSubject =
        !selectedSubject || item.subject === selectedSubject;

      const matchesSemester =
        !selectedSemester || item.semesterId === selectedSemester;

      return matchesKeyword && matchesSubject && matchesSemester;
    });
  }, [classes, searchKeyword, selectedSubject, selectedSemester]);

  const pageSize = isMobile ? 6 : isTablet ? 8 : 10;
  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / pageSize));

  const paginatedClasses = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return filteredClasses.slice(startIndex, startIndex + pageSize);
  }, [filteredClasses, currentPage, totalPages, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedSubject, selectedSemester, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const hasActiveFilters =
    searchKeyword.trim().length > 0 || !!selectedSubject || !!selectedSemester;

  const resetFilters = () => {
    setSearchKeyword("");
    setSelectedSubject(null);
    setSelectedSemester(null);
    setCurrentPage(1);
  };

  const tableColumns = useMemo(() => {
    const classColumn = {
      key: "class",
      label: "Lớp học",
      width: isMobile ? 230 : 260,
      render: (item: TeacherClassCard) => (
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#1e293b",
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={{ fontSize: 12, color: "#64748b" }} numberOfLines={1}>
            {item.code}
          </Text>
        </View>
      ),
    };

    const scheduleColumn = {
      key: "scheduleText",
      label: "Lịch dạy",
      width: isMobile ? 240 : 220,
      render: (item: TeacherClassCard) => (
        <Text style={{ fontSize: 13, color: "#475569" }} numberOfLines={1}>
          {item.scheduleText || "Chưa có lịch"}
        </Text>
      ),
    };

    if (isMobile) {
      return [classColumn, scheduleColumn];
    }

    return [
      {
        ...classColumn,
        width: undefined,
        flex: 2.3,
      },
      {
        key: "subject",
        label: "Môn học",
        flex: 1.6,
        render: (item: TeacherClassCard) => (
          <Text style={{ fontSize: 13, color: "#334155" }} numberOfLines={1}>
            {item.subject || "-"}
          </Text>
        ),
      },
      {
        ...scheduleColumn,
        width: undefined,
        flex: 1.5,
      },
      {
        key: "room",
        label: "Phòng",
        flex: 0.6,
        align: "center" as const,
        render: (item: TeacherClassCard) => (
          <Text style={{ fontSize: 13, color: "#0f172a", fontWeight: "600" }}>
            {item.room || "-"}
          </Text>
        ),
      },
      {
        key: "totalStudents",
        label: "SV",
        flex: 0.5,
        align: "center" as const,
        render: (item: TeacherClassCard) => (
          <Text style={{ fontSize: 13, color: "#0f172a", fontWeight: "700" }}>
            {item.totalStudents || 0}
          </Text>
        ),
      },
      {
        key: "attendanceRate",
        label: "Tỉ lệ ĐD",
        flex: 0.8,
        align: "center" as const,
        render: (item: TeacherClassCard) => {
          const rate = item.attendanceRate || 0;
          const color = rate >= 80 ? "#10b981" : rate >= 60 ? "#f59e0b" : "#ef4444";
          const bg = rate >= 80 ? "#ecfdf5" : rate >= 60 ? "#fffbeb" : "#fef2f2";
          return (
            <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color }}>{rate}%</Text>
            </View>
          );
        },
      },
      {
        key: "action",
        label: "",
        flex: 0.7,
        align: "center" as const,
        render: () => (
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563eb" }}>Chi tiết</Text>
        ),
      },
    ];
  }, [isMobile]);

  // Stats derived from filtered data
  const activeClasses = classes.filter((c) => c.attendanceRate > 0).length;
  const highRateClasses = classes.filter((c) => c.attendanceRate >= 80).length;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F1F5F9" }}
      edges={["top"]}
    >
      <StatusBar style="light" />

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
          paddingHorizontal,
          paddingTop: 14,
          paddingBottom: isMobile ? 110 : 34,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" }}>

          {/* Mobile header */}
          {isMobile && (
            <MobileGradientHeader
              title="Danh sách lớp học"
              subtitle={`${summary.totalClasses} lớp • ${summary.totalStudents} sinh viên`}
              icon="school"
              iconSize={24}
              actions={[
                { icon: "notifications", onPress: () => router.push("/teacher/notifications"), accessibilityLabel: "Thông báo" },
                { icon: "person", onPress: () => router.push("/teacher/profile"), accessibilityLabel: "Hồ sơ" },
              ]}
              style={{ marginHorizontal: 0, marginTop: 0, marginBottom: 14 }}
            />
          )}

          {/* ── Stats Cards ── */}
          {!isMobile && (
            <View style={{ flexDirection: "row", gap: 14, marginBottom: 18 }}>
              {[
                { icon: "school-outline", label: "Tổng lớp học", value: summary.totalClasses, color: "#3b82f6", bg: "#eff6ff" },
                { icon: "people-outline", label: "Tổng sinh viên", value: summary.totalStudents, color: "#8b5cf6", bg: "#f5f3ff" },
                { icon: "checkmark-circle-outline", label: "Lớp có điểm danh", value: activeClasses, color: "#10b981", bg: "#ecfdf5" },
                { icon: "trending-up-outline", label: "Tỉ lệ TB", value: `${summary.averageRate}%`, color: summary.averageRate >= 80 ? "#10b981" : summary.averageRate >= 60 ? "#f59e0b" : "#ef4444", bg: summary.averageRate >= 80 ? "#ecfdf5" : summary.averageRate >= 60 ? "#fffbeb" : "#fef2f2" },
              ].map((stat, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 16, flexDirection: "row", alignItems: "center", gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: stat.bg, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 11, color: "#64748b", fontWeight: "600", marginBottom: 2 }}>{stat.label}</Text>
                    <Text style={{ fontSize: 24, fontWeight: "800", color: "#1e293b" }}>{loading ? "-" : stat.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Search & Filter Bar ── */}
          <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
            {/* Title row */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>Danh sách lớp học</Text>
                <View style={{ backgroundColor: "#eff6ff", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#3b82f6" }}>{filteredClasses.length}</Text>
                </View>
              </View>
              {hasActiveFilters && (
                <TouchableOpacity onPress={resetFilters} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" }}>
                  <Ionicons name="close" size={14} color="#ef4444" />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#ef4444" }}>Xóa bộ lọc</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Controls row */}
            <View style={{ padding: 12, gap: 10 }}>
              {/* Search */}
              <View style={{ borderWidth: 1, borderColor: "#D7E3F7", borderRadius: 10, backgroundColor: "#F8FAFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, minHeight: 42 }}>
                <Ionicons name="search" size={16} color="#1E40AF" />
                <TextInput
                  placeholder="Tìm theo tên lớp, mã lớp, môn học..."
                  value={searchKeyword}
                  onChangeText={setSearchKeyword}
                  placeholderTextColor="#94A3B8"
                  style={{ flex: 1, fontSize: 13, color: "#0F172A", marginLeft: 8, paddingVertical: 8 }}
                />
                {searchKeyword.trim().length > 0 && (
                  <TouchableOpacity onPress={() => setSearchKeyword("")}>
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filters */}
              <View style={{ flexDirection: isMobile ? "column" : "row", gap: 10 }}>
                <DropdownPicker label="Môn học" options={subjectOptions} selectedValue={selectedSubject} onValueChange={setSelectedSubject} placeholder="Tất cả môn học" themeColor="#1E40AF" />
                <DropdownPicker label="Học kỳ" options={semesterOptions} selectedValue={selectedSemester} onValueChange={setSelectedSemester} placeholder="Tất cả học kỳ" themeColor="#1E40AF" />
              </View>
            </View>
          </View>

          {/* ── Table ── */}
          {loading ? (
            <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", paddingVertical: 48, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ color: Colors.textSecondary, marginTop: 12 }}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
              <Table
                columns={tableColumns}
                data={paginatedClasses}
                onRowPress={(item) => handleClassPress(item as TeacherClassCard)}
                stickyHeader={false}
                headerBackgroundColor="#1E3A8A"
                headerTextColor="#FFFFFF"
                headerBorderColor="#1D4ED8"
                emptyState={{
                  title: hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có lớp học",
                  description: hasActiveFilters ? "Hãy thử đổi từ khóa hoặc điều chỉnh bộ lọc." : "Hiện chưa có lớp học nào được gán.",
                  icon: <CalendarIcon size={48} color={Colors.gray300} />,
                }}
              />

              {/* Pagination footer */}
              {filteredClasses.length > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingVertical: 12, paddingHorizontal: 16 }}>
                  <Text style={{ fontSize: 13, color: "#64748b" }}>
                    {filteredClasses.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredClasses.length)} / {filteredClasses.length} lớp
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <TouchableOpacity
                      disabled={currentPage <= 1}
                      onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      style={{ padding: 6, opacity: currentPage <= 1 ? 0.35 : 1 }}
                    >
                      <Ionicons name="chevron-back" size={18} color="#1E40AF" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", minWidth: 70, textAlign: "center" }}>Trang {currentPage}/{totalPages}</Text>
                    <TouchableOpacity
                      disabled={currentPage >= totalPages}
                      onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      style={{ padding: 6, opacity: currentPage >= totalPages ? 0.35 : 1 }}
                    >
                      <Ionicons name="chevron-forward" size={18} color="#1E40AF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ─── Detail Modal (Redesigned) ─── */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(15,23,42,0.6)", justifyContent: "center", alignItems: "center", padding: isMobile ? 0 : 24 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: isMobile ? 0 : 20,
              width: "100%",
              maxWidth: isDesktop ? 1060 : isTablet ? 680 : "100%",
              maxHeight: isMobile ? "100%" : "92%",
              flex: isMobile ? 1 : undefined,
              flexShrink: 1,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            {/* ── Gradient Header ── */}
            <View style={{ backgroundColor: "#1e3a8a", padding: isMobile ? 16 : 24, paddingBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="school" size={18} color="#fff" />
                    </View>
                    <View style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.9)", letterSpacing: 0.5 }}>{selectedClass?.code}</Text>
                    </View>
                    {selectedClass?.semester && (
                      <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{selectedClass.semester}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: isMobile ? 18 : 22, fontWeight: "800", color: "#fff", marginBottom: 4 }} numberOfLines={2}>
                    {selectedClass?.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }} numberOfLines={1}>
                    {selectedClass?.subject || ""}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Quick stats row */}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                {[
                  { icon: "people", label: "Sinh viên", value: selectedClass?.totalStudents ?? 0, color: "#bfdbfe" },
                  { icon: "checkmark-circle", label: "Có mặt", value: selectedClass?.presentCount ?? 0, color: "#6ee7b7" },
                  { icon: "time", label: "Muộn", value: selectedClass?.lateCount ?? 0, color: "#fde68a" },
                  { icon: "close-circle", label: "Vắng", value: selectedClass?.absentCount ?? 0, color: "#fca5a5" },
                  { icon: "trending-up", label: "Tỉ lệ ĐD", value: `${selectedClass?.attendanceRate ?? 0}%`, color: "#c4b5fd" },
                ].map((s, i) => (
                  <View key={i} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 10, padding: isMobile ? 8 : 10, alignItems: "center" }}>
                    <Ionicons name={s.icon as any} size={16} color={s.color} />
                    <Text style={{ fontSize: isMobile ? 14 : 18, fontWeight: "800", color: "#fff", marginTop: 4 }}>{s.value}</Text>
                    <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 1, textAlign: "center" }}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Tabs ── */}
            <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", backgroundColor: "#fff" }}>
              {(["overview", "students"] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setModalTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    alignItems: "center",
                    borderBottomWidth: 3,
                    borderBottomColor: modalTab === tab ? "#1e3a8a" : "transparent",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons
                      name={tab === "overview" ? "information-circle-outline" : "people-outline"}
                      size={16}
                      color={modalTab === tab ? "#1e3a8a" : "#94a3b8"}
                    />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: modalTab === tab ? "#1e3a8a" : "#94a3b8" }}>
                      {tab === "overview" ? "Tổng quan" : `Sinh viên (${students.length})`}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Content ── */}
            <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ padding: isMobile ? 16 : 24 }}>
              {modalTab === "overview" ? (
                /* ── Overview tab ── */
                <View style={{ gap: 16 }}>
                  {/* Info cards grid */}
                  <View style={{ flexDirection: isDesktop || isTablet ? "row" : "column", gap: 12 }}>
                    {[
                      { icon: "book-outline", label: "Môn học", value: selectedClass?.subject || "-", color: "#3b82f6", bg: "#eff6ff" },
                      { icon: "calendar-outline", label: "Lịch dạy", value: selectedClass?.scheduleText || "Chưa có lịch", color: "#8b5cf6", bg: "#f5f3ff" },
                      { icon: "location-outline", label: "Phòng học", value: selectedClass?.room || "Chưa có", color: "#10b981", bg: "#ecfdf5" },
                      { icon: "layers-outline", label: "Học kỳ", value: selectedClass?.semester || "-", color: "#f59e0b", bg: "#fffbeb" },
                    ].map((card, i) => (
                      <View key={i} style={{ flex: 1, backgroundColor: card.bg, borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: card.color + "20", alignItems: "center", justifyContent: "center" }}>
                          <Ionicons name={card.icon as any} size={18} color={card.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: card.color, fontWeight: "600", marginBottom: 3, opacity: 0.8 }}>{card.label.toUpperCase()}</Text>
                          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1e293b" }} numberOfLines={2}>{card.value}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Attendance breakdown */}
                  <View style={{ backgroundColor: "#f8fafc", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e293b", marginBottom: 14 }}>Phân bố điểm danh</Text>
                    {[
                      { label: "Có mặt", count: selectedClass?.presentCount ?? 0, color: "#10b981", bg: "#ecfdf5" },
                      { label: "Muộn", count: selectedClass?.lateCount ?? 0, color: "#f59e0b", bg: "#fffbeb" },
                      { label: "Vắng mặt", count: selectedClass?.absentCount ?? 0, color: "#ef4444", bg: "#fef2f2" },
                    ].map((row, i) => {
                      const total = (selectedClass?.presentCount ?? 0) + (selectedClass?.lateCount ?? 0) + (selectedClass?.absentCount ?? 0);
                      const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
                      return (
                        <View key={i} style={{ marginBottom: i < 2 ? 12 : 0 }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                            <Text style={{ fontSize: 13, color: "#475569", fontWeight: "600" }}>{row.label}</Text>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: row.color }}>{row.count} lượt ({pct}%)</Text>
                          </View>
                          <View style={{ height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                            <View style={{ height: 8, width: `${pct}%`, backgroundColor: row.color, borderRadius: 4 }} />
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Overall rate */}
                  <View style={{ backgroundColor: "#1e3a8a", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View>
                      <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Tỉ lệ điểm danh tổng thể</Text>
                      <Text style={{ fontSize: 32, fontWeight: "900", color: "#fff" }}>{selectedClass?.attendanceRate ?? 0}%</Text>
                    </View>
                    <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons
                        name={(selectedClass?.attendanceRate ?? 0) >= 80 ? "checkmark-circle" : "alert-circle"}
                        size={32}
                        color={(selectedClass?.attendanceRate ?? 0) >= 80 ? "#34d399" : "#fbbf24"}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                /* ── Students tab ── */
                <View>
                  {studentsLoading ? (
                    <View style={{ alignItems: "center", paddingVertical: 48 }}>
                      <ActivityIndicator size="large" color="#3b82f6" />
                      <Text style={{ color: "#64748b", marginTop: 12 }}>Đang tải danh sách sinh viên...</Text>
                    </View>
                  ) : (
                    <View style={{ gap: 12 }}>
                      {/* Search bar */}
                      <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, backgroundColor: "#f8fafc", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, minHeight: 42 }}>
                        <Ionicons name="search" size={16} color="#94a3b8" />
                        <TextInput
                          placeholder="Tìm theo tên hoặc MSSV..."
                          value={studentSearch}
                          onChangeText={setStudentSearch}
                          placeholderTextColor="#94a3b8"
                          style={{ flex: 1, fontSize: 13, color: "#0f172a", marginLeft: 8, paddingVertical: 8 }}
                        />
                        {studentSearch.length > 0 && (
                          <TouchableOpacity onPress={() => setStudentSearch("")}>
                            <Ionicons name="close-circle" size={16} color="#94a3b8" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Filter chips */}
                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        {([
                          { key: "all", label: "Tất cả", color: "#1e3a8a", bg: "#eff6ff" },
                          { key: "good", label: "≥ 80%", color: "#10b981", bg: "#ecfdf5" },
                          { key: "warning", label: "60–79%", color: "#f59e0b", bg: "#fffbeb" },
                          { key: "bad", label: "< 60%", color: "#ef4444", bg: "#fef2f2" },
                        ] as const).map((chip) => (
                          <TouchableOpacity
                            key={chip.key}
                            onPress={() => setStudentRateFilter(chip.key)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 20,
                              borderWidth: 1.5,
                              borderColor: studentRateFilter === chip.key ? chip.color : "#e5e7eb",
                              backgroundColor: studentRateFilter === chip.key ? chip.bg : "#fff",
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: "700", color: studentRateFilter === chip.key ? chip.color : "#94a3b8" }}>
                              {chip.label}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        {/* Result count */}
                        <View style={{ marginLeft: "auto" as any, justifyContent: "center" }}>
                          <Text style={{ fontSize: 12, color: "#64748b" }}>
                            {(() => {
                              const kw = studentSearch.trim().toLowerCase();
                              return students.filter((s) => {
                                const rate = Math.round(s.attendanceRate || 0);
                                const matchKw = kw.length === 0 || (s.studentName || "").toLowerCase().includes(kw) || (s.studentId || "").toLowerCase().includes(kw);
                                const matchRate = studentRateFilter === "all" || (studentRateFilter === "good" && rate >= 80) || (studentRateFilter === "warning" && rate >= 60 && rate < 80) || (studentRateFilter === "bad" && rate < 60);
                                return matchKw && matchRate;
                              }).length;
                            })()} / {students.length} sinh viên
                          </Text>
                        </View>
                      </View>

                      {/* Student cards */}
                      {(() => {
                        const kw = studentSearch.trim().toLowerCase();
                        const filtered = students.filter((s) => {
                          const rate = Math.round(s.attendanceRate || 0);
                          const matchKw = kw.length === 0 || (s.studentName || "").toLowerCase().includes(kw) || (s.studentId || "").toLowerCase().includes(kw);
                          const matchRate = studentRateFilter === "all" || (studentRateFilter === "good" && rate >= 80) || (studentRateFilter === "warning" && rate >= 60 && rate < 80) || (studentRateFilter === "bad" && rate < 60);
                          return matchKw && matchRate;
                        });

                        if (filtered.length === 0) {
                          return (
                            <View style={{ alignItems: "center", paddingVertical: 32 }}>
                              <Ionicons name="search-outline" size={40} color="#cbd5e1" />
                              <Text style={{ color: "#94a3b8", marginTop: 10, fontSize: 14 }}>Không tìm thấy sinh viên nào</Text>
                            </View>
                          );
                        }

                        return (
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                            {filtered.map((student) => {
                              const rate = Math.round(student.attendanceRate || 0);
                              const rateColor = rate >= 80 ? "#10b981" : rate >= 60 ? "#f59e0b" : "#ef4444";
                              const rateBg = rate >= 80 ? "#ecfdf5" : rate >= 60 ? "#fffbeb" : "#fef2f2";
                              const initial = (student.studentName || "?").trim().charAt(0).toUpperCase();
                              const cardWidth = isDesktop ? "calc(50% - 5px)" : "100%";
                              return (
                                <TouchableOpacity
                                  key={student.studentId}
                                  onPress={() => handleStudentPress(student)}
                                  activeOpacity={0.75}
                                  style={{
                                    width: cardWidth as any,
                                    backgroundColor: "#fff",
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: "#e5e7eb",
                                    padding: 14,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.03,
                                    shadowRadius: 4,
                                    elevation: 1,
                                  }}
                                >
                                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Text style={{ fontSize: 16, fontWeight: "800", color: "#1e40af" }}>{initial}</Text>
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#1e293b", marginBottom: 2 }} numberOfLines={1}>{student.studentName}</Text>
                                    <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>MSSV: {student.studentId}</Text>
                                    <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                                      ✓ {student.presentCount || 0} • ⏰ {student.lateCount || 0} • ✗ {student.absentCount || 0}
                                    </Text>
                                  </View>
                                  <View style={{ alignItems: "center", gap: 4 }}>
                                    <View style={{ backgroundColor: rateBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                                      <Text style={{ fontSize: 14, fontWeight: "800", color: rateColor }}>{rate}%</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={14} color="#cbd5e1" />
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        );
                      })()}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: "#f1f5f9", flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e5e7eb" }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569" }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* History Modal */}
      <Modal
        visible={studentHistoryVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseHistoryModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              width: "100%",
              maxHeight: "85%",
              flexShrink: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 8,
              paddingTop: 16,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#cbd5e1",
                borderRadius: 2,
                alignSelf: "center",
                marginBottom: 16,
              }}
            />

            <View
              style={{
                paddingHorizontal: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#f1f5f9",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#1e293b" }}
              >
                Chi tiết điểm danh
              </Text>
              <TouchableOpacity
                onPress={handleCloseHistoryModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloseIcon size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: "#eff6ff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "700", color: "#3b82f6" }}
                >
                  {selectedStudent?.studentName?.trim().charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}
                  numberOfLines={1}
                >
                  {selectedStudent?.studentName}
                </Text>
                <Text style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                  MSSV: {selectedStudent?.studentId}
                </Text>
              </View>
            </View>

            <ScrollView
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ padding: 20 }}
            >
              {studentRecordsLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Text style={{ color: "#64748b" }}>Đang tải lịch sử...</Text>
                </View>
              ) : studentRecords.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                  <Text
                    style={{
                      color: "#94a3b8",
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    Chưa có bản ghi điểm danh nào{"\n"}cho sinh viên này
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {studentRecords.map((r, i) => {
                    const date = new Date(
                      r.createdAt || r.attendedAt || Date.now(),
                    );
                    const statusColor = getStatusColor(r.status);
                    const statusLabel = getStatusLabel(r.status);

                    return (
                      <View
                        key={r.id || i}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 14,
                          backgroundColor: "#fff",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "#f1f5f9",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.02,
                          shadowRadius: 4,
                          elevation: 1,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: statusColor + "15",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <Ionicons
                            name={
                              r.status === "PRESENT"
                                ? "checkmark"
                                : r.status === "LATE"
                                  ? "time"
                                  : "close"
                            }
                            size={20}
                            color={statusColor}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "600",
                              color: "#1e293b",
                              marginBottom: 2,
                            }}
                          >
                            {date.toLocaleDateString("vi-VN")}
                          </Text>
                          <Text style={{ fontSize: 12, color: "#64748b" }}>
                            {date.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            • QUA {r.method || "---"}
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: statusColor + "15",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: statusColor,
                            }}
                          >
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
