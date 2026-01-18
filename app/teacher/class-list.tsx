import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppHeader } from "@/components/AppHeader";
import { StudentCard } from "@/components/StudentCard";
import { Colors } from "@/constants/colors";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import PrimaryButton from "@/components/PrimaryButton";

// Mock data cho các lớp học
const mockClasses = [
  {
    id: 1,
    code: "CS101",
    name: "Lập trình cơ bản",
    subject: "Khoa học máy tính",
    schedule: "Thứ 2, 7:00 - 9:00",
    room: "A101",
    totalStudents: 45,
    presentCount: 38,
    lateCount: 5,
    absentCount: 2,
    attendanceRate: 84,
    students: [
      { id: 1, name: "Nguyễn Văn A", studentId: "SV001", status: "present" },
      { id: 2, name: "Trần Thị B", studentId: "SV002", status: "present" },
      { id: 3, name: "Lê Văn C", studentId: "SV003", status: "late" },
      { id: 4, name: "Phạm Thị D", studentId: "SV004", status: "absent" },
      { id: 5, name: "Hoàng Văn E", studentId: "SV005", status: "present" },
    ],
  },
  {
    id: 2,
    code: "CS201",
    name: "Cấu trúc dữ liệu",
    subject: "Khoa học máy tính",
    schedule: "Thứ 3, 9:00 - 11:00",
    room: "B202",
    totalStudents: 40,
    presentCount: 35,
    lateCount: 3,
    absentCount: 2,
    attendanceRate: 88,
    students: [
      { id: 6, name: "Đỗ Văn F", studentId: "SV006", status: "present" },
      { id: 7, name: "Vũ Thị G", studentId: "SV007", status: "present" },
      { id: 8, name: "Bùi Văn H", studentId: "SV008", status: "late" },
      { id: 9, name: "Ngô Thị I", studentId: "SV009", status: "present" },
    ],
  },
  {
    id: 3,
    code: "CS301",
    name: "Cơ sở dữ liệu",
    subject: "Khoa học máy tính",
    schedule: "Thứ 4, 13:00 - 15:00",
    room: "C303",
    totalStudents: 38,
    presentCount: 30,
    lateCount: 4,
    absentCount: 4,
    attendanceRate: 79,
    students: [
      { id: 10, name: "Lý Văn J", studentId: "SV010", status: "present" },
      { id: 11, name: "Đinh Thị K", studentId: "SV011", status: "absent" },
      { id: 12, name: "Phan Văn L", studentId: "SV012", status: "late" },
    ],
  },
  {
    id: 4,
    code: "CS401",
    name: "Lập trình Web",
    subject: "Khoa học máy tính",
    schedule: "Thứ 5, 15:00 - 17:00",
    room: "D404",
    totalStudents: 42,
    presentCount: 40,
    lateCount: 2,
    absentCount: 0,
    attendanceRate: 95,
    students: [
      { id: 13, name: "Trịnh Văn M", studentId: "SV013", status: "present" },
      { id: 14, name: "Mai Thị N", studentId: "SV014", status: "present" },
      { id: 15, name: "Dương Văn O", studentId: "SV015", status: "late" },
    ],
  },
  {
    id: 5,
    code: "CS501",
    name: "Trí tuệ nhân tạo",
    subject: "Khoa học máy tính",
    schedule: "Thứ 6, 7:00 - 9:00",
    room: "E505",
    totalStudents: 35,
    presentCount: 32,
    lateCount: 2,
    absentCount: 1,
    attendanceRate: 91,
    students: [
      { id: 16, name: "Cao Văn P", studentId: "SV016", status: "present" },
      { id: 17, name: "Tô Thị Q", studentId: "SV017", status: "present" },
      { id: 18, name: "Hồ Văn R", studentId: "SV018", status: "absent" },
    ],
  },
  {
    id: 6,
    code: "CS102",
    name: "Lập trình hướng đối tượng",
    subject: "Khoa học máy tính",
    schedule: "Thứ 2, 13:00 - 15:00",
    room: "F101",
    totalStudents: 44,
    presentCount: 36,
    lateCount: 6,
    absentCount: 2,
    attendanceRate: 82,
    students: [
      { id: 19, name: "Võ Văn S", studentId: "SV019", status: "present" },
      { id: 20, name: "Tạ Thị T", studentId: "SV020", status: "late" },
    ],
  },
];

export default function ClassListScreen() {
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const [selectedClass, setSelectedClass] = useState<
    (typeof mockClasses)[0] | null
  >(null);
  const [modalVisible, setModalVisible] = useState(false);

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  const handleClassPress = (classItem: (typeof mockClasses)[0]) => {
    setSelectedClass(classItem);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedClass(null), 300);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return { variant: "success" as const, label: "Có mặt" };
      case "late":
        return { variant: "warning" as const, label: "Muộn" };
      case "absent":
        return { variant: "error" as const, label: "Vắng" };
      default:
        return { variant: "neutral" as const, label: "Chưa điểm danh" };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />
      <AppHeader title="Danh sách lớp học" showBack showLogout={!isWeb} />

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
              flexDirection: isMobile ? "column" : "row",
              marginBottom: 24,
              marginHorizontal: -8,
              gap: isMobile ? 8 : 0,
            }}
          >
            <View
              style={{
                flex: isMobile ? undefined : 1,
                paddingHorizontal: 8,
                marginBottom: isMobile ? 8 : 0,
              }}
            >
              <Card>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: Colors.primary,
                    marginBottom: 4,
                  }}
                >
                  {mockClasses.length}
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                  Tổng lớp học
                </Text>
              </Card>
            </View>
            <View
              style={{
                flex: isMobile ? undefined : 1,
                paddingHorizontal: 8,
                marginBottom: isMobile ? 8 : 0,
              }}
            >
              <Card>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: Colors.success,
                    marginBottom: 4,
                  }}
                >
                  {mockClasses.reduce((sum, c) => sum + c.totalStudents, 0)}
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                  Tổng sinh viên
                </Text>
              </Card>
            </View>
            <View
              style={{
                flex: isMobile ? undefined : 1,
                paddingHorizontal: 8,
                marginBottom: isMobile ? 8 : 0,
              }}
            >
              <Card>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: Colors.info,
                    marginBottom: 4,
                  }}
                >
                  {Math.round(
                    mockClasses.reduce((sum, c) => sum + c.attendanceRate, 0) /
                      mockClasses.length
                  )}
                  %
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                  Tỷ lệ điểm danh TB
                </Text>
              </Card>
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
            {mockClasses.map((classItem) => (
              <View
                key={classItem.id}
                style={{
                  width: isDesktop ? "33.333%" : isTablet ? "50%" : "100%",
                  paddingHorizontal: 8,
                  marginBottom: 16,
                }}
              >
                <Card onPress={() => handleClassPress(classItem)}>
                  {/* Class Header */}
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          color: Colors.text,
                        }}
                      >
                        {classItem.code}
                      </Text>
                      <Badge
                        variant={
                          classItem.attendanceRate >= 90
                            ? "success"
                            : classItem.attendanceRate >= 75
                            ? "warning"
                            : "error"
                        }
                        size="small"
                      >
                        {classItem.attendanceRate}%
                      </Badge>
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors.text,
                        marginBottom: 4,
                      }}
                    >
                      {classItem.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                      {classItem.subject}
                    </Text>
                  </View>

                  {/* Schedule Info */}
                  <View
                    style={{
                      marginBottom: 12,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: Colors.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: Colors.textSecondary,
                          marginRight: 4,
                        }}
                      >
                        🕐
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: Colors.textSecondary }}
                      >
                        {classItem.schedule}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: Colors.textSecondary,
                          marginRight: 4,
                        }}
                      >
                        📍
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: Colors.textSecondary }}
                      >
                        Phòng {classItem.room}
                      </Text>
                    </View>
                  </View>

                  {/* Attendance Stats */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ alignItems: "center", flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: Colors.success,
                          marginBottom: 2,
                        }}
                      >
                        {classItem.presentCount}
                      </Text>
                      <Text
                        style={{ fontSize: 11, color: Colors.textSecondary }}
                      >
                        Có mặt
                      </Text>
                    </View>
                    <View
                      style={{
                        alignItems: "center",
                        flex: 1,
                        borderLeftWidth: 1,
                        borderRightWidth: 1,
                        borderColor: Colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: Colors.warning,
                          marginBottom: 2,
                        }}
                      >
                        {classItem.lateCount}
                      </Text>
                      <Text
                        style={{ fontSize: 11, color: Colors.textSecondary }}
                      >
                        Muộn
                      </Text>
                    </View>
                    <View style={{ alignItems: "center", flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: Colors.error,
                          marginBottom: 2,
                        }}
                      >
                        {classItem.absentCount}
                      </Text>
                      <Text
                        style={{ fontSize: 11, color: Colors.textSecondary }}
                      >
                        Vắng
                      </Text>
                    </View>
                  </View>

                  {/* Student Count */}
                  <View
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: Colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: Colors.textSecondary,
                        textAlign: "center",
                      }}
                    >
                      👥 {classItem.totalStudents} sinh viên
                    </Text>
                  </View>
                </Card>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

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
                <Text style={{ fontSize: 18, color: Colors.gray700 }}>✕</Text>
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
                      {selectedClass?.presentCount}
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
                      {selectedClass?.lateCount}
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
                      {selectedClass?.absentCount}
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
                Danh sách sinh viên ({selectedClass?.students.length})
              </Text>

              {selectedClass?.students.map((student) => {
                const badge = getStatusBadge(student.status);
                return (
                  <View
                    key={student.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 12,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: Colors.border,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: Colors.text,
                          marginBottom: 4,
                        }}
                      >
                        {student.name}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: Colors.textSecondary }}
                      >
                        MSSV: {student.studentId}
                      </Text>
                    </View>
                    <Badge variant={badge.variant} size="small">
                      {badge.label}
                    </Badge>
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
