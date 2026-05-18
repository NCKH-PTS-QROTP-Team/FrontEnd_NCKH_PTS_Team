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
        key: "action",
        label: "",
        flex: 0.8,
        align: "center" as const,
        render: () => (
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563eb" }}>
            Xem chi tiết
          </Text>
        ),
      },
    ];
  }, [isMobile]);

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
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {isMobile ? (
            <MobileGradientHeader
              title="Danh sách lớp học"
              subtitle={`${summary.totalClasses} lớp • ${summary.totalStudents} sinh viên`}
              icon="school"
              iconSize={24}
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
              style={{
                marginHorizontal: 0,
                marginTop: 0,
                marginBottom: 14,
                borderColor: "#BFDBFE",
              }}
            />
          ) : null}

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#E5ECF6",
              padding: 14,
              marginBottom: 14,
            }}
          >
            <View
              style={{
                borderWidth: 1,
                borderColor: "#D7E3F7",
                borderRadius: 12,
                backgroundColor: "#F8FAFF",
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                marginBottom: 12,
                minHeight: 44,
              }}
            >
              <Ionicons name="search" size={18} color="#1E40AF" />
              <TextInput
                placeholder="Tìm theo tên lớp, mã lớp, môn học, học kỳ..."
                value={searchKeyword}
                onChangeText={setSearchKeyword}
                placeholderTextColor="#94A3B8"
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: "#0F172A",
                  marginLeft: 8,
                  paddingVertical: 10,
                }}
              />
              {searchKeyword.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchKeyword("")}
                  style={{ paddingHorizontal: 4 }}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 10,
              }}
            >
              <DropdownPicker
                label="Môn học"
                options={subjectOptions}
                selectedValue={selectedSubject}
                onValueChange={setSelectedSubject}
                placeholder="Tất cả môn học"
                themeColor="#1E40AF"
              />
              <DropdownPicker
                label="Học kỳ"
                options={semesterOptions}
                selectedValue={selectedSemester}
                onValueChange={setSelectedSemester}
                placeholder="Tất cả học kỳ"
                themeColor="#1E40AF"
              />
            </View>

            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <Text
                style={{ fontSize: 12, color: "#475569", fontWeight: "600" }}
              >
                Hiển thị{" "}
                {filteredClasses.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
                -{Math.min(currentPage * pageSize, filteredClasses.length)}/
                {filteredClasses.length} lớp
              </Text>
              {hasActiveFilters ? (
                <TouchableOpacity onPress={resetFilters}>
                  <Text
                    style={{
                      color: "#1D4ED8",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    Xóa bộ lọc
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {loading ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E5ECF6",
                paddingVertical: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ color: Colors.textSecondary, marginTop: 12 }}>
                Đang tải dữ liệu...
              </Text>
            </View>
          ) : (
            <View>
              <Table
                columns={tableColumns}
                data={paginatedClasses}
                onRowPress={(item) =>
                  handleClassPress(item as TeacherClassCard)
                }
                stickyHeader={false}
                headerBackgroundColor="#1E3A8A"
                headerTextColor="#FFFFFF"
                headerBorderColor="#1D4ED8"
                emptyState={{
                  title: hasActiveFilters
                    ? "Không có kết quả phù hợp"
                    : "Chưa có lớp học",
                  description: hasActiveFilters
                    ? "Hãy thử đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc."
                    : "Hiện chưa có lớp học nào được gán cho giảng viên.",
                  icon: <CalendarIcon size={48} color={Colors.gray300} />,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  marginTop: 10,
                  marginLeft: 2,
                }}
              >
                Nhấn vào một dòng để xem chi tiết lớp và danh sách sinh viên.
              </Text>

              {filteredClasses.length > 0 && (
                <View
                  style={{
                    marginTop: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#E5ECF6",
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    disabled={currentPage <= 1}
                    onPress={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: currentPage <= 1 ? "#E2E8F0" : "#DBEAFE",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: currentPage <= 1 ? "#94A3B8" : "#1D4ED8",
                      }}
                    >
                      Trước
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={{
                      fontSize: 12,
                      color: "#334155",
                      fontWeight: "700",
                    }}
                  >
                    Trang {currentPage}/{totalPages}
                  </Text>

                  <TouchableOpacity
                    disabled={currentPage >= totalPages}
                    onPress={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor:
                        currentPage >= totalPages ? "#E2E8F0" : "#DBEAFE",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color:
                          currentPage >= totalPages ? "#94A3B8" : "#1D4ED8",
                      }}
                    >
                      Sau
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: isMobile ? 16 : 24,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              width: "100%",
              maxWidth: isDesktop ? 800 : 600,
              maxHeight: "90%",
              flexShrink: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                padding: isMobile ? 16 : 24,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: isMobile ? 18 : 20,
                    fontWeight: "600",
                    color: Colors.text,
                    marginBottom: 4,
                  }}
                >
                  {selectedClass?.code} - {selectedClass?.name}
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                  {selectedClass?.scheduleText} • Phòng {selectedClass?.room}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: Colors.gray100,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 12,
                }}
              >
                <CloseIcon size={18} color={Colors.gray700} />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ padding: isMobile ? 16 : 24 }}
            >
              <View
                style={{
                  backgroundColor: "#EFF6FF",
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: "#1E3A8A",
                    fontWeight: "700",
                    marginBottom: 6,
                  }}
                >
                  Tổng quan lớp học
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#334155" }}>
                    Môn học: {selectedClass?.subject || "-"}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#334155" }}>
                    Sĩ số: {selectedClass?.totalStudents || 0} sinh viên
                  </Text>
                </View>
              </View>

              {/* Student List */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#1E3A8A",
                  marginBottom: 10,
                }}
              >
                Danh sách sinh viên{" "}
                {studentsLoading
                  ? "(đang tải...)"
                  : `(${students.length} sinh viên)`}
              </Text>
              {!studentsLoading &&
                students.map((student) => {
                  const rate = Math.round(student.attendanceRate || 0);
                  let rateColor = "#2563EB";
                  let rateBg = "#DBEAFE";
                  if (rate >= 90) {
                    rateColor = "#1D4ED8";
                    rateBg = "#DBEAFE";
                  } else if (rate >= 75) {
                    rateColor = "#1E40AF";
                    rateBg = "#E0E7FF";
                  }
                  const initial = (student.studentName || "?")
                    .trim()
                    .charAt(0)
                    .toUpperCase();

                  return (
                    <TouchableOpacity
                      key={student.studentId}
                      onPress={() => handleStudentPress(student)}
                      activeOpacity={0.75}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#DBEAFE",
                        marginBottom: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {/* Avatar */}
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 19,
                          backgroundColor: "#DBEAFE",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "800",
                            color: "#1E40AF",
                          }}
                        >
                          {initial}
                        </Text>
                      </View>

                      {/* Info */}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#1e293b",
                            marginBottom: 2,
                          }}
                          numberOfLines={1}
                        >
                          {student.studentName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                            marginBottom: 4,
                          }}
                        >
                          MSSV: {student.studentId}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#64748b" }}>
                          Có mặt: {student.presentCount || 0} • Vắng:{" "}
                          {student.absentCount || 0} • Muộn:{" "}
                          {student.lateCount || 0}
                        </Text>
                      </View>

                      {/* Rate badge */}
                      <View
                        style={{
                          backgroundColor: rateBg,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          alignItems: "center",
                          minWidth: 62,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: rateColor,
                          }}
                        >
                          {rate}%
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: rateColor,
                            opacity: 0.8,
                          }}
                        >
                          Tỷ lệ
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            {/* Modal Footer */}
            <View
              style={{
                padding: isMobile ? 16 : 24,
                borderTopWidth: 1,
                borderTopColor: Colors.border,
              }}
            >
              <PrimaryButton
                title="Đóng"
                onPress={handleCloseModal}
                variant="outline"
              />
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
