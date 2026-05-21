import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/colors";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";
import Tabs from "@/components/Tabs";
import Badge from "@/components/Badge";
import ConfirmDialog, { useConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/ToastProvider";
import { SkeletonCard } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import {
  classService,
  Class,
  ClassStudent,
} from "@/apis/services/class.service";

export default function ClassDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [deleting, setDeleting] = useState(false);
  const { confirm, dialogProps } = useConfirmDialog();
  const { showToast } = useToast();

  useEffect(() => {
    if (id) loadClassData();
  }, [id]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classService.getClassById(id as string);
      setClassData(data);
      // Also load students
      try {
        const studentList = await classService.getStudentsByClass(id as string);
        setStudents(studentList);
      } catch {
        // Students may fail if class has none — that's okay
        setStudents([]);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không tìm thấy lớp học";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!classData) return;
    confirm({
      title: "Xác nhận xóa",
      message: `Bạn có chắc muốn xóa lớp ${classData.code}?`,
      confirmText: "Xóa",
      variant: "danger",
      onConfirm: async () => {
        try {
          setDeleting(true);
          await classService.deleteClass(classData.id);
          showToast("Đã xóa lớp học", "success");
          router.back();
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Không thể xóa lớp học";
          showToast(message, "error");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    if (!classData) return;
    confirm({
      title: "Xóa sinh viên khỏi lớp",
      message: `Bạn có chắc muốn xóa ${studentName} khỏi lớp ${classData.code}?`,
      confirmText: "Xóa",
      variant: "danger",
      onConfirm: async () => {
        try {
          await classService.removeStudentFromClass(classData.id, studentId);
          setStudents((prev) => prev.filter((s) => s.id !== studentId));
          showToast("Đã xóa sinh viên khỏi lớp", "success");
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Không thể xóa sinh viên";
          showToast(message, "error");
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF", padding: 16 }}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (error || !classData) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <ErrorState
          title="Không tìm thấy lớp học"
          message={error || "Lớp học không tồn tại"}
          onRetry={loadClassData}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Tabs
        tabs={[
          { key: "info", label: "Thông tin" },
          { key: "students", label: `Sinh viên (${students.length})` },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            padding: 16,
            maxWidth: 1200,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {activeTab === "info" && (
            <>
              <Card style={{ marginBottom: 16 }}>
                <View style={{ alignItems: "center", paddingVertical: 16 }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      backgroundColor: Colors.primary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "bold",
                        color: Colors.white,
                      }}
                    >
                      {classData.code.substring(0, 2)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      marginBottom: 8,
                      color: Colors.text,
                    }}
                  >
                    {classData.name}
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: Colors.textSecondary }}
                  >
                    {classData.code}
                  </Text>
                </View>
              </Card>

              <Card style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 16,
                    color: Colors.text,
                  }}
                >
                  Chi tiết lớp học
                </Text>

                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 4,
                      color: Colors.textSecondary,
                    }}
                  >
                    Môn học
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: Colors.text,
                    }}
                  >
                    {classData.subjectName || "-"}
                  </Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 4,
                      color: Colors.textSecondary,
                    }}
                  >
                    Giảng viên
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: Colors.text,
                    }}
                  >
                    {classData.teacherName || "-"}
                  </Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 4,
                      color: Colors.textSecondary,
                    }}
                  >
                    Học kỳ
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: Colors.text,
                    }}
                  >
                    {classData.semester || "-"}
                  </Text>
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 4,
                      color: Colors.textSecondary,
                    }}
                  >
                    Số sinh viên
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: Colors.primary,
                    }}
                  >
                    {classData.studentCount ?? students.length} sinh viên
                  </Text>
                </View>
              </Card>

              <Card style={{ marginBottom: 16 }}>
                <PrimaryButton
                  title={deleting ? "Đang xóa..." : "Xóa lớp học"}
                  variant="outline"
                  onPress={handleDelete}
                  disabled={deleting}
                  style={{ borderColor: Colors.error }}
                />
              </Card>
            </>
          )}

          {activeTab === "students" && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{ fontWeight: "500", color: Colors.textSecondary }}
                >
                  {students.length} sinh viên
                </Text>
              </View>

              {students.length === 0 ? (
                <Card style={{ alignItems: "center", padding: 32 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: Colors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    Chưa có sinh viên trong lớp này
                  </Text>
                </Card>
              ) : (
                students.map((student) => (
                  <Card
                    key={student.id}
                    onPress={() =>
                      handleRemoveStudent(student.id, student.name)
                    }
                    style={{ marginBottom: 8 }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: Colors.gray100,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: Colors.primary,
                          }}
                        >
                          {student.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontWeight: "600",
                            fontSize: 14,
                            color: Colors.text,
                            marginBottom: 2,
                          }}
                        >
                          {student.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: Colors.textSecondary,
                            marginBottom: 2,
                          }}
                        >
                          {student.email}
                        </Text>
                        {student.studentId && (
                          <Badge variant="success" size="small">
                            {student.studentId}
                          </Badge>
                        )}
                      </View>
                      <Text style={{ fontSize: 12, color: Colors.error }}>Xóa</Text>
                    </View>
                  </Card>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
      <ConfirmDialog {...dialogProps} />
    </View>
  );
}
