import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import {
  classService,
  type Class,
  type ClassStudent,
} from "@/apis/services/class.service";
import {
  reportService,
  type ClassAttendanceReport,
  type StudentAttendanceReport,
} from "@/apis/services/report.service";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import { useToast } from "@/components/ToastProvider";

const PRIMARY_BLUE = "#1E3A8A";
const PRIMARY_BLUE_SOFT = "#DBEAFE";

type TabKey = "students" | "at-risk";

function getAttendanceColor(rate: number) {
  if (rate >= 90) return "#10b981";
  if (rate >= 75) return "#f59e0b";
  return "#ef4444";
}

function getAttendanceBg(rate: number) {
  if (rate >= 90) return "#ecfdf5";
  if (rate >= 75) return "#fffbeb";
  return "#fef2f2";
}

function getStatusColor(status: string) {
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
}

function getStatusLabel(status: string) {
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
}

function getStatusIcon(
  status: string,
): React.ComponentProps<typeof Ionicons>["name"] {
  switch (status) {
    case "PRESENT":
      return "checkmark-circle";
    case "LATE":
      return "time";
    case "ABSENT":
      return "close-circle";
    default:
      return "help-circle";
  }
}

function StudentCard({
  student,
  onPress,
  compact = false,
}: {
  student: StudentAttendanceReport;
  onPress?: () => void;
  compact?: boolean;
}) {
  const rate = Math.round(student.attendanceRate || 0);
  const rateColor = getAttendanceColor(rate);
  const rateBg = getAttendanceBg(rate);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 8,
        paddingVertical: compact ? 10 : 12,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: compact ? 36 : 40,
          height: compact ? 36 : 40,
          borderRadius: compact ? 18 : 20,
          backgroundColor: PRIMARY_BLUE_SOFT,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "800", color: PRIMARY_BLUE }}>
          {(student.studentName || "?").charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#1E293B",
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {student.studentName}
        </Text>
        <Text style={{ fontSize: 12, color: "#64748B" }} numberOfLines={1}>
          MSSV: {student.studentId}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: rateBg,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 8,
          alignItems: "center",
          minWidth: 56,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "800", color: rateColor }}>
          {rate}%
        </Text>
        <Text style={{ fontSize: 10, color: rateColor, opacity: 0.8 }}>
          Chuyên cần
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdviseeClass() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const isMobile = width < 768;
  const paddingHorizontal = isDesktop ? 24 : isMobile ? 16 : 20;
  const pageSize = isDesktop ? 10 : 8;

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentAttendanceReport[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [subjectCards, setSubjectCards] = useState<
    Array<{
      title: string;
      classCode: string;
      rate: number;
      totalSessions: number;
    }>
  >([]);
  const [className, setClassName] = useState("Lớp chủ nhiệm");
  const [major, setMajor] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [atRiskCount, setAtRiskCount] = useState(0);

  const [selectedStudent, setSelectedStudent] =
    useState<StudentAttendanceReport | null>(null);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [studentRecordsLoading, setStudentRecordsLoading] = useState(false);
  const [studentsPage, setStudentsPage] = useState(1);
  const [atRiskPage, setAtRiskPage] = useState(1);

  const { showToast } = useToast();

  useEffect(() => {
    loadAdvisorClassData();
  }, []);

  const toStudentReport = (
    student: ClassStudent,
    selectedClass: Class,
  ): StudentAttendanceReport => ({
    studentId: student.studentId || student.id,
    studentName: student.name || "Sinh viên",
    classId: selectedClass.id,
    className: selectedClass.name || selectedClass.code || "Lớp học",
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    attendanceRate: 0,
  });

  const loadStudentsForClass = async (
    classId: string,
    classesInput?: Class[],
  ) => {
    const classList = classesInput || teacherClasses;
    const selectedClass = classList.find((c) => c.id === classId);
    if (!selectedClass) return;

    setSelectedClassId(selectedClass.id);
    setClassName(selectedClass.code || "Lớp chủ nhiệm");
    setMajor(selectedClass.name || "");

    const [classStudents, studentReports, classReports] = await Promise.all([
      classService.getStudentsByClass(selectedClass.id),
      reportService
        .getStudentReports(selectedClass.id)
        .catch(() => [] as StudentAttendanceReport[]),
      reportService
        .getClassReports()
        .catch(() => [] as ClassAttendanceReport[]),
    ]);

    const reportByStudentId = new Map(
      studentReports
        .filter((r) => !!r.studentId)
        .map((r) => [String(r.studentId), r]),
    );

    const mergedStudents = classStudents.map((student) => {
      const fallback = toStudentReport(student, selectedClass);
      const report = reportByStudentId.get(String(fallback.studentId));
      return report ? { ...fallback, ...report } : fallback;
    });

    setStudents(mergedStudents);

    const total = mergedStudents.length;
    const studentsHasSessions = mergedStudents.filter(
      (s) => (s.totalSessions || 0) > 0,
    );
    const atRisk = studentsHasSessions.filter(
      (s) => (s.attendanceRate || 0) < 80,
    );
    const avgRate =
      studentsHasSessions.length > 0
        ? Math.round(
            (studentsHasSessions.reduce(
              (sum, s) => sum + (s.attendanceRate || 0),
              0,
            ) /
              studentsHasSessions.length) *
              10,
          ) / 10
        : 0;

    setTotalStudents(total);
    setAtRiskCount(atRisk.length);
    setAttendanceRate(avgRate);

    const reportMap = new Map(classReports.map((r) => [r.classId, r]));
    const cards = classList.slice(0, 4).map((cls) => {
      const report = reportMap.get(cls.id);
      return {
        title: cls.subjectName || cls.name || "Môn học",
        classCode: cls.code || "",
        rate: Math.round(report?.attendanceRate || 0),
        totalSessions: report?.totalSessions || 0,
      };
    });
    setSubjectCards(cards);
  };

  const loadAdvisorClassData = async () => {
    try {
      setLoading(true);
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) {
        showToast(
          "Không tìm thấy thông tin giảng viên. Vui lòng đăng nhập lại.",
          "error",
        );
        return;
      }

      const classes = await classService.getClassesByTeacher(teacherId);
      if (!classes || classes.length === 0) {
        showToast("Bạn chưa được phân công lớp chủ nhiệm.", "info");
        setTeacherClasses([]);
        setSelectedClassId(null);
        setStudents([]);
        return;
      }

      setTeacherClasses(classes);
      await loadStudentsForClass(classes[0].id, classes);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải dữ liệu lớp chủ nhiệm.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const atRiskStudents = useMemo(
    () =>
      students.filter(
        (s) => (s.totalSessions || 0) > 0 && (s.attendanceRate || 0) < 80,
      ),
    [students],
  );

  const handleSelectAssignedClass = async (classId: string) => {
    if (!classId || classId === selectedClassId) return;
    try {
      setLoading(true);
      await loadStudentsForClass(classId);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải danh sách sinh viên của lớp.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        (s.studentName || "").toLowerCase().includes(q) ||
        (s.studentId || "").toLowerCase().includes(q),
    );
  }, [students, searchQuery]);

  const totalStudentsPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / pageSize),
  );

  const totalAtRiskPages = Math.max(
    1,
    Math.ceil(atRiskStudents.length / pageSize),
  );

  useEffect(() => {
    setStudentsPage(1);
  }, [searchQuery, selectedClassId]);

  useEffect(() => {
    setAtRiskPage(1);
  }, [selectedClassId]);

  useEffect(() => {
    setStudentsPage((prev) => Math.min(prev, totalStudentsPages));
  }, [totalStudentsPages]);

  useEffect(() => {
    setAtRiskPage((prev) => Math.min(prev, totalAtRiskPages));
  }, [totalAtRiskPages]);

  const pagedStudents = useMemo(() => {
    const start = (studentsPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, studentsPage, pageSize]);

  const pagedAtRiskStudents = useMemo(() => {
    const start = (atRiskPage - 1) * pageSize;
    return atRiskStudents.slice(start, start + pageSize);
  }, [atRiskStudents, atRiskPage, pageSize]);

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onChange: (page: number) => void,
  ) => {
    if (totalPages <= 1) return null;

    return (
      <View
        style={{
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => onChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#CBD5E1",
            backgroundColor: currentPage === 1 ? "#F8FAFC" : "#FFFFFF",
            opacity: currentPage === 1 ? 0.6 : 1,
          }}
        >
          <Ionicons name="chevron-back" size={14} color="#334155" />
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>
            Trước
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "700" }}>
          Trang {currentPage}/{totalPages}
        </Text>

        <TouchableOpacity
          onPress={() => onChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#CBD5E1",
            backgroundColor: currentPage === totalPages ? "#F8FAFC" : "#FFFFFF",
            opacity: currentPage === totalPages ? 0.6 : 1,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>
            Sau
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#334155" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleOpenStudentDetail = async (student: StudentAttendanceReport) => {
    setSelectedStudent(student);
    setStudentModalVisible(true);
    setStudentRecords([]);
    setStudentRecordsLoading(true);
    try {
      const { attendanceService } = await import("@/apis");
      const records = await attendanceService.getRecords({
        studentId: student.studentId,
      });
      setStudentRecords(records || []);
    } catch {
      setStudentRecords([]);
    } finally {
      setStudentRecordsLoading(false);
    }
  };

  const handleCloseStudentDetail = () => {
    setStudentModalVisible(false);
    setTimeout(() => {
      setSelectedStudent(null);
      setStudentRecords([]);
    }, 250);
  };

  const stats = [
    {
      id: "total",
      label: "Tổng sinh viên",
      value: String(totalStudents),
      icon: "people" as const,
      bg: "#EFF6FF",
      color: "#1D4ED8",
    },
    {
      id: "rate",
      label: "Tỷ lệ điểm danh",
      value: `${attendanceRate}%`,
      icon: "pie-chart" as const,
      bg: "#ECFDF5",
      color: "#059669",
    },
    {
      id: "risk",
      label: "Cần quan tâm",
      value: String(atRiskCount),
      icon: "warning" as const,
      bg: "#FEF2F2",
      color: "#DC2626",
    },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F1F5F9" }}
      edges={["top"]}
    >
      <StatusBar style={isMobile ? "light" : "dark"} />

      {isMobile && (
        <LinearGradient
          colors={["#1E3A8A", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            marginHorizontal: 16,
            marginTop: 10,
            padding: 16,
            borderWidth: 1,
            borderColor: "#93C5FD",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                flex: 1,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.32)",
                }}
              >
                <Ionicons name="school" size={22} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 19, fontWeight: "800", color: "#FFFFFF" }}
                >
                  Lớp chủ nhiệm
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.9)",
                    marginTop: 2,
                  }}
                >
                  {className} • {totalStudents} sinh viên
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => router.push("/teacher/notifications")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.35)",
                }}
              >
                <Ionicons name="notifications" size={19} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/teacher/profile")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.35)",
                }}
              >
                <Ionicons name="person" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      )}

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={PRIMARY_BLUE} />
          <Text style={{ color: Colors.textSecondary, marginTop: 12 }}>
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal,
            paddingTop: isMobile ? 12 : 16,
            paddingBottom: isMobile ? 128 : 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ maxWidth: 1320, width: "100%", alignSelf: "center" }}>
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <View style={{ width: isDesktop ? "34%" : "100%", gap: 14 }}>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#E5ECF6",
                    padding: 14,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: PRIMARY_BLUE,
                    }}
                  >
                    Tổng quan lớp học
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}
                  >
                    {className} • {major || "Lớp chủ nhiệm"}
                  </Text>

                  <View
                    style={{
                      marginTop: 12,
                      backgroundColor: "#F8FAFC",
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#64748B" }}>
                      Danh sách lớp được phân công
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#0F172A",
                        fontWeight: "700",
                        marginTop: 2,
                      }}
                    >
                      {teacherClasses.length} lớp
                    </Text>
                  </View>

                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {teacherClasses.map((cls) => {
                      const active = selectedClassId === cls.id;
                      return (
                        <TouchableOpacity
                          key={cls.id}
                          onPress={() => handleSelectAssignedClass(cls.id)}
                          style={{
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: active ? PRIMARY_BLUE : "#CBD5E1",
                            backgroundColor: active ? "#EFF6FF" : "#FFFFFF",
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: active ? PRIMARY_BLUE : "#475569",
                            }}
                          >
                            {cls.code || cls.name || "Lớp"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View
                    style={{
                      marginTop: 12,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    {stats.map((item) => (
                      <View
                        key={item.id}
                        style={{
                          width: isDesktop ? "48%" : "31%",
                          minWidth: isDesktop ? 120 : 100,
                          backgroundColor: item.bg,
                          borderRadius: 10,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: "#E2E8F0",
                        }}
                      >
                        <Ionicons
                          name={item.icon}
                          size={16}
                          color={item.color}
                        />
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "800",
                            color: "#0F172A",
                            marginTop: 4,
                          }}
                        >
                          {item.value}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#64748B",
                            marginTop: 2,
                          }}
                        >
                          {item.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#E5ECF6",
                    padding: 14,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: PRIMARY_BLUE,
                    }}
                  >
                    Các môn đã học
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}
                  >
                    Hiển thị từ các lớp đã phân công
                  </Text>

                  <View style={{ marginTop: 10 }}>
                    {subjectCards.length === 0 ? (
                      <Text style={{ fontSize: 13, color: "#94A3B8" }}>
                        Chưa có dữ liệu môn học.
                      </Text>
                    ) : (
                      subjectCards.map((item, idx) => {
                        const color = getAttendanceColor(item.rate);
                        return (
                          <View
                            key={`${item.classCode}-${idx}`}
                            style={{
                              borderWidth: 1,
                              borderColor: "#E2E8F0",
                              borderRadius: 10,
                              padding: 10,
                              marginBottom:
                                idx < subjectCards.length - 1 ? 8 : 0,
                              backgroundColor: "#F8FAFC",
                            }}
                          >
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 13,
                                fontWeight: "700",
                                color: "#1E293B",
                              }}
                            >
                              {item.title}
                            </Text>
                            <View
                              style={{
                                marginTop: 6,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Text style={{ fontSize: 11, color: "#64748B" }}>
                                {item.classCode} • {item.totalSessions} buổi
                              </Text>
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: "800",
                                  color,
                                }}
                              >
                                {item.rate}%
                              </Text>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>
              </View>

              <View style={{ width: isDesktop ? "64%" : "100%" }}>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#E5ECF6",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#F8FAFC",
                      borderBottomWidth: 1,
                      borderBottomColor: "#E2E8F0",
                    }}
                  >
                    {[
                      {
                        key: "students" as const,
                        label: "Danh sách sinh viên",
                        count: filteredStudents.length,
                      },
                      {
                        key: "at-risk" as const,
                        label: "Sinh viên cần quan tâm",
                        count: atRiskStudents.length,
                      },
                    ].map((tab) => {
                      const active = activeTab === tab.key;
                      return (
                        <TouchableOpacity
                          key={tab.key}
                          onPress={() => setActiveTab(tab.key)}
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            paddingHorizontal: 12,
                            borderBottomWidth: 2,
                            borderBottomColor: active
                              ? PRIMARY_BLUE
                              : "transparent",
                            backgroundColor: active ? "#EFF6FF" : "transparent",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "700",
                              color: active ? PRIMARY_BLUE : "#64748B",
                            }}
                          >
                            {tab.label} ({tab.count})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={{ padding: 14 }}>
                    {activeTab === "students" ? (
                      <>
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
                            placeholder="Tìm theo tên sinh viên hoặc MSSV..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#94A3B8"
                            style={{
                              flex: 1,
                              fontSize: 14,
                              color: "#0F172A",
                              marginLeft: 8,
                              paddingVertical: 10,
                              ...(Platform.OS === "web"
                                ? ({ outlineStyle: "none" } as any)
                                : {}),
                            }}
                          />
                          {searchQuery.trim().length > 0 && (
                            <TouchableOpacity
                              onPress={() => setSearchQuery("")}
                            >
                              <Ionicons
                                name="close-circle"
                                size={18}
                                color="#94A3B8"
                              />
                            </TouchableOpacity>
                          )}
                        </View>

                        {filteredStudents.length === 0 ? (
                          <View
                            style={{
                              alignItems: "center",
                              paddingVertical: 34,
                            }}
                          >
                            <Ionicons
                              name="search-outline"
                              size={44}
                              color="#CBD5E1"
                            />
                            <Text
                              style={{
                                marginTop: 10,
                                color: "#94A3B8",
                                fontWeight: "600",
                              }}
                            >
                              Không tìm thấy sinh viên
                            </Text>
                          </View>
                        ) : (
                          pagedStudents.map((student) => (
                            <StudentCard
                              key={student.studentId}
                              student={student}
                              onPress={() => handleOpenStudentDetail(student)}
                            />
                          ))
                        )}
                        {renderPagination(
                          studentsPage,
                          totalStudentsPages,
                          setStudentsPage,
                        )}
                      </>
                    ) : (
                      <>
                        <View
                          style={{
                            backgroundColor: "#FEF2F2",
                            borderWidth: 1,
                            borderColor: "#FECACA",
                            borderRadius: 10,
                            padding: 10,
                            marginBottom: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Ionicons name="warning" size={16} color="#DC2626" />
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#DC2626",
                              fontWeight: "700",
                            }}
                          >
                            Sinh viên có tỷ lệ điểm danh dưới 80%
                          </Text>
                        </View>

                        {atRiskStudents.length === 0 ? (
                          <View
                            style={{
                              alignItems: "center",
                              paddingVertical: 34,
                            }}
                          >
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={44}
                              color="#10B981"
                            />
                            <Text
                              style={{
                                marginTop: 10,
                                color: "#10B981",
                                fontWeight: "700",
                              }}
                            >
                              Không có sinh viên cần quan tâm
                            </Text>
                          </View>
                        ) : (
                          pagedAtRiskStudents.map((student) => (
                            <StudentCard
                              key={student.studentId}
                              student={student}
                              compact
                              onPress={() => handleOpenStudentDetail(student)}
                            />
                          ))
                        )}
                        {renderPagination(
                          atRiskPage,
                          totalAtRiskPages,
                          setAtRiskPage,
                        )}
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <Modal
        visible={studentModalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseStudentDetail}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              width: "100%",
              maxHeight: "90%",
              paddingTop: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#CBD5E1",
                borderRadius: 2,
                alignSelf: "center",
                marginBottom: 12,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#F1F5F9",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: PRIMARY_BLUE_SOFT,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: PRIMARY_BLUE,
                  }}
                >
                  {selectedStudent?.studentName?.trim().charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 17, fontWeight: "700", color: "#1E293B" }}
                  numberOfLines={1}
                >
                  {selectedStudent?.studentName}
                </Text>
                <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                  MSSV: {selectedStudent?.studentId}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseStudentDetail}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                }}
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20 }}
            >
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: PRIMARY_BLUE,
                  }}
                >
                  Lịch sử điểm danh
                </Text>
              </View>

              {studentRecordsLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 32 }}>
                  <ActivityIndicator size="small" color={PRIMARY_BLUE} />
                  <Text
                    style={{ fontSize: 13, color: "#94A3B8", marginTop: 10 }}
                  >
                    Đang tải lịch sử...
                  </Text>
                </View>
              ) : studentRecords.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 32 }}>
                  <Ionicons name="calendar-outline" size={44} color="#CBD5E1" />
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#94A3B8",
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    Chưa có bản ghi điểm danh nào{"\n"}cho sinh viên này
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {studentRecords.map((r, i) => {
                    const date = new Date(
                      r.createdAt || r.attendedAt || Date.now(),
                    );
                    const statusColor = getStatusColor(r.status);
                    const statusLabel = getStatusLabel(r.status);
                    const statusIcon = getStatusIcon(r.status);
                    return (
                      <View
                        key={r.id || i}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 12,
                          backgroundColor: "#FFFFFF",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "#F1F5F9",
                          gap: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: statusColor + "18",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Ionicons
                            name={statusIcon}
                            size={20}
                            color={statusColor}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: "#1E293B",
                              marginBottom: 2,
                            }}
                          >
                            {date.toLocaleDateString("vi-VN", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </Text>
                          <Text style={{ fontSize: 12, color: "#94A3B8" }}>
                            {date.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {r.method ? ` • ${r.method}` : ""}
                          </Text>
                        </View>

                        <View
                          style={{
                            backgroundColor: statusColor + "18",
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
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
