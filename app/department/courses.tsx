import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { courseService, semesterService } from "@/apis";
import type { Course } from "@/apis/services/course.service";
import type { Semester } from "@/apis/services/semester.service";
import { useToast } from "@/components/ToastProvider";

export default function CoursesManagement() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const paddingH = isDesktop ? 32 : isTablet ? 24 : 16;

  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseList, semList] = await Promise.all([
        courseService.getAllCourses().catch(() => [] as Course[]),
        semesterService.getAllSemesters().catch(() => [] as Semester[]),
      ]);
      setCourses(courseList || []);
      setSemesters(semList || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      showToast("Không thể tải danh sách khóa học", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return (courses || []).filter((c) => {
      const matchSearch =
        !keyword ||
        c.name?.toLowerCase().includes(keyword) ||
        c.subjectName?.toLowerCase().includes(keyword) ||
        c.theoryLectureName?.toLowerCase().includes(keyword);
      const matchSemester =
        !selectedSemester || c.semesterId === selectedSemester;
      return matchSearch && matchSemester;
    });
  }, [courses, searchQuery, selectedSemester]);

  const semesterOptions = useMemo(() => {
    return [
      { label: "Tất cả học kỳ", value: null },
      ...(semesters || []).map((s) => ({ label: s.name, value: s.id })),
    ];
  }, [semesters]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ color: "#6B7280", marginTop: 12, fontSize: 14 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: paddingH, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 960, width: "100%", alignSelf: "center" }}>
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 26, fontWeight: "700", color: "#111827", marginBottom: 6 }}>
              Quản lý khóa học
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              {filteredCourses.length} khóa học{selectedSemester ? " trong học kỳ đã chọn" : " trong hệ thống"}
            </Text>
          </View>

          {/* Search + Filter */}
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#E5E7EB" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F9FAFB",
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 44,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                marginBottom: 12,
              }}
            >
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Tìm theo tên khóa học, môn học, giảng viên..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, fontSize: 14, color: "#111827", marginLeft: 8, ...(Platform.OS === "web" ? { outlineStyle: "none" } as any : {}) }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Semester filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {semesterOptions.map((opt, i) => {
                  const isActive = selectedSemester === opt.value;
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedSemester(opt.value)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 8,
                        backgroundColor: isActive ? "#2563EB" : "#F3F4F6",
                        ...(Platform.OS === "web" ? { cursor: "pointer" } as any : {}),
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: isActive ? "#FFFFFF" : "#4B5563" }}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 48, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" }}>
              <Ionicons name="book-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#6B7280", marginTop: 16 }}>
                {searchQuery || selectedSemester ? "Không tìm thấy khóa học phù hợp" : "Chưa có khóa học nào"}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredCourses.map((course) => (
                <View
                  key={course.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    ...(Platform.OS === "web" ? { transition: "box-shadow 0.2s" } as any : {}),
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="book" size={22} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 4 }} numberOfLines={2}>
                        {course.name}
                      </Text>
                      {course.subjectName && (
                        <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}>
                          Môn: {course.subjectName}
                        </Text>
                      )}
                      {course.semesterName && (
                        <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                          {course.semesterName}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Meta info */}
                  <View style={{ flexDirection: "row", gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6", flexWrap: "wrap" }}>
                    {course.theoryLectureName && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="person-outline" size={14} color="#6B7280" />
                        <Text style={{ fontSize: 13, color: "#4B5563" }}>GV: {course.theoryLectureName}</Text>
                      </View>
                    )}
                    {course.practiceTeacherName && course.practiceTeacherName !== course.theoryLectureName && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="construct-outline" size={14} color="#6B7280" />
                        <Text style={{ fontSize: 13, color: "#4B5563" }}>TH: {course.practiceTeacherName}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
