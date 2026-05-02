import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import { faceService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import { Colors } from "@/constants/colors";
import { PrimaryButton } from "@/components/PrimaryButton";
import Toast, { useToast } from "@/components/Toast";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";

export default function FaceAttendanceScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [mode, setMode] = useState<'authenticate' | 'register'>('authenticate');
  const cameraRef = useRef<CameraView>(null);
  const { toast, showToast, hideToast } = useToast();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  // Student ID - lấy từ JWT token
  const [studentId, setStudentId] = useState<string | null>(null);

  // Lấy studentId từ JWT token
  useEffect(() => {
    const loadStudentId = async () => {
      const id = await getStudentIdFromToken();
      if (!id) {
        showToast("Không thể lấy thông tin sinh viên. Vui lòng đăng nhập lại.", "error");
        setTimeout(() => router.back(), 2000);
        return;
      }
      setStudentId(id);
    };
    loadStudentId();
  }, []);

  const handleCaptureAndVerify = async () => {
    if (!cameraRef.current) {
      showToast("Camera chưa sẵn sàng", "error");
      return;
    }

    if (!studentId) {
      showToast("Không tìm thấy mã sinh viên. Vui lòng đăng nhập lại.", "error");
      return;
    }

    try {
      setScanning(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0, // Maximum quality để tăng similarity trên mobile
        base64: true, // Quan trọng: lấy base64
        skipProcessing: false, // Đảm bảo xử lý đầy đủ
        exif: false, // Tắt EXIF để giảm kích thước
      });

      if (!photo.base64) {
        showToast("Không thể capture ảnh", "error");
        return;
      }

      setCaptured(true);
      const base64Image = photo.base64;

      if (mode === 'authenticate') {
        // Gọi API verify face
        const verifyResult = await faceService.verifyFromCamera({
          studentId,
          base64Image,
        });

        if (verifyResult.isMatch) {
          showToast(
            `Xác thực thành công! Độ tương đồng: ${(verifyResult.similarity * 100).toFixed(1)}%`,
            "success"
          );

          // Navigate back sau 1.5 giây
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          showToast(
            `Xác thực thất bại. ${verifyResult.message}`,
            "error"
          );
          setCaptured(false);
        }
      } else {
        // Mode Đăng ký
        const registerResult = await faceService.registerFromCamera({
          studentId,
          base64Image,
        });
        
        if (registerResult) {
          showToast(`Đăng ký dữ liệu khuôn mặt thành công!`, "success");
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          showToast(`Đăng ký thất bại. Vui lòng thử lại.`, "error");
          setCaptured(false);
        }
      }
    } catch (error: any) {
      console.error("Face verification error:", error);
      showToast(
        error.message || "Không thể kết nối server. Vui lòng thử lại.",
        "error"
      );
      setCaptured(false);
    } finally {
      setScanning(false);
    }
  };

  if (!permission) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <StatusBar style="dark" />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: paddingHorizontal,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: Colors.textHeading,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Cần quyền truy cập camera
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.textSecondary,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Vui lòng cho phép truy cập camera để quét mặt điểm danh
          </Text>
          <PrimaryButton
            title="Cấp quyền camera"
            onPress={requestPermission}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? Colors.surface : "#000" }}>
      <StatusBar style="light" />

      {/* Camera View */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: Platform.OS === 'web' ? 'center' : 'flex-start', padding: Platform.OS === 'web' ? 24 : 0 }}>
        <View style={Platform.OS === 'web' ? {
          width: '100%',
          maxWidth: 800,
          aspectRatio: 16 / 9,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "#111827",
          ...getWebShadow("xl"),
        } : {
          flex: 1,
          alignSelf: 'stretch',
        }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="front" // Front camera cho selfie
          >
            <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
              {/* Top Toggle Mode */}
              <View style={{ 
                flexDirection: 'row', 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                marginHorizontal: Platform.OS === 'web' ? 'auto' : 40, 
                width: Platform.OS === 'web' ? 300 : undefined,
                marginTop: 20,
                borderRadius: 30,
                padding: 4,
                alignSelf: Platform.OS === 'web' ? 'center' : 'stretch'
              }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    backgroundColor: mode === 'authenticate' ? Colors.primary : 'transparent',
                    borderRadius: 26,
                    alignItems: 'center',
                    ...getWebCursor(),
                  }}
                  onPress={() => { setMode('authenticate'); setCaptured(false); }}
                  disabled={scanning}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Điểm danh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    backgroundColor: mode === 'register' ? Colors.primary : 'transparent',
                    borderRadius: 26,
                    alignItems: 'center',
                    ...getWebCursor(),
                  }}
                  onPress={() => { setMode('register'); setCaptured(false); }}
                  disabled={scanning}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Đăng ký</Text>
                </TouchableOpacity>
              </View>

              {/* Face guide frame (visual guide) */}
              {!captured && (
                <View
                  style={Platform.OS === 'web' ? {
                    position: "absolute",
                    top: "15%",
                    bottom: "25%",
                    alignSelf: "center",
                    aspectRatio: 1,
                    borderWidth: 2,
                    borderColor: mode === 'authenticate' ? Colors.primary : '#38BDF8',
                    borderRadius: 16,
                    borderStyle: "dashed",
                  } : {
                    position: "absolute",
                    top: "30%",
                    left: "10%",
                    right: "10%",
                    aspectRatio: 0.75,
                    borderWidth: 2,
                    borderColor: mode === 'authenticate' ? Colors.primary : '#38BDF8',
                    borderRadius: 12,
                    borderStyle: "dashed",
                  }}
                />
              )}

              {/* Overlay với hướng dẫn */}
              <View
                style={{
                  padding: paddingHorizontal,
                  paddingBottom: Platform.OS === 'web' ? 24 : 40,
                }}
              >
                {/* Instruction */}
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.7)",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 24,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    {scanning
                      ? "Đang xử lý..."
                      : captured
                      ? "Đã chụp ảnh"
                      : mode === 'authenticate' ? "Đặt khuôn mặt trong khung để điểm danh" : "Căn chỉnh khuôn mặt để đăng ký"}
                  </Text>
                  <Text
                    style={{
                      color: Colors.white,
                      fontSize: 13,
                      opacity: 0.8,
                      textAlign: "center",
                    }}
                  >
                    {scanning
                      ? "Vui lòng chờ..."
                      : "Đảm bảo ánh sáng đủ và khuôn mặt rõ ràng"}
                  </Text>
                </View>

                {/* Actions row for web (side by side), column for mobile */}
                <View style={{
                  flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                  gap: 16,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <View style={{ width: Platform.OS === 'web' ? 300 : '100%' }}>
                    <PrimaryButton
                      title={scanning ? "Đang xử lý..." : mode === 'authenticate' ? "Quét mặt để điểm danh" : "Lưu khuôn mặt mới"}
                      onPress={handleCaptureAndVerify}
                      loading={scanning}
                      disabled={scanning || captured}
                    />
                  </View>

                  {/* Back Button */}
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                      padding: 12,
                      alignItems: "center",
                      backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent',
                      borderRadius: 12,
                      width: Platform.OS === 'web' ? 120 : 'auto',
                      ...getWebCursor(),
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: "500",
                      }}
                    >
                      Hủy
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </CameraView>
        </View>
      </View>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
}

