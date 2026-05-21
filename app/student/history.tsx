import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { AttendanceStatusTag } from "@/components/AttendanceStatusTag";
import { attendanceService, semesterService, scheduleService, authService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import {
  AttendanceRecordResponse,
  AttendanceStatus,
  AttendanceMethod,
} from "@/apis/types/attendance.types";
import type { Semester } from "@/apis/services/semester.service";
import { useToast } from "@/components/ToastProvider";
import { DropdownPicker } from "@/components/DropdownPicker";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";
import { useRouter } from "expo-router";

const BLUE = "#3b82f6";

export default function HistoryScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecordResponse[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "present" | "late" | "absent">("all");
  const [selectedSubject, setSelectedSubject] = useState<string | null>("all");
  const [selectedSemester, setSelectedSemester] = useState<string | null>("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const { showToast } = useToast();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  }, []);

  const contentMaxWidth = isDesktop ? "100%" : isTablet ? 800 : "100%";
  const paddingHorizontal = isDesktop ? 40 : isTablet ? 24 : 16;

  // Extract unique subjects (from both enrollment and records)
  const subjectOptions = useMemo(() => {
    const subjects = new Set<string>(enrolledSubjects);
    records.forEach((r) => {
      if (r.subjectName) subjects.add(r.subjectName);
    });
    const opts = Array.from(subjects).sort().map((subj) => ({
      label: subj,
      value: subj,
    }));
    opts.unshift({ label: "Tất cả", value: "all" });
    return opts;
  }, [records, enrolledSubjects]);

  const semesterOptions = useMemo(() => {
    const opts = semesters.map((sem) => ({
      label: sem.name,
      value: sem.id,
    }));
    opts.unshift({ label: "Tất cả", value: "all" });
    return opts;
  }, [semesters]);

  const getMethodIcon = (method: AttendanceMethod) => {
    switch (method) {
      case AttendanceMethod.QR: return "QR";
      case AttendanceMethod.OTP: return "OTP";
      case AttendanceMethod.FACE: return "Face ID";
      default: return "-";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("vi-VN", {
      year: "numeric", month: "2-digit", day: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit", minute: "2-digit",
    });
    return { date: dateStr, time: timeStr };
  };

  const mapStatusToUI = (status: AttendanceStatus): "present" | "late" | "absent" => {
    switch (status) {
      case AttendanceStatus.PRESENT: return "present";
      case AttendanceStatus.LATE: return "late";
      case AttendanceStatus.ABSENT:
      case AttendanceStatus.EXCUSED: return "absent";
      default: return "absent";
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter, selectedSubject, selectedSemester]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const studentId = await getStudentIdFromToken();
      if (!studentId) {
        showToast("Không tìm thấy thông tin sinh viên", "error");
        return;
      }

      // 1. Fetch semesters and set latest
      const sems = await semesterService.getAllSemesters();
      sems.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()); // Latest first
      setSemesters(sems);
      if (sems.length > 0) {
        // Giữ mặc định là "all" (Tất cả học kỳ) để hiển thị toàn bộ lịch sử điểm danh của sinh viên, tránh bị trống do ngày học kỳ lệch
        setSelectedSemester("all");
      }

      // 2. Fetch enrolled subjects using studentSchedules endpoint
      const schedules = await scheduleService.getStudentSchedules(studentId);
      const uniqueEnrolledSubjects = new Set<string>();
      schedules.forEach(s => {
        if (s.subjectName) uniqueEnrolledSubjects.add(s.subjectName);
      });
      setEnrolledSubjects(Array.from(uniqueEnrolledSubjects));

      // 3. Fetch attendance records
      const recordsData = await attendanceService.getRecords({ studentId });
      recordsData.sort((a, b) => {
        const dateA = new Date(a.attendedAt || a.createdAt).getTime();
        const dateB = new Date(b.attendedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      setRecords(recordsData);
    } catch (error: any) {
      console.error("Error loading history:", error);
      showToast(error?.response?.data?.message || "Không thể tải lịch sử điểm danh", "error");
    } finally {
      setLoading(false);
    }
  };

  const contextRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSubject = selectedSubject === "all" || r.subjectName === selectedSubject;
      
      let matchSemester = selectedSemester === "all";
      if (!matchSemester && selectedSemester) {
        const sem = semesters.find(s => s.id === selectedSemester);
        if (sem) {
          const rDate = new Date(r.attendedAt || r.createdAt).getTime();
          const sStart = new Date(sem.startAt).getTime();
          const sEnd = new Date(sem.endAt).getTime();
          if (rDate >= sStart && rDate <= sEnd) {
            matchSemester = true;
          }
        }
      }
      
      return matchSubject && matchSemester;
    });
  }, [records, selectedSubject, selectedSemester, semesters]);

  const stats = {
    total: contextRecords.length,
    present: contextRecords.filter((r) => r.status === AttendanceStatus.PRESENT).length,
    late: contextRecords.filter((r) => r.status === AttendanceStatus.LATE).length,
    absent: contextRecords.filter((r) => r.status === AttendanceStatus.ABSENT || r.status === AttendanceStatus.EXCUSED).length,
  };

  const presentPercent = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  const filteredRecords = contextRecords.filter((record) => {
    if (filter === "all") return true;
    const uiStatus = mapStatusToUI(record.status);
    return uiStatus === filter;
  });

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const paginatedRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pieData = [
    {
      name: "Có mặt",
      population: stats.present,
      color: "#34d399",
      legendFontColor: "#475569",
      legendFontSize: 12
    },
    {
      name: "Đi muộn",
      population: stats.late,
      color: "#fbbf24",
      legendFontColor: "#475569",
      legendFontSize: 12
    },
    {
      name: "Vắng",
      population: stats.absent,
      color: "#fb7185",
      legendFontColor: "#475569",
      legendFontSize: 12
    }
  ].filter(item => item.population > 0);

  // Default empty pie to show something if no data
  if (pieData.length === 0) {
    pieData.push({
      name: "Trống",
      population: 1,
      color: "#e2e8f0",
      legendFontColor: "#94a3b8",
      legendFontSize: 12
    });
  }

  // Bar Chart Data & Warning Subjects
  const subjectMap: Record<string, { present: number, total: number }> = {};
  contextRecords.forEach((r) => {
    if (r.subjectName) {
       if (!subjectMap[r.subjectName]) subjectMap[r.subjectName] = { present: 0, total: 0 };
       subjectMap[r.subjectName].total += 1;
       if (r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE) {
          subjectMap[r.subjectName].present += 1;
       }
    }
  });

  let barChartLabels: string[] = [];
  let barChartValues: number[] = [];
  let warningSubjects: { name: string, rate: number }[] = [];

  const subjectEntries = Object.entries(subjectMap).sort((a, b) => b[1].present - a[1].present);
  
  if (subjectEntries.length > 0) {
    subjectEntries.slice(0, 5).forEach(([name, data]) => {
       let shortName = name.split("-")[0].trim();
       shortName = shortName.split(" ")[0] + (shortName.split(" ").length > 1 ? "..." : "");
       if (shortName.length > 10) shortName = shortName.substring(0, 10) + '...';
       
       barChartLabels.push(shortName);
       barChartValues.push(data.present);
    });

    subjectEntries.forEach(([name, data]) => {
      const rate = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
      if (rate <= 70 && data.total >= 3) {
        warningSubjects.push({ name, rate });
      }
    });
  } else {
     barChartLabels = ["Chưa có"];
     barChartValues = [0];
  }

  const barChartData = { labels: barChartLabels, data: barChartValues };

  // Data cho Line Chart (Điểm danh theo tháng)
  const monthMap: Record<string, number> = {};
  contextRecords.forEach((r) => {
    if (r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE) {
       const dateStr = r.attendedAt || r.createdAt;
       if (dateStr) {
          const date = new Date(dateStr);
          const monthStr = `Th${date.getMonth() + 1}`;
          monthMap[monthStr] = (monthMap[monthStr] || 0) + 1;
       }
    }
  });

  let lineLabels = Object.keys(monthMap).sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)));
  let lineValues = lineLabels.map((m) => monthMap[m]);
  
  if (lineLabels.length === 0) {
     lineLabels = ["Chưa có"];
     lineValues = [0];
  }
  const lineChartData = { labels: lineLabels, datasets: [{ data: lineValues }] };

  // Responsive calculations for Desktop Chart Grid
  // Desktop has Left flex:1, Right flex:2 with gap 32. Right is approx (width - padding*2 - 32) * 2 / 3
  const rightColWidth = isDesktop ? (width - (paddingHorizontal * 2) - 32) * 0.65 : width - paddingHorizontal * 2;
  const gridItemWidth = isDesktop ? (rightColWidth - 20) / 2 : rightColWidth; // 20 is gap between items

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc", ...(Platform.OS === "web" ? { height: "100vh" as any, overflow: "hidden" as any } : {}) }}>
      <StatusBar style="light" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        
        {/* ── Blue Hero Banner (MOBILE ONLY) ── */}
        {!isDesktop && (
          <LinearGradient
            colors={["#1E3A8A", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: isMobile ? 52 : 36,
              paddingBottom: 24,
              paddingHorizontal: paddingHorizontal,
              shadowColor: "#1E3A8A",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Title row */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="file-tray-full" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 }}>Hệ thống quản lý</Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#fff", marginTop: 2 }}>Lịch sử điểm danh</Text>
              </View>
            </View>

            {/* Progress Bar inside banner */}
            <View style={{ backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 12, padding: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.9)" }}>
                  Tiến độ đi học ({stats.total} buổi)
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#fff" }}>
                  {presentPercent}%
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" }}>
                <View style={{
                  height: "100%",
                  width: `${Math.min(presentPercent, 100)}%`,
                  backgroundColor: presentPercent >= 90 ? "#34d399" : presentPercent >= 75 ? "#fbbf24" : "#fb7185",
                  borderRadius: 3,
                }} />
              </View>
            </View>
          </LinearGradient>
        )}

        {/* ── Main Content Area ── */}
        <View style={{ paddingHorizontal: paddingHorizontal, paddingTop: isMobile ? 16 : 32, paddingBottom: isMobile ? 100 : 48 }}>
          <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center", flexDirection: isDesktop ? "row" : "column", gap: 32 }}>
            
            {/* ── LEFT COLUMN (List & Filters) ── */}
            <View style={{ flex: isDesktop ? 1 : undefined, minWidth: isDesktop ? 360 : undefined }}>
              
              {/* DESKTOP TITLE */}
              {isDesktop && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#bfdbfe" }}>
                    <Ionicons name="file-tray-full" size={24} color="#3b82f6" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Hệ thống quản lý
                    </Text>
                    <Text style={{ fontSize: 26, fontWeight: "800", color: "#1e293b", marginTop: 2 }}>
                      Lịch sử điểm danh
                    </Text>
                  </View>
                </View>
              )}
            
            {/* Quick Stats Grid (Mobile/Tablet outside banner) */}
            {!isDesktop && (
              <View style={{ flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 24, ...getWebShadow("sm") }}>
                {[
                  { label: "Có mặt", value: String(stats.present), icon: "checkmark-circle", color: "#34d399" },
                  { label: "Muộn", value: String(stats.late), icon: "time", color: "#fbbf24" },
                  { label: "Vắng", value: String(stats.absent), icon: "close-circle", color: "#fb7185" },
                ].map((item, idx) => (
                  <View key={idx} style={{ flex: 1, alignItems: "center", borderLeftWidth: idx > 0 ? 1 : 0, borderLeftColor: "#f1f5f9", paddingLeft: idx > 0 ? 16 : 0 }}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} style={{ marginBottom: 4 }} />
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#1e293b" }}>{item.value}</Text>
                    <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "600", marginTop: 2 }}>{item.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Filters Row */}
            <View style={{ flexDirection: isMobile ? "column" : "row", gap: 16, marginBottom: 24, zIndex: 10 }}>
              <View style={{ flex: 1, zIndex: 20 }}>
                <DropdownPicker
                  label="Học kỳ"
                  placeholder="Chọn học kỳ"
                  options={semesterOptions}
                  selectedValue={selectedSemester}
                  onValueChange={setSelectedSemester}
                  themeColor={BLUE}
                />
              </View>
              <View style={{ flex: 1, zIndex: 10 }}>
                <DropdownPicker
                  label="Môn học"
                  placeholder="Chọn môn"
                  options={subjectOptions}
                  selectedValue={selectedSubject}
                  onValueChange={setSelectedSubject}
                  themeColor={BLUE}
                />
              </View>
            </View>

            {/* Status Tabs */}
            <View style={{ marginBottom: 24 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "present", label: "Có mặt" },
                  { id: "late", label: "Đi muộn" },
                  { id: "absent", label: "Vắng" },
                ].map((tab) => {
                  const isActive = filter === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setFilter(tab.id as any)}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 24,
                        backgroundColor: isActive ? BLUE : "#fff",
                        borderWidth: 1,
                        borderColor: isActive ? BLUE : "#e2e8f0",
                        ...getWebShadow("sm"),
                        ...getWebCursor(),
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 14, fontWeight: isActive ? "700" : "600", color: isActive ? "#fff" : "#64748b" }}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* List */}
            {loading ? (
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <ActivityIndicator size="large" color={BLUE} />
                <Text style={{ marginTop: 16, color: "#64748b", fontWeight: "500" }}>Đang tải lịch sử...</Text>
              </View>
            ) : filteredRecords.length === 0 ? (
              <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 40, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Ionicons name="document-text-outline" size={32} color="#94a3b8" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#475569" }}>
                  {filter === "all" ? "Chưa có lịch sử điểm danh" : `Chưa có bản ghi "${filter === "present" ? "Có mặt" : filter === "late" ? "Đi muộn" : "Vắng"}"`}
                </Text>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                {paginatedRecords.map((record) => {
                  const { date, time } = formatDateTime(record.attendedAt || record.createdAt);
                  const uiStatus = mapStatusToUI(record.status);
                  return (
                    <View
                      key={record.id}
                      style={{
                        flexDirection: "row",
                        backgroundColor: "#fff",
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        ...getWebShadow("sm"),
                      }}
                    >
                      <View style={{ width: 4, height: "100%", backgroundColor: uiStatus === "present" ? "#34d399" : uiStatus === "late" ? "#fbbf24" : "#fb7185", borderRadius: 4, marginRight: 16 }} />
                      
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                          <View style={{ flex: 1, marginRight: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 4 }} numberOfLines={1}>
                              {record.subjectName}
                            </Text>
                            <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "500" }} numberOfLines={1}>
                              Mã lớp: {record.subjectCode || record.classCode}
                            </Text>
                          </View>
                          <AttendanceStatusTag status={uiStatus} size="sm" />
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9" }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
                              <Ionicons name="calendar-outline" size={14} color="#64748b" />
                            </View>
                            <Text style={{ fontSize: 13, color: "#475569", fontWeight: "600" }}>{date} • {time}</Text>
                          </View>
                          
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
                              <Ionicons name="scan-outline" size={14} color={BLUE} />
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: BLUE }}>
                              {getMethodIcon(record.method)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, backgroundColor: "#fff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                    <TouchableOpacity
                      onPress={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: page === 1 ? "#f8fafc" : "#eff6ff", ...getWebCursor() }}
                    >
                      <Text style={{ color: page === 1 ? "#94a3b8" : BLUE, fontWeight: "700", fontSize: 13 }}>Trang trước</Text>
                    </TouchableOpacity>
                    
                    <Text style={{ color: "#475569", fontWeight: "700", fontSize: 14 }}>
                      {page} <Text style={{ color: "#cbd5e1" }}>/</Text> {totalPages}
                    </Text>
                    
                    <TouchableOpacity
                      onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: page === totalPages ? "#f8fafc" : "#eff6ff", ...getWebCursor() }}
                    >
                      <Text style={{ color: page === totalPages ? "#94a3b8" : BLUE, fontWeight: "700", fontSize: 13 }}>Trang sau</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </View>
            )}

            {/* ── MOBILE CHARTS AT THE BOTTOM ── */}
            {!isDesktop && (
              <Animated.View style={{ gap: 24, marginTop: 32, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                {/* Line Chart */}
                <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 8 }}>
                    Tiến độ điểm danh theo tháng
                  </Text>
                  <View style={{ marginLeft: -20, alignItems: "center" }}>
                    <LineChart
                      data={lineChartData}
                      width={width - (paddingHorizontal * 2) - 16}
                      height={200}
                      yAxisLabel=""
                      yAxisSuffix=""
                      chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                        style: { borderRadius: 16 },
                        propsForDots: { r: "4", strokeWidth: "2", stroke: "#8b5cf6" },
                      }}
                      bezier
                      style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                  </View>
                </View>

                {/* Pie Chart */}
                <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm"), alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 8, alignSelf: "flex-start" }}>
                    Phân bố trạng thái
                  </Text>
                  <PieChart
                    data={pieData}
                    width={width - (paddingHorizontal * 2) - 32}
                    height={140}
                    chartConfig={{
                      backgroundColor: "#ffffff",
                      backgroundGradientFrom: "#ffffff",
                      backgroundGradientTo: "#ffffff",
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"0"}
                    absolute
                  />
                </View>

                {/* Bar Chart */}
                <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm"), alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 8, alignSelf: "flex-start" }}>
                    Tần suất điểm danh (Top 5)
                  </Text>
                  <View style={{ marginLeft: -20 }}>
                    <BarChart
                      data={{
                        labels: barChartData.labels,
                        datasets: [{ data: barChartData.data }]
                      }}
                      width={width - (paddingHorizontal * 2) - 16}
                      height={200}
                      yAxisLabel=""
                      yAxisSuffix=""
                      fromZero={true}
                      showValuesOnTopOfBars={true}
                      chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                        style: { borderRadius: 16 },
                        barPercentage: 0.5,
                        propsForLabels: { fontSize: 10, fontWeight: "600" }
                      }}
                      style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                  </View>
                </View>

                {/* Warning Card */}
                {warningSubjects.length > 0 && (
                  <View style={{ backgroundColor: "#fef2f2", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#fca5a5" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Ionicons name="warning" size={20} color="#ef4444" />
                      <Text style={{ fontSize: 16, fontWeight: "700", color: "#ef4444" }}>Cảnh báo điểm danh</Text>
                    </View>
                    <View style={{ gap: 12 }}>
                      {warningSubjects.map((subj, idx) => (
                        <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text style={{ fontSize: 13, color: "#7f1d1d", fontWeight: "600", flex: 1 }} numberOfLines={1}>{subj.name}</Text>
                          <Text style={{ fontSize: 13, color: "#ef4444", fontWeight: "800" }}>{subj.rate}%</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </Animated.View>
            )}

            </View>

            {/* ── RIGHT COLUMN (Desktop ONLY) ── */}
            {isDesktop && (
              <Animated.View style={{ flex: 2, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
                  
                  {/* Line Chart (100% width) */}
                  <View style={{ width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 16 }}>
                      Tiến độ điểm danh theo tháng
                    </Text>
                    <View style={{ marginLeft: -20, alignItems: "center" }}>
                      <LineChart
                        data={lineChartData}
                        width={rightColWidth - 8}
                        height={240}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                          backgroundColor: "#ffffff",
                          backgroundGradientFrom: "#ffffff",
                          backgroundGradientTo: "#ffffff",
                          decimalPlaces: 0,
                          color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                          labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                          style: { borderRadius: 16 },
                          propsForDots: { r: "4", strokeWidth: "2", stroke: "#8b5cf6" },
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16 }}
                      />
                    </View>
                  </View>

                  {/* Progress Card (48%) */}
                  <View style={{ width: gridItemWidth, backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 16 }}>
                      Tiến độ đi học
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748b" }}>Tỷ lệ hiện tại</Text>
                      <Text style={{ fontSize: 14, fontWeight: "800", color: "#1e293b" }}>{presentPercent}%</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
                      <View style={{
                        height: "100%",
                        width: `${Math.min(presentPercent, 100)}%`,
                        backgroundColor: presentPercent >= 90 ? "#34d399" : presentPercent >= 75 ? "#fbbf24" : "#fb7185",
                        borderRadius: 4,
                      }} />
                    </View>
                    <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 20 }}>
                      Đã hoàn thành {stats.present} trên tổng số {stats.total} buổi học được ghi nhận.
                    </Text>
                  </View>

                  {/* Stats Grid Card (48%) */}
                  <View style={{ width: gridItemWidth, backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 16 }}>
                      Thống kê tổng quan
                    </Text>
                    <View style={{ gap: 16 }}>
                      {[
                        { label: "Có mặt", value: String(stats.present), icon: "checkmark-circle", color: "#34d399", bgColor: "#ecfdf5" },
                        { label: "Đi muộn", value: String(stats.late), icon: "time", color: "#fbbf24", bgColor: "#fffbeb" },
                        { label: "Vắng mặt", value: String(stats.absent), icon: "close-circle", color: "#fb7185", bgColor: "#fff1f2" },
                      ].map((item, idx) => (
                        <View key={idx} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: idx < 2 ? 16 : 0, borderBottomWidth: idx < 2 ? 1 : 0, borderBottomColor: "#f1f5f9" }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: item.bgColor, alignItems: "center", justifyContent: "center" }}>
                              <Ionicons name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <Text style={{ fontSize: 15, fontWeight: "600", color: "#475569" }}>{item.label}</Text>
                          </View>
                          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1e293b" }}>{item.value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Pie Chart Card (48%) */}
                  <View style={{ width: gridItemWidth, backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 16 }}>
                      Phân bố trạng thái
                    </Text>
                    <View style={{ alignItems: "center" }}>
                      <PieChart
                        data={pieData}
                        width={gridItemWidth - 40}
                        height={160}
                        chartConfig={{
                          backgroundColor: "#ffffff",
                          backgroundGradientFrom: "#ffffff",
                          backgroundGradientTo: "#ffffff",
                          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                      />
                    </View>
                  </View>

                  {/* Bar Chart Card (48%) */}
                  <View style={{ width: gridItemWidth, backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 16 }}>
                      Tần suất điểm danh (Top 5)
                    </Text>
                    <View style={{ alignItems: "center", marginLeft: -20 }}>
                      <BarChart
                        data={{
                          labels: barChartData.labels,
                          datasets: [{ data: barChartData.data }]
                        }}
                        width={gridItemWidth}
                        height={200}
                        yAxisLabel=""
                        yAxisSuffix=""
                        fromZero={true}
                        showValuesOnTopOfBars={true}
                        chartConfig={{
                          backgroundColor: "#ffffff",
                          backgroundGradientFrom: "#ffffff",
                          backgroundGradientTo: "#ffffff",
                          decimalPlaces: 0,
                          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                          labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                          style: { borderRadius: 16 },
                          barPercentage: 0.5,
                          propsForLabels: { fontSize: 10, fontWeight: "600" }
                        }}
                        style={{ marginVertical: 8, borderRadius: 16 }}
                      />
                    </View>
                  </View>

                  {/* Warning Card (48%) */}
                  <View style={{ width: gridItemWidth, backgroundColor: warningSubjects.length > 0 ? "#fef2f2" : "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: warningSubjects.length > 0 ? "#fca5a5" : "#e5e7eb", ...getWebShadow("sm") }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <Ionicons name={warningSubjects.length > 0 ? "warning" : "checkmark-circle"} size={20} color={warningSubjects.length > 0 ? "#ef4444" : "#10b981"} />
                      <Text style={{ fontSize: 16, fontWeight: "700", color: warningSubjects.length > 0 ? "#ef4444" : "#1e293b" }}>Cảnh báo điểm danh</Text>
                    </View>
                    <View style={{ gap: 12 }}>
                      {warningSubjects.length > 0 ? (
                        warningSubjects.map((subj, idx) => (
                          <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: idx < warningSubjects.length - 1 ? 12 : 0, borderBottomWidth: idx < warningSubjects.length - 1 ? 1 : 0, borderBottomColor: "#fecaca" }}>
                            <Text style={{ fontSize: 14, color: "#7f1d1d", fontWeight: "600", flex: 1 }} numberOfLines={2}>{subj.name}</Text>
                            <Text style={{ fontSize: 16, color: "#ef4444", fontWeight: "800" }}>{subj.rate}%</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 20 }}>
                          Không có môn học nào có tỷ lệ điểm danh dưới 70%. Chúc mừng bạn đã duy trì tốt việc lên lớp!
                        </Text>
                      )}
                    </View>
                  </View>

                </View>
              </Animated.View>
            )}

          </View>
        </View>
      </ScrollView>
    </View>
  );
}
