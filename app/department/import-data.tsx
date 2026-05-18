import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { importService } from "@/apis";
import type { ImportResponse, ImportStudentResponse } from "@/apis/services/import.service";
import { useToast } from "@/components/ToastProvider";

type ImportType = "classes" | "students" | null;

export default function ImportDataScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const paddingH = isDesktop ? 32 : isTablet ? 24 : 16;

  const [selectedType, setSelectedType] = useState<ImportType>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | ImportStudentResponse | null>(null);
  const { showToast } = useToast();

  const handleFileSelect = (type: ImportType) => {
    setSelectedType(type);
    setResult(null);

    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx,.xls";
      input.onchange = (e: any) => {
        const f = e.target.files?.[0];
        if (f) {
          if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
            showToast("Vui lòng chọn file Excel (.xlsx hoặc .xls)", "error");
            return;
          }
          setFile(f);
        }
      };
      input.click();
    } else {
      showToast("Chức năng import chỉ hỗ trợ trên web", "error");
    }
  };

  const handleImport = async () => {
    if (!file || !selectedType) return;
    setLoading(true);
    try {
      let res: ImportResponse | ImportStudentResponse;
      if (selectedType === "classes") {
        res = await importService.importClasses(file);
      } else {
        res = await importService.importStudents(file);
      }
      setResult(res);
      const label = selectedType === "classes" ? "lớp học" : "sinh viên";
      if (res.errorCount === 0) {
        showToast(`Import thành công ${res.successCount} ${label}!`, "success");
      } else {
        showToast(
          `${res.successCount} thành công, ${res.errorCount} lỗi`,
          res.successCount > 0 ? "success" : "error",
        );
      }
    } catch (error: any) {
      console.error("Import error:", error);
      showToast(error.message || "Lỗi khi import. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setResult(null);
    setSelectedType(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: paddingH, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 720, width: "100%", alignSelf: "center" }}>
          {/* Header */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 26, fontWeight: "700", color: "#111827", marginBottom: 6 }}>
              Import dữ liệu
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", lineHeight: 20 }}>
              Tải lên file Excel để import hàng loạt lớp học hoặc sinh viên vào hệ thống.
            </Text>
          </View>

          {/* Step 1: Choose type (if no file selected yet) */}
          {!file && (
            <View style={{ gap: 12, marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                Chọn loại dữ liệu
              </Text>

              <TouchableOpacity
                onPress={() => handleFileSelect("classes")}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  gap: 14,
                  ...(Platform.OS === "web" ? { cursor: "pointer", transition: "border-color 0.2s" } as any : {}),
                }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="school-outline" size={24} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 2 }}>Import lớp học</Text>
                  <Text style={{ fontSize: 13, color: "#6B7280" }}>Tải file Excel chứa danh sách lớp học</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleFileSelect("students")}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  gap: 14,
                  ...(Platform.OS === "web" ? { cursor: "pointer", transition: "border-color 0.2s" } as any : {}),
                }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="people-outline" size={24} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 2 }}>Import sinh viên</Text>
                  <Text style={{ fontSize: 13, color: "#6B7280" }}>Tải file Excel chứa danh sách sinh viên</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: File selected — show file info + import button */}
          {file && !result && (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                padding: 24,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: "#2563EB",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="document-text" size={24} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 2 }} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#6B7280" }}>
                    {(file.size / 1024).toFixed(1)} KB • {selectedType === "classes" ? "Lớp học" : "Sinh viên"}
                  </Text>
                </View>
                <TouchableOpacity onPress={resetState} style={{ padding: 8 }}>
                  <Ionicons name="close-circle" size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleImport}
                disabled={loading}
                activeOpacity={0.8}
                style={{
                  backgroundColor: loading ? "#93C5FD" : "#2563EB",
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                {loading ? (
                  <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600" }}>Đang import...</Text>
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                    <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600" }}>Tiến hành Import</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Import result */}
          {result && (
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 24, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 16 }}>
                Kết quả Import
              </Text>

              <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
                <View style={{ flex: 1, backgroundColor: "#F0FDF4", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#BBF7D0" }}>
                  <Text style={{ fontSize: 22, fontWeight: "700", color: "#16A34A", marginBottom: 2 }}>{result.successCount}</Text>
                  <Text style={{ fontSize: 13, color: "#15803D" }}>Thành công</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: "#FEF2F2", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#FECACA" }}>
                  <Text style={{ fontSize: 22, fontWeight: "700", color: "#DC2626", marginBottom: 2 }}>{result.errorCount}</Text>
                  <Text style={{ fontSize: 13, color: "#B91C1C" }}>Lỗi</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: "#F9FAFB", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" }}>
                  <Text style={{ fontSize: 22, fontWeight: "700", color: "#6B7280", marginBottom: 2 }}>{result.totalRows}</Text>
                  <Text style={{ fontSize: 13, color: "#4B5563" }}>Tổng dòng</Text>
                </View>
              </View>

              {/* Error details */}
              {result.errors && result.errors.length > 0 && (
                <View>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 }}>Chi tiết lỗi:</Text>
                  <ScrollView style={{ maxHeight: 180, backgroundColor: "#FEF2F2", borderRadius: 8, padding: 12 }}>
                    {result.errors.map((err: any, i: number) => (
                      <Text key={i} style={{ fontSize: 13, color: "#DC2626", lineHeight: 20, marginBottom: 4 }}>
                        Dòng {err.rowNumber}: {err.message}
                      </Text>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity
                onPress={resetState}
                activeOpacity={0.7}
                style={{
                  marginTop: 16,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#374151", fontSize: 14, fontWeight: "600" }}>Import thêm</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Guide section */}
          <View style={{ backgroundColor: "#FFFBEB", borderRadius: 12, padding: 18, borderWidth: 1, borderColor: "#FDE68A" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Ionicons name="information-circle" size={18} color="#92400E" />
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#92400E" }}>Lưu ý khi import</Text>
            </View>
            <Text style={{ fontSize: 13, color: "#78350F", lineHeight: 20 }}>
              {"• File phải đúng định dạng .xlsx hoặc .xls\n• Dòng đầu tiên là header\n• Kiểm tra kỹ dữ liệu trước khi import\n• Hệ thống sẽ báo cáo chi tiết các dòng lỗi"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
