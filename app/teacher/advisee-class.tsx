import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { classService } from "@/apis/services/class.service";
import {
  reportService,
  type StudentAttendanceReport,
} from "@/apis/services/report.service";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";

// ─── Constants ────────────────────────────────────────────────────────────────
const INDIGO = "#6366f1";

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Tab Bar ─────────────────────────────────────────────────────────────────
const TAB_DEFS = [
  { key: "overview", label: "Tổng quan", icon: "bar-chart-outline" as const },
  { key: "students", label: "Danh sách SV", icon: "people-outline" as const },
  { key: "at-risk", label: "Cảnh báo", icon: "warning-outline" as const },
];

function TabBar({
  activeTab,
  onTabChange,
  atRiskCount,
}: {
  activeTab: string;
  onTabChange: (key: string) => void;
  atRiskCount: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        paddingHorizontal: 16,
      }}
    >
      {TAB_DEFS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 12,
              marginRight: 4,
              borderBottomWidth: 2,
              borderBottomColor: isActive ? INDIGO : "transparent",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
            activeOpacity={0.75}
          >
            <Ionicons
              name={tab.icon}
              size={15}
              color={isActive ? INDIGO : "#94a3b8"}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: isActive ? INDIGO : "#94a3b8",
              }}
            >
              {tab.label}
            </Text>
            {tab.key === "at-risk" && atRiskCount > 0 && (
              <View
                style={{
                  backgroundColor: "#ef4444",
                  borderRadius: 10,
                  minWidth: 18,
                  height: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 5,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}
                >
                  {atRiskCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Student Row Card ─────────────────────────────────────────────────────────
function StudentRowCard({
  student,
  onPress,
}: {
  student: StudentAttendanceReport;
  onPress?: () => void;
}) {
  const rate = Math.round(student.attendanceRate || 0);
  const rateColor = getAttendanceColor(rate);
  const rateBg = getAttendanceBg(rate);
  const initial = (student.studentName || "?").charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#64748b",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 10,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: INDIGO + "18",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800", color: INDIGO }}>
          {initial}
        </Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: 3,
          }}
          numberOfLines={1}
        >
          {student.studentName}
        </Text>
        <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
          MSSV: {student.studentId}
          {student.className ? ` • ${student.className}` : ""}
        </Text>
        {/* Progress bar */}
        <View
          style={{
            height: 4,
            backgroundColor: "#e2e8f0",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${rate}%`,
              backgroundColor: rateColor,
              borderRadius: 2,
            }}
          />
        </View>
      </View>

      {/* Rate badge */}
      <View
        style={{
          backgroundColor: rateBg,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 8,
          alignItems: "center",
          minWidth: 52,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "800", color: rateColor }}>
          {rate}%
        </Text>
        <Text style={{ fontSize: 10, color: rateColor, opacity: 0.8 }}>
          Điểm danh
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── At-Risk Card ─────────────────────────────────────────────────────────────
function AtRiskCard({
  student,
  onNotify,
  onDetail,
}: {
  student: StudentAttendanceReport;
  onNotify?: () => void;
  onDetail?: () => void;
}) {
  const totalSessions = student.totalSessions || 0;
  const rate = Math.round(student.attendanceRate || 0);
  const isCritical = rate < 60; // < 60% là cực kỳ nguy hiểm
  const accentColor = isCritical ? "#ef4444" : "#f59e0b";
  const accentBg = isCritical ? "#fef2f2" : "#fffbeb";
  const initial = (student.studentName || "?").charAt(0).toUpperCase();

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#64748b",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      {/* Left accent */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: accentColor,
        }}
      />

      <View style={{ padding: 14, paddingLeft: 18 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: accentBg,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Text
              style={{ fontSize: 17, fontWeight: "800", color: accentColor }}
            >
              {initial}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {student.studentName}
            </Text>
            <Text style={{ fontSize: 12, color: "#64748b" }}>
              MSSV: {student.studentId}
            </Text>
          </View>
          {/* Rate badge */}
          <View
            style={{
              backgroundColor: accentColor,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#fff" }}>
              {rate}%
            </Text>
            <Text
              style={{
                fontSize: 9,
                color: "#fff",
                opacity: 0.85,
                textAlign: "center",
              }}
            >
              Chuyên cần
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#f8fafc",
            borderRadius: 10,
            padding: 10,
            marginBottom: 12,
            gap: 8,
          }}
        >
          {[
            { label: "Vắng", value: student.absentCount, color: "#ef4444" },
            { label: "Tổng buổi", value: totalSessions, color: "#64748b" },
            {
              label: "Có mặt",
              value: totalSessions - student.absentCount,
              color: "#10b981",
            },
          ].map((s, idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                alignItems: "center",
                borderLeftWidth: idx > 0 ? 1 : 0,
                borderLeftColor: "#e2e8f0",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: s.color }}>
                {s.value}
              </Text>
              <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 6,
            backgroundColor: "#e2e8f0",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${rate}%`,
              backgroundColor: accentColor,
              borderRadius: 3,
            }}
          />
        </View>

        {/* Critical warning */}
        {isCritical && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#fee2e2",
              borderRadius: 8,
              padding: 8,
              marginBottom: 12,
            }}
          >
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#ef4444" }}>
              Nguy cơ cao — Cần can thiệp ngay
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={onNotify}
            style={{
              flex: 1,
              backgroundColor: INDIGO,
              paddingVertical: 9,
              borderRadius: 9,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={14} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>
              Gửi thông báo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDetail}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 9,
              borderWidth: 1.5,
              borderColor: "#e2e8f0",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569" }}>
              Chi tiết
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdviseeClass() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentAttendanceReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "excellent" | "warning" | "danger"
  >("all");
  const [atRiskStudents, setAtRiskStudents] = useState<
    StudentAttendanceReport[]
  >([]);
  const [className, setClassName] = useState<string>("Lớp chủ nhiệm");
  const [major, setMajor] = useState<string>("");
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [attendanceRate, setAttendanceRate] = useState<number>(0);
  const [atRiskCount, setAtRiskCount] = useState<number>(0);
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isMobile = width < 768;
  const paddingHorizontal = isDesktop ? 24 : isMobile ? 16 : 20;

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = isDesktop ? 280 : isMobile ? 320 : 290;

  // Chỉ cuộn gom header ở mobile, còn desktop/tablet set cứng = MAX_HEIGHT
  const HEADER_MIN_HEIGHT = isMobile ? 120 : HEADER_MAX_HEIGHT;
  const HEADER_SCROLL_DISTANCE = Math.max(
    1,
    HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
  );

  const headerHeight = isMobile
    ? scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: "clamp",
      })
    : HEADER_MAX_HEIGHT;

  const contentOpacity = isMobile
    ? scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 0.2, 0],
        extrapolate: "clamp",
      })
    : 1;

  const contentTranslateY = isMobile
    ? scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -10],
        extrapolate: "clamp",
      })
    : 0;

  // Giữ TabBar luôn dính dưới bottom của Header khi cuộn quá nó
  const tabBarTranslateY = isMobile
    ? scrollY.interpolate({
        inputRange: [-1, 0, HEADER_SCROLL_DISTANCE, HEADER_SCROLL_DISTANCE + 1],
        outputRange: [0, 0, 0, 1],
      })
    : scrollY.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 0, 1],
      });

  // ── Student detail modal state ──────────────────────────────────────────────
  const [selectedStudent, setSelectedStudent] =
    useState<StudentAttendanceReport | null>(null);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [studentRecordsLoading, setStudentRecordsLoading] = useState(false);

  useEffect(() => {
    loadAdvisorClassData();
  }, []);

  const loadAdvisorClassData = async () => {
    try {
      setLoading(true);

      // Bước 1: Lấy teacherId từ JWT
      const teacherId = await getTeacherIdFromToken();
      console.log("[AdviseeClass] teacherId from token:", teacherId);
      if (!teacherId) {
        showToast(
          "Không tìm thấy thông tin giảng viên. Vui lòng đăng nhập lại.",
          "error",
        );
        return;
      }

      // Bước 2: Lấy danh sách lớp của giáo viên
      const classes = await classService.getClassesByTeacher(teacherId);
      console.log("[AdviseeClass] classes by teacher:", classes);
      if (!classes || classes.length === 0) {
        showToast("Bạn chưa được phân công lớp chủ nhiệm.", "info");
        return;
      }

      // Lấy lớp chủ nhiệm (classes[0])
      const advisorClass = classes[0];
      console.log("[AdviseeClass] advisorClass:", advisorClass);
      setClassName(advisorClass.code);
      setMajor(advisorClass.name);

      // Bước 3: Lấy báo cáo điểm danh sinh viên của lớp
      const studentReports = await reportService.getStudentReports(
        advisorClass.id,
      );
      console.log("[AdviseeClass] studentReports:", studentReports);
      setStudents(studentReports);

      const total = studentReports.length;
      setTotalStudents(total);

      const atRisk = studentReports.filter(
        (s) => s.attendanceRate != null && s.attendanceRate < 80,
      );
      setAtRiskStudents(atRisk);
      setAtRiskCount(atRisk.length);

      const avgRate =
        total > 0
          ? Math.round(
              (studentReports.reduce(
                (sum, s) => sum + (s.attendanceRate || 0),
                0,
              ) /
                total) *
                10,
            ) / 10
          : 0;
      setAttendanceRate(avgRate);
    } catch (error: any) {
      console.error("[AdviseeClass] Error loading advisor class data:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải dữ liệu lớp chủ nhiệm.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Student detail handlers ──────────────────────────────────────────────
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
    } catch (error) {
      console.error("[AdviseeClass] Error loading student records:", error);
    } finally {
      setStudentRecordsLoading(false);
    }
  };

  const handleCloseStudentDetail = () => {
    setStudentModalVisible(false);
    setTimeout(() => {
      setSelectedStudent(null);
      setStudentRecords([]);
    }, 300);
  };

  // ── Overview Stats Data ──────────────────────────────────────────────────────
  const statsData = [
    {
      id: "total",
      label: "Tổng sinh viên",
      value: totalStudents,
      icon: "people" as const,
      color: INDIGO,
      bg: INDIGO + "18",
    },
    {
      id: "rate",
      label: "Tỷ lệ điểm danh TB",
      value: `${attendanceRate}%`,
      icon: "pie-chart" as const,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      id: "atrisk",
      label: "Cần quan tâm",
      value: atRiskCount,
      icon: "warning" as const,
      color: "#ef4444",
      bg: "#fef2f2",
    },
  ];

  // ── Subject Summary (static/demo) ────────────────────────────────────────────
  const subjectSummary = [
    {
      subject: "Lập trình cơ bản",
      rate: 92,
      present: 41,
      total: 45,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      subject: "Cơ sở dữ liệu",
      rate: 87,
      present: 39,
      total: 45,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      subject: "Mạng máy tính",
      rate: 78,
      present: 35,
      total: 45,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="light" />

      {/* ── Parallax Animated Hero Header ── */}
      <Animated.View
        style={{
          paddingTop: isMobile ? 48 : 64,
          paddingHorizontal: paddingHorizontal,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          zIndex: 10,
          overflow: "hidden",
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.32,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={["#1E3A8A", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <View
          style={{
            maxWidth: 1200,
            width: "100%",
            alignSelf: "center",
            flex: 1,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="school" size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: "#fff",
                  marginBottom: 2,
                }}
              >
                Lớp {className}
              </Text>
              <Animated.Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  opacity: contentOpacity,
                }}
              >
                {major || "Lớp chủ nhiệm"}
              </Animated.Text>
            </View>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 8,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.35)",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#fff" }}>
                {attendanceRate}%
              </Text>
            </View>
          </View>

          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            }}
          >
            <View style={{ marginBottom: 16, marginTop: 4 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  Tỷ lệ điểm danh trung bình
                </Text>
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}
                >
                  {attendanceRate}%
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(attendanceRate, 100)}%`,
                    backgroundColor:
                      attendanceRate >= 90
                        ? "#34d399"
                        : attendanceRate >= 75
                          ? "#fbbf24"
                          : "#f87171",
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 14,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              {[
                {
                  label: "Sinh viên",
                  value: String(totalStudents),
                  icon: "people" as const,
                },
                {
                  label: "Tỷ lệ ĐD",
                  value: `${attendanceRate}%`,
                  icon: "pie-chart" as const,
                },
                {
                  label: "Cảnh báo",
                  value: String(atRiskCount),
                  icon: "warning" as const,
                },
              ].map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    borderLeftWidth: idx > 0 ? 1 : 0,
                    borderLeftColor: "rgba(255,255,255,0.25)",
                    gap: 4,
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={15}
                    color="rgba(255,255,255,0.7)"
                  />
                  <Text
                    style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={INDIGO} />
          <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 12 }}>
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : (
        <Animated.ScrollView
          contentContainerStyle={{
            paddingHorizontal,
            paddingTop: HEADER_MAX_HEIGHT + 16,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
        >
          <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}>
            {/* Tab Bar - Sticky below header */}
            <Animated.View
              style={{
                marginBottom: 20,
                borderRadius: 16,
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
                zIndex: 20,
                overflow: "hidden",
                transform: [{ translateY: tabBarTranslateY }],
              }}
            >
              <TabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                atRiskCount={atRiskCount}
              />
            </Animated.View>

            {/* ── OVERVIEW TAB ──────────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <>
                {/* Stat Cards */}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#1e293b",
                    marginBottom: 14,
                  }}
                >
                  Thống kê tổng quan
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  {statsData.map((stat) => (
                    <View
                      key={stat.id}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 16,
                        padding: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                        flex: isMobile ? 0 : 1,
                        width: isMobile ? "47%" : undefined,
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: stat.bg,
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 10,
                        }}
                      >
                        <Ionicons
                          name={stat.icon}
                          size={22}
                          color={stat.color}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "800",
                          color: "#1e293b",
                          marginBottom: 4,
                        }}
                      >
                        {stat.value}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#64748b" }}>
                        {stat.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* At-Risk Preview */}
                {atRiskStudents.length > 0 && (
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: "#f1f5f9",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                      marginBottom: 20,
                      overflow: "hidden",
                    }}
                  >
                    {/* Section header */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: "#f1f5f9",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            backgroundColor: "#fef2f2",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="warning" size={16} color="#ef4444" />
                        </View>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#1e293b",
                          }}
                        >
                          Sinh viên cần quan tâm
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setActiveTab("at-risk")}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          backgroundColor: INDIGO + "12",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 8,
                        }}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: INDIGO,
                          }}
                        >
                          Xem tất cả
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={12}
                          color={INDIGO}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* At-risk mini list (preview 3) */}
                    <View style={{ padding: 12 }}>
                      {atRiskStudents.slice(0, 3).map((student, idx) => {
                        const totalSessions = student.totalSessions || 0;
                        const rate = Math.round(student.attendanceRate || 0);
                        const isCrit = rate < 60;
                        const ac = isCrit ? "#ef4444" : "#f59e0b";
                        return (
                          <View
                            key={student.studentId || idx}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: 10,
                              paddingHorizontal: 12,
                              borderRadius: 10,
                              backgroundColor: "#f8fafc",
                              marginBottom: idx < 2 ? 8 : 0,
                              gap: 10,
                            }}
                          >
                            <View
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: ac + "18",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "800",
                                  color: ac,
                                }}
                              >
                                {(student.studentName || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: "700",
                                  color: "#1e293b",
                                }}
                                numberOfLines={1}
                              >
                                {student.studentName}
                              </Text>
                              <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                                {student.studentId}
                              </Text>
                            </View>
                            <View
                              style={{
                                backgroundColor: ac,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 6,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: "800",
                                  color: "#fff",
                                }}
                              >
                                {rate}% CC
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Subject Summary */}
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#f1f5f9",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f1f5f9",
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        backgroundColor: "#eff6ff",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="book" size={16} color="#3b82f6" />
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      Thống kê các môn học
                    </Text>
                  </View>
                  <View style={{ padding: 12 }}>
                    {subjectSummary.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          marginBottom:
                            index < subjectSummary.length - 1 ? 10 : 0,
                          backgroundColor: "#f8fafc",
                          padding: 12,
                          borderRadius: 10,
                          borderLeftWidth: 3,
                          borderLeftColor: item.color,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: "#1e293b",
                              flex: 1,
                            }}
                            numberOfLines={1}
                          >
                            {item.subject}
                          </Text>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "800",
                              color: item.color,
                            }}
                          >
                            {item.rate}%
                          </Text>
                        </View>
                        {/* Progress bar */}
                        <View
                          style={{
                            height: 5,
                            backgroundColor: "#e2e8f0",
                            borderRadius: 3,
                            overflow: "hidden",
                            marginBottom: 6,
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${item.rate}%`,
                              backgroundColor: item.color,
                              borderRadius: 3,
                            }}
                          />
                        </View>
                        <Text style={{ fontSize: 11, color: "#64748b" }}>
                          {item.present}/{item.total} sinh viên có mặt
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* ── STUDENTS TAB ──────────────────────────────────────────────── */}
            {activeTab === "students" &&
              (() => {
                const filteredStudents = students.filter((s) => {
                  const matchQuery =
                    (s.studentName || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    (s.studentId || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase());
                  if (!matchQuery) return false;

                  const rate = Math.round(s.attendanceRate || 0);
                  if (filterType === "excellent") return rate >= 90;
                  if (filterType === "warning") return rate >= 75 && rate < 90;
                  if (filterType === "danger") return rate < 75;
                  return true;
                });

                return (
                  <>
                    {/* Search Bar & Filters */}
                    <View style={{ marginBottom: 16 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#fff",
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderWidth: 1,
                          borderColor: "#f1f5f9",
                          marginBottom: 12,
                        }}
                      >
                        <Ionicons
                          name="search"
                          size={20}
                          color="#94a3b8"
                          style={{ marginRight: 8 }}
                        />
                        <TextInput
                          style={
                            {
                              flex: 1,
                              fontSize: 14,
                              color: "#1e293b",
                              outlineStyle: "none",
                            } as any
                          }
                          placeholder="Tìm kiếm theo tên hoặc MSSV..."
                          placeholderTextColor="#94a3b8"
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                          <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons
                              name="close-circle"
                              size={18}
                              color="#cbd5e1"
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ flexDirection: "row" }}
                      >
                        {[
                          { id: "all", label: "Tất cả" },
                          { id: "excellent", label: "Tốt (≥90%)" },
                          { id: "warning", label: "Cảnh báo (75-89%)" },
                          { id: "danger", label: "Nguy hiểm (<75%)" },
                        ].map((f) => {
                          const isActive = filterType === f.id;
                          return (
                            <TouchableOpacity
                              key={f.id}
                              onPress={() => setFilterType(f.id as any)}
                              style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                backgroundColor: isActive ? INDIGO : "#fff",
                                borderWidth: 1,
                                borderColor: isActive ? INDIGO : "#e2e8f0",
                                marginRight: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: "600",
                                  color: isActive ? "#fff" : "#64748b",
                                }}
                              >
                                {f.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>

                    {/* Count badge */}
                    <View
                      style={{
                        alignSelf: "flex-start",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderWidth: 1,
                        borderColor: "#f1f5f9",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.04,
                        shadowRadius: 4,
                        elevation: 1,
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="people" size={14} color={INDIGO} />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: "#1e293b",
                        }}
                      >
                        {filteredStudents.length} sinh viên
                      </Text>
                    </View>

                    {filteredStudents.length === 0 ? (
                      <View
                        style={{ alignItems: "center", paddingVertical: 48 }}
                      >
                        <Ionicons
                          name="search-outline"
                          size={52}
                          color="#cbd5e1"
                        />
                        <Text
                          style={{
                            fontSize: 15,
                            color: "#94a3b8",
                            marginTop: 12,
                            fontWeight: "600",
                          }}
                        >
                          Không tìm thấy sinh viên nào
                        </Text>
                      </View>
                    ) : (
                      filteredStudents.map((student) => (
                        <StudentRowCard
                          key={student.studentId}
                          student={student}
                          onPress={() => handleOpenStudentDetail(student)}
                        />
                      ))
                    )}
                  </>
                );
              })()}

            {/* ── AT-RISK TAB ───────────────────────────────────────────────── */}
            {activeTab === "at-risk" && (
              <>
                {/* Warning banner */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "#fef2f2",
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "#fecaca",
                  }}
                >
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#ef4444",
                      }}
                    >
                      Tiêu chí cảnh báo
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#ef4444",
                        opacity: 0.8,
                        marginTop: 2,
                      }}
                    >
                      Sinh viên có tỷ lệ chuyên cần &lt; 80%
                    </Text>
                  </View>
                </View>

                {/* Count badge */}
                <View
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "#fef2f2",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderWidth: 1,
                    borderColor: "#fecaca",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="warning" size={14} color="#ef4444" />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#ef4444",
                    }}
                  >
                    {atRiskCount} sinh viên cần quan tâm
                  </Text>
                </View>

                {atRiskStudents.length === 0 ? (
                  <View style={{ alignItems: "center", paddingVertical: 48 }}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={52}
                      color="#10b981"
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#10b981",
                        marginTop: 12,
                        fontWeight: "700",
                      }}
                    >
                      Không có sinh viên cần cảnh báo
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}
                    >
                      Tất cả sinh viên đều có điểm danh tốt
                    </Text>
                  </View>
                ) : (
                  atRiskStudents.map((student, idx) => (
                    <AtRiskCard
                      key={student.studentId || idx}
                      student={student}
                      onNotify={() =>
                        alert(`Gửi thông báo cho ${student.studentName}`)
                      }
                      onDetail={() => handleOpenStudentDetail(student)}
                    />
                  ))
                )}
              </>
            )}
          </View>
        </Animated.ScrollView>
      )}

      {/* ─── Student Detail Modal (bottom-sheet style) ─── */}
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
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              width: "100%",
              maxHeight: "90%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 10,
              paddingTop: 8,
            }}
          >
            {/* Handle bar */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#cbd5e1",
                borderRadius: 2,
                alignSelf: "center",
                marginBottom: 12,
              }}
            />

            {/* Modal header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#f1f5f9",
              }}
            >
              {/* Avatar */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: INDIGO + "18",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "800", color: INDIGO }}
                >
                  {selectedStudent?.studentName?.trim().charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 17, fontWeight: "700", color: "#1e293b" }}
                  numberOfLines={1}
                >
                  {selectedStudent?.studentName}
                </Text>
                <Text style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                  MSSV: {selectedStudent?.studentId}
                  {selectedStudent?.className
                    ? ` • ${selectedStudent.className}`
                    : ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseStudentDetail}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                }}
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* ── Stats overview ── */}
              {selectedStudent &&
                (() => {
                  const rate = Math.round(selectedStudent.attendanceRate || 0);
                  const rateColor = getAttendanceColor(rate);
                  const rateBg = getAttendanceBg(rate);
                  const totalSess = selectedStudent.totalSessions || 0;
                  return (
                    <>
                      {/* Big rate badge */}
                      <View style={{ alignItems: "center", marginBottom: 20 }}>
                        <View
                          style={{
                            width: 88,
                            height: 88,
                            borderRadius: 44,
                            backgroundColor: rateBg,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 3,
                            borderColor: rateColor + "40",
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 26,
                              fontWeight: "800",
                              color: rateColor,
                            }}
                          >
                            {rate}%
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            fontWeight: "600",
                          }}
                        >
                          Tỷ lệ điểm danh
                        </Text>
                      </View>

                      {/* 4-column stats */}
                      <View
                        style={{
                          flexDirection: "row",
                          backgroundColor: "#f8fafc",
                          borderRadius: 14,
                          padding: 14,
                          marginBottom: 20,
                          gap: 0,
                        }}
                      >
                        {[
                          {
                            label: "Tổng buổi",
                            value: totalSess,
                            color: "#64748b",
                          },
                          {
                            label: "Có mặt",
                            value: selectedStudent.presentCount,
                            color: "#10b981",
                          },
                          {
                            label: "Muộn",
                            value: selectedStudent.lateCount,
                            color: "#f59e0b",
                          },
                          {
                            label: "Vắng",
                            value: selectedStudent.absentCount,
                            color: "#ef4444",
                          },
                        ].map((s, idx) => (
                          <View
                            key={idx}
                            style={{
                              flex: 1,
                              alignItems: "center",
                              borderLeftWidth: idx > 0 ? 1 : 0,
                              borderLeftColor: "#e2e8f0",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 22,
                                fontWeight: "800",
                                color: s.color,
                              }}
                            >
                              {s.value}
                            </Text>
                            <Text
                              style={{
                                fontSize: 10,
                                color: "#94a3b8",
                                marginTop: 3,
                              }}
                            >
                              {s.label}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Progress bar */}
                      <View style={{ marginBottom: 4 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#475569",
                            }}
                          >
                            Tiến độ điểm danh
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "700",
                              color: rateColor,
                            }}
                          >
                            {rate}%
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 8,
                            backgroundColor: "#e2e8f0",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${rate}%`,
                              backgroundColor: rateColor,
                              borderRadius: 4,
                            }}
                          />
                        </View>
                      </View>

                      {/* Warning if at-risk */}
                      {rate < 80 && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            backgroundColor: "#fef2f2",
                            borderRadius: 10,
                            padding: 12,
                            marginTop: 14,
                            marginBottom: 4,
                            borderWidth: 1,
                            borderColor: "#fecaca",
                          }}
                        >
                          <Ionicons name="warning" size={16} color="#ef4444" />
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#ef4444",
                              flex: 1,
                            }}
                          >
                            {rate < 60
                              ? "Nguy cơ cao — Cần can thiệp ngay"
                              : "Cần theo dõi — Tỷ lệ điểm danh thấp"}
                          </Text>
                        </View>
                      )}
                    </>
                  );
                })()}

              {/* ── Attendance history ── */}
              <View style={{ marginTop: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <Ionicons name="calendar" size={16} color={INDIGO} />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    Lịch sử điểm danh
                  </Text>
                  {!studentRecordsLoading && (
                    <View
                      style={{
                        backgroundColor: INDIGO + "18",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: INDIGO,
                        }}
                      >
                        {studentRecords.length} buổi
                      </Text>
                    </View>
                  )}
                </View>

                {studentRecordsLoading ? (
                  <View style={{ alignItems: "center", paddingVertical: 32 }}>
                    <ActivityIndicator size="small" color={INDIGO} />
                    <Text
                      style={{ fontSize: 13, color: "#94a3b8", marginTop: 10 }}
                    >
                      Đang tải lịch sử...
                    </Text>
                  </View>
                ) : studentRecords.length === 0 ? (
                  <View style={{ alignItems: "center", paddingVertical: 32 }}>
                    <Ionicons
                      name="calendar-outline"
                      size={44}
                      color="#cbd5e1"
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#94a3b8",
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
                            backgroundColor: "#fff",
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: "#f1f5f9",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.03,
                            shadowRadius: 4,
                            elevation: 1,
                            gap: 12,
                          }}
                        >
                          {/* Status icon */}
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

                          {/* Date/time info */}
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "#1e293b",
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
                            <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                              {date.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {r.method ? ` • ${r.method}` : ""}
                            </Text>
                          </View>

                          {/* Status badge */}
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
              </View>
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </View>
  );
}
