import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
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
import { LinearGradient } from "expo-linear-gradient";
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

  const contentMaxWidth = isDesktop ? 1024 : isTablet ? 800 : "100%";
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

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
        setSelectedSemester(sems[0].id);
      }

      // 2. Fetch enrolled subjects
      const currentUser = await authService.getCurrentUser();
      const baseParams: any = {};
      if (currentUser?.enrolledClassIds?.length) {
        baseParams.classIds = currentUser.enrolledClassIds;
      } else if (currentUser?.classId) {
        baseParams.classId = currentUser.classId;
      }
      
      const schedules = await scheduleService.getSchedules(baseParams);
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
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
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
                  backgroundColor: presentPercent >= 90 ? "#34d399" : presentPercent >= 75 ? "#fbbf24" : "#f87171",
                  borderRadius: 3,
                }} />
              </View>
            </View>
          </LinearGradient>
        )}

        {/* ── Main Content Area ── */}
        <View style={{ paddingHorizontal: paddingHorizontal, paddingTop: isMobile ? 16 : 32, paddingBottom: isMobile ? 100 : 48 }}>
          <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center", flexDirection: isDesktop ? "row" : "column", gap: 32 }}>
            
            {/* ── LEFT COLUMN ── */}
            <View style={{ flex: isDesktop ? 2 : undefined }}>
              
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
                  { label: "Có mặt", value: String(stats.present), icon: "checkmark-circle", color: "#10b981" },
                  { label: "Muộn", value: String(stats.late), icon: "time", color: "#f59e0b" },
                  { label: "Vắng", value: String(stats.absent), icon: "close-circle", color: "#ef4444" },
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
                      <View style={{ width: 4, height: "100%", backgroundColor: uiStatus === "present" ? "#10b981" : uiStatus === "late" ? "#f59e0b" : "#ef4444", borderRadius: 4, marginRight: 16 }} />
                      
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

            </View>

            {/* ── RIGHT COLUMN (Desktop ONLY) ── */}
            {isDesktop && (
              <View style={{ flex: 1 }}>
                <View style={{ position: "sticky" as any, top: 32, gap: 24 }}>
                  
                  {/* Progress Card */}
                  <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 16 }}>
                      Tiến độ đi học
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748b" }}>Tỷ lệ hiện tại</Text>
                      <Text style={{ fontSize: 14, fontWeight: "800", color: "#1e293b" }}>{presentPercent}%</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                      <View style={{
                        height: "100%",
                        width: `${Math.min(presentPercent, 100)}%`,
                        backgroundColor: presentPercent >= 90 ? "#10b981" : presentPercent >= 75 ? "#f59e0b" : "#ef4444",
                        borderRadius: 4,
                      }} />
                    </View>
                  </View>

                  {/* Stats Grid Card */}
                  <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 16 }}>
                      Thống kê tổng quan
                    </Text>
                    <View style={{ gap: 16 }}>
                      {[
                        { label: "Có mặt", value: String(stats.present), icon: "checkmark-circle", color: "#10b981", bgColor: "#d1fae5" },
                        { label: "Đi muộn", value: String(stats.late), icon: "time", color: "#f59e0b", bgColor: "#fef3c7" },
                        { label: "Vắng mặt", value: String(stats.absent), icon: "close-circle", color: "#ef4444", bgColor: "#fee2e2" },
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

                </View>
              </View>
            )}

          </View>
        </View>
      </ScrollView>
    </View>
  );
}
