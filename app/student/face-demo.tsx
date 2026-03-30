import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import { facePythonService } from "@/apis/services/facePython.service";
import { faceService } from "@/apis";
import { Colors } from "@/constants/colors";
import Toast, { useToast } from "@/components/Toast";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getStudentIdFromToken } from "@/apis/utils/jwt";

const SMOOTHING = 0.35; // thấp = bám mặt nhanh hơn
const DETECT_INTERVAL_MS = 350;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function FaceDemoScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [detecting, setDetecting] = useState(false);
  const [faceBox, setFaceBox] = useState<Box | null>(null);
  const [previewLayout, setPreviewLayout] = useState({ width: width, height: height });
  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boxRef = useRef<Box | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const isWeb = Platform.OS === "web";

  useEffect(() => {
    const loadStudentId = async () => {
      try {
        const id = await getStudentIdFromToken();
        if (id) setStudentId(id);
      } catch {
        // Không bắt buộc đăng nhập để xem demo detect; verify sẽ báo lỗi nếu chưa login
      }
    };
    loadStudentId();
  }, []);

  // Detect realtime: gọi thẳng Python (face-recognition-service)
  useEffect(() => {
    if (!isWeb || !permission?.granted || !cameraRef.current) return;

    const run = async () => {
      if (!cameraRef.current || detecting || verifying) return;
      try {
        setDetecting(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.45,
          skipProcessing: true,
          exif: false,
          base64: true,
        });
        if (!photo.base64) {
          setDetecting(false);
          return;
        }

        const result = await facePythonService.detect(photo.base64);
        const previewW = previewLayout.width || width;
        const previewH = previewLayout.height || height;
        const bbox = result.data?.bbox;
        const imgW = result.data?.imageWidth ?? photo.width ?? previewW;
        const imgH = result.data?.imageHeight ?? photo.height ?? previewH;

        if (result.success && bbox && imgW > 0 && imgH > 0) {
          const imgAspect = imgW / imgH;
          const screenAspect = previewW / previewH;
          let scaleX: number, scaleY: number, offsetX: number, offsetY: number;
          if (imgAspect > screenAspect) {
            scaleX = previewW / imgW;
            scaleY = scaleX;
            offsetX = 0;
            offsetY = (previewH - imgH * scaleY) / 2;
          } else {
            scaleY = previewH / imgH;
            scaleX = scaleY;
            offsetX = (previewW - imgW * scaleX) / 2;
            offsetY = 0;
          }
          let x = bbox.x * scaleX + offsetX;
          let y = bbox.y * scaleY + offsetY;
          let w = bbox.width * scaleX;
          let h = bbox.height * scaleY;
          const pad = 0.25;
          x -= w * pad;
          y -= h * pad;
          w += w * pad * 2;
          h += h * pad * 2;
          x = Math.max(0, Math.min(x, previewW - 20));
          y = Math.max(0, Math.min(y, previewH - 20));
          w = Math.max(40, Math.min(w, previewW - x));
          h = Math.max(40, Math.min(h, previewH - y));

          const next: Box = { x, y, width: w, height: h };
          const prev = boxRef.current;
          const smoothed: Box = prev
            ? {
                x: prev.x * SMOOTHING + next.x * (1 - SMOOTHING),
                y: prev.y * SMOOTHING + next.y * (1 - SMOOTHING),
                width: prev.width * SMOOTHING + next.width * (1 - SMOOTHING),
                height: prev.height * SMOOTHING + next.height * (1 - SMOOTHING),
              }
            : next;
          boxRef.current = smoothed;
          setFaceBox(smoothed);
        } else {
          boxRef.current = null;
          setFaceBox(null);
        }
      } catch {
        boxRef.current = null;
        setFaceBox(null);
      } finally {
        setDetecting(false);
      }
    };

    intervalRef.current = setInterval(run, DETECT_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isWeb, permission?.granted, previewLayout.width, previewLayout.height, width, height]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!permission) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={["top"]}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: Colors.textHeading, marginBottom: 12, textAlign: "center" }}>
            Cần quyền camera
          </Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 24, textAlign: "center" }}>
            Bật quyền camera để demo nhận diện khuôn mặt
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={{
              backgroundColor: Colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: Colors.white, fontWeight: "600" }}>Bật camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // App (mobile): tab này dành cho web, trên app chỉ hiện thông báo
  if (!isWeb) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={["top"]}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.textHeading, marginBottom: 8, textAlign: "center" }}>
            Demo nhận diện khuôn mặt
          </Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 24, textAlign: "center" }}>
            Tính năng này dành cho bản web. Trên điện thoại dùng "Điểm danh Face" để quét mặt.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
          >
            <Text style={{ color: Colors.white, fontWeight: "600" }}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleVerifyFace = async () => {
    if (!cameraRef.current) {
      showToast("Camera chưa sẵn sàng", "error");
      return;
    }
    if (!studentId) {
      showToast("Vui lòng đăng nhập để xác thực với DB.", "error");
      return;
    }
    try {
      setVerifying(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        base64: true,
        skipProcessing: false,
        exif: false,
      });
      if (!photo.base64) {
        showToast("Không thể chụp ảnh.", "error");
        return;
      }
      const result = await faceService.verifyFromCamera({
        studentId,
        base64Image: photo.base64,
      });
      if (result.isMatch) {
        showToast(
          `Xác thực thành công! Độ tương đồng: ${(result.similarity * 100).toFixed(1)}%`,
          "success"
        );
      } else {
        showToast(
          result.message || "Khuôn mặt không trùng với dữ liệu đã đăng ký.",
          "error"
        );
      }
    } catch (error: any) {
      showToast(
        error?.message || "Không thể kết nối server Java. Kiểm tra backend (port 8080).",
        "error"
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <CameraView
          ref={cameraRef}
          style={[ { flex: 1 }, isWeb && { pointerEvents: "none" as any } ]}
          facing="front"
        >
          <View
            style={[
              {
                flex: 1,
                justifyContent: "flex-end",
                paddingHorizontal: 24,
                paddingBottom: 24,
                paddingTop: 16,
              },
              isWeb && {
                position: "absolute" as any,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 10,
                pointerEvents: "auto" as any,
              },
            ]}
            onLayout={(e) => {
              const { width: w, height: h } = e.nativeEvent.layout;
              if (w > 0 && h > 0) setPreviewLayout({ width: w, height: h });
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.75)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: Colors.white, fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
                Nhận diện: Python • Xác thực: Java (DB)
              </Text>
              <Text style={{ color: Colors.white, fontSize: 13, opacity: 0.9, textAlign: "center" }}>
                {faceBox
                  ? "Đã phát hiện mặt. Nhấn Xác thực để so sánh với dữ liệu đã đăng ký (Java)."
                  : "Đưa mặt vào — khung hiện khi Python phát hiện. Sau đó nhấn Xác thực."}
              </Text>
            </View>

            <PrimaryButton
              title={verifying ? "Đang xác thực..." : "Xác thực khuôn mặt"}
              onPress={handleVerifyFace}
              loading={verifying}
              disabled={verifying}
              style={{ marginBottom: 12, alignSelf: "stretch" }}
            />
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: 8, alignItems: "center" }}
            >
              <Text style={{ color: Colors.white, fontSize: 15, fontWeight: "500" }}>Quay lại</Text>
            </TouchableOpacity>
          </View>

          {/* Bounding box khi có face */}
          {faceBox && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: faceBox.x,
                top: faceBox.y,
                width: faceBox.width,
                height: faceBox.height,
                borderWidth: 2.5,
                borderColor: Colors.primary,
                borderRadius: 12,
                backgroundColor: "rgba(14, 116, 144, 0.08)",
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  left: -2,
                  width: 16,
                  height: 16,
                  borderTopWidth: 3,
                  borderLeftWidth: 3,
                  borderColor: Colors.primary,
                  borderTopLeftRadius: 6,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderTopWidth: 3,
                  borderRightWidth: 3,
                  borderColor: Colors.primary,
                  borderTopRightRadius: 6,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: -2,
                  left: -2,
                  width: 16,
                  height: 16,
                  borderBottomWidth: 3,
                  borderLeftWidth: 3,
                  borderColor: Colors.primary,
                  borderBottomLeftRadius: 6,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderBottomWidth: 3,
                  borderRightWidth: 3,
                  borderColor: Colors.primary,
                  borderBottomRightRadius: 6,
                }}
              />
            </View>
          )}
        </CameraView>
      </View>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </SafeAreaView>
  );
}
