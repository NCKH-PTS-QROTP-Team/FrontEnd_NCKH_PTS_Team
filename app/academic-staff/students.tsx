import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { PrimaryButton } from "@/components/PrimaryButton";
import DataTable from "@/components/DataTable";
import {
  EmptyUsersIcon,
  EmptySearchIcon,
} from "@/components/EmptyStateIllustration";
import { UsersIcon, UploadIcon } from "@/components/Icons";
import Toast, { useToast } from "@/components/Toast";
import { userService, User } from "@/apis";

export default function StudentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const showTable = isDesktop || isTablet;
  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await userService.getStudents();
      setStudents(data);
    } catch (error: any) {
      console.error("Error loading students:", error);
      showToast(
        error.message || "Không thể tải danh sách sinh viên",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = students.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.studentId &&
        user.studentId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleImportStudents = () => {
    router.push("/academic-staff/import?type=students" as any);
  };

  const tableColumns = [
    { key: "studentId", label: "Mã SV", width: 100 },
    { key: "name", label: "Họ tên", width: 200 },
    { key: "email", label: "Email", width: 200 },
    { key: "classId", label: "Lớp", width: 120 },
    { key: "actions", label: "Thao tác", width: 120 },
  ];

  const tableData = filteredUsers.map((user) => ({
    studentId: user.studentId || "-",
    name: user.name,
    email: user.email,
    classId: user.classId || "Chưa phân lớp",
    actions: (
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          onPress={() => {
            router.push(`/academic-staff/students/${user.id}` as any);
          }}
          style={{
            padding: 6,
            backgroundColor: Colors.primary + "15",
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 12, color: Colors.primary }}>Xem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push(`/academic-staff/students/${user.id}/edit` as any);
          }}
          style={{
            padding: 6,
            backgroundColor: Colors.warning + "15",
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 12, color: Colors.warning }}>Sửa</Text>
        </TouchableOpacity>
      </View>
    ),
  }));

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal,
            paddingVertical,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Page Title */}
          <Text
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: "600",
              marginBottom: isMobile ? 16 : 24,
              color: Colors.text,
            }}
          >
            Quản lý sinh viên
          </Text>

          {/* Actions */}
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <PrimaryButton
              title="+ Thêm sinh viên"
              onPress={() => router.push("/academic-staff/students/create" as any)}
              style={{ flex: isMobile ? undefined : 1 }}
            />
            <PrimaryButton
              title={
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <UploadIcon size={16} color="#FFF" />
                  <Text style={{ color: "#FFF" }}>Import từ Excel</Text>
                </View>
              }
              variant="outline"
              onPress={handleImportStudents}
              style={{ flex: isMobile ? undefined : 1 }}
            />
          </View>

          {/* Search */}
          <TextInput
            style={{
              height: isMobile ? 44 : 48,
              borderWidth: 2,
              borderColor: Colors.gray200,
              borderRadius: 8,
              paddingHorizontal: isMobile ? 12 : 16,
              marginBottom: isMobile ? 12 : 16,
              color: Colors.text,
              lineHeight: 24,
              fontSize: isMobile ? 14 : 16,
              ...Platform.select({
                web: { outlineStyle: "none" as any },
              }),
            }}
            placeholder="Tìm kiếm theo mã SV, tên, email..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Loading State */}
          {loading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 48,
              }}
            >
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Đang tải danh sách sinh viên...
              </Text>
            </View>
          ) : filteredUsers.length > 0 ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 12,
                  color: Colors.textSecondary,
                }}
              >
                Tìm thấy {filteredUsers.length} sinh viên
              </Text>

              {showTable ? (
                <DataTable
                  columns={tableColumns}
                  data={tableData}
                  zebraStriping={true}
                  stickyHeader={true}
                />
              ) : (
                <>
                  {filteredUsers.map((user) => (
                    <Card
                      key={user.id}
                      onPress={() => {
                        router.push(`/academic-staff/students/${user.id}` as any);
                      }}
                      style={{ marginBottom: 8 }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: Colors.primary + "15",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <UsersIcon size={24} color={Colors.primary} />
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              fontWeight: "600",
                              fontSize: 15,
                              color: Colors.text,
                              marginBottom: 4,
                            }}
                          >
                            {user.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: Colors.textSecondary,
                              marginBottom: 4,
                            }}
                          >
                            {user.studentId || "Chưa có mã SV"}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: Colors.textSecondary,
                            }}
                          >
                            {user.email}
                          </Text>
                          {user.classId && (
                            <Badge
                              label={`Lớp: ${user.classId}`}
                              variant="success"
                              style={{ marginTop: 8, alignSelf: "flex-start" }}
                            />
                          )}
                        </View>
                      </View>
                    </Card>
                  ))}
                </>
              )}
            </>
          ) : searchQuery ? (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <EmptySearchIcon size={80} />
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Không tìm thấy sinh viên nào
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <EmptyUsersIcon size={80} />
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Chưa có sinh viên nào
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}

