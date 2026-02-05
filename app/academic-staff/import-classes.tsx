import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Colors } from "@/constants/colors";
import { importService, ImportResponse, ImportError } from "@/apis";
import Toast, { useToast } from "@/components/Toast";
import { UploadIcon, CheckCircleIcon } from "@/components/Icons";

export default function ImportClassesScreen() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

  const handleFileSelect = () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx,.xls";
      input.onchange = (e: any) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
          if (
            !selectedFile.name.endsWith(".xlsx") &&
            !selectedFile.name.endsWith(".xls")
          ) {
            showToast("Vui lòng chọn file Excel (.xlsx hoặc .xls)", "error");
            return;
          }
          setFile(selectedFile);
          setImportResult(null);
        }
      };
      input.click();
    } else {
      // For React Native, you would use expo-document-picker
      showToast("Chức năng này chỉ hỗ trợ trên web", "error");
    }
  };

  const handleImport = async () => {
    if (!file) {
      showToast("Vui lòng chọn file Excel", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await importService.importClasses(file);
      setImportResult(result);
      
      if (result.errorCount === 0) {
        showToast(
          `Import thành công ${result.successCount} lớp học!`,
          "success"
        );
      } else {
        showToast(
          `Import hoàn tất: ${result.successCount} thành công, ${result.errorCount} lỗi`,
          result.successCount > 0 ? "success" : "error"
        );
      }
    } catch (error: any) {
      console.error("Import error:", error);
      showToast(
        error.message || "Lỗi khi import file. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatFileName = (fileName: string) => {
    if (fileName.length > 30) {
      return fileName.substring(0, 27) + "...";
    }
    return fileName;
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: isDesktop ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: isDesktop ? 800 : "100%",
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: isDesktop ? 32 : 28,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Import lớp học từ Excel
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 20,
              }}
            >
              Tải lên file Excel chứa thông tin các lớp học để import hàng loạt
            </Text>
          </View>

          {/* Upload Section */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              borderWidth: 2,
              borderColor: file ? Colors.primary : "#E5E7EB",
              borderStyle: file ? "solid" : "dashed",
            }}
          >
            {!file ? (
              <TouchableOpacity
                onPress={handleFileSelect}
                style={{
                  alignItems: "center",
                  paddingVertical: 32,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "#F3F4F6",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <UploadIcon size={32} color={Colors.primary} />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 8,
                  }}
                >
                  Chọn file Excel
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  Hỗ trợ định dạng .xlsx hoặc .xls
                </Text>
              </TouchableOpacity>
            ) : (
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
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
                    <CheckCircleIcon size={24} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {formatFileName(file.name)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6B7280",
                      }}
                    >
                      {(file.size / 1024).toFixed(2)} KB
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setFile(null);
                      setImportResult(null);
                    }}
                    style={{
                      padding: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors.primary,
                        fontWeight: "600",
                      }}
                    >
                      Xóa
                    </Text>
                  </TouchableOpacity>
                </View>
                <PrimaryButton
                  title="Import lớp học"
                  onPress={handleImport}
                  loading={loading}
                />
              </View>
            )}
          </View>

          {/* Format Guide */}
          <View
            style={{
              backgroundColor: "#F0F9FF",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "#BAE6FD",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1E40AF",
                marginBottom: 12,
              }}
            >
              Định dạng file Excel
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#1E40AF",
                lineHeight: 22,
                marginBottom: 8,
              }}
            >
              File Excel cần có các cột sau (theo thứ tự):
            </Text>
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 22 }}>
                1. Mã lớp (bắt buộc)
              </Text>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 22 }}>
                2. Tên lớp (bắt buộc)
              </Text>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 22 }}>
                3. Mã môn học (tùy chọn)
              </Text>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 22 }}>
                4. Tên môn học (tùy chọn)
              </Text>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 22 }}>
                5. Mã giảng viên (tùy chọn)
              </Text>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 22 }}>
                6. Học kỳ (tùy chọn)
              </Text>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 22 }}>
                7. Số lượng sinh viên (tùy chọn)
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                color: "#1E40AF",
                marginTop: 12,
                fontStyle: "italic",
              }}
            >
              Lưu ý: Dòng đầu tiên là header, các dòng tiếp theo là dữ liệu
            </Text>
          </View>

          {/* Import Result */}
          {importResult && (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 24,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 16,
                }}
              >
                Kết quả import
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#F0FDF4",
                    borderRadius: 8,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#86EFAC",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color: "#16A34A",
                      marginBottom: 4,
                    }}
                  >
                    {importResult.successCount}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#15803D",
                    }}
                  >
                    Thành công
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FEF2F2",
                    borderRadius: 8,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#FCA5A5",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color: "#DC2626",
                      marginBottom: 4,
                    }}
                  >
                    {importResult.errorCount}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#B91C1C",
                    }}
                  >
                    Lỗi
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color: "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    {importResult.totalRows}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#4B5563",
                    }}
                  >
                    Tổng số dòng
                  </Text>
                </View>
              </View>

              {/* Errors List */}
              {importResult.errors.length > 0 && (
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 12,
                    }}
                  >
                    Chi tiết lỗi:
                  </Text>
                  <ScrollView
                    style={{
                      maxHeight: 200,
                      backgroundColor: "#F9FAFB",
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    {importResult.errors.map((error: ImportError, index) => (
                      <View
                        key={index}
                        style={{
                          paddingVertical: 8,
                          borderBottomWidth:
                            index < importResult.errors.length - 1 ? 1 : 0,
                          borderBottomColor: "#E5E7EB",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#DC2626",
                          }}
                        >
                          Dòng {error.rowNumber}: {error.message}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
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

