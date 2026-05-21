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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { otpService, attendanceService, scheduleService } from "@/apis";
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
    const now = new Date();
    setCustomHour(String(now.getHours()).padStart(2, "0"));
    setCustomMinute(String(now.getMinutes()).padStart(2, "0"));
  }, []);

  useEffect(() => {
    loadData();
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
        setSessionInfo({
          id: otpSession.id,
          classId: otpSession.courseId || otpSession.classId || "",
          classCode: otpSession.classCode || "",
          className:
            otpSession.className || (otpSession as any).courseName || "",
          subjectId: otpSession.subjectId,
          subjectName: otpSession.subjectName || "",
          duration: (otpSession as any).duration,
        });
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
        classId: selectedSchedule.classId,
        classCode: selectedSchedule.classCode,
        className: selectedSchedule.className,
        subjectId: selectedSchedule.subjectId,
        subjectName: selectedSchedule.subjectName,
        duration: intervalVal,
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

  const handleStopAttendance = async () => {
    if (!currentSessionId) return;
    setLoading(true);
    try {
      await attendanceService.completeSession(currentSessionId);
      setIsActive(false); // ← stop countdown immediately
      setOtp("");
      setCountdown(Number(totpInterval) || 10);
      setCurrentSessionId(null);
      setSessionInfo(null);
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
                  minHeight: isDesktop ? 520 : undefined,
                  width: isDesktop ? undefined : "100%",
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
                    height: "100%",
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
              </View>
            </View>
          )}

          <BottomNavigationSpacer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
