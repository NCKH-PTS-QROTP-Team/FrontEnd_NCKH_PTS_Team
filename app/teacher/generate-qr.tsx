import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { QRViewer } from "@/components/QRViewer";
import { qrService, attendanceService, scheduleService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import { useToast } from "@/components/ToastProvider";
import { QRStatus } from "@/apis/types/qr.types";
import { AttendanceMethod } from "@/apis/types/attendance.types";
import type { Schedule } from "@/apis/services/schedule.service";
import { CalendarIcon, LocationIcon } from "@/components/Icons";

interface SessionInfo {
  id: string;
  courseId: string;
  courseName: string;
  subjectId: string;
  subjectName: string;
  classCode?: string;
  className?: string;
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

export default function GenerateQRScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Custom Settings
  const [durationMinutes, setDurationMinutes] = useState<string>("15");
  const [qrInterval, setQrInterval] = useState<string>("10");
  const [customHour, setCustomHour] = useState<string>("");
  const [customMinute, setCustomMinute] = useState<string>("");

  // States
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [currentQR, setCurrentQR] = useState<any>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [countdown, setCountdown] = useState<number>(10);
  const [isActive, setIsActive] = useState(false);

  const contentMaxWidth = isDesktop ? 1280 : "100%";
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  /** Returns schedule availability state based on current local time */
  const getScheduleAvailability = (schedule: Schedule): ScheduleAvailability => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    if (!schedule.startTime || !schedule.endTime) {
      return { canCreate: false, statusText: "Thiếu dữ liệu thời gian", statusColor: "#78716C", statusBg: "#F5F5F4", dotColor: "#78716C" };
    }

    const [startH, startM] = schedule.startTime.split(":").map(Number);
    const [endH, endM] = schedule.endTime.split(":").map(Number);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
      return { canCreate: false, statusText: "Thiếu dữ liệu thời gian", statusColor: "#78716C", statusBg: "#F5F5F4", dotColor: "#78716C" };
    }

    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (nowMins < startMins) {
      return { canCreate: false, statusText: `Bắt đầu lúc ${schedule.startTime}`, statusColor: "#B45309", statusBg: "#FEF3C7", dotColor: "#F59E0B" };
    }
    if (nowMins > endMins) {
      return { canCreate: false, statusText: "Đã kết thúc", statusColor: "#991B1B", statusBg: "#FEE2E2", dotColor: "#EF4444" };
    }
    return { canCreate: true, statusText: "Đang diễn ra", statusColor: "#14532D", statusBg: "#DCFCE7", dotColor: "#16A34A" };
  };

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

      const sorted = [...schedules].sort((a, b) => a.startTime.localeCompare(b.startTime));
      setTodaySchedules(sorted);

      if (!selectedSchedule) {
        const active = sorted.find((s) => getScheduleAvailability(s).canCreate);
        if (active) setSelectedSchedule(active);
      }
    } catch (error) {
      console.warn("Không tải được lịch dạy hôm nay:", error);
    }
  };

  const loadActiveSession = async () => {
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) return;

      const sessions = await attendanceService.getSessions({ teacherId, active: true });
      const qrSession = sessions.find(
        (s) => s.method === AttendanceMethod.QR && s.status === "ACTIVE"
      );

      if (qrSession) {
        const sess: SessionInfo = {
          id: qrSession.id,
          courseId: qrSession.courseId || qrSession.classId || "",
          courseName: qrSession.courseName || qrSession.className || "",
          subjectId: qrSession.subjectId,
          subjectName: qrSession.subjectName,
          classCode: qrSession.classCode || "",
          className: qrSession.className || "",
          duration: (qrSession as any).duration,
          present: qrSession.present,
          late: qrSession.late,
          absent: qrSession.absent,
          total: qrSession.total,
        };
        setSelectedSession(sess);
        setQrInterval(String((qrSession as any).duration || "10"));
        setIsActive(true);

        try {
          const qr = await qrService.getCurrentQR(qrSession.id);
          if (qr) {
            setCurrentQR(qr);
            const diff = new Date(qr.expiresAt).getTime() - Date.now();
            setCountdown(Math.max(0, Math.floor(diff / 1000)));
          }
        } catch (_) {
          // No QR active yet, generate one
          handleGenerateNewQR(qrSession.id);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải phiên điểm danh:", error);
    }
  };

  // Auto-countdown and QR refresh loop
  useEffect(() => {
    if (isActive && selectedSession) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleGenerateNewQR(selectedSession.id);
            return Number(qrInterval) || 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, selectedSession, qrInterval]);

  const handleGenerateNewQR = async (sessionId: string) => {
    try {
      const teacherId = await getTeacherIdFromToken();
      const qr = await qrService.generateQR({
        sessionId,
        teacherId: teacherId ?? undefined,
        expirySeconds: Number(qrInterval) || 10,
      });
      setCurrentQR(qr);
      setCountdown(Number(qrInterval) || 10);
    } catch (error) {
      console.error("Lỗi khi tạo mã QR mới:", error);
    }
  };

  const handleStartQR = async () => {
    if (!selectedSchedule) {
      showToast("Vui lòng chọn lịch dạy để tạo phiên điểm danh.", "error"); return;
    }
    const avail = getScheduleAvailability(selectedSchedule);
    if (!avail.canCreate) {
      showToast(`Không thể tạo phiên: ${avail.statusText}`, "error"); return;
    }

    const intervalVal = parseInt(qrInterval);
    if (isNaN(intervalVal) || intervalVal < 5) {
      showToast("Chu kỳ QR tối thiểu là 5 giây.", "error"); return;
    }
    const durationVal = parseInt(durationMinutes);
    if (isNaN(durationVal) || durationVal <= 0) {
      showToast("Thời gian điểm danh không hợp lệ.", "error"); return;
    }

    setLoadingQR(true);
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) { showToast("Không tìm thấy thông tin giảng viên.", "error"); return; }

      const existing = await attendanceService.getSessions({ classId: selectedSchedule.classId });
      const anyActive = existing.find((s) => s.status === "ACTIVE");
      if (anyActive) { showToast("Học phần này đang có phiên điểm danh hoạt động.", "error"); setLoadingQR(false); return; }

      const attendedAtDate = new Date();
      const h = parseInt(customHour), m = parseInt(customMinute);
      if (!isNaN(h) && !isNaN(m)) attendedAtDate.setHours(h, m, 0, 0);
      const expiredAtDate = new Date(attendedAtDate.getTime() + durationVal * 60 * 1000);

      const newSession = await attendanceService.createSession({
        courseId: selectedSchedule.classId,
        subjectId: selectedSchedule.subjectId,
        teacherId,
        method: AttendanceMethod.QR,
        duration: intervalVal,
        attendedAt: attendedAtDate.toISOString(),
        expiredAt: expiredAtDate.toISOString(),
        scheduledStartTime: selectedSchedule.startTime,
      });

      const sessionDetails: SessionInfo = {
        id: newSession.id,
        courseId: selectedSchedule.classId,
        courseName: selectedSchedule.className,
        subjectId: selectedSchedule.subjectId,
        subjectName: selectedSchedule.subjectName,
        classCode: selectedSchedule.classCode,
        className: selectedSchedule.className,
        duration: intervalVal,
        present: newSession.present || 0,
        late: newSession.late || 0,
        absent: newSession.absent || 0,
        total: newSession.total || 0,
      };

      setSelectedSession(sessionDetails);
      setIsActive(true);

      const qr = await qrService.generateQR({
        sessionId: newSession.id,
        teacherId: teacherId ?? undefined,
        expirySeconds: intervalVal,
      });
      setCurrentQR(qr);
      setCountdown(intervalVal);

      showToast("Khởi tạo cổng điểm danh QR thành công!", "success");
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Không thể tạo phiên QR.", "error");
    } finally {
      setLoadingQR(false);
    }
  };

  const handleStopQR = async () => {
    if (!selectedSession) return;
    setLoading(true);
    try {
      await attendanceService.completeSession(selectedSession.id);
      setIsActive(false);
      setSelectedSession(null);
      setCurrentQR(null);
      setCountdown(Number(qrInterval) || 10);
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

  const progressPercent = Math.max(0, Math.min(100, (countdown / (Number(qrInterval) || 10)) * 100));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal, paddingVertical: isDesktop ? 32 : 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#3B82F6"]} tintColor="#3B82F6" />
        }
      >
        <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" }}>

          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#0F172A", letterSpacing: 0.2 }}>
              Điểm Danh QR Code Động
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
              Mã QR biến đổi liên tục theo chu kỳ để đảm bảo bảo mật tối đa.
            </Text>
          </View>

          {initialLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={{ color: "#64748B", marginTop: 12 }}>Đang tải lịch dạy...</Text>
            </View>
          ) : (
            <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 20, alignItems: "flex-start" }}>

              {/* LEFT COLUMN */}
              <View style={{ flex: isDesktop ? 1.2 : undefined, gap: 16 }}>

                {/* Schedule List */}
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>
                    Lịch dạy hôm nay — {new Date().toLocaleDateString("vi-VN")}
                  </Text>

                  {todaySchedules.length === 0 ? (
                    <View style={{ backgroundColor: "#F8FAFC", borderRadius: 10, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" }}>
                      <Text style={{ fontSize: 24, marginBottom: 8 }}>📅</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 4 }}>
                        Không có lịch dạy hôm nay
                      </Text>
                      <Text style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center" }}>
                        Bạn không có ca dạy nào vào ngày hôm nay, không thể tạo phiên điểm danh.
                      </Text>
                    </View>
                  ) : (
                    <View style={{ gap: 10 }}>
                      {todaySchedules.map((item) => {
                        const avail = getScheduleAvailability(item);
                        const isSelected = selectedSchedule?.id === item.id;
                        const isRunningSession = selectedSession && (selectedSession.courseId === item.classId || selectedSession.subjectId === item.subjectId);

                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => !isActive && setSelectedSchedule(item)}
                            activeOpacity={isActive ? 1 : 0.7}
                            style={{
                              borderRadius: 12,
                              borderWidth: 2,
                              borderColor: isSelected ? "#3B82F6" : "#E2E8F0",
                              backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                              padding: 14,
                              opacity: isActive && !isRunningSession ? 0.55 : 1,
                            }}
                          >
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A", flex: 1 }} numberOfLines={2}>
                                {item.subjectName}
                              </Text>
                              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: avail.statusBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: avail.dotColor, marginRight: 5 }} />
                                <Text style={{ fontSize: 11, fontWeight: "700", color: avail.statusColor }}>
                                  {avail.statusText}
                                </Text>
                              </View>
                            </View>

                            <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>
                              {item.className} ({item.classCode})
                            </Text>

                            <View style={{ flexDirection: "row", gap: 16 }}>
                              <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <CalendarIcon size={13} color="#94A3B8" />
                                <Text style={{ fontSize: 12, color: "#64748B", marginLeft: 4 }}>
                                  {item.startTime} – {item.endTime}
                                </Text>
                              </View>
                              <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <LocationIcon size={13} color="#94A3B8" />
                                <Text style={{ fontSize: 12, color: "#64748B", marginLeft: 4 }}>
                                  Phòng {item.room}
                                </Text>
                              </View>
                            </View>

                            {isSelected && (
                              <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#3B82F6", marginRight: 6 }} />
                                <Text style={{ fontSize: 12, color: "#3B82F6", fontWeight: "600" }}>Đã chọn để tạo phiên QR</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Config Card */}
                {todaySchedules.length > 0 && (
                  <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 18 }}>
                      Cài đặt phiên điểm danh
                    </Text>

                    {/* Duration Quick Picks */}
                    <View style={{ marginBottom: 18 }}>
                      <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 8, fontWeight: "500" }}>
                        Thời gian mở cổng điểm danh
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {["5", "10", "15", "30", "45"].map((val) => (
                          <TouchableOpacity
                            key={val}
                            disabled={isActive}
                            onPress={() => setDurationMinutes(val)}
                            style={{
                              flex: 1,
                              backgroundColor: durationMinutes === val ? "#3B82F6" : "#F1F5F9",
                              borderWidth: 1,
                              borderColor: durationMinutes === val ? "#3B82F6" : "#E2E8F0",
                              borderRadius: 8,
                              paddingVertical: 9,
                              alignItems: "center",
                              opacity: isActive ? 0.5 : 1,
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: "600", color: durationMinutes === val ? "#FFFFFF" : "#374151" }}>
                              {val}m
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Custom start time */}
                    <View style={{ marginBottom: 18 }}>
                      <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 8, fontWeight: "500" }}>
                        Thời điểm bắt đầu điểm danh
                      </Text>
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Giờ (0-23)</Text>
                          <TextInput
                            value={customHour}
                            onChangeText={setCustomHour}
                            editable={!isActive}
                            keyboardType="numeric"
                            placeholder="HH"
                            maxLength={2}
                            placeholderTextColor="#94A3B8"
                            style={{
                              backgroundColor: "#F8FAFC",
                              borderColor: "#CBD5E1",
                              borderWidth: 1,
                              borderRadius: 8,
                              color: "#0F172A",
                              paddingHorizontal: 12,
                              paddingVertical: 10,
                              textAlign: "center",
                              fontSize: 15,
                              opacity: isActive ? 0.5 : 1,
                            }}
                          />
                        </View>
                        <View style={{ alignSelf: "flex-end", paddingBottom: 10 }}>
                          <Text style={{ fontSize: 18, fontWeight: "700", color: "#94A3B8" }}>:</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>Phút (0-59)</Text>
                          <TextInput
                            value={customMinute}
                            onChangeText={setCustomMinute}
                            editable={!isActive}
                            keyboardType="numeric"
                            placeholder="MM"
                            maxLength={2}
                            placeholderTextColor="#94A3B8"
                            style={{
                              backgroundColor: "#F8FAFC",
                              borderColor: "#CBD5E1",
                              borderWidth: 1,
                              borderRadius: 8,
                              color: "#0F172A",
                              paddingHorizontal: 12,
                              paddingVertical: 10,
                              textAlign: "center",
                              fontSize: 15,
                              opacity: isActive ? 0.5 : 1,
                            }}
                          />
                        </View>
                      </View>
                    </View>

                    {/* QR interval */}
                    <View style={{ marginBottom: 20 }}>
                      <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 8, fontWeight: "500" }}>
                        Chu kỳ biến đổi QR (giây) — tối thiểu 5s
                      </Text>
                      <TextInput
                        value={qrInterval}
                        onChangeText={setQrInterval}
                        editable={!isActive}
                        keyboardType="numeric"
                        placeholderTextColor="#94A3B8"
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderColor: "#CBD5E1",
                          borderWidth: 1,
                          borderRadius: 8,
                          color: "#0F172A",
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          fontSize: 14,
                          opacity: isActive ? 0.5 : 1,
                        }}
                        placeholder="Mặc định: 10"
                      />
                      <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 5 }}>
                        Mã QR tự động thay đổi sau mỗi {qrInterval || "10"} giây.
                      </Text>
                    </View>

                    {/* Buttons */}
                    {!isActive ? (
                      <PrimaryButton
                        title="Bật cổng điểm danh QR"
                        onPress={handleStartQR}
                        loading={loadingQR}
                        disabled={!selectedSchedule || !getScheduleAvailability(selectedSchedule).canCreate}
                      />
                    ) : (
                      <TouchableOpacity
                        style={{ backgroundColor: "#EF4444", paddingVertical: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
                        onPress={handleStopQR}
                        disabled={loading}
                      >
                        {loading ? <ActivityIndicator color="#FFFFFF" /> : (
                          <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>Kết thúc phiên điểm danh</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* RIGHT COLUMN — QR Display */}
              <View style={{ flex: isDesktop ? 1 : undefined, gap: 16 }}>

                {/* QR Viewer */}
                <View style={{
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
                }}>
                  {isActive && currentQR ? (
                    <View style={{ alignItems: "center", width: "100%" }}>
                      {/* Subject badge */}
                      <View style={{ backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 20, flexDirection: "row", alignItems: "center" }}>
                        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#22C55E", marginRight: 7 }} />
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#1D4ED8" }}>
                          {selectedSession?.subjectName}
                        </Text>
                      </View>

                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#94A3B8", marginBottom: 18, textTransform: "uppercase", letterSpacing: 1 }}>
                        Quét mã QR để điểm danh
                      </Text>

                      {/* QR Code */}
                      <View style={{
                        backgroundColor: "#FFFFFF",
                        padding: 14,
                        borderRadius: 16,
                        marginBottom: 24,
                        borderWidth: 1,
                        borderColor: "#BAE6FD",
                        shadowColor: "#3B82F6",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.08,
                        shadowRadius: 16,
                      }}>
                        <QRViewer
                          value={currentQR.token}
                          size={isDesktop ? 260 : 220}
                        />
                      </View>

                      {/* Countdown */}
                      <Text style={{ fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Tự động làm mới sau</Text>
                      <Text style={{
                        fontSize: 34,
                        fontWeight: "800",
                        color: countdown < 5 ? "#EF4444" : countdown < 10 ? "#F59E0B" : "#16A34A",
                        marginBottom: 14,
                      }}>
                        {countdown}s
                      </Text>

                      {/* Progress bar */}
                      <View style={{ width: "70%", height: 5, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                        <View style={{
                          width: `${progressPercent}%`,
                          height: "100%",
                          backgroundColor: countdown < 5 ? "#EF4444" : countdown < 10 ? "#F59E0B" : "#3B82F6",
                          borderRadius: 3,
                        }} />
                      </View>
                    </View>
                  ) : (
                    <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
                      <View style={{ width: 88, height: 88, backgroundColor: "#F1F5F9", borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 20, borderWidth: 1, borderColor: "#E2E8F0" }}>
                        <Text style={{ fontSize: 38 }}>📱</Text>
                      </View>
                      <Text style={{ fontSize: 18, fontWeight: "700", color: "#1E293B", marginBottom: 8 }}>
                        Chưa bật cổng QR
                      </Text>
                      <Text style={{ fontSize: 14, color: "#94A3B8", textAlign: "center", lineHeight: 22 }}>
                        Chọn lịch dạy đang diễn ra ở bên trái và nhấn "Bật cổng điểm danh QR" để bắt đầu.
                      </Text>
                    </View>
                  )}
                </View>

                {/* Live stats */}
                {isActive && selectedSession && (
                  <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>
                      Thống kê điểm danh — Thời gian thực
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <View style={{ flex: 1, backgroundColor: "#EFF6FF", borderRadius: 10, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#BFDBFE" }}>
                        <Text style={{ fontSize: 22, fontWeight: "800", color: "#1D4ED8" }}>{selectedSession.total ?? 0}</Text>
                        <Text style={{ fontSize: 11, color: "#64748B", marginTop: 4, fontWeight: "500" }}>Sĩ số</Text>
                      </View>
                      <View style={{ flex: 1, backgroundColor: "#F0FDF4", borderRadius: 10, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#BBF7D0" }}>
                        <Text style={{ fontSize: 22, fontWeight: "800", color: "#15803D" }}>{selectedSession.present ?? 0}</Text>
                        <Text style={{ fontSize: 11, color: "#64748B", marginTop: 4, fontWeight: "500" }}>Có mặt</Text>
                      </View>
                      <View style={{ flex: 1, backgroundColor: "#FFFBEB", borderRadius: 10, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#FDE68A" }}>
                        <Text style={{ fontSize: 22, fontWeight: "800", color: "#D97706" }}>{selectedSession.late ?? 0}</Text>
                        <Text style={{ fontSize: 11, color: "#64748B", marginTop: 4, fontWeight: "500" }}>Đi muộn</Text>
                      </View>
                    </View>
                  </View>
                )}

              </View>

            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
