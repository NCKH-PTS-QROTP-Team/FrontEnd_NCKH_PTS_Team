import React, { useState, useEffect } from "react";
import {
  RefreshControl,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { otpService, attendanceService, scheduleService, apiClient, reportService, getAuthToken } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import { AttendanceMethod } from "@/apis/types/attendance.types";
import { useToast } from "@/components/ToastProvider";
import type { Schedule } from "@/apis/services/schedule.service";
import {
  CalendarIconFilled,
  LocationIconFilled,
  LockIconFilled,
} from "@/components/Icons";
import { BottomNavigationSpacer } from "@/components/BottomNavigation";

interface SessionInfo {
  id: string;
  classId: string;
  classCode: string;
  className: string;
  subjectId: string;
  subjectName: string;
  duration?: number;
  present?: number;
  late?: number;
  absent?: number;
  total?: number;
}

interface ScheduleAvailability {
  canCreate: boolean;
  statusText: string;
  statusColor: string;
  statusBg: string;
  dotColor: string;
}

const toLocalISOString = (date: Date) => {
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export default function GenerateOTPScreen() {
  const [otp, setOtp] = useState("");
  // countdown only for display; only starts when isActive is true
  const [countdown, setCountdown] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Custom Settings
  const [durationMinutes, setDurationMinutes] = useState<string>("15");
  const [totpInterval, setTotpInterval] = useState<string>("10");
  const [customHour, setCustomHour] = useState<string>("");
  const [customMinute, setCustomMinute] = useState<string>("");

  // Schedule
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();

  // Completion Modal State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [modalSessionInfo, setModalSessionInfo] = useState<any>(null);
  const [studentList, setStudentList] = useState<Array<{ studentId: string; studentName: string; status: 'PRESENT' | 'LATE' | 'ABSENT' }>>([]);
  const [loadingModalData, setLoadingModalData] = useState(false);
  const [activeTab, setActiveTab] = useState<'PRESENT' | 'LATE' | 'ABSENT'>('PRESENT');

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

  const hasSchedules = todaySchedules.length > 0;
  const hasActiveSchedule =
    selectedSchedule !== null &&
    getScheduleAvailability(selectedSchedule).canCreate;
  const inputsLocked = isActive || !hasSchedules;
  const startDisabled = !hasSchedules || !hasActiveSchedule || isActive;



  useEffect(() => {
    loadData();
    const now = new Date();
    setCustomHour(String(now.getHours()).padStart(2, "0"));
    setCustomMinute(String(now.getMinutes()).padStart(2, "0"));
  }, []);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([loadTodaySchedules(), loadActiveSession()]);
    } finally {
      setInitialLoading(false);
    }
  };

  function getScheduleAvailability(schedule: Schedule): ScheduleAvailability {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    if (!schedule.startTime || !schedule.endTime) {
      return {
        canCreate: false,
        statusText: "Thiếu dữ liệu thời gian",
        statusColor: "#78716C",
        statusBg: "#F5F5F4",
        dotColor: "#78716C",
      };
    }

    const [startH, startM] = schedule.startTime.split(":").map(Number);
    const [endH, endM] = schedule.endTime.split(":").map(Number);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
      return {
        canCreate: false,
        statusText: "Thiếu dữ liệu thời gian",
        statusColor: "#78716C",
        statusBg: "#F5F5F4",
        dotColor: "#78716C",
      };
    }

    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (nowMins < startMins) {
      return {
        canCreate: false,
        statusText: `Bắt đầu lúc ${schedule.startTime}`,
        statusColor: "#B45309",
        statusBg: "#FEF3C7",
        dotColor: "#F59E0B",
      };
    }
    if (nowMins > endMins) {
      return {
        canCreate: false,
        statusText: "Đã kết thúc",
        statusColor: "#991B1B",
        statusBg: "#FEE2E2",
        dotColor: "#EF4444",
      };
    }
    return {
      canCreate: true,
      statusText: "Đang diễn ra",
      statusColor: "#14532D",
      statusBg: "#DCFCE7",
      dotColor: "#16A34A",
    };
  }

  const loadTodaySchedules = async () => {
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) return;

      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const schedules = await scheduleService.getSchedules({
        teacherId,
        fromDate: dateStr,
        toDate: dateStr,
        scheduleType: "CLASS",
      });

      const sorted = [...schedules].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
      setTodaySchedules(sorted);

      // Auto-select the currently active schedule
      const active = sorted.find((s) => getScheduleAvailability(s).canCreate);
      if (active) setSelectedSchedule(active);
    } catch (error) {
      console.warn("Không tải được lịch dạy hôm nay:", error);
    }
  };

  const loadActiveSession = async () => {
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) return;

      const sessions = await attendanceService.getSessions({
        teacherId,
        active: true,
      });
      const otpSession = sessions.find((s) => {
        if (s.method !== AttendanceMethod.OTP || s.status !== "ACTIVE") return false;
        if (s.expiredAt) {
          const expTime = new Date(s.expiredAt).getTime();
          if (expTime <= Date.now()) return false;
        }
        return true;
      });

      if (otpSession) {
        const sess: SessionInfo = {
          id: otpSession.id,
          classId: otpSession.courseId || otpSession.classId || "",
          classCode: otpSession.classCode || "",
          className:
            otpSession.className || (otpSession as any).courseName || "",
          subjectId: otpSession.subjectId,
          subjectName: otpSession.subjectName || "",
          duration: (otpSession as any).duration,
          present: otpSession.present || 0,
          late: otpSession.late || 0,
          absent: otpSession.absent || 0,
          total: otpSession.total || 0,
        };
        setSessionInfo(sess);
        setCurrentSessionId(otpSession.id);

        const interval = (otpSession as any).duration;
        if (interval) setTotpInterval(String(interval));

        // Only set active + fetch OTP if there is a real active session
        try {
          const otpResponse = await otpService.getCurrent(otpSession.id);
          if (otpResponse && otpResponse.code) {
            setOtp(otpResponse.code);
            setCountdown(
              otpResponse.remainingSeconds || Number(interval) || 10,
            );
            setIsActive(true); // ← ONLY start countdown here
          }
        } catch (_) {
          // session exists but no OTP generated yet — don't start countdown
        }
      }
      // If no otpSession found, isActive remains false → countdown never starts
    } catch (error) {
      console.error("Lỗi khi tải phiên điểm danh:", error);
    }
  };

  // Auto-countdown — only runs when isActive===true AND currentSessionId is set
  useEffect(() => {
    if (!isActive || !currentSessionId) return; // Guard: no timer unless actually active

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshOTPCode();
          return Number(totpInterval) || 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, currentSessionId, totpInterval]);

  const refreshOTPCode = async () => {
    if (!currentSessionId) return;
    try {
      const resp = await otpService.getCurrent(currentSessionId);
      if (resp?.code) {
        setOtp(resp.code);
        setCountdown(resp.remainingSeconds || Number(totpInterval) || 10);
      }
    } catch (_) {
      generateOTPCodeSilently();
    }
  };

  const generateOTPCodeSilently = async () => {
    if (!currentSessionId) return;
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) return;
      const resp = await otpService.generate({
        sessionId: currentSessionId,
        teacherId,
      });
      setOtp(resp.code);
      setCountdown(resp.remainingSeconds || Number(totpInterval) || 10);
    } catch (_) {
      setIsActive(false);
    }
  };

  const refreshSessionStats = async (sessionId: string) => {
    try {
      const session = await attendanceService.getSessionById(sessionId);
      setSessionInfo((prev) =>
        prev
          ? {
              ...prev,
              present: session.present ?? 0,
              late: session.late ?? 0,
              absent: session.absent ?? 0,
              total: session.total ?? prev.total,
            }
          : prev
      );
    } catch (error) {
      // Silent fail — stats refresh không critical
    }
  };

  // Auto-refresh stats mỗi 3 giây để cập nhật số lượng SV điểm danh thời gian thực mượt mà
  useEffect(() => {
    if (!sessionInfo?.id) return;

    // Refresh ngay lập tức khi chọn phiên hoặc mount
    refreshSessionStats(sessionInfo.id);

    const statsInterval = setInterval(() => {
      refreshSessionStats(sessionInfo.id);
    }, 3000);

    return () => clearInterval(statsInterval);
  }, [sessionInfo?.id]);

  const handleStartAttendance = async () => {
    if (!selectedSchedule) {
      showToast("Vui lòng chọn lịch dạy để tạo phiên điểm danh.", "error");
      return;
    }
    const avail = getScheduleAvailability(selectedSchedule);
    if (!avail.canCreate) {
      showToast(`Không thể tạo phiên: ${avail.statusText}`, "error");
      return;
    }

    const intervalVal = parseInt(totpInterval);
    if (isNaN(intervalVal) || intervalVal < 5) {
      showToast("Chu kỳ OTP tối thiểu là 5 giây.", "error");
      return;
    }
    const durationVal = parseInt(durationMinutes);
    if (isNaN(durationVal) || durationVal <= 0) {
      showToast("Thời gian điểm danh không hợp lệ.", "error");
      return;
    }

    setLoading(true);
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) {
        showToast("Không tìm thấy thông tin giảng viên.", "error");
        return;
      }

      // Chỉ kiểm tra các phiên đang active (active:true) và của chính giảng viên này
      // — tránh false positive do session cũ đã COMPLETED hoặc của giáo viên khác
      const existing = await attendanceService.getSessions({
        courseId: selectedSchedule.courseId || selectedSchedule.classId,
        teacherId,
        active: true,
      });
      const realActive = existing.filter((s) => {
        const isCurrentTeacher = s.teacherId === teacherId || s.lecturerId === teacherId;
        if (!isCurrentTeacher) return false;
        if (s.expiredAt) {
          const expTime = new Date(s.expiredAt).getTime();
          if (expTime <= Date.now()) return false;
        }
        return s.status === "ACTIVE";
      });
      if (realActive.length > 0) {
        showToast("Học phần này đang có phiên điểm danh hoạt động.", "error");
        setLoading(false);
        return;
      }

      const attendedAtDate = new Date();
      const h = parseInt(customHour),
        m = parseInt(customMinute);
      if (!isNaN(h) && !isNaN(m)) attendedAtDate.setHours(h, m, 0, 0);
      const expiredAtDate = new Date(
        attendedAtDate.getTime() + durationVal * 60 * 1000,
      );

      const newSession = await attendanceService.createSession({
        // Backend cần courseId (Course.id từ schedule.courseId), không phải classId
        courseId: selectedSchedule.courseId || selectedSchedule.classId,
        subjectId: selectedSchedule.subjectId,
        lecturerId: teacherId,   // backend dùng lecturerId để validate
        teacherId,
        method: AttendanceMethod.OTP,
        duration: intervalVal,
        attendedAt: attendedAtDate.toISOString(),
        expiredAt: expiredAtDate.toISOString(),
        scheduledStartTime: selectedSchedule.startTime,
      });

      setSessionInfo({
        id: newSession.id,
        classId: newSession.courseId || selectedSchedule.classId,
        classCode: selectedSchedule.classCode,
        className: selectedSchedule.className,
        subjectId: selectedSchedule.subjectId,
        subjectName: selectedSchedule.subjectName,
        duration: intervalVal,
        present: newSession.present || 0,
        late: newSession.late || 0,
        absent: newSession.absent || 0,
        total: newSession.total || 0,
      });
      setCurrentSessionId(newSession.id);

      const otpResp = await otpService.generate({
        sessionId: newSession.id,
        teacherId,
      });
      setOtp(otpResp.code);
      setCountdown(otpResp.remainingSeconds || intervalVal);
      setIsActive(true); // ← start timer ONLY after successful creation
      showToast("Khởi tạo phiên điểm danh thành công!", "success");
    } catch (error: any) {
      showToast(
        error?.message || "Không thể tạo phiên điểm danh.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadModalData = async (sessionId: string, courseId: string) => {
    setLoadingModalData(true);
    try {
      // 1. Fetch active enrollments (try courseId then fallback to classId)
      let enrollments = [];
      try {
        const enrollmentsResp = await apiClient.get('/enrollments', {
          params: { courseId }
        });
        enrollments = enrollmentsResp.data?.data || [];
      } catch (err) {
        console.warn("Lỗi fetch enrollments bằng courseId:", err);
      }

      if (enrollments.length === 0) {
        try {
          const enrollmentsResp = await apiClient.get('/enrollments', {
            params: { classId: courseId }
          });
          enrollments = enrollmentsResp.data?.data || [];
        } catch (err) {
          console.warn("Lỗi fetch enrollments bằng classId:", err);
        }
      }

      const activeEnrollments = enrollments.filter((e: any) => e.status === 'ENROLLED' || e.status === 'ACTIVE' || !e.status);

      // 2. Fetch attendance records
      const records = await attendanceService.getRecords({ sessionId });

      // 3. Map students using bulletproof case-insensitive matching
      const mapped = activeEnrollments.map((e: any) => {
        const match = records.find((r: any) => {
          const rStudentId = String(r.studentId || "").trim().toLowerCase();
          const rStudentCode = String(r.studentCode || "").trim().toLowerCase();
          const eStudentUserId = String(e.studentUserId || "").trim().toLowerCase();
          const eStudentId = String(e.studentId || "").trim().toLowerCase();

          return (
            (rStudentId && eStudentUserId && rStudentId === eStudentUserId) ||
            (rStudentId && eStudentId && rStudentId === eStudentId) ||
            (rStudentCode && eStudentId && rStudentCode === eStudentId) ||
            (rStudentCode && eStudentUserId && rStudentCode === eStudentUserId)
          );
        });

        return {
          studentId: e.studentId || e.studentUserId || '',
          studentName: e.studentName || 'Chưa rõ',
          status: match ? (match.status as 'PRESENT' | 'LATE' | 'ABSENT') : 'ABSENT',
        };
      });

      setStudentList(mapped);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sinh viên:", err);
      showToast("Không thể tải danh sách sinh viên lớp học.", "error");
    } finally {
      setLoadingModalData(false);
    }
  };

  const handleExportExcel = async () => {
    if (!modalSessionInfo?.id) return;
    try {
      const token = await getAuthToken();
      let url = reportService.getExportExcelUrl(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        modalSessionInfo.id
      );
      if (token) {
        url += (url.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(token);
      }
      Linking.openURL(url).catch((err) => {
        console.error("Lỗi mở link tải Excel:", err);
        showToast("Không thể tải file báo cáo Excel.", "error");
      });
    } catch (err) {
      console.error("Lỗi lấy token xác thực:", err);
      showToast("Không thể xác thực để tải file.", "error");
    }
  };

  const handleStopAttendance = async () => {
    if (!currentSessionId || !sessionInfo) return;
    const sessionId = currentSessionId;
    const courseId = sessionInfo.classId; // sessionInfo.classId holds the course/class ID in OTP screen
    setLoading(true);
    try {
      const completedSession = await attendanceService.completeSession(sessionId);
      setIsActive(false); // ← stop countdown immediately
      setOtp("");
      setCountdown(Number(totpInterval) || 10);

      const finalCourseId = completedSession.courseId || courseId;
      
      // Store session info for modal before clearing active state
      setModalSessionInfo({
        id: completedSession.id,
        courseId: finalCourseId,
        subjectName: completedSession.subjectName || sessionInfo.subjectName,
        className: completedSession.className || sessionInfo.className,
        method: 'OTP',
        present: completedSession.present || 0,
        late: completedSession.late || 0,
        absent: completedSession.absent || 0,
        total: completedSession.total || 0,
      });

      // Clear active session from screen
      setCurrentSessionId(null);
      setSessionInfo(null);
      
      // Fetch roster & show modal
      setShowSummaryModal(true);
      await loadModalData(sessionId, finalCourseId);
      showToast("Đã kết thúc phiên điểm danh.", "success");
    } catch (_) {
      showToast("Không thể kết thúc phiên điểm danh.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const progressPercent = isActive
    ? Math.max(
        0,
        Math.min(100, (countdown / (Number(totpInterval) || 10)) * 100),
      )
    : 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: isDesktop ? 32 : 20,
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
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#0F172A",
                letterSpacing: 0.2,
              }}
            >
              Điểm Danh OTP (TOTP)
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
              Mã OTP tự động đổi liên tục theo chu kỳ cài đặt.
            </Text>
          </View>

          {initialLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={{ color: "#64748B", marginTop: 12 }}>
                Đang tải lịch dạy...
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                gap: 20,
                alignItems: isDesktop ? "flex-start" : "stretch",
                width: "100%",
              }}
            >
              {/* LEFT COLUMN */}
              <View
                style={{
                  flex: isDesktop ? 1.2 : undefined,
                  width: isDesktop ? undefined : "100%",
                  gap: 16,
                }}
              >
                {/* Schedule List */}
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 14,
                    }}
                  >
                    Lịch dạy hôm nay — {new Date().toLocaleDateString("vi-VN")}
                  </Text>

                  {/* No schedule banner */}
                  {!hasSchedules && (
                    <View
                      style={{
                        backgroundColor: "#FFF7ED",
                        borderRadius: 10,
                        padding: 16,
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 12,
                        borderWidth: 1,
                        borderColor: "#FED7AA",
                        marginBottom: 4,
                      }}
                    >
                      <CalendarIconFilled size={24} color="#C2410C" />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: "#C2410C",
                            marginBottom: 4,
                          }}
                        >
                          Không có lịch dạy hôm nay
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#9A3412",
                            lineHeight: 20,
                          }}
                        >
                          Bạn không có ca dạy nào vào ngày{" "}
                          {new Date().toLocaleDateString("vi-VN")}. Tính năng
                          điểm danh bị khoá cho đến khi có lịch hợp lệ.
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Active session card when running but no schedule today */}
                  {isActive && sessionInfo && !hasSchedules && (
                    <View
                      style={{
                        backgroundColor: "#EFF6FF",
                        borderRadius: 10,
                        padding: 14,
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 12,
                        borderWidth: 1,
                        borderColor: "#BFDBFE",
                        marginTop: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#22C55E",
                          marginTop: 4,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: "#1D4ED8",
                            marginBottom: 2,
                          }}
                        >
                          Phiên OTP đang hoạt động
                        </Text>
                        <Text style={{ fontSize: 12, color: "#3730A3" }}>
                          {sessionInfo.subjectName} — {sessionInfo.className}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#6366F1",
                            marginTop: 3,
                          }}
                        >
                          Nhấn "Kết thúc" để đóng phiên này.
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Schedule cards */}
                  {todaySchedules.length > 0 && (
                    <View style={{ gap: 10 }}>
                      {todaySchedules.map((item) => {
                        const avail = getScheduleAvailability(item);
                        const isSelected = selectedSchedule?.id === item.id;

                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() =>
                              !isActive && setSelectedSchedule(item)
                            }
                            activeOpacity={isActive ? 1 : 0.7}
                            style={{
                              borderRadius: 12,
                              borderWidth: 2,
                              borderColor: isSelected ? "#3B82F6" : "#E2E8F0",
                              backgroundColor: isSelected
                                ? "#EFF6FF"
                                : "#FFFFFF",
                              padding: 14,
                              opacity:
                                isActive &&
                                sessionInfo?.classId !== item.classId
                                  ? 0.5
                                  : 1,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontWeight: "700",
                                  color: "#0F172A",
                                  flex: 1,
                                }}
                                numberOfLines={2}
                              >
                                {item.subjectName}
                              </Text>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  backgroundColor: avail.statusBg,
                                  paddingHorizontal: 8,
                                  paddingVertical: 3,
                                  borderRadius: 20,
                                  marginLeft: 8,
                                }}
                              >
                                <View
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: avail.dotColor,
                                    marginRight: 5,
                                  }}
                                />
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontWeight: "700",
                                    color: avail.statusColor,
                                  }}
                                >
                                  {avail.statusText}
                                </Text>
                              </View>
                            </View>

                            <Text
                              style={{
                                fontSize: 12,
                                color: "#64748B",
                                marginBottom: 10,
                              }}
                            >
                              {item.className} ({item.classCode})
                            </Text>

                            <View style={{ flexDirection: "row", gap: 16 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <CalendarIconFilled size={14} color="#3B82F6" />
                                <Text
                                  style={{ fontSize: 12, color: "#475569" }}
                                >
                                  {item.startTime} – {item.endTime}
                                </Text>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <LocationIconFilled size={14} color="#3B82F6" />
                                <Text
                                  style={{ fontSize: 12, color: "#475569" }}
                                >
                                  Phòng {item.room}
                                </Text>
                              </View>
                            </View>

                            {isSelected && (
                              <View
                                style={{
                                  marginTop: 8,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <View
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 4,
                                    backgroundColor: "#3B82F6",
                                  }}
                                />
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: "#3B82F6",
                                    fontWeight: "600",
                                  }}
                                >
                                  Đã chọn để tạo phiên OTP
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 18,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      Cài đặt phiên điểm danh
                    </Text>
                    {!hasSchedules && (
                      <View
                        style={{
                          backgroundColor: "#FEF3C7",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 8,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <LockIconFilled size={12} color="#92400E" />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: "#92400E",
                          }}
                        >
                          Bị khoá
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Duration Quick Picks */}
                  <View style={{ marginBottom: 18 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                        marginBottom: 8,
                        fontWeight: "500",
                      }}
                    >
                      Thời gian mở cổng điểm danh
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        opacity: inputsLocked ? 0.45 : 1,
                      }}
                    >
                      {["5", "10", "15", "30", "45"].map((val) => (
                        <TouchableOpacity
                          key={val}
                          disabled={inputsLocked}
                          onPress={() => setDurationMinutes(val)}
                          style={{
                            flex: 1,
                            backgroundColor:
                              durationMinutes === val ? "#3B82F6" : "#F1F5F9",
                            borderWidth: 1,
                            borderColor:
                              durationMinutes === val ? "#3B82F6" : "#E2E8F0",
                            borderRadius: 8,
                            paddingVertical: 9,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color:
                                durationMinutes === val ? "#FFFFFF" : "#374151",
                            }}
                          >
                            {val}m
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Custom start time */}
                  <View style={{ marginBottom: 18 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                        marginBottom: 8,
                        fontWeight: "500",
                      }}
                    >
                      Thời điểm bắt đầu điểm danh
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "flex-end",
                        opacity: inputsLocked ? 0.45 : 1,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#94A3B8",
                            marginBottom: 4,
                          }}
                        >
                          Giờ (0–23)
                        </Text>
                        <TextInput
                          value={customHour}
                          onChangeText={setCustomHour}
                          editable={!inputsLocked}
                          keyboardType="numeric"
                          placeholder="HH"
                          maxLength={2}
                          placeholderTextColor="#94A3B8"
                          style={{
                            backgroundColor: "#F1F5F9",
                            borderColor: "#CBD5E1",
                            borderWidth: 1,
                            borderRadius: 8,
                            color: inputsLocked ? "#94A3B8" : "#0F172A",
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            textAlign: "center",
                            fontSize: 15,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: "#94A3B8",
                          paddingBottom: 10,
                        }}
                      >
                        :
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#94A3B8",
                            marginBottom: 4,
                          }}
                        >
                          Phút (0–59)
                        </Text>
                        <TextInput
                          value={customMinute}
                          onChangeText={setCustomMinute}
                          editable={!inputsLocked}
                          keyboardType="numeric"
                          placeholder="MM"
                          maxLength={2}
                          placeholderTextColor="#94A3B8"
                          style={{
                            backgroundColor: "#F1F5F9",
                            borderColor: "#CBD5E1",
                            borderWidth: 1,
                            borderRadius: 8,
                            color: inputsLocked ? "#94A3B8" : "#0F172A",
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            textAlign: "center",
                            fontSize: 15,
                          }}
                        />
                      </View>
                    </View>
                  </View>

                  {/* TOTP interval */}
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                        marginBottom: 8,
                        fontWeight: "500",
                      }}
                    >
                      Chu kỳ đổi mã OTP (giây) — tối thiểu 5s
                    </Text>
                    <View style={{ opacity: inputsLocked ? 0.45 : 1 }}>
                      <TextInput
                        value={totpInterval}
                        onChangeText={setTotpInterval}
                        editable={!inputsLocked}
                        keyboardType="numeric"
                        placeholderTextColor="#94A3B8"
                        style={{
                          backgroundColor: "#F1F5F9",
                          borderColor: "#CBD5E1",
                          borderWidth: 1,
                          borderRadius: 8,
                          color: inputsLocked ? "#94A3B8" : "#0F172A",
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          fontSize: 14,
                        }}
                        placeholder="Mặc định: 10"
                      />
                    </View>
                    <Text
                      style={{ fontSize: 11, color: "#94A3B8", marginTop: 5 }}
                    >
                      Mã OTP tự động đổi sau mỗi {totpInterval || "10"} giây.
                    </Text>
                  </View>

                  {/* Buttons */}
                  {!isActive ? (
                    <PrimaryButton
                      title="Bắt đầu điểm danh"
                      onPress={handleStartAttendance}
                      loading={loading}
                      disabled={startDisabled}
                    />
                  ) : (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#EF4444",
                        paddingVertical: 14,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={handleStopAttendance}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#FFFFFF",
                          }}
                        >
                          Kết thúc phiên điểm danh
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* RIGHT COLUMN — OTP Display */}
              <View
                style={{
                  flex: isDesktop ? 1 : undefined,
                  width: isDesktop ? undefined : "100%",
                  gap: 16,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 2,
                    minHeight: 460,
                  }}
                >
                  {isActive && otp ? (
                    <View style={{ alignItems: "center", width: "100%" }}>
                      {/* Session badge */}
                      <View
                        style={{
                          backgroundColor: "#EFF6FF",
                          borderRadius: 20,
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                          marginBottom: 24,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <View
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            backgroundColor: "#22C55E",
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#1D4ED8",
                          }}
                        >
                          {sessionInfo?.subjectName || "Đang điểm danh"}
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: "#94A3B8",
                          marginBottom: 16,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Mã OTP điểm danh
                      </Text>

                      {/* OTP code */}
                      <View
                        style={{
                          backgroundColor: "#F0F9FF",
                          paddingHorizontal: isDesktop ? 44 : 28,
                          paddingVertical: 22,
                          borderRadius: 18,
                          borderWidth: 2,
                          borderColor: "#BAE6FD",
                          marginBottom: 28,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: isDesktop ? 56 : 46,
                            fontWeight: "900",
                            color: "#1E40AF",
                            letterSpacing: 10,
                          }}
                        >
                          {otp}
                        </Text>
                      </View>

                      {/* Countdown */}
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#94A3B8",
                          marginBottom: 8,
                        }}
                      >
                        Đổi mã mới sau
                      </Text>
                      <Text
                        style={{
                          fontSize: 36,
                          fontWeight: "800",
                          marginBottom: 16,
                          color:
                            countdown < 5
                              ? "#EF4444"
                              : countdown < 10
                                ? "#F59E0B"
                                : "#16A34A",
                        }}
                      >
                        {countdown}s
                      </Text>

                      {/* Progress bar */}
                      <View
                        style={{
                          width: "75%",
                          height: 6,
                          backgroundColor: "#F1F5F9",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            width: `${progressPercent}%`,
                            height: "100%",
                            borderRadius: 3,
                            backgroundColor:
                              countdown < 5
                                ? "#EF4444"
                                : countdown < 10
                                  ? "#F59E0B"
                                  : "#3B82F6",
                          }}
                        />
                      </View>
                    </View>
                  ) : (
                    <View
                      style={{ alignItems: "center", paddingHorizontal: 20 }}
                    >
                      <View
                        style={{
                          width: 88,
                          height: 88,
                          backgroundColor: "#F1F5F9",
                          borderRadius: 44,
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 20,
                          borderWidth: 1,
                          borderColor: "#E2E8F0",
                        }}
                      >
                        <LockIconFilled size={40} color="#94A3B8" />
                      </View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: "#1E293B",
                          marginBottom: 8,
                        }}
                      >
                        Chưa có phiên điểm danh
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#94A3B8",
                          textAlign: "center",
                          lineHeight: 22,
                        }}
                      >
                        {hasSchedules
                          ? 'Chọn lịch dạy đang diễn ra ở bên trái và nhấn "Bắt đầu điểm danh" để phát mã OTP.'
                          : "Không có lịch dạy hôm nay. Bạn chưa thể tạo phiên điểm danh."}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Live stats — only when session active */}
                {isActive && sessionInfo && (
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      padding: 20,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#64748B",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 14,
                      }}
                    >
                      Thống kê điểm danh — Thời gian thực
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#EFF6FF",
                          borderRadius: 10,
                          padding: 14,
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "#BFDBFE",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "800",
                            color: "#1D4ED8",
                          }}
                        >
                          {sessionInfo.total ?? 0}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#64748B",
                            marginTop: 4,
                            fontWeight: "500",
                          }}
                        >
                          Sĩ số
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#F0FDF4",
                          borderRadius: 10,
                          padding: 14,
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "#BBF7D0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "800",
                            color: "#15803D",
                          }}
                        >
                          {sessionInfo.present ?? 0}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#64748B",
                            marginTop: 4,
                            fontWeight: "500",
                          }}
                        >
                          Có mặt
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#FFFBEB",
                          borderRadius: 10,
                          padding: 14,
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "#FDE68A",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "800",
                            color: "#D97706",
                          }}
                        >
                          {sessionInfo.late ?? 0}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#64748B",
                            marginTop: 4,
                            fontWeight: "500",
                          }}
                        >
                          Đi muộn
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Modern Details Modal */}
          <Modal
            visible={showSummaryModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowSummaryModal(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                justifyContent: "center",
                alignItems: "center",
                padding: isDesktop ? 40 : 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  width: "100%",
                  maxWidth: 640,
                  maxHeight: "90%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.1,
                  shadowRadius: 20,
                  elevation: 10,
                  overflow: "hidden",
                }}
              >
                {/* Modal Header */}
                <View
                  style={{
                    padding: 24,
                    backgroundColor: "#0F172A",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#FFFFFF",
                      }}
                    >
                      Kết Quả Phiên Điểm Danh
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#94A3B8",
                        marginTop: 4,
                      }}
                      numberOfLines={1}
                    >
                      {modalSessionInfo?.subjectName || "Học phần"} — {modalSessionInfo?.className || "Lớp"}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#1E293B",
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#3B82F6",
                      }}
                    >
                      Cổng {modalSessionInfo?.method || "OTP"}
                    </Text>
                  </View>
                </View>

                {/* Quick Stats Grid */}
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: "#E2E8F0",
                    backgroundColor: "#F8FAFC",
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ alignItems: "center", flex: 1 }}>
                    <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>Sĩ Số</Text>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A", marginTop: 4 }}>
                      {modalSessionInfo?.total || 0}
                    </Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: "#E2E8F0" }} />
                  <View style={{ alignItems: "center", flex: 1 }}>
                    <Text style={{ fontSize: 12, color: "#16A34A", fontWeight: "600" }}>Có Mặt</Text>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#16A34A", marginTop: 4 }}>
                      {modalSessionInfo?.present || 0}
                    </Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: "#E2E8F0" }} />
                  <View style={{ alignItems: "center", flex: 1 }}>
                    <Text style={{ fontSize: 12, color: "#D97706", fontWeight: "600" }}>Trễ/Muộn</Text>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#D97706", marginTop: 4 }}>
                      {modalSessionInfo?.late || 0}
                    </Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: "#E2E8F0" }} />
                  <View style={{ alignItems: "center", flex: 1 }}>
                    <Text style={{ fontSize: 12, color: "#DC2626", fontWeight: "600" }}>Vắng</Text>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#DC2626", marginTop: 4 }}>
                      {modalSessionInfo?.absent || 0}
                    </Text>
                  </View>
                </View>

                {/* Tab Selection */}
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: "#E2E8F0",
                    paddingHorizontal: 16,
                  }}
                >
                  {(["PRESENT", "LATE", "ABSENT"] as const).map((tab) => {
                    const label =
                      tab === "PRESENT"
                        ? "Có mặt"
                        : tab === "LATE"
                          ? "Trễ/Muộn"
                          : "Không điểm danh";
                    const color =
                      tab === "PRESENT"
                        ? "#16A34A"
                        : tab === "LATE"
                          ? "#D97706"
                          : "#DC2626";
                    const isActiveTab = activeTab === tab;
                    const count = studentList.filter((s) => s.status === tab).length;

                    return (
                      <TouchableOpacity
                        key={tab}
                        style={{
                          flex: 1,
                          paddingVertical: 14,
                          alignItems: "center",
                          borderBottomWidth: 2,
                          borderBottomColor: isActiveTab ? color : "transparent",
                        }}
                        onPress={() => setActiveTab(tab)}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: isActiveTab ? "700" : "500",
                            color: isActiveTab ? color : "#64748B",
                          }}
                        >
                          {label} ({count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Student Roster List */}
                <View style={{ flex: 1, minHeight: 280, paddingHorizontal: 24, paddingVertical: 12 }}>
                  {loadingModalData ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
                      <ActivityIndicator size="small" color="#3B82F6" />
                      <Text style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>
                        Đang đối chiếu danh sách sinh viên...
                      </Text>
                    </View>
                  ) : (
                    <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }}>
                      {studentList.filter((s) => s.status === activeTab).length === 0 ? (
                        <View style={{ alignItems: "center", paddingVertical: 60 }}>
                          <Text style={{ fontSize: 14, color: "#94A3B8" }}>
                            Không có sinh viên nào trong danh sách này.
                          </Text>
                        </View>
                      ) : (
                        studentList
                          .filter((s) => s.status === activeTab)
                          .map((student, idx) => (
                            <View
                              key={student.studentId + "_" + idx}
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingVertical: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: "#F1F5F9",
                              }}
                            >
                              <View>
                                <Text style={{ fontSize: 14, fontWeight: "600", color: "#0F172A" }}>
                                  {student.studentName}
                                </Text>
                                <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                                  Mã SV: {student.studentId}
                                </Text>
                              </View>
                              <View
                                style={{
                                  backgroundColor:
                                    activeTab === "PRESENT"
                                      ? "#DCFCE7"
                                      : activeTab === "LATE"
                                        ? "#FEF3C7"
                                        : "#FEE2E2",
                                  borderRadius: 6,
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontWeight: "700",
                                    color:
                                      activeTab === "PRESENT"
                                        ? "#15803D"
                                        : activeTab === "LATE"
                                          ? "#B45309"
                                          : "#B91C1C",
                                  }}
                                >
                                  {activeTab === "PRESENT"
                                    ? "CÓ MẶT"
                                    : activeTab === "LATE"
                                      ? "TRỄ"
                                      : "VẮNG"}
                                </Text>
                              </View>
                            </View>
                          ))
                      )}
                    </ScrollView>
                  )}
                </View>

                {/* Modal Actions */}
                <View
                  style={{
                    padding: 24,
                    borderTopWidth: 1,
                    borderTopColor: "#E2E8F0",
                    flexDirection: isDesktop ? "row" : "column-reverse",
                    gap: 12,
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flex: isDesktop ? 1 : undefined,
                      backgroundColor: "#E2E8F0",
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => setShowSummaryModal(false)}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#475569" }}>
                      Đóng
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: isDesktop ? 1.5 : undefined,
                      backgroundColor: "#22C55E",
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 8,
                    }}
                    onPress={handleExportExcel}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
                      Xuất Báo Cáo Excel (Session)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <BottomNavigationSpacer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
