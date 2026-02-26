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
import { PrimaryButton } from "@/components/PrimaryButton";
import DataTable from "@/components/DataTable";
import {
  EmptySearchIcon,
  EmptyListIcon,
} from "@/components/EmptyStateIllustration";
import { SchoolIcon, UploadIcon } from "@/components/Icons";
import Toast, { useToast } from "@/components/Toast";
import { classService, Class } from "@/apis";

export default function ClassManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const showTable = isDesktop;

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getClasses();
      setClasses(data);
    } catch (error: any) {
      console.error("Error loading classes:", error);
      showToast(
        error.message || "Không thể tải danh sách lớp học",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.teacherName &&
        cls.teacherName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            Quản lý lớp học
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
              title="+ Tạo lớp học mới"
              onPress={() => router.push("/academic-staff/classes/create" as any)}
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
              onPress={() => router.push("/academic-staff/import?type=classes" as any)}
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
            placeholder="Tìm kiếm lớp học..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

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
                Đang tải danh sách lớp học...
              </Text>
            </View>
          ) : filteredClasses.length > 0 ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 12,
                  color: Colors.textSecondary,
                }}
              >
                Tìm thấy {filteredClasses.length} lớp học
              </Text>

              {showTable ? (
                <DataTable
                  columns={[
                    {
                      key: "code",
                      label: "Mã lớp",
                      width: 120,
                      render: (cls) => (
                        <Text
                          style={{
                            fontWeight: "600",
                            fontSize: 14,
                            color: Colors.text,
                          }}
                        >
                          {cls.code}
                        </Text>
                      ),
                    },
                    {
                      key: "name",
                      label: "Tên lớp",
                      width: 250,
                      render: (cls) => (
                        <Text style={{ fontSize: 14, color: Colors.text }}>
                          {cls.name}
                        </Text>
                      ),
                    },
                    {
                      key: "subject",
                      label: "Môn học",
                      width: 200,
                      render: (cls: Class) => (
                        <Text
                          style={{ fontSize: 14, color: Colors.textSecondary }}
                        >
                          {cls.subjectName || "-"}
                        </Text>
                      ),
                    },
                    {
                      key: "teacher",
                      label: "Giảng viên",
                      width: 180,
                      render: (cls: Class) => (
                        <Text
                          style={{ fontSize: 14, color: Colors.textSecondary }}
                        >
                          {cls.teacherName || "-"}
                        </Text>
                      ),
                    },
                    {
                      key: "semester",
                      label: "Học kỳ",
                      width: 120,
                      render: (cls: Class) => (
                        <Text
                          style={{ fontSize: 14, color: Colors.textSecondary }}
                        >
                          {cls.semester || "-"}
                        </Text>
                      ),
                    },
                    {
                      key: "studentCount",
                      label: "Số SV",
                      width: 100,
                      align: "center",
                      render: (cls: Class) => (
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: Colors.primary,
                          }}
                        >
                          {cls.studentCount || 0}
                        </Text>
                      ),
                    },
                    {
                      key: "actions",
                      label: "Thao tác",
                      width: 150,
                      render: (cls) => (
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => {
                              router.push(`/academic-staff/classes/${cls.id}` as any);
                            }}
                            style={{
                              padding: 6,
                              backgroundColor: Colors.primary + "15",
                              borderRadius: 6,
                            }}
                          >
                            <Text style={{ fontSize: 12, color: Colors.primary }}>
                              Xem
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              router.push(`/academic-staff/classes/${cls.id}/edit` as any);
                            }}
                            style={{
                              padding: 6,
                              backgroundColor: Colors.warning + "15",
                              borderRadius: 6,
                            }}
                          >
                            <Text style={{ fontSize: 12, color: Colors.warning }}>
                              Sửa
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ),
                    },
                  ]}
                  data={filteredClasses}
                  onRowPress={(cls: Class) =>
                    router.push(`/academic-staff/classes/${cls.id}` as any)
                  }
                  zebraStriping={true}
                  stickyHeader={true}
                />
              ) : (
                <>
                  {filteredClasses.map((cls: Class) => (
                    <Card
                      key={cls.id}
                      onPress={() =>
                        router.push(`/academic-staff/classes/${cls.id}` as any)
                      }
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
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                            backgroundColor: Colors.infoLight,
                          }}
                        >
                          <SchoolIcon size={24} color={Colors.primary} />
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
                            {cls.code} - {cls.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: Colors.textSecondary,
                              marginBottom: 4,
                            }}
                          >
                            {cls.subjectName || "Chưa có môn học"}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: Colors.textSecondary,
                            }}
                          >
                            {cls.teacherName
                              ? `GV: ${cls.teacherName} • ${cls.studentCount || 0} SV`
                              : `${cls.studentCount || 0} SV`}
                          </Text>
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
                Không tìm thấy lớp học nào
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <EmptyListIcon size={80} />
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Chưa có lớp học nào
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
