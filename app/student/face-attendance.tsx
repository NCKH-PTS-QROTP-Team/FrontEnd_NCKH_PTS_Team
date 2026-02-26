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

export default function FaceAttendanceScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [captured, setCaptured] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { toast, showToast, hideToast } = useToast();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const contentMaxWidth = isDesktop ? 500 : "100%";
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

      // Capture photo từ camera
      // Tăng quality lên tối đa (1.0) để cải thiện nhận diện mặt trên mobile
      // Mobile thường có độ phân giải thấp hơn web, cần quality cao hơn
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0, // Maximum quality để tăng similarity trên mobile
        base64: true, // Quan trọng: lấy base64
        skipProcessing: false, // Đảm bảo xử lý đầy đủ
        exif: false, // Tắt EXIF để giảm kích thước
        // Không set width/height để giữ nguyên resolution của camera
      });

      if (!photo.base64) {
        showToast("Không thể capture ảnh", "error");
        return;
      }

      setCaptured(true);

      // Gửi base64 thuần (backend sẽ tự strip prefix nếu có)
      const base64Image = photo.base64;

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {/* Camera View */}
      <View style={{ flex: 1 }}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="front" // Front camera cho selfie
        >
          {/* Overlay với hướng dẫn */}
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              padding: paddingHorizontal,
              paddingBottom: 40,
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
                  : "Đặt khuôn mặt trong khung"}
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

            {/* Capture Button */}
            <PrimaryButton
              title={scanning ? "Đang xử lý..." : "Quét mặt để điểm danh"}
              onPress={handleCaptureAndVerify}
              loading={scanning}
              disabled={scanning || captured}
            />

            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginTop: 16,
                padding: 12,
                alignItems: "center",
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

          {/* Face guide frame (visual guide) */}
          {!captured && (
            <View
              style={{
                position: "absolute",
                top: "30%",
                left: "10%",
                right: "10%",
                aspectRatio: 0.75,
                borderWidth: 2,
                borderColor: Colors.primary,
                borderRadius: 12,
                borderStyle: "dashed",
              }}
            />
          )}
        </CameraView>
      </View>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}

