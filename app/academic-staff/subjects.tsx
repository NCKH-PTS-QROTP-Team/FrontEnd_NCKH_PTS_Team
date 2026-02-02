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
import { BookIcon } from "@/components/Icons";
import {
  EmptySearchIcon,
  EmptyDocumentIcon,
} from "@/components/EmptyStateIllustration";
import Toast, { useToast } from "@/components/Toast";
import { subjectService, Subject } from "@/apis";

export default function SubjectManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getSubjects();
      setSubjects(data);
    } catch (error: any) {
      console.error("Error loading subjects:", error);
      showToast(
        error.message || "Không thể tải danh sách môn học",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Text
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: "600",
              marginBottom: isMobile ? 16 : 24,
              color: Colors.text,
            }}
          >
            Quản lý môn học
          </Text>

          <View style={{ marginBottom: isMobile ? 12 : 16 }}>
            <PrimaryButton
              title="+ Tạo môn học mới"
              onPress={() => router.push("/academic-staff/subjects/create" as any)}
            />
          </View>

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
            placeholder="Tìm kiếm môn học..."
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
                Đang tải danh sách môn học...
              </Text>
            </View>
          ) : filteredSubjects.length > 0 ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 12,
                  color: Colors.textSecondary,
                }}
              >
                Tìm thấy {filteredSubjects.length} môn học
              </Text>

              {filteredSubjects.map((subject: Subject) => (
                <Card
                  key={subject.id}
                  onPress={() =>
                    router.push(`/academic-staff/subjects/${subject.id}` as any)
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
                        backgroundColor: Colors.primary + "15",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <BookIcon size={24} color={Colors.primary} />
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          fontSize: 15,
                          color: Colors.text,
                          marginBottom: 4,
                        }}
                        numberOfLines={1}
                      >
                        {subject.code} - {subject.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: Colors.textSecondary,
                          marginBottom: 2,
                        }}
                        numberOfLines={1}
                      >
                        {subject.teacherLTName || subject.teacherTHName || "Chưa phân giảng viên"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: Colors.textSecondary,
                        }}
                      >
                        {subject.credits} tín chỉ
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
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
                Không tìm thấy môn học nào
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <EmptyDocumentIcon size={80} />
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Chưa có môn học nào
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

