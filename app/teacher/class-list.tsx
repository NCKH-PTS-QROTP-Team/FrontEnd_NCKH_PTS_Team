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
import { classService, reportService, scheduleService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";
import type { Class } from "@/apis/services/class.service";
import type { ClassAttendanceReport, StudentAttendanceReport } from "@/apis/services/report.service";
import type { Schedule } from "@/apis/services/schedule.service";

interface TeacherClassCard {
  id: string;
  code: string;
  name: string;
  subject?: string;
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
        classService.getClasses(teacherId).catch(() => [] as Class[]),
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
          subject: cls.subjectName,
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

          {/* Summary Stats */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                lineHeight: 28,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 20,
              }}
            >
              Tổng quan
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginHorizontal: -8,
              }}
            >
              <View
                style={{
                  width: isMobile ? "50%" : isTablet ? "50%" : "33.333%",
                  paddingHorizontal: 8,
                  marginBottom: isMobile ? 16 : 0,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#EFF6FF",
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      lineHeight: 40,
                      fontWeight: "bold",
                      color: Colors.primary,
                      marginBottom: 4,
                    }}
                  >
                    {summary.totalClasses}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    Tổng lớp học
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: isMobile ? "50%" : isTablet ? "50%" : "33.333%",
                  paddingHorizontal: 8,
                  marginBottom: isMobile ? 16 : 0,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#ECFDF5",
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      lineHeight: 40,
                      fontWeight: "bold",
                      color: Colors.success,
                      marginBottom: 4,
                    }}
                  >
                    {summary.totalStudents}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    Tổng sinh viên
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: isMobile ? "100%" : isTablet ? "100%" : "33.333%",
                  paddingHorizontal: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#F0F9FF",
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      lineHeight: 40,
                      fontWeight: "bold",
                      color: Colors.info,
                      marginBottom: 4,
                    }}
                  >
                    {summary.averageRate}
                    %
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    Tỷ lệ điểm danh TB
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Classes Grid */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -8,
            }}
          >
            {classes.map((classItem) => (
              <View
                key={classItem.id}
                style={{
                  width: isDesktop ? "33.333%" : isTablet ? "50%" : "100%",
                  paddingHorizontal: 8,
                  marginBottom: 16,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleClassPress(classItem)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                    borderLeftWidth: 4,
                    borderLeftColor:
                      classItem.attendanceRate >= 90
                        ? "#10B981"
                        : classItem.attendanceRate >= 75
                          ? "#F59E0B"
                          : "#EF4444",
                  }}
                >
                  {/* Header với code và badge */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#F3F4F6",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#111827",
                        }}
                      >
                        {classItem.code}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor:
                          classItem.attendanceRate >= 90
                            ? "#ECFDF5"
                            : classItem.attendanceRate >= 75
                              ? "#FEF3C7"
                              : "#FEE2E2",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color:
                            classItem.attendanceRate >= 90
                              ? "#10B981"
                              : classItem.attendanceRate >= 75
                                ? "#F59E0B"
                                : "#EF4444",
                        }}
                      >
                        {classItem.attendanceRate}%
                      </Text>
                    </View>
                  </View>

                  {/* Tên môn học */}
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 4,
                      lineHeight: 22,
                    }}
                  >
                    {classItem.name}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}
                  >
                    {classItem.subject}
                  </Text>

                  {/* Thông tin lịch học - Simple text */}
                  <View
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 16,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <CalendarIcon size={14} color="#6B7280" />
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#374151",
                          marginLeft: 8,
                          flex: 1,
                        }}
                      >
                        {classItem.schedule}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                          fontWeight: "600",
                          width: 22,
                          textAlign: "center",
                        }}
                      >
                        <LocationIcon size={14} color="#6B7280" />
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#374151",
                          marginLeft: 8,
                        }}
                      >
                        Phòng {classItem.room}
                      </Text>
                    </View>
                  </View>

                  {/* Stats dạng horizontal pills */}
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#ECFDF5",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#10B981",
                        }}
                      >
                        {classItem.presentCount}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#059669" }}>
                        Có mặt
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: "#FEF3C7",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#F59E0B",
                        }}
                      >
                        {classItem.lateCount}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#D97706" }}>
                        Muộn
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: "#FEE2E2",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#EF4444",
                        }}
                      >
                        {classItem.absentCount}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#DC2626" }}>
                        Vắng
                      </Text>
                    </View>
                  </View>

                  {/* Total students */}
                  <View
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: "#E5E7EB",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UsersIcon size={16} color="#6B7280" />
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        marginLeft: 6,
                        fontWeight: "500",
                      }}
                    >
                      {classItem.totalStudents} sinh viên
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
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
                  {selectedClass?.schedule} • Phòng {selectedClass?.room}
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
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: isMobile ? 16 : 24 }}
            >
              {/* Attendance Summary */}
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 24,
                  marginHorizontal: -6,
                }}
              >
                <View style={{ flex: 1, paddingHorizontal: 6 }}>
                  <View
                    style={{
                      backgroundColor: Colors.successLight,
                      borderRadius: 12,
                      padding: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: Colors.success,
                        marginBottom: 4,
                      }}
                    >
                      {selectedClass?.presentCount ?? 0}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.success }}>
                      Có mặt
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 6 }}>
                  <View
                    style={{
                      backgroundColor: Colors.warningLight,
                      borderRadius: 12,
                      padding: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: Colors.warning,
                        marginBottom: 4,
                      }}
                    >
                      {selectedClass?.lateCount ?? 0}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.warning }}>
                      Muộn
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 6 }}>
                  <View
                    style={{
                      backgroundColor: Colors.errorLight,
                      borderRadius: 12,
                      padding: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: Colors.error,
                        marginBottom: 4,
                      }}
                    >
                      {selectedClass?.absentCount ?? 0}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.error }}>
                      Vắng
                    </Text>
                  </View>
                </View>
              </View>

              {/* Student List */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: Colors.text,
                  marginBottom: 16,
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
                      ? Colors.success
                      : rate >= 75
                        ? Colors.warning
                        : Colors.error;
                  return (
                    <View
                      key={student.studentId}
                      style={{
                        padding: 12,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 8,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: Colors.border,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: Colors.text,
                          }}
                        >
                          {student.studentName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: rateColor,
                          }}
                        >
                          {rate}%
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          color: Colors.textSecondary,
                          marginBottom: 4,
                        }}
                      >
                        MSSV: {student.studentId}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: Colors.textSecondary,
                        }}
                      >
                        Đi học: {student.presentCount} • Vắng:{" "}
                        {student.absentCount} • Muộn: {student.lateCount}
                      </Text>
                    </View>
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
    </SafeAreaView>
  );
}
