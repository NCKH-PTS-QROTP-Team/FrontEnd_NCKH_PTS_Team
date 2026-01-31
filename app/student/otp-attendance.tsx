import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Colors } from "@/constants/colors";
import { otpService, attendanceService, faceService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import { AttendanceMethod } from "@/apis/types/attendance.types";
import Toast, { useToast } from "@/components/Toast";
import { CameraView, useCameraPermissions } from "expo-camera";

interface SessionInfo {
  id: string;
  classId: string;
  classCode: string;
  className: string;
  subjectId: string;
  subjectName: string;
}

export default function OTPAttendanceScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturingFace, setCapturingFace] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { toast, showToast, hideToast } = useToast();

  // Load active session on mount
  useEffect(() => {
    loadActiveSession();
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Refresh OTP info periodically
  useEffect(() => {
    if (currentSessionId) {
      const interval = setInterval(() => {
        refreshOTPInfo();
      }, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [currentSessionId]);

  const loadActiveSession = async () => {
    try {
      const studentId = await getStudentIdFromToken();
      if (!studentId) {
        showToast("Không tìm thấy thông tin sinh viên", "error");
        return;
      }

      // Lấy active sessions
      const sessions = await attendanceService.getSessions({
        status: "ACTIVE",
      });

      // Tìm session OTP active
      const otpSession = sessions.find(
        (s) => s.method === AttendanceMethod.OTP && s.status === "ACTIVE"
      );

      if (!otpSession) {
        showToast("Không có phiên điểm danh OTP nào đang hoạt động", "error");
        return;
      }

      setSessionInfo({
        id: otpSession.id,
        classId: otpSession.classId,
        classCode: otpSession.classCode || "",
        className: otpSession.className || "",
        subjectId: otpSession.subjectId,
        subjectName: otpSession.subjectName || "",
      });
      setCurrentSessionId(otpSession.id);

      // Load OTP info
      await refreshOTPInfo();
    } catch (error: any) {
      console.error("Error loading active session:", error);
      showToast(
        error.message || "Không thể tải thông tin phiên điểm danh",
        "error"
      );
    }
  };

  const refreshOTPInfo = async () => {
    if (!currentSessionId) return;

    try {
      const otpInfo = await otpService.getInfo(currentSessionId);
      if (otpInfo && otpInfo.remainingSeconds !== undefined) {
        setCountdown(otpInfo.remainingSeconds);
      } else {
        setCountdown(0);
      }
    } catch (error) {
      // OTP expired or not found
      setCountdown(0);
    }
  };

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;

    if (!currentSessionId) {
      showToast("Không tìm thấy phiên điểm danh", "error");
      return;
    }

    // Hiển thị camera để capture face
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        showToast("Cần quyền truy cập camera để điểm danh", "error");
        return;
      }
    }

    setShowCamera(true);
  };

  const handleCaptureFace = async () => {
    if (!cameraRef.current) {
      showToast("Camera chưa sẵn sàng", "error");
      return;
    }

    setCapturingFace(true);
    try {
      // Capture photo từ camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo.base64) {
        showToast("Không thể capture ảnh", "error");
        setCapturingFace(false);
        return;
      }

      // Extract face encoding
      const encodingResult = await faceService.extractEncodingFromCamera(
        photo.base64
      );

      if (!encodingResult.faceEncoding || encodingResult.faceEncoding.length === 0) {
        showToast("Không phát hiện khuôn mặt. Vui lòng thử lại.", "error");
        setCapturingFace(false);
        return;
      }

      // Submit attendance với face encoding
      await submitAttendance(encodingResult.faceEncoding);
    } catch (error: any) {
      console.error("Error capturing face:", error);
      showToast(
        error.message || "Không thể xử lý ảnh. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setCapturingFace(false);
      setShowCamera(false);
    }
  };

  const submitAttendance = async (faceEncoding: number[]) => {
    const otpCode = otp.join("");
    if (!currentSessionId) return;

    setLoading(true);
    try {
      const studentId = await getStudentIdFromToken();
      if (!studentId) {
        showToast("Không tìm thấy thông tin sinh viên", "error");
        setLoading(false);
        return;
      }

      // Tạo attendance record với face encoding
      const record = await attendanceService.createRecord({
        sessionId: currentSessionId,
        studentId: studentId,
        method: AttendanceMethod.OTP,
        otpCode: otpCode,
        faceEncoding: faceEncoding,
      });

      showToast("Điểm danh thành công!", "success");
      
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting attendance:", error);
      showToast(
        error.message || "Điểm danh thất bại. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
return `${mins}:${secs.toString().padStart(2, "0")}`;
};

  const isExpired = countdown === 0;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

const contentMaxWidth = isDesktop ? 500 : "100%";
const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const otpInputSpacing = isDesktop ? 50 : isTablet ? 30 : 20;

  return (
<SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />

<ScrollView
        contentContainerStyle={{ paddingHorizontal, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
<View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Main Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              borderWidth: 1,
borderColor: "#E5E7EB",
              shadowColor: "#000",
shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Countdown Section */}
<View style={{ alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontSize: 48, lineHeight: 56, marginBottom: 12 }}>
                ⏱️
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Thời gian còn lại
              </Text>
              <Text
                style={{
                  fontSize: 36,
                  lineHeight: 44,
                  fontWeight: "bold",
                  color: isExpired ? "#EF4444" : "#3FA9F5",
                }}
              >
                {formatTime(countdown)}
              </Text>
              {isExpired && (
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#EF4444",
                    marginTop: 8,
                  }}
                >
Hết thời gian điểm danh
                </Text>
              )}
            </View>

            {/* Course Info */}
<View
              style={{
                backgroundColor: "#E0F2FE",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: "#6B7280",
                  marginBottom: 4,
                }}
              >
                Môn học
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  lineHeight: 28,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                {sessionInfo?.subjectName || "Chưa có phiên điểm danh"}
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: "#4B5563" }}>
                {sessionInfo
                  ? `${sessionInfo.classCode} • ${sessionInfo.className}`
                  : "Vui lòng đợi giảng viên tạo phiên điểm danh"}
              </Text>
            </View>

            {/* OTP Input */}
            <View style={{ marginBottom: 24 }}>
<Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Nhập mã OTP từ giảng viên
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: otpInputSpacing,
                }}
              >
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={1}
                    keyboardType="number-pad"
                    editable={!isExpired}
style={[
                      {
                        width: 50,
                        height: 56,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: digit ? Colors.primary : Colors.border,
                        backgroundColor: "#F9FAFB",
                        textAlign: "center",
                        fontSize: 24,
                        fontWeight: "bold",
                        color: Colors.textHeading,
                      },
                      Platform.OS === "web" && { outlineStyle: "none" as any },
                    ]}
/>
                ))}
              </View>
            </View>

            <PrimaryButton
              title={isExpired ? "Hết thời gian" : "Xác nhận"}
              onPress={handleSubmit}
              loading={loading}
              disabled={
                otp.join("").length !== 6 ||
                isExpired ||
                !currentSessionId ||
                !sessionInfo
              }
            />
          </View>

          {/* Help Text */}
<View
            style={{
              backgroundColor: "#FEF3C7",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#FDE68A",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                fontWeight: "600",
                color: "#92400E",
                marginBottom: 8,
              }}
            >
              Hướng dẫn:
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: "#78350F" }}>
              Nhập mã OTP 6 số mà giảng viên hiển thị trên lớp để hoàn tất điểm
              danh.
</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Camera Modal for Face Capture */}
      {showCamera && permission?.granted && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
            zIndex: 1000,
          }}
        >
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="front"
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                justifyContent: "flex-end",
                padding: 24,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  Xác thực khuôn mặt
                </Text>
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 14,
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  Đặt khuôn mặt vào khung và nhấn chụp
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity
                      onPress={() => setShowCamera(false)}
                      style={{
                        backgroundColor: "#6B7280",
                        paddingVertical: 14,
                        paddingHorizontal: 24,
                        borderRadius: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#FFF", fontWeight: "600" }}>
                        Hủy
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PrimaryButton
                      title={capturingFace ? "Đang xử lý..." : "Chụp"}
                      onPress={handleCaptureFace}
                      loading={capturingFace}
                    />
                  </View>
                </View>
              </View>
            </View>
          </CameraView>
        </View>
      )}

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

// Updated: 2026-01-02 13:16:08
