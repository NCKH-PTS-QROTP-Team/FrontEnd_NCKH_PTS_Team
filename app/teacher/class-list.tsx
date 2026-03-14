import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import PrimaryButton from "@/components/PrimaryButton";
import { CalendarIcon, UsersIcon, LocationIcon, CloseIcon } from "@/components/Icons";
import { Ionicons } from "@expo/vector-icons";
import { classService, reportService, scheduleService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";
import type { Class } from "@/apis/services/class.service";
import type { ClassAttendanceReport, StudentAttendanceReport } from "@/apis/services/report.service";
import type { Schedule } from "@/apis/services/schedule.service";
import type { ScheduleResponse } from "@/apis/types/schedule.types";
import { WeekCalendar } from "@/components/WeekCalendar";

interface TeacherClassCard {
  id: string;
  code: string;
  name: string;
  subject?: string;
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
  const isWeb = Platform.OS === "web";
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
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendanceReport | null>(null);
  const [studentHistoryVisible, setStudentHistoryVisible] = useState(false);
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [studentRecordsLoading, setStudentRecordsLoading] = useState(false);

  // Sub-tab trong modal chi tiết lớp học
  const [modalTab, setModalTab] = useState<'students' | 'schedule'>('students');
  const [classSchedules, setClassSchedules] = useState<Schedule[]>([]);

  // WeekCalendar states cho tab lịch học
  const [scheduleSelectedDate, setScheduleSelectedDate] = useState<Date>(new Date());
  const [scheduleWeekOffset, setScheduleWeekOffset] = useState<number>(0);

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

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

      const [classList, classReports, teacherSchedules] = await Promise.all([
        classService.getClassesByTeacher(teacherId).catch(() => [] as Class[]),
        reportService.getClassReports().catch(
          () => [] as ClassAttendanceReport[],
        ),
        scheduleService
          .getSchedules({ teacherId })
          .catch(() => [] as Schedule[]),
      ]);

      const teacherClassIds = new Set(classList.map((c) => c.id));

      const reportMap = new Map<string, ClassAttendanceReport>();
      classReports
        .filter((r) => teacherClassIds.has(r.classId))
        .forEach((r) => {
          reportMap.set(r.classId, r);
        });

      const scheduleMap = new Map<string, Schedule[]>();
      teacherSchedules.forEach((s) => {
        if (!teacherClassIds.has(s.classId)) return;
        const arr = scheduleMap.get(s.classId) || [];
        arr.push(s);
        scheduleMap.set(s.classId, arr);
      });

      const cards: TeacherClassCard[] = classList.map((cls) => {
        const report = reportMap.get(cls.id);
        const schedules = scheduleMap.get(cls.id) || [];
        const primarySchedule = schedules[0];

        const totalStudents = cls.studentCount || 0;
        const totalPresent = report?.totalPresent || 0;
        const totalAbsent = report?.totalAbsent || 0;
        const totalLate = report?.totalLate || 0;
        const attendanceRate = report
          ? Math.round(report.attendanceRate)
          : 0;

        return {
          id: cls.id,
          code: cls.code,
          name: cls.name,
          subject: cls.subjectName || undefined,
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

  const handleClassPress = (classItem: TeacherClassCard) => {
    setSelectedClass(classItem);
    setModalVisible(true);
    setModalTab('students');
    setScheduleSelectedDate(new Date());
    setScheduleWeekOffset(0);
    loadStudentReports(classItem.id);
    loadClassSchedules(classItem.id);
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

  const loadClassSchedules = async (classId: string) => {
    try {
      const schedules = await scheduleService.getSchedules({ classId });
      setClassSchedules(schedules || []);
    } catch {
      setClassSchedules([]);
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
    setSelectedStudent(student);
    setStudentHistoryVisible(true);
    setStudentRecordsLoading(true);
    try {
      const { attendanceService } = await import('@/apis');
      const records = await attendanceService.getRecords({
        classId: selectedClass?.id,
        studentId: student.studentId,
      });
      setStudentRecords(records || []);
    } catch (error) {
      console.error("Error loading student history:", error);
      showToast("Lỗi khi tải lịch sử điểm danh", "error");
    } finally {
      setStudentRecordsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return '#10b981';
      case 'LATE': return '#f59e0b';
      case 'ABSENT': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'Có mặt';
      case 'LATE': return 'Muộn';
      case 'ABSENT': return 'Vắng';
      default: return 'Không rõ';
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: Colors.textSecondary }}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal, paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              maxWidth: contentMaxWidth,
              width: "100%",
              alignSelf: "center",
            }}
          >
            {/* Page Title - Removed since it's redundant with AppHeader */}

            {/* ── Hero Overview Bar ────────────────────────────────────── */}
            <View
              style={{
                backgroundColor: '#0891b2',
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                shadowColor: '#0891b2',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.32,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              {/* Header row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="school" size={28} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 }}>
                    Danh sách lớp học
                  </Text>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                    {summary.totalClasses} lớp • {summary.totalStudents} sinh viên
                  </Text>
                </View>
                {/* Big rate badge */}
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: 'rgba(255,255,255,0.35)',
                  }}
                >
                  <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>
                    {summary.averageRate}%
                  </Text>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>
                    Điểm danh TB
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
                    Tỷ lệ điểm danh trung bình
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                    {summary.averageRate}%
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${Math.min(summary.averageRate, 100)}%`,
                      backgroundColor: summary.averageRate >= 90
                        ? '#34d399'
                        : summary.averageRate >= 75
                          ? '#fbbf24'
                          : '#f87171',
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>

              {/* Quick stats 3 columns */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 14,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                {[
                  { label: 'Tổng lớp', value: String(summary.totalClasses), icon: 'grid' as const },
                  { label: 'Sinh viên', value: String(summary.totalStudents), icon: 'people' as const },
                  { label: 'Điểm danh TB', value: `${summary.averageRate}%`, icon: 'pie-chart' as const },
                ].map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      borderLeftWidth: idx > 0 ? 1 : 0,
                      borderLeftColor: 'rgba(255,255,255,0.25)',
                      gap: 4,
                    }}
                  >
                    <Ionicons name={item.icon} size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>
                      {item.value}
                    </Text>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Classes List */}
            <View style={{
              flexDirection: isMobile ? "column" : "row",
              flexWrap: isMobile ? "nowrap" : "wrap",
              gap: 16
            }}>
              {classes.map((classItem, index) => {
                // Accent color cycle for variety
                const accentColors = [
                  { main: '#6366f1', bg: '#eef2ff', light: '#e0e7ff' }, // indigo
                  { main: '#3b82f6', bg: '#eff6ff', light: '#dbeafe' }, // blue
                  { main: '#8b5cf6', bg: '#f5f3ff', light: '#ede9fe' }, // violet
                  { main: '#0ea5e9', bg: '#f0f9ff', light: '#e0f2fe' }, // sky
                  { main: '#10b981', bg: '#ecfdf5', light: '#d1fae5' }, // emerald
                ];
                const accent = accentColors[index % accentColors.length];
                const rate = classItem.attendanceRate || 0;
                const rateColor = rate >= 90 ? '#10b981' : rate >= 75 ? '#f59e0b' : '#ef4444';
                const rateBg = rate >= 90 ? '#ecfdf5' : rate >= 75 ? '#fffbeb' : '#fef2f2';
                const initial = (classItem.name || '?').trim().charAt(0).toUpperCase();

                return (
                  <View
                    key={classItem.id}
                    style={{
                      width: isDesktop ? '31.5%' : isTablet ? '48%' : '100%',
                      flexGrow: isDesktop || isTablet ? 1 : 0,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleClassPress(classItem)}
                      activeOpacity={0.75}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: '#f1f5f9',
                        shadowColor: accent.main,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 3,
                        overflow: 'hidden',
                      }}
                    >
                      {/* ── Top accent bar ────────────────────────── */}
                      <View style={{ height: 4, backgroundColor: accent.main }} />

                      {/* ── Card body ─────────────────────────────── */}
                      <View style={{ padding: 16 }}>

                        {/* Header row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          {/* Avatar */}
                          <View
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 14,
                              backgroundColor: accent.bg,
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              borderWidth: 1.5,
                              borderColor: accent.light,
                            }}
                          >
                            <Text style={{ fontSize: 22, fontWeight: '800', color: accent.main }}>
                              {initial}
                            </Text>
                          </View>

                          {/* Name + badges */}
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{ fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 5 }}
                              numberOfLines={1}
                            >
                              {classItem.name}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                              {/* Code badge */}
                              <View
                                style={{
                                  backgroundColor: accent.bg,
                                  borderRadius: 6,
                                  paddingHorizontal: 8,
                                  paddingVertical: 3,
                                  borderWidth: 1,
                                  borderColor: accent.light,
                                }}
                              >
                                <Text style={{ fontSize: 11, fontWeight: '700', color: accent.main }}>
                                  {classItem.code}
                                </Text>
                              </View>
                              {/* Semester badge */}
                              {classItem.semester && (
                                <View
                                  style={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 6,
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderWidth: 1,
                                    borderColor: '#e2e8f0',
                                  }}
                                >
                                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b' }}>
                                    {classItem.semester}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>

                          {/* Rate ring */}
                          <View
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 26,
                              backgroundColor: rateBg,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 2.5,
                              borderColor: rateColor + '35',
                              flexShrink: 0,
                            }}
                          >
                            <Text style={{ fontSize: 14, fontWeight: '800', color: rateColor }}>
                              {rate}%
                            </Text>
                          </View>
                        </View>

                        {/* Meta info row */}
                        <View style={{ gap: 4, marginBottom: 14 }}>
                          {classItem.subject && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Ionicons name="book-outline" size={13} color="#94a3b8" />
                              <Text style={{ fontSize: 12, color: '#64748b', flex: 1 }} numberOfLines={1}>
                                {classItem.subject}
                              </Text>
                            </View>
                          )}
                          <View style={{ flexDirection: 'row', gap: 14 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
                              <Ionicons name="calendar-outline" size={13} color="#94a3b8" />
                              <Text style={{ fontSize: 12, color: '#64748b' }} numberOfLines={1}>
                                {classItem.scheduleText || 'Chưa có lịch'}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                              <Ionicons name="location-outline" size={13} color="#94a3b8" />
                              <Text style={{ fontSize: 12, color: '#64748b' }}>
                                {classItem.room || '—'}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* ── Progress bar ───────────────────────── */}
                        <View style={{ marginBottom: 14 }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 6,
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>
                              Tỷ lệ điểm danh
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: rateColor }}>
                              {rate}%
                            </Text>
                          </View>
                          <View
                            style={{
                              height: 7,
                              backgroundColor: '#e2e8f0',
                              borderRadius: 4,
                              overflow: 'hidden',
                            }}
                          >
                            <View
                              style={{
                                height: '100%',
                                width: `${Math.min(rate, 100)}%`,
                                backgroundColor: rateColor,
                                borderRadius: 4,
                              }}
                            />
                          </View>
                        </View>

                        {/* ── Stats row ────────────────────────────── */}
                        <View
                          style={{
                            flexDirection: 'row',
                            backgroundColor: '#f8fafc',
                            borderRadius: 12,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                          }}
                        >
                          {[
                            {
                              label: 'Sinh viên',
                              value: classItem.totalStudents || 0,
                              icon: 'people' as const,
                              color: accent.main,
                            },
                            {
                              label: 'Có mặt',
                              value: classItem.presentCount || 0,
                              icon: 'checkmark-circle' as const,
                              color: '#10b981',
                            },
                            {
                              label: 'Vắng',
                              value: classItem.absentCount || 0,
                              icon: 'close-circle' as const,
                              color: '#ef4444',
                            },
                          ].map((s, idx) => (
                            <View
                              key={s.label}
                              style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingVertical: 10,
                                paddingHorizontal: 4,
                                borderLeftWidth: idx > 0 ? 1 : 0,
                                borderLeftColor: '#e2e8f0',
                              }}
                            >
                              <Ionicons name={s.icon} size={16} color={s.color} style={{ marginBottom: 3 }} />
                              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b' }}>
                                {s.value}
                              </Text>
                              <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                                {s.label}
                              </Text>
                            </View>
                          ))}
                        </View>

                      </View>

                      {/* ── Footer CTA ────────────────────────────── */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          paddingVertical: 11,
                          borderTopWidth: 1,
                          borderTopColor: '#f1f5f9',
                          backgroundColor: accent.bg + 'aa',
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: accent.main }}>
                          Xem chi tiết
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color={accent.main} />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
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

            {/* Modal Sub-tabs */}
            <View
              style={{
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
                paddingHorizontal: isMobile ? 16 : 24,
              }}
            >
              {(['students', 'schedule'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setModalTab(tab)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 4,
                    marginRight: 24,
                    borderBottomWidth: 2,
                    borderBottomColor: modalTab === tab ? '#3b82f6' : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: modalTab === tab ? '#3b82f6' : '#94a3b8',
                    }}
                  >
                    {tab === 'students' ? 'Sinh viên' : 'Lịch học'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Modal Content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: isMobile ? 16 : 24 }}
            >
              {/* Stats Cards - Department style */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  marginBottom: 20,
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { label: 'Có mặt', value: selectedClass?.presentCount ?? 0, icon: 'checkmark-circle', color: '#10b981', bg: '#ecfdf5' },
                  { label: 'Muộn', value: selectedClass?.lateCount ?? 0, icon: 'time', color: '#f59e0b', bg: '#fffbeb' },
                  { label: 'Vắng', value: selectedClass?.absentCount ?? 0, icon: 'close-circle', color: '#ef4444', bg: '#fef2f2' },
                ].map((s) => (
                  <View
                    key={s.label}
                    style={{
                      flex: 1,
                      minWidth: 80,
                      backgroundColor: '#fff',
                      borderRadius: 14,
                      padding: 14,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: s.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons name={s.icon as any} size={20} color={s.color} />
                    </View>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 2 }}>{s.value}</Text>
                    <Text style={{ fontSize: 12, color: '#64748b' }}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {modalTab === 'students' ? (
                <>
                  {/* Student List */}
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: Colors.text,
                      marginBottom: 12,
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
                      const rateColor =
                        rate >= 90
                          ? "#10b981"
                          : rate >= 75
                            ? "#f59e0b"
                            : "#ef4444";
                      const avatarColor =
                        rate >= 90
                          ? "#dcfce7"
                          : rate >= 75
                            ? "#fef3c7"
                            : "#fee2e2";
                      return (
                        <View
                          key={student.studentId}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 12,
                            paddingHorizontal: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: "#f8fafc",
                            gap: 12,
                            backgroundColor: "#fff",
                            borderRadius: 10,
                            marginBottom: 8,
                            borderWidth: 1,
                            borderColor: '#f1f5f9',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.04,
                            shadowRadius: 4,
                            elevation: 1,
                          }}
                        >
                          {/* Avatar */}
                          <View
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 12,
                              backgroundColor: avatarColor,
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Text style={{ fontSize: 16, fontWeight: "700", color: rateColor }}>
                              {student.studentName.trim().charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          {/* Info */}
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }} numberOfLines={1}>
                              {student.studentName}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                              MSSV: {student.studentId}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                              <Text style={{ fontSize: 11, color: '#10b981', fontWeight: '700' }}>✓ {student.presentCount}</Text>
                              <Text style={{ fontSize: 11, color: '#f59e0b', fontWeight: '700' }}>◔ {student.lateCount}</Text>
                              <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: '700' }}>× {student.absentCount}</Text>
                            </View>
                          </View>
                          {/* Rate badge */}
                          <View style={{ alignItems: 'center', gap: 8 }}>
                            <View
                              style={{
                                backgroundColor: rateColor + '18',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 8,
                              }}
                            >
                              <Text style={{ fontSize: 13, fontWeight: '800', color: rateColor }}>{rate}%</Text>
                            </View>
                            {/* Eye button */}
                            <TouchableOpacity
                              onPress={() => handleStudentPress(student)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: '#eff6ff',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Ionicons name="eye-outline" size={16} color="#3b82f6" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                </>
              ) : (
                <>
                  {/* WeekCalendar */}
                  <WeekCalendar
                    schedules={classSchedules.map(s => ({
                      ...s,
                      classId: s.classId ?? null,
                      classCode: s.classCode ?? null,
                      className: s.className ?? null,
                      subjectId: s.subjectId ?? null,
                      subjectCode: s.subjectCode ?? null,
                      subjectName: s.subjectName ?? null,
                      teacherId: s.teacherId ?? null,
                      teacherName: s.teacherName ?? null,
                      // Schedule service dùng 1-7 (T2–CN), WeekCalendar dùng 2–8 (T2–CN)
                      dayOfWeek: s.dayOfWeek != null
                        ? (s.dayOfWeek === 7 ? 8 : s.dayOfWeek + 1)
                        : null,
                      startTime: s.startTime ?? null,
                      endTime: s.endTime ?? null,
                      room: s.room ?? null,
                      startDate: s.startDate ?? null,
                      endDate: s.endDate ?? null,
                    }) as import('@/apis/types/schedule.types').ScheduleResponse)}
                    selectedDate={scheduleSelectedDate}
                    setSelectedDate={setScheduleSelectedDate}
                    weekOffset={scheduleWeekOffset}
                    setWeekOffset={setScheduleWeekOffset}
                  />

                  {/* Lịch của ngày đã chọn */}
                  {(() => {
                    // WeekCalendar dùng dow 2–8; schedule.service dùng 1–7
                    const jsDay = scheduleSelectedDate.getDay(); // 0=CN,1=T2,...6=T7
                    // convert jsDay -> schedule.service dayOfWeek (1=T2,...,7=CN)
                    const svcDow = jsDay === 0 ? 7 : jsDay;
                    const selStr = scheduleSelectedDate.toISOString().slice(0, 10); // yyyy-MM-dd

                    const filtered = classSchedules.filter(s => {
                      // Case 1: Backend trả về từng buổi học riêng lẻ (có field `date`)
                      // → khớp chính xác với ngày chọn
                      if (s.date) {
                        return s.date === selStr;
                      }

                      // Case 2: Lịch lặp lại theo tuần (không có `date`)
                      // → kiểm tra thứ + khoảng thời gian + excludedDates
                      if (s.dayOfWeek !== svcDow) return false;
                      if (s.startDate && selStr < s.startDate) return false;
                      if (s.endDate && selStr > s.endDate) return false;
                      if (s.excludedDates?.includes(selStr)) return false;
                      return true;
                    });

                    // Loại duplicate theo ID (đề phòng API trả về trùng)
                    const seen = new Set<string>();
                    const unique = filtered.filter(s => {
                      if (seen.has(s.id)) return false;
                      seen.add(s.id);
                      return true;
                    });
                    const dayMap: Record<number, string> = { 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 7: 'Chủ nhật' };

                    if (unique.length === 0) {
                      return (
                        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                          <Ionicons name="calendar-outline" size={42} color="#cbd5e1" />
                          <Text style={{ color: '#94a3b8', marginTop: 10, textAlign: 'center' }}>
                            Không có lịch học{'\n'}vào {scheduleSelectedDate.toLocaleDateString('vi-VN')}
                          </Text>
                        </View>
                      );
                    }

                    return (
                      <View style={{ gap: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 4 }}>
                          {scheduleSelectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </Text>
                        {unique.map((s, i) => (
                          <View
                            key={s.id || i}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: 14,
                              backgroundColor: '#fff',
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: '#e0f2fe',
                              borderLeftWidth: 4,
                              borderLeftColor: '#0ea5e9',
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.04,
                              shadowRadius: 4,
                              elevation: 1,
                              gap: 14,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>
                                {dayMap[s.dayOfWeek] || ''}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <Ionicons name="time-outline" size={13} color="#0ea5e9" />
                                <Text style={{ fontSize: 13, color: '#0ea5e9', fontWeight: '600' }}>
                                  {s.startTime} – {s.endTime}
                                </Text>
                              </View>
                              {s.room && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                  <Ionicons name="location-outline" size={13} color="#94a3b8" />
                                  <Text style={{ fontSize: 12, color: '#64748b' }}>Phòng {s.room}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    );
                  })()}
                </>
              )}
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 8,
              paddingTop: 16,
            }}
          >
            <View style={{ width: 40, height: 4, backgroundColor: '#cbd5e1', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

            <View style={{ paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b' }}>
                Chi tiết điểm danh
              </Text>
              <TouchableOpacity onPress={handleCloseHistoryModal} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <CloseIcon size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#3b82f6' }}>{selectedStudent?.studentName?.trim().charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }} numberOfLines={1}>{selectedStudent?.studentName}</Text>
                <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>MSSV: {selectedStudent?.studentId}</Text>
              </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              {studentRecordsLoading ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Text style={{ color: '#64748b' }}>Đang tải lịch sử...</Text>
                </View>
              ) : studentRecords.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                  <Text style={{ color: '#94a3b8', marginTop: 12, textAlign: 'center' }}>Chưa có bản ghi điểm danh nào{'\n'}cho sinh viên này</Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {studentRecords.map((r, i) => {
                    const date = new Date(r.createdAt || r.attendedAt || Date.now());
                    const statusColor = getStatusColor(r.status);
                    const statusLabel = getStatusLabel(r.status);

                    return (
                      <View key={r.id || i} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: statusColor + '15', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Ionicons name={
                            r.status === 'PRESENT' ? 'checkmark' :
                              r.status === 'LATE' ? 'time' :
                                'close'
                          } size={20} color={statusColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 2 }}>{date.toLocaleDateString('vi-VN')}</Text>
                          <Text style={{ fontSize: 12, color: '#64748b' }}>{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • QUA {r.method || '---'}</Text>
                        </View>
                        <View style={{ backgroundColor: statusColor + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: statusColor }}>{statusLabel}</Text>
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
    </SafeAreaView >
  );
}
