import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Animated,
  TextInput,
  Modal,
} from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  reportService,
  type TeacherSummary,
  type ClassAttendanceReport,
  type StudentAttendanceReport,
} from "@/apis/services/report.service";
import { subjectService, type Subject } from "@/apis/services/subject.service";
import { getAuthToken, getCurrentUserProfile } from "@/apis/config/apiClient";
import { useToast } from "@/components/ToastProvider";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient";

// ─── Design Tokens (Premium Palette) ──────────────────────────────────────────
const VIOLET = "#8b5cf6";
const VIOLET_DARK = "#6d28d9";
const VIOLET_LIGHT = "#ddd6fe";
const GRAY_TEXT = "#64748b";
const DARK_BG = "#0f172a";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRateColor(rate: number) {
  if (rate >= 90) return "#10b981"; // Green
  if (rate >= 75) return "#f59e0b"; // Amber
  return "#ef4444"; // Red
}

function getRateBg(rate: number) {
  if (rate >= 90) return "#ecfdf5";
  if (rate >= 75) return "#fffbeb";
  return "#fef2f2";
}

function getStatusText(rate: number) {
  if (rate >= 90) return "Tốt";
  if (rate >= 75) return "Khá";
  return "Nguy cơ cấm thi";
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const delta = 2; // Số trang hiển thị ở mỗi bên trang hiện tại
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l !== undefined) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

function getMonthStartEnd(monthStr: string) {
  if (!monthStr || monthStr === "all") return { startDate: undefined, endDate: undefined };
  const [year, month] = monthStr.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString()
  };
}

function parseDateToISO(dateStr: string, isEnd = false) {
  if (!dateStr) return undefined;
  const cleaned = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return undefined;
  try {
    const d = new Date(cleaned);
    if (isNaN(d.getTime())) return undefined;
    if (isEnd) {
      d.setUTCHours(23, 59, 59, 999);
    } else {
      d.setUTCHours(0, 0, 0, 0);
    }
    return d.toISOString();
  } catch {
    return undefined;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Visual bar chart row cho từng lớp học */
function ClassBarRow({
  cls,
  maxRate,
}: {
  cls: ClassAttendanceReport;
  maxRate: number;
}) {
  const rate = Math.round(cls.attendanceRate);
  const rateColor = getRateColor(rate);
  const barWidth = maxRate > 0 ? (rate / 100) * 100 : 0;

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text
            style={{ fontSize: 14, fontWeight: "700", color: "#1e293b" }}
            numberOfLines={1}
          >
            {cls.className}
          </Text>
          <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            {cls.classCode} • {cls.totalStudents} SV • {cls.totalSessions} buổi
          </Text>
        </View>
        {/* Rate badge */}
        <View
          style={{
            backgroundColor: getRateBg(rate),
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderWidth: 1.5,
            borderColor: rateColor + "35",
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "800", color: rateColor }}>
            {rate}%
          </Text>
        </View>
      </View>

      {/* Bar */}
      <View
        style={{
          height: 7,
          backgroundColor: "#e2e8f0",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${Math.min(barWidth, 100)}%`,
            backgroundColor: rateColor,
            borderRadius: 4,
          }}
        />
      </View>

      {/* Mini stats */}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
        {[
          {
            label: "Có mặt",
            value: cls.totalPresent,
            color: "#10b981",
            icon: "checkmark-circle" as const,
          },
          {
            label: "Muộn",
            value: cls.totalLate,
            color: "#f59e0b",
            icon: "time" as const,
          },
          {
            label: "Vắng",
            value: cls.totalAbsent,
            color: "#ef4444",
            icon: "close-circle" as const,
          },
        ].map((s) => (
          <View
            key={s.label}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Ionicons name={s.icon} size={13} color={s.color} />
            <Text style={{ fontSize: 12, color: s.color, fontWeight: "600" }}>
              {s.value}
            </Text>
            <Text style={{ fontSize: 11, color: "#94a3b8" }}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportsScreen() {
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const { showToast } = useToast();

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = isMobile ? 320 : 280;
  const HEADER_MIN_HEIGHT = 120;
  const HEADER_SCROLL_DISTANCE = Math.max(1, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT);

  // Responsive header properties
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

  // React State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [summary, setSummary] = useState<TeacherSummary | null>(null);
  const [studentReports, setStudentReports] = useState<StudentAttendanceReport[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<ClassAttendanceReport[]>([]);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Advanced Filters State
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all"); // "all", "2026-05", "2026-04", etc., or "custom"
  const [startDateInput, setStartDateInput] = useState(""); // YYYY-MM-DD
  const [endDateInput, setEndDateInput] = useState(""); // YYYY-MM-DD
  const [activeDateFilter, setActiveDateFilter] = useState<{ startDate?: string; endDate?: string }>({});

  // Export Customization Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"ALL" | "SUBJECT" | "COURSE">("ALL");
  const [exportSubjectId, setExportSubjectId] = useState("");
  const [exportCourseId, setExportCourseId] = useState("");
  const [exportTimeframe, setExportTimeframe] = useState<"ALL_TIME" | "FILTERED">("ALL_TIME");
  const [exportOnlyRisk, setExportOnlyRisk] = useState(false);

  const getPreviewSheets = () => {
    const sheets = [
      { title: "📊 Báo cáo theo lớp", type: "dashboard" },
      { title: "📊 Báo cáo theo sinh viên", type: "student" },
      { title: "📈 Biểu đồ chuyên cần", type: "chart" }
    ];

    if (exportScope === "ALL") {
      const classes = teacherCourses;
      if (classes.length > 0) {
        classes.slice(0, 3).forEach((c) => {
          sheets.push({ title: `📁 Lớp ${c.classCode}`, type: "class" });
        });
        if (classes.length > 3) {
          sheets.push({ title: `📁 +${classes.length - 3} lớp`, type: "more" });
        }
      } else {
        sheets.push({ title: "📁 Chi tiết lớp", type: "class" });
      }
    } else if (exportScope === "SUBJECT") {
      const selectedSub = subjects.find(s => s.id === exportSubjectId);
      const subName = selectedSub ? selectedSub.code : "Môn học";
      sheets.push({ title: `📁 Môn ${subName}`, type: "class" });
    } else if (exportScope === "COURSE") {
      const selectedCls = teacherCourses.find(c => c.classId === exportCourseId);
      const clsName = selectedCls ? selectedCls.classCode : "Học phần";
      sheets.push({ title: `📁 Lớp ${clsName}`, type: "class" });
    }

    return sheets;
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClassId]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false, subjectId = selectedSubjectId, dateFilter = activeDateFilter) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const profile = await getCurrentUserProfile();
      const teacherId = profile?.userId || profile?.teacherId || undefined;

      const [summaryData, studentData, subjectsData, allCoursesData] = await Promise.all([
        reportService.getTeacherSummary(
          subjectId !== "all" ? subjectId : undefined,
          dateFilter.startDate,
          dateFilter.endDate
        ),
        reportService.getStudentReports(
          undefined,
          undefined,
          subjectId !== "all" ? subjectId : undefined,
          dateFilter.startDate,
          dateFilter.endDate
        ),
        subjectService.getSubjects(teacherId).catch(() => [] as Subject[]),
        reportService.getTeacherSummary().catch(() => null),
      ]);

      setSummary(summaryData);
      setStudentReports(studentData || []);
      setSubjects(subjectsData || []);
      
      const courses = allCoursesData?.classReports || [];
      setTeacherCourses(courses);

      // Auto select default export options if empty or invalid
      if (subjectsData && subjectsData.length > 0) {
        const isValidSubject = subjectsData.some((s) => s.id === exportSubjectId);
        if (!exportSubjectId || !isValidSubject) {
          setExportSubjectId(subjectsData[0].id);
        }
      }
      
      if (courses && courses.length > 0) {
        const isValidCourse = courses.some((c) => c.classId === exportCourseId);
        if (!exportCourseId || !isValidCourse) {
          setExportCourseId(courses[0].classId);
        }
      }
    } catch (error: any) {
      console.error("Error loading report:", error);
      showToast(
        error?.response?.data?.message || "Không thể tải dữ liệu báo cáo",
        "error",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setCurrentPage(1);
    loadData(false, subjectId, activeDateFilter);
  };

  const handleMonthChange = (monthVal: string) => {
    setSelectedMonth(monthVal);
    if (monthVal === "custom") {
      return;
    }
    
    let nextFilter: { startDate?: string; endDate?: string } = {};
    if (monthVal !== "all") {
      nextFilter = getMonthStartEnd(monthVal);
    }
    setActiveDateFilter(nextFilter);
    setCurrentPage(1);
    loadData(false, selectedSubjectId, nextFilter);
  };

  const handleApplyCustomDate = () => {
    const startISO = parseDateToISO(startDateInput, false);
    const endISO = parseDateToISO(endDateInput, true);
    
    if (startDateInput && !startISO) {
      showToast("Ngày bắt đầu không đúng định dạng YYYY-MM-DD", "error");
      return;
    }
    if (endDateInput && !endISO) {
      showToast("Ngày kết thúc không đúng định dạng YYYY-MM-DD", "error");
      return;
    }
    if (startISO && endISO && new Date(startISO) > new Date(endISO)) {
      showToast("Ngày bắt đầu không được lớn hơn ngày kết thúc", "error");
      return;
    }
    
    const nextFilter = { startDate: startISO, endDate: endISO };
    setActiveDateFilter(nextFilter);
    setCurrentPage(1);
    loadData(false, selectedSubjectId, nextFilter);
    showToast("Đã áp dụng bộ lọc ngày tùy chỉnh", "success");
  };
  
  const handleClearCustomDate = () => {
    setStartDateInput("");
    setEndDateInput("");
    setActiveDateFilter({});
    setSelectedMonth("all");
    setCurrentPage(1);
    loadData(false, selectedSubjectId, {});
  };

  const handleExportConfirm = async () => {
    try {
      setExportingExcel(true);
      
      const subjectId = exportScope === "SUBJECT" ? exportSubjectId : undefined;
      const courseId = exportScope === "COURSE" ? exportCourseId : undefined;
      
      let startDate: string | undefined = undefined;
      let endDate: string | undefined = undefined;
      if (exportTimeframe === "FILTERED") {
        startDate = activeDateFilter.startDate;
        endDate = activeDateFilter.endDate;
      }
      
      const onlyRisk = exportOnlyRisk;

      if (Platform.OS === "web" && typeof window !== "undefined") {
        const blob = await reportService.exportExcel(courseId, subjectId, startDate, endDate, onlyRisk);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        
        let filename = `Bao_cao_diem_danh_${new Date().toISOString().slice(0, 10)}.xlsx`;
        if (subjectId) {
          filename = `Bao_cao_diem_danh_mon_${new Date().toISOString().slice(0, 10)}.xlsx`;
        }
        if (courseId) {
          filename = `Bao_cao_diem_danh_hoc_phan_${courseId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Đã tải file Excel thành công", "success");
        setIsExportModalOpen(false);
      } else {
        const token = await getAuthToken();
        if (!token) {
          showToast("Vui lòng đăng nhập để tải file", "error");
          return;
        }
        const url = reportService.getExportExcelUrl(courseId, subjectId, startDate, endDate, onlyRisk);
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        
        let filename = `Bao_cao_diem_danh_${new Date().toISOString().slice(0, 10)}.xlsx`;
        if (subjectId) {
          filename = `Bao_cao_diem_danh_mon_${new Date().toISOString().slice(0, 10)}.xlsx`;
        }
        if (courseId) {
          filename = `Bao_cao_diem_danh_hoc_phan_${courseId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        }
        
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, btoa(binary), {
          encoding: FileSystem.EncodingType.Base64,
        });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: "Lưu file Excel",
          });
          showToast("Đã mở hộp thoại lưu/chia sẻ file", "success");
          setIsExportModalOpen(false);
        } else {
          showToast("Thiết bị không hỗ trợ chia sẻ file", "error");
        }
      }
    } catch (error: any) {
      console.error("Export Excel error:", error);
      showToast(error?.message || "Không thể xuất file Excel", "error");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportExcel = () => {
    setIsExportModalOpen(true);
  };

  // derived data
  const rate = Math.round(summary?.averageAttendanceRate ?? 0);
  const rateColor = getRateColor(rate);
  const classReports = summary?.classReports ?? [];

  // Filtered lists
  const atRiskStudents = studentReports
    .filter((s) => s.attendanceRate < 75)
    .sort((a, b) => a.attendanceRate - b.attendanceRate);

  const filteredStudents = studentReports.filter((student) => {
    const matchesClass = selectedClassId === "all" || student.classId === selectedClassId;
    const matchesSearch =
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style={isDesktop ? "dark" : "light"} />

      {/* ─── HEADER: Web (Clean Admin Topbar) vs Mobile (Collapsible Hero Banner) ─── */}
      {isDesktop ? (
        // WEB HEADER
        <View
          style={{
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#e2e8f0",
            paddingVertical: 20,
            paddingHorizontal: paddingHorizontal,
          }}
        >
          <View
            style={{
              maxWidth: contentMaxWidth,
              width: "100%",
              alignSelf: "center",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ fontSize: 28, fontWeight: "900", color: "#0f172a" }}>
                Báo cáo & Thống kê chuyên cần
              </Text>
              <Text style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                Phân tích dữ liệu điểm danh, quản lý học viên có nguy cơ và xuất báo cáo.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleExportExcel()}
              disabled={exportingExcel}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#10b981",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {exportingExcel ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="download" size={20} color="#fff" style={{ marginRight: 8 }} />
              )}
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                {exportingExcel ? "Đang xuất..." : "Xuất báo cáo Excel"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // MOBILE COLLAPSIBLE HERO HEADER (Only shown on Mobile/Tablet)
        <Animated.View
          style={{
            paddingTop: Platform.OS === "ios" ? 54 : 40,
            paddingHorizontal: paddingHorizontal,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            zIndex: 10,
            overflow: "hidden",
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={["#1e293b", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <View style={{ flex: 1 }}>
            {/* Top Row with Back Button and Quick Stats */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.25)",
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>

              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderWidth: 1,
                  borderColor: rateColor + "70",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
                  TB: {rate}%
                </Text>
              </View>
            </View>

            {/* Inner Content */}
            <View style={{ flex: 1, justifyContent: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="bar-chart" size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff" }} numberOfLines={1}>
                    Báo cáo & Thống kê
                  </Text>
                  <Animated.Text
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.8)",
                      marginTop: 2,
                      opacity: contentOpacity,
                    }}
                  >
                    {summary?.totalClasses ?? 0} lớp • {summary?.totalStudents ?? 0} SV
                  </Animated.Text>
                </View>
              </View>

              {/* Progress gauge */}
              <Animated.View
                style={{
                  marginTop: 14,
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }],
                }}
              >
                <View style={{ height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" }}>
                  <View
                    style={{
                      height: "100%",
                      width: `${Math.min(rate, 100)}%`,
                      backgroundColor: rate >= 90 ? "#10b981" : rate >= 75 ? "#fbbf24" : "#ef4444",
                    }}
                  />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                  <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Hiệu suất điểm danh lớp học</Text>
                  <Text style={{ fontSize: 10, fontWeight: "800", color: "#fff" }}>{rate}%</Text>
                </View>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ─── LOADING STATE ─── */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={VIOLET} />
          <Text style={{ fontSize: 14, color: GRAY_TEXT, marginTop: 12 }}>
            Đang tổng hợp dữ liệu báo cáo...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal,
            paddingTop: isDesktop ? 24 : HEADER_MAX_HEIGHT + 16,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={
            !isDesktop
              ? Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                  useNativeDriver: false,
                })
              : undefined
          }
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor={VIOLET}
            />
          }
        >
          <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" }}>
            
            {/* ─── ADVANCED FILTERS PANEL ─── */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 18,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: "#e2e8f0",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              {/* Header */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: VIOLET + "15", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="funnel-outline" size={16} color={VIOLET} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>Bộ lọc nâng cao</Text>
                  <Text style={{ fontSize: 11, color: GRAY_TEXT }}>Lọc dữ liệu tổng quan, biểu đồ và danh sách lớp học</Text>
                </View>
              </View>

              {isWeb ? (
                // WEB FILTER LAYOUT
                <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
                  {/* Subject Filter */}
                  <View style={{ flex: 1, minWidth: 220 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6 }}>
                      Môn học giảng dạy
                    </Text>
                    <View style={{ position: "relative" }}>
                      <select
                        value={selectedSubjectId}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#fff",
                          color: "#1e293b",
                          fontSize: "14px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">Tất cả môn học</option>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} ({sub.code})
                          </option>
                        ))}
                      </select>
                    </View>
                  </View>

                  {/* Month Filter */}
                  <View style={{ flex: 1, minWidth: 200 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6 }}>
                      Thời gian (Tháng)
                    </Text>
                    <View style={{ position: "relative" }}>
                      <select
                        value={selectedMonth}
                        onChange={(e) => handleMonthChange(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#fff",
                          color: "#1e293b",
                          fontSize: "14px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">Tất cả thời gian</option>
                        <option value="2026-05">Tháng 5, 2026</option>
                        <option value="2026-04">Tháng 4, 2026</option>
                        <option value="2026-03">Tháng 3, 2026</option>
                        <option value="2026-02">Tháng 2, 2026</option>
                        <option value="2026-01">Tháng 1, 2026</option>
                        <option value="custom">Khoảng ngày tùy chọn...</option>
                      </select>
                    </View>
                  </View>
                </View>
              ) : (
                // NATIVE MOBILE/TABLET FILTER LAYOUT (Fluid scrolling pills)
                <View style={{ gap: 12 }}>
                  {/* Subject Scroll Pills */}
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6 }}>
                      Môn học:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleSubjectChange("all")}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 20,
                          backgroundColor: selectedSubjectId === "all" ? VIOLET : "#f1f5f9",
                          marginRight: 8,
                          borderWidth: 1,
                          borderColor: selectedSubjectId === "all" ? VIOLET : "#e2e8f0",
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: selectedSubjectId === "all" ? "#fff" : "#475569" }}>
                          Tất cả môn học
                        </Text>
                      </TouchableOpacity>
                      {subjects.map((sub) => (
                        <TouchableOpacity
                          key={sub.id}
                          activeOpacity={0.7}
                          onPress={() => handleSubjectChange(sub.id)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            backgroundColor: selectedSubjectId === sub.id ? VIOLET : "#f1f5f9",
                            marginRight: 8,
                            borderWidth: 1,
                            borderColor: selectedSubjectId === sub.id ? VIOLET : "#e2e8f0",
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: "700", color: selectedSubjectId === sub.id ? "#fff" : "#475569" }}>
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Month Scroll Pills */}
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6 }}>
                      Thời gian:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                      {[
                        { label: "Tất cả thời gian", value: "all" },
                        { label: "Tháng 5/2026", value: "2026-05" },
                        { label: "Tháng 4/2026", value: "2026-04" },
                        { label: "Tháng 3/2026", value: "2026-03" },
                        { label: "Tháng 2/2026", value: "2026-02" },
                        { label: "Tháng 1/2026", value: "2026-01" },
                        { label: "Tùy chọn...", value: "custom" },
                      ].map((m) => (
                        <TouchableOpacity
                          key={m.value}
                          activeOpacity={0.7}
                          onPress={() => handleMonthChange(m.value)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            backgroundColor: selectedMonth === m.value ? VIOLET : "#f1f5f9",
                            marginRight: 8,
                            borderWidth: 1,
                            borderColor: selectedMonth === m.value ? VIOLET : "#e2e8f0",
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: "700", color: selectedMonth === m.value ? "#fff" : "#475569" }}>
                            {m.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}

              {/* Custom Date Inputs (Both Web and Native Mobile use same styled fields) */}
              {selectedMonth === "custom" && (
                <View style={{ flexDirection: "row", gap: 12, marginTop: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <View style={{ flex: 1, minWidth: 130 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: GRAY_TEXT, marginBottom: 4 }}>Từ ngày (YYYY-MM-DD)</Text>
                    <TextInput
                      placeholder="VD: 2026-05-01"
                      value={startDateInput}
                      onChangeText={setStartDateInput}
                      placeholderTextColor="#94a3b8"
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: "#cbd5e1",
                        borderRadius: 10,
                        backgroundColor: "#fff",
                        fontSize: 13,
                        color: "#1e293b",
                      }}
                    />
                  </View>
                  <View style={{ flex: 1, minWidth: 130 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: GRAY_TEXT, marginBottom: 4 }}>Đến ngày (YYYY-MM-DD)</Text>
                    <TextInput
                      placeholder="VD: 2026-05-31"
                      value={endDateInput}
                      onChangeText={setEndDateInput}
                      placeholderTextColor="#94a3b8"
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: "#cbd5e1",
                        borderRadius: 10,
                        backgroundColor: "#fff",
                        fontSize: 13,
                        color: "#1e293b",
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, height: 38, alignItems: "center" }}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleApplyCustomDate}
                      style={{
                        backgroundColor: VIOLET,
                        borderRadius: 10,
                        paddingHorizontal: 16,
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Áp dụng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleClearCustomDate}
                      style={{
                        backgroundColor: "#f1f5f9",
                        borderWidth: 1,
                        borderColor: "#cbd5e1",
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#475569", fontWeight: "600", fontSize: 13 }}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Active Filters Summary Badge Row */}
              {(selectedSubjectId !== "all" || activeDateFilter.startDate || activeDateFilter.endDate) && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9", alignItems: "center" }}>
                  <Text style={{ fontSize: 11, color: GRAY_TEXT, fontWeight: "700" }}>Đang lọc:</Text>
                  
                  {selectedSubjectId !== "all" && (
                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: VIOLET + "10", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: VIOLET + "30" }}>
                      <Text style={{ fontSize: 11, color: VIOLET, fontWeight: "700" }}>
                        Môn: {subjects.find(s => s.id === selectedSubjectId)?.name || selectedSubjectId}
                      </Text>
                      <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => handleSubjectChange("all")}>
                        <Ionicons name="close-circle" size={14} color={VIOLET} />
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {(activeDateFilter.startDate || activeDateFilter.endDate) && (
                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#3b82f610", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: "#3b82f630" }}>
                      <Text style={{ fontSize: 11, color: "#3b82f6", fontWeight: "700" }}>
                        Thời gian: {selectedMonth !== "custom" ? `Tháng ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}` : "Khoảng tùy chỉnh"}
                      </Text>
                      <TouchableOpacity style={{ marginLeft: 6 }} onPress={handleClearCustomDate}>
                        <Ionicons name="close-circle" size={14} color="#3b82f6" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* ─── SECTION 1: OVERVIEW METRIC CARDS ─── */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                marginBottom: 24,
                gap: isDesktop ? 0 : 12,
              }}
            >
              {[
                {
                  title: "Tỷ lệ chuyên cần",
                  value: `${rate}%`,
                  desc: "Mức chuyên cần trung bình",
                  icon: "analytics",
                  color: rateColor,
                  bg: getRateBg(rate),
                },
                {
                  title: "Số lớp giảng dạy",
                  value: String(summary?.totalClasses ?? 0),
                  desc: "Số học phần đang quản lý",
                  icon: "school",
                  color: "#3b82f6",
                  bg: "#eff6ff",
                },
                {
                  title: "Tổng số học viên",
                  value: String(summary?.totalStudents ?? 0),
                  desc: "Sĩ số sinh viên đang dạy",
                  icon: "people",
                  color: "#10b981",
                  bg: "#ecfdf5",
                },
                {
                  title: "Số buổi điểm danh",
                  value: String(summary?.totalSessions ?? 0),
                  desc: "Phiên điểm danh đã mở",
                  icon: "calendar",
                  color: "#8b5cf6",
                  bg: "#f5f3ff",
                },
              ].map((card, idx) => (
                <View
                  key={idx}
                  style={{
                    width: isDesktop ? "23.8%" : isTablet ? "48%" : "48%",
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748b" }}>{card.title}</Text>
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: card.bg, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name={card.icon as any} size={16} color={card.color} />
                    </View>
                  </View>
                  <Text style={{ fontSize: 26, fontWeight: "900", color: "#0f172a" }}>{card.value}</Text>
                  <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{card.desc}</Text>
                </View>
              ))}
            </View>

            {/* ─── SECTION 2: CHARTS & STATS VIEWPORT ROW ─── */}
            <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 20, marginBottom: 24 }}>
              
              {/* TỶ LỆ CHUYÊN CẦN CÁC LỚP (BAR CHART) */}
              <View
                style={{
                  flex: isDesktop ? 2 : undefined,
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: VIOLET + "15", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="bar-chart-outline" size={18} color={VIOLET} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>Tỷ lệ chuyên cần các lớp</Text>
                    <Text style={{ fontSize: 12, color: GRAY_TEXT }}>Biểu diễn phần trăm điểm danh của từng lớp học</Text>
                  </View>
                </View>

                {classReports.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                      data={{
                        labels: classReports.map((c) => c.className.substring(0, 10) + ".."),
                        datasets: [
                          {
                            data: classReports.map((c) => Math.round(c.attendanceRate)),
                          },
                        ],
                      }}
                      width={Math.max(isDesktop ? (1200 / 3) * 2 - 32 : width - 68, classReports.length * 75)}
                      height={230}
                      yAxisLabel=""
                      yAxisSuffix="%"
                      fromZero={true}
                      chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        fillShadowGradient: VIOLET,
                        fillShadowGradientOpacity: 1,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                        style: { borderRadius: 16 },
                        barPercentage: 0.5,
                      }}
                      style={{ marginVertical: 8, borderRadius: 16 }}
                      showValuesOnTopOfBars={true}
                    />
                  </ScrollView>
                ) : (
                  <View style={{ alignItems: "center", paddingVertical: 40 }}>
                    <Ionicons name="bar-chart-outline" size={40} color="#cbd5e1" />
                    <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>Chưa có dữ liệu thống kê lớp</Text>
                  </View>
                )}
              </View>

              {/* PHÂN PHỐI ĐIỂM DANH TỔNG THỂ (PIE CHART) */}
              <View
                style={{
                  flex: isDesktop ? 1 : undefined,
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#f59e0b15", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="pie-chart-outline" size={18} color="#f59e0b" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>Phân phối điểm danh</Text>
                    <Text style={{ fontSize: 12, color: GRAY_TEXT }}>Biểu đồ phân phối trạng thái học tập</Text>
                  </View>
                </View>

                {summary && summary.totalSessions > 0 ? (
                  <View style={{ alignItems: "center", justifyContent: "center", height: 230 }}>
                    <PieChart
                      data={[
                        {
                          name: "Có mặt",
                          population: summary.totalPresent,
                          color: "#10b981",
                          legendFontColor: "#475569",
                          legendFontSize: 11,
                        },
                        {
                          name: "Đi muộn",
                          population: summary.totalLate,
                          color: "#f59e0b",
                          legendFontColor: "#475569",
                          legendFontSize: 11,
                        },
                        {
                          name: "Vắng mặt",
                          population: summary.totalAbsent,
                          color: "#ef4444",
                          legendFontColor: "#475569",
                          legendFontSize: 11,
                        },
                      ]}
                      width={isDesktop ? 1200 / 3 - 36 : width - 68}
                      height={180}
                      chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      }}
                      accessor={"population"}
                      backgroundColor={"transparent"}
                      paddingLeft={"10"}
                      center={[0, 0]}
                      absolute
                    />
                  </View>
                ) : (
                  <View style={{ alignItems: "center", paddingVertical: 40 }}>
                    <Ionicons name="pie-chart-outline" size={40} color="#cbd5e1" />
                    <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>Chưa có dữ liệu tổng quan</Text>
                  </View>
                )}
              </View>

            </View>

            {/* ─── SECTION 3: DESKTOP MULTI-COLUMN OR MOBILE TABBED LAYOUT ─── */}
            <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 20 }}>
              
              {/* LEFT DASHBOARD COLUMN: Student Search table & Filter */}
              <View
                style={{
                  flex: isDesktop ? 2.1 : undefined,
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                {/* Header */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#1e293b" }}>Danh sách chuyên cần sinh viên</Text>
                  <Text style={{ fontSize: 12, color: GRAY_TEXT }}>Tra cứu, tìm kiếm và phân loại tình hình tham gia lớp học của sinh viên.</Text>
                </View>

                {/* Filters */}
                <View style={{ marginBottom: 16 }}>
                  {/* Search box */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#f8fafc",
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <Ionicons name="search" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                    <TextInput
                      placeholder="Tìm kiếm sinh viên theo Tên hoặc MSSV..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholderTextColor="#94a3b8"
                      style={{
                        flex: 1,
                        color: "#1e293b",
                        fontSize: 14,
                        ...Platform.select({
                          web: { outlineStyle: "none" } as any,
                        }),
                      }}
                    />
                    {searchQuery !== "" && (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={18} color="#cbd5e1" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Horizontal Scroll Pills for Class filters */}
                  <View style={{ marginTop: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>
                      Bộ lọc lớp học:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setSelectedClassId("all")}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                          borderRadius: 20,
                          backgroundColor: selectedClassId === "all" ? VIOLET : "#f1f5f9",
                          borderWidth: 1,
                          borderColor: selectedClassId === "all" ? VIOLET : "#e2e8f0",
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: selectedClassId === "all" ? "#fff" : "#475569" }}>
                          Tất cả các lớp ({studentReports.length})
                        </Text>
                      </TouchableOpacity>

                      {classReports.map((cls) => (
                        <TouchableOpacity
                          key={cls.classId}
                          activeOpacity={0.7}
                          onPress={() => setSelectedClassId(cls.classId)}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 20,
                            backgroundColor: selectedClassId === cls.classId ? VIOLET : "#f1f5f9",
                            borderWidth: 1,
                            borderColor: selectedClassId === cls.classId ? VIOLET : "#e2e8f0",
                            marginRight: 8,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: "700", color: selectedClassId === cls.classId ? "#fff" : "#475569" }}>
                            {cls.className} ({cls.totalStudents} SV)
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* STUDENT RECORD DATA TABLE */}
                {filteredStudents.length === 0 ? (
                  <View style={{ alignItems: "center", paddingVertical: 50 }}>
                    <Ionicons name="people-outline" size={48} color="#cbd5e1" />
                    <Text style={{ fontSize: 14, color: GRAY_TEXT, marginTop: 12 }}>
                      Không tìm thấy sinh viên nào phù hợp bộ lọc.
                    </Text>
                  </View>
                ) : isDesktop ? (
                  // DESKTOP WIDE TABLE LAYOUT
                  <View style={{ borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                    {/* Header Row */}
                    <View style={{ flexDirection: "row", backgroundColor: "#f8fafc", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
                      <Text style={{ flex: 1.2, fontSize: 12, fontWeight: "700", color: "#475569", paddingLeft: 12 }}>MSSV</Text>
                      <Text style={{ flex: 2.2, fontSize: 12, fontWeight: "700", color: "#475569" }}>Họ & Tên</Text>
                      <Text style={{ flex: 2.2, fontSize: 12, fontWeight: "700", color: "#475569" }}>Lớp học</Text>
                      <Text style={{ flex: 1, fontSize: 12, fontWeight: "700", color: "#475569", textAlign: "center" }}>Số buổi</Text>
                      <Text style={{ flex: 2, fontSize: 12, fontWeight: "700", color: "#475569", textAlign: "center" }}>Có mặt/Muộn/Vắng</Text>
                      <Text style={{ flex: 1.2, fontSize: 12, fontWeight: "700", color: "#475569", textAlign: "right" }}>Tỷ lệ</Text>
                      <Text style={{ flex: 1.5, fontSize: 12, fontWeight: "700", color: "#475569", textAlign: "center", paddingRight: 12 }}>Trạng thái</Text>
                    </View>

                    {/* Data Rows */}
                    {paginatedStudents.map((student, idx) => {
                      const stRate = Math.round(student.attendanceRate);
                      return (
                        <View
                          key={student.studentId}
                          style={{
                            flexDirection: "row",
                            paddingVertical: 12,
                            borderBottomWidth: idx < paginatedStudents.length - 1 ? 1 : 0,
                            borderBottomColor: "#e2e8f0",
                            backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ flex: 1.2, fontSize: 13, fontWeight: "600", color: "#475569", paddingLeft: 12 }}>{student.studentId}</Text>
                          <Text style={{ flex: 2.2, fontSize: 13, fontWeight: "700", color: "#1e293b" }}>{student.studentName}</Text>
                          <Text style={{ flex: 2.2, fontSize: 13, color: "#64748b" }} numberOfLines={1}>{student.className}</Text>
                          <Text style={{ flex: 1, fontSize: 13, color: "#64748b", textAlign: "center" }}>{student.totalSessions}</Text>
                          <View style={{ flex: 2, flexDirection: "row", justifyContent: "center", gap: 8 }}>
                            <Text style={{ fontSize: 12, color: "#10b981", fontWeight: "600" }}>{student.presentCount}</Text>
                            <Text style={{ fontSize: 12, color: "#cbd5e1" }}>/</Text>
                            <Text style={{ fontSize: 12, color: "#f59e0b", fontWeight: "600" }}>{student.lateCount}</Text>
                            <Text style={{ fontSize: 12, color: "#cbd5e1" }}>/</Text>
                            <Text style={{ fontSize: 12, color: "#ef4444", fontWeight: "600" }}>{student.absentCount}</Text>
                          </View>
                          <Text style={{ flex: 1.2, fontSize: 13, fontWeight: "800", color: getRateColor(stRate), textAlign: "right" }}>{stRate}%</Text>
                          <View style={{ flex: 1.5, alignItems: "center", paddingRight: 12 }}>
                            <View style={{ backgroundColor: getRateBg(stRate), paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: getRateColor(stRate) + "30" }}>
                              <Text style={{ fontSize: 11, fontWeight: "700", color: getRateColor(stRate) }}>{getStatusText(stRate)}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  // MOBILE / TABLET CARD LIST LAYOUT
                  <View style={{ gap: 10 }}>
                    {paginatedStudents.map((student) => {
                      const stRate = Math.round(student.attendanceRate);
                      return (
                        <View
                          key={student.studentId}
                          style={{
                            backgroundColor: "#f8fafc",
                            borderRadius: 12,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: "#e2e8f0",
                          }}
                        >
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <Text style={{ fontSize: 14, fontWeight: "700", color: "#1e293b" }}>{student.studentName}</Text>
                              <Text style={{ fontSize: 12, color: GRAY_TEXT }}>MSSV: {student.studentId} • {student.className}</Text>
                            </View>
                            <View style={{ backgroundColor: getRateBg(stRate), paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: getRateColor(stRate) + "30" }}>
                              <Text style={{ fontSize: 12, fontWeight: "800", color: getRateColor(stRate) }}>{stRate}%</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 8, marginTop: 4 }}>
                            <Text style={{ fontSize: 11, color: GRAY_TEXT }}>Có mặt: {student.presentCount} | Muộn: {student.lateCount} | Vắng: {student.absentCount}</Text>
                            <Text style={{ fontSize: 11, fontWeight: "700", color: getRateColor(stRate) }}>{getStatusText(stRate)}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* PAGINATION CONTROLS */}
                {totalItems > itemsPerPage && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 20,
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: "#e2e8f0",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    {/* Page info */}
                    <Text style={{ fontSize: 13, color: "#64748b" }}>
                      Hiển thị <Text style={{ fontWeight: "700", color: "#334155" }}>{startIndex + 1}</Text> -{" "}
                      <Text style={{ fontWeight: "700", color: "#334155" }}>
                        {Math.min(startIndex + itemsPerPage, totalItems)}
                      </Text>{" "}
                      trên <Text style={{ fontWeight: "700", color: "#334155" }}>{totalItems}</Text> kết quả
                    </Text>

                    {/* Action buttons */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {/* Prev Button */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: currentPage === 1 ? "#f1f5f9" : "#fff",
                          borderWidth: 1,
                          borderColor: currentPage === 1 ? "#e2e8f0" : "#cbd5e1",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: currentPage === 1 ? 0.5 : 1,
                        }}
                      >
                        <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? "#94a3b8" : "#475569"} />
                      </TouchableOpacity>

                      {/* Pages buttons or numeric indicator */}
                      {isDesktop ? (
                        getPageNumbers(currentPage, totalPages).map((pg, idx) => {
                          const isSelected = pg === currentPage;
                          const isDots = pg === "...";
                          return (
                            <TouchableOpacity
                              key={idx}
                              activeOpacity={isDots ? 1 : 0.7}
                              disabled={isDots}
                              onPress={() => !isDots && typeof pg === "number" && setCurrentPage(pg)}
                              style={{
                                minWidth: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: isSelected ? VIOLET : isDots ? "transparent" : "#fff",
                                borderWidth: isDots ? 0 : 1,
                                borderColor: isSelected ? VIOLET : "#cbd5e1",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingHorizontal: 6,
                              }}
                            >
                              <Text style={{ fontSize: 13, fontWeight: "700", color: isSelected ? "#fff" : "#475569" }}>
                                {pg}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                      ) : (
                        <View style={{ paddingHorizontal: 12 }}>
                          <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569" }}>
                            Trang {currentPage} / {totalPages}
                          </Text>
                        </View>
                      )}

                      {/* Next Button */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: currentPage === totalPages ? "#f1f5f9" : "#fff",
                          borderWidth: 1,
                          borderColor: currentPage === totalPages ? "#e2e8f0" : "#cbd5e1",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: currentPage === totalPages ? 0.5 : 1,
                        }}
                      >
                        <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? "#94a3b8" : "#475569"} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* RIGHT COLUMN: At-Risk watch list & Class Detail progress & export */}
              <View style={{ flex: isDesktop ? 1 : undefined, gap: 20 }}>
                
                {/* SINH VIÊN CÓ NGUY CƠ VẮNG HỌC CAO (AT-RISK / FLAGGED WATCHLIST) */}
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 18,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#ef444415", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="warning-outline" size={18} color="#ef4444" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>Cần lưu ý (Chuyên cần &lt; 75%)</Text>
                      <Text style={{ fontSize: 11, color: GRAY_TEXT }}>Học sinh có tỷ lệ nghỉ học vượt ngưỡng cảnh báo</Text>
                    </View>
                  </View>

                  {atRiskStudents.length === 0 ? (
                    <View style={{ alignItems: "center", paddingVertical: 32 }}>
                      <Ionicons name="checkmark-circle" size={36} color="#10b981" />
                      <Text style={{ color: "#10b981", fontSize: 13, fontWeight: "700", marginTop: 8 }}>Tuyệt vời!</Text>
                      <Text style={{ color: GRAY_TEXT, fontSize: 12, textAlign: "center", marginTop: 2 }}>Không có sinh viên nào rơi vào vùng nguy cơ.</Text>
                    </View>
                  ) : (
                    <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
                      {atRiskStudents.slice(0, 10).map((st) => {
                        const stRate = Math.round(st.attendanceRate);
                        return (
                          <View
                            key={st.studentId}
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              backgroundColor: "#fef2f2",
                              borderRadius: 12,
                              padding: 10,
                              marginBottom: 8,
                              borderWidth: 1,
                              borderColor: "#fecdd3",
                            }}
                          >
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <Text style={{ fontSize: 13, fontWeight: "700", color: "#991b1b" }} numberOfLines={1}>
                                {st.studentName}
                              </Text>
                              <Text style={{ fontSize: 11, color: "#ef4444" }}>
                                {st.studentId} • {st.className.substring(0, 15)}...
                              </Text>
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                              <Text style={{ fontSize: 13, fontWeight: "800", color: "#ef4444" }}>
                                {stRate}%
                              </Text>
                              <Text style={{ fontSize: 10, color: "#991b1b" }}>
                                Vắng: {st.absentCount} buổi
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                      {atRiskStudents.length > 10 && (
                        <Text style={{ fontSize: 11, color: GRAY_TEXT, textAlign: "center", marginVertical: 6 }}>
                          Và {atRiskStudents.length - 10} học viên khác có nguy cơ...
                        </Text>
                      )}
                    </ScrollView>
                  )}
                </View>

                {/* CHI TIẾT TỪNG LỚP HỌC (CLASS REPORTS PROGRESS) */}
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 18,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: VIOLET + "15", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="list" size={18} color={VIOLET} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>Chi tiết các lớp giảng dạy</Text>
                      <Text style={{ fontSize: 11, color: GRAY_TEXT }}>Thông số và tiến độ chuyên cần từng lớp học</Text>
                    </View>
                  </View>

                  {classReports.length === 0 ? (
                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                      <Text style={{ color: GRAY_TEXT, fontSize: 12 }}>Chưa có lớp học nào được phân công.</Text>
                    </View>
                  ) : (
                    classReports.map((cls) => (
                      <ClassBarRow key={cls.classId} cls={cls} maxRate={100} />
                    ))
                  )}
                </View>

                {/* MOBILE AT-RISK LEGEND AND EXPORT BUTTONS (Only visible on Mobile viewports) */}
                {!isDesktop && (
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 18,
                      padding: 18,
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 10,
                      elevation: 2,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#10b98115", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="download-outline" size={18} color="#10b981" />
                      </View>
                      <View>
                        <Text style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>Lưu trữ & Tải về</Text>
                        <Text style={{ fontSize: 11, color: GRAY_TEXT }}>Xuất bảng điểm danh định dạng Excel</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleExportExcel()}
                      disabled={exportingExcel}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#ecfdf5",
                        borderWidth: 1.5,
                        borderColor: "#a7f3d0",
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#d1fae5", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                        {exportingExcel ? (
                          <ActivityIndicator size="small" color="#10b981" />
                        ) : (
                          <Ionicons name="document-text" size={20} color="#10b981" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: "#065f46" }}>Xuất Excel chi tiết</Text>
                        <Text style={{ fontSize: 11, color: "#059669" }}>Tải bảng điểm danh tất cả sinh viên</Text>
                      </View>
                      <View style={{ backgroundColor: "#10b981", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>Tải về</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
                
              </View>

            </View>

          </View>
        </ScrollView>
      )}

      {/* ─── EXCEL EXPORT CUSTOMIZATION MODAL ─── */}
      <Modal
        visible={isExportModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsExportModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              width: isDesktop ? 550 : "100%",
              maxHeight: "90%",
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 10,
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <LinearGradient
              colors={[VIOLET, VIOLET_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 18,
                paddingHorizontal: 24,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#fff" }}>
                  Xuất báo cáo Excel
                </Text>
                <Text style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.8)", marginTop: 2 }}>
                  Tùy chỉnh thông số và nhận file workbook thông minh
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsExportModalOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Modal Body */}
            <ScrollView
              contentContainerStyle={{ padding: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {/* SECTION 1: PHẠM VI XUẤT */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#334155", marginBottom: 8, textTransform: "uppercase" }}>
                  1. Phạm vi dữ liệu
                </Text>
                <View style={{ flexDirection: "row", backgroundColor: "#f1f5f9", borderRadius: 12, padding: 4, gap: 4 }}>
                  {[
                    { key: "ALL", label: "Tất cả lớp", icon: "globe-outline" },
                    { key: "SUBJECT", label: "Theo môn", icon: "book-outline" },
                    { key: "COURSE", label: "Theo lớp HP", icon: "school-outline" },
                  ].map((scope) => {
                    const active = exportScope === scope.key;
                    return (
                      <TouchableOpacity
                        key={scope.key}
                        activeOpacity={0.7}
                        onPress={() => setExportScope(scope.key as any)}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          paddingVertical: 10,
                          backgroundColor: active ? "#fff" : "transparent",
                          borderRadius: 9,
                          shadowColor: active ? "#000" : "transparent",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: active ? 1 : 0,
                        }}
                      >
                        <Ionicons name={scope.icon as any} size={15} color={active ? VIOLET : GRAY_TEXT} />
                        <Text style={{ fontSize: 12, fontWeight: "700", color: active ? VIOLET : GRAY_TEXT }}>
                          {scope.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Scope selector child dropdown */}
                {exportScope === "SUBJECT" && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: GRAY_TEXT, marginBottom: 6 }}>
                      Chọn môn học muốn xuất:
                    </Text>
                    {isWeb ? (
                      <select
                        value={exportSubjectId}
                        onChange={(e) => setExportSubjectId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#fff",
                          color: "#1e293b",
                          fontSize: "13px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} ({sub.code})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row", paddingVertical: 4 }}>
                        {subjects.map((sub) => {
                          const active = exportSubjectId === sub.id;
                          return (
                            <TouchableOpacity
                              key={sub.id}
                              activeOpacity={0.7}
                              onPress={() => setExportSubjectId(sub.id)}
                              style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 16,
                                backgroundColor: active ? VIOLET + "15" : "#f1f5f9",
                                borderWidth: 1,
                                borderColor: active ? VIOLET : "#e2e8f0",
                                marginRight: 8,
                              }}
                            >
                              <Text style={{ fontSize: 11, fontWeight: "700", color: active ? VIOLET : "#475569" }}>
                                {sub.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>
                )}

                {exportScope === "COURSE" && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: GRAY_TEXT, marginBottom: 6 }}>
                      Chọn lớp học phần muốn xuất:
                    </Text>
                    {isWeb ? (
                      <select
                        value={exportCourseId}
                        onChange={(e) => setExportCourseId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#fff",
                          color: "#1e293b",
                          fontSize: "13px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {teacherCourses.map((cls) => (
                          <option key={cls.classId} value={cls.classId}>
                            {cls.className} ({cls.classCode})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row", paddingVertical: 4 }}>
                        {teacherCourses.map((cls) => {
                          const active = exportCourseId === cls.classId;
                          return (
                            <TouchableOpacity
                              key={cls.classId}
                              activeOpacity={0.7}
                              onPress={() => setExportCourseId(cls.classId)}
                              style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 16,
                                backgroundColor: active ? VIOLET + "15" : "#f1f5f9",
                                borderWidth: 1,
                                borderColor: active ? VIOLET : "#e2e8f0",
                                marginRight: 8,
                              }}
                            >
                              <Text style={{ fontSize: 11, fontWeight: "700", color: active ? VIOLET : "#475569" }}>
                                {cls.className}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>
                )}
              </View>

              {/* SECTION 2: KHOẢNG THỜI GIAN */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#334155", marginBottom: 8, textTransform: "uppercase" }}>
                  2. Khoảng thời gian
                </Text>
                <View style={{ flexDirection: "row", backgroundColor: "#f1f5f9", borderRadius: 12, padding: 4, gap: 4 }}>
                  {[
                    { key: "ALL_TIME", label: "Toàn bộ thời gian", icon: "calendar-outline" },
                    { key: "FILTERED", label: "Theo bộ lọc ngày", icon: "funnel-outline" },
                  ].map((tf) => {
                    const active = exportTimeframe === tf.key;
                    return (
                      <TouchableOpacity
                        key={tf.key}
                        activeOpacity={0.7}
                        onPress={() => setExportTimeframe(tf.key as any)}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          paddingVertical: 10,
                          backgroundColor: active ? "#fff" : "transparent",
                          borderRadius: 9,
                          shadowColor: active ? "#000" : "transparent",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: active ? 1 : 0,
                        }}
                      >
                        <Ionicons name={tf.icon as any} size={15} color={active ? VIOLET : GRAY_TEXT} />
                        <Text style={{ fontSize: 12, fontWeight: "700", color: active ? VIOLET : GRAY_TEXT }}>
                          {tf.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Filter info indicator */}
                {exportTimeframe === "FILTERED" && (
                  <View style={{ marginTop: 10 }}>
                    {activeDateFilter.startDate || activeDateFilter.endDate ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#eff6ff",
                          borderWidth: 1,
                          borderColor: "#bfdbfe",
                          borderRadius: 10,
                          padding: 10,
                          gap: 8,
                        }}
                      >
                        <Ionicons name="information-circle" size={18} color="#3b82f6" />
                        <Text style={{ fontSize: 12, color: "#1e3a8a", flex: 1, fontWeight: "600" }}>
                          Đã áp dụng lọc ngày:{"\n"}
                          {activeDateFilter.startDate ? `Từ ${activeDateFilter.startDate.slice(0, 10)}` : "Ban đầu"}{" "}
                          {activeDateFilter.endDate ? `đến ${activeDateFilter.endDate.slice(0, 10)}` : "Hiện tại"}
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#fffbeb",
                          borderWidth: 1,
                          borderColor: "#fde68a",
                          borderRadius: 10,
                          padding: 10,
                          gap: 8,
                        }}
                      >
                        <Ionicons name="warning" size={18} color="#d97706" />
                        <Text style={{ fontSize: 12, color: "#78350f", flex: 1 }}>
                          Không có bộ lọc ngày nào đang hoạt động. Hệ thống sẽ tự động xuất toàn bộ thời gian.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* SECTION 3: TÙY CHỌN NÂNG CAO */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#334155", marginBottom: 8, textTransform: "uppercase" }}>
                  3. Bộ lọc cảnh báo nâng cao
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setExportOnlyRisk(!exportOnlyRisk)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f8fafc",
                    borderWidth: 1,
                    borderColor: exportOnlyRisk ? "#fecdd3" : "#e2e8f0",
                    borderRadius: 14,
                    padding: 12,
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: exportOnlyRisk ? "#ef4444" : "#cbd5e1",
                      backgroundColor: exportOnlyRisk ? "#ef4444" : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {exportOnlyRisk && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: exportOnlyRisk ? "#991b1b" : "#334155" }}>
                      Chỉ xuất sinh viên có nguy cơ cấm thi
                    </Text>
                    <Text style={{ fontSize: 11, color: GRAY_TEXT, marginTop: 2 }}>
                      Lọc danh sách các học viên có tỷ lệ chuyên cần &lt; 75%
                    </Text>
                  </View>
                  <Ionicons
                    name="warning-outline"
                    size={20}
                    color={exportOnlyRisk ? "#ef4444" : "#94a3b8"}
                  />
                </TouchableOpacity>

                {exportOnlyRisk && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#fef2f2",
                      borderWidth: 1,
                      borderColor: "#fecdd3",
                      borderRadius: 10,
                      padding: 10,
                      marginTop: 8,
                      gap: 8,
                    }}
                  >
                    <Ionicons name="alert-circle" size={18} color="#ef4444" />
                    <Text style={{ fontSize: 11, color: "#991b1b", flex: 1, fontWeight: "500" }}>
                      Chú ý: Dữ liệu chuyên cần các sinh viên đạt chuẩn (&gt;=75%) sẽ không được đưa vào chi tiết các sheets để phục vụ công tác cảnh báo nhanh.
                    </Text>
                  </View>
                )}
              </View>

              {/* SECTION 4: PREVIEW STRUCTURE (EXCEL SHEETS) */}
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#334155", marginBottom: 8, textTransform: "uppercase" }}>
                  4. Xem trước cấu trúc file Excel (.xlsx)
                </Text>
                
                <View
                  style={{
                    backgroundColor: "#f8fafc",
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <Ionicons name="grid-outline" size={14} color="#10b981" />
                    <Text style={{ fontSize: 11, fontWeight: "800", color: "#047857", textTransform: "uppercase" }}>
                      Workbook Tabs Preview
                    </Text>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                    {getPreviewSheets().map((sheet, index) => {
                      let tabBg = "#e2e8f0";
                      let tabText = "#475569";
                      let tabBorder = "#cbd5e1";

                      if (sheet.type === "dashboard") {
                        tabBg = "#eff6ff";
                        tabText = "#1d4ed8";
                        tabBorder = "#bfdbfe";
                      } else if (sheet.type === "chart") {
                        tabBg = "#faf5ff";
                        tabText = "#7e22ce";
                        tabBorder = "#e9d5ff";
                      } else if (sheet.type === "class") {
                        tabBg = "#ecfdf5";
                        tabText = "#047857";
                        tabBorder = "#a7f3d0";
                      } else if (sheet.type === "more") {
                        tabBg = "#f8fafc";
                        tabText = "#64748b";
                        tabBorder = "#e2e8f0";
                      }

                      return (
                        <View
                          key={index}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            backgroundColor: tabBg,
                            borderWidth: 1,
                            borderColor: tabBorder,
                            borderBottomWidth: 0,
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            marginRight: 6,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: "700", color: tabText }}>
                            {sheet.title}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* Spreadsheet Grid Mockup Representation */}
                  <View
                    style={{
                      height: 50,
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      borderTopWidth: 2,
                      borderTopColor: "#10b981",
                      borderBottomLeftRadius: 8,
                      borderBottomRightRadius: 8,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 12,
                    }}
                  >
                    <View style={{ flexDirection: "row", width: "100%", gap: 6 }}>
                      <View style={{ width: 35, height: 8, backgroundColor: "#cbd5e1", borderRadius: 4 }} />
                      <View style={{ flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 4 }} />
                      <View style={{ flex: 2, height: 8, backgroundColor: "#f1f5f9", borderRadius: 4 }} />
                      <View style={{ width: 45, height: 8, backgroundColor: "#fecdd3", borderRadius: 4 }} />
                    </View>
                    <View style={{ flexDirection: "row", width: "100%", gap: 6, marginTop: 6 }}>
                      <View style={{ width: 35, height: 8, backgroundColor: "#cbd5e1", borderRadius: 4 }} />
                      <View style={{ flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 4 }} />
                      <View style={{ flex: 2, height: 8, backgroundColor: "#f1f5f9", borderRadius: 4 }} />
                      <View style={{ width: 45, height: 8, backgroundColor: "#a7f3d0", borderRadius: 4 }} />
                    </View>
                  </View>

                  <Text style={{ fontSize: 10, color: GRAY_TEXT, textAlign: "center", marginTop: 8 }}>
                    💡 File Excel tích hợp biểu đồ chuyên cần động và cấu trúc chuẩn định dạng giảng dạy.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "#f1f5f9",
                padding: 20,
                flexDirection: "row",
                gap: 12,
                backgroundColor: "#f8fafc",
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsExportModalOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#cbd5e1",
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#475569" }}>
                  Hủy bỏ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleExportConfirm}
                disabled={exportingExcel}
                style={{
                  flex: 1.5,
                  flexDirection: "row",
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: "#10b981",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {exportingExcel ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="cloud-download" size={18} color="#fff" />
                )}
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#fff" }}>
                  {exportingExcel ? "Đang tạo file..." : "Tải xuống file"}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}
