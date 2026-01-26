import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "../../../constants/colors";
import { mockClasses, mockStudents } from "../../../constants/mockData";
import AppHeader from "../../../components/AppHeader";
import Card from "../../../components/Card";
import PrimaryButton from "../../../components/PrimaryButton";
import Tabs from "../../../components/Tabs";
import StudentCard from "../../../components/StudentCard";
import AttendanceStatusTag from "../../../components/AttendanceStatusTag";

export default function ClassDetail() {
  const { id } = useLocalSearchParams();
  const classData = mockClasses.find((c) => c.id === id);
  const [activeTab, setActiveTab] = useState("info");

  if (!classData) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text style={{ color: Colors.textSecondary }}>
          Không tìm thấy lớp học
        </Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa lớp ${classData.code}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          alert("Đã xóa lớp học");
          router.back();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <Tabs
        tabs={[
          { key: "info", label: "Thông tin" },
          { key: "students", label: "Sinh viên" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView className="flex-1">
        <View
          className="p-4"
          style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}
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
                      className="text-3xl font-bold"
                      style={{ color: Colors.white }}
                    >
                      {classData.code.substring(0, 2)}
                    </Text>
                  </View>
                  <Text
                    className="text-2xl font-bold mb-2"
                    style={{ color: Colors.text }}
                  >
                    {classData.name}
                  </Text>
                  <Text
                    className="text-base"
                    style={{ color: Colors.textSecondary }}
                  >
                    {classData.code}
                  </Text>
                </View>
              </Card>

              <Card className="mb-4">
                <Text
                  className="text-lg font-semibold mb-4"
                  style={{ color: Colors.text }}
                >
                  Chi tiết lớp học
                </Text>

                <View className="mb-3">
                  <Text
                    className="text-sm mb-1"
                    style={{ color: Colors.textSecondary }}
                  >
                    Môn học
                  </Text>
                  <Text
                    className="text-base font-medium"
                    style={{ color: Colors.text }}
                  >
                    {classData.subject}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text
                    className="text-sm mb-1"
                    style={{ color: Colors.textSecondary }}
                  >
                    Giảng viên
                  </Text>
                  <Text
                    className="text-base font-medium"
                    style={{ color: Colors.text }}
                  >
                    {classData.teacher}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text
                    className="text-sm mb-1"
                    style={{ color: Colors.textSecondary }}
                  >
                    Học kỳ
                  </Text>
                  <Text
                    className="text-base font-medium"
                    style={{ color: Colors.text }}
                  >
                    {classData.semester}
                  </Text>
                </View>

                <View>
                  <Text
                    className="text-sm mb-1"
                    style={{ color: Colors.textSecondary }}
                  >
                    Số sinh viên
                  </Text>
                  <Text
                    className="text-base font-medium"
                    style={{ color: Colors.primary }}
                  >
                    {classData.studentCount} sinh viên
                  </Text>
                </View>
              </Card>

              <Card className="mb-4">
                <PrimaryButton
                  title="Thêm sinh viên"
                  variant="outline"
                  onPress={() => alert("Thêm sinh viên")}
                  className="mb-3"
                />
                <PrimaryButton
                  title="Upload danh sách CSV"
                  variant="outline"
                  onPress={() => alert("Upload CSV")}
                  className="mb-3"
                />
                <PrimaryButton
                  title="Xóa lớp học"
                  variant="outline"
                  onPress={handleDelete}
                  style={{ borderColor: Colors.error }}
                />
              </Card>
            </>
          )}

          {activeTab === "students" && (
            <>
              <View className="flex-row justify-between items-center mb-4">
                <Text
                  className="font-medium"
                  style={{ color: Colors.textSecondary }}
                >
                  {mockStudents.length} sinh viên
                </Text>
                <PrimaryButton
                  title="+ Thêm"
                  onPress={() => alert("Thêm sinh viên")}
                  style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                />
              </View>

              {mockStudents.map((student) => (
                <View key={student.id} style={{ marginBottom: 12 }}>
                  <StudentCard
                    student={student}
                    onPress={() => alert(`Chi tiết ${student.name}`)}
                  />
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
