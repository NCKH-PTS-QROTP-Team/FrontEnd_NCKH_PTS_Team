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
  Animated,
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
import { useSocket } from "@/apis/socket/SocketProvider";
import { CloseIcon } from "@/components/Icons";

interface SessionInfo {
  id: string;
  classId: string;
  classCode: string;
  className: string;
  subjectId: string;
  subjectName: string;
}

interface FaceDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  eyes?: Array<{ x: number; y: number; width: number; height: number }>;
  smiles?: Array<{ x: number; y: number; width: number; height: number }>;
}

const FACE_BOX_SMOOTHING_ALPHA = 0.65; // 0..1 (cao hơn = mượt hơn nhưng trễ hơn)

export default function OTPAttendanceScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturingFace, setCapturingFace] = useState(false);
  const [faceResult, setFaceResult] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [faceRetryCooldown, setFaceRetryCooldown] = useState(0);
  const [faceVerified, setFaceVerified] = useState(false);
  const [verifiedFaceEncoding, setVerifiedFaceEncoding] = useState<
    number[] | null
  >(null);
  const [faceDetected, setFaceDetected] = useState<FaceDetection | null>(null);
  const [faceTooFar, setFaceTooFar] = useState(false);
  const detectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const faceBoxRef = useRef<FaceDetection | null>(null);
  const lastImageDimensions = useRef<{ width: number; height: number } | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { toast, showToast, hideToast } = useToast();
  const { socket, isConnected, connect, disconnect, emit, on, off } = useSocket();
  const { width, height } = useWindowDimensions();
  const [previewLayout] = useState<{ width: number; height: number }>({
    width,
    height,
  });

  // Cooldown sau khi xác thực thất bại để tránh spam
  useEffect(() => {
    if (faceRetryCooldown <= 0) return;
    const timer = setInterval(() => {
      setFaceRetryCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [faceRetryCooldown]);

  // Animation nhẹ nhàng cho khung scan (thay thế detect realtime)
  // Chỉ dùng animation cho transform (native driver) để tránh conflict
  // Opacity và shadow dùng giá trị tĩnh để tránh lỗi
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Tạo animation pulse nhẹ nhàng cho khung scan khi đang mở camera
  useEffect(() => {
    if (showCamera && !capturingFace && !faceVerified) {
      // Pulse animation (nhấp nháy nhẹ) - chỉ dùng native driver cho transform
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
        pulseAnim.setValue(1);
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [showCamera, capturingFace, faceVerified]);

  // Connect socket khi camera mở
  useEffect(() => {
    if (showCamera && !isConnected) {
      connect();
    }
    return () => {
      if (isConnected && !showCamera) {
        disconnect();
      }
    };
  }, [showCamera, isConnected]);

  // Listen socket events cho face detection results
  useEffect(() => {
    if (!isConnected || !showCamera || capturingFace || faceVerified) return;

    const handleFaceDetection = (data: any) => {
      if (!data) return;
      
      if (data.faces && data.faces.length > 0) {
        const face = data.faces[0];
        
        const previewW = previewLayout.width || width;
        const previewH = previewLayout.height || height;
        const imgWidth = data.imageWidth || lastImageDimensions.current?.width || previewW;
        const imgHeight = data.imageHeight || lastImageDimensions.current?.height || previewH;
        
        if (!imgWidth || !imgHeight || imgWidth <= 0 || imgHeight <= 0) {
          return;
        }
        
        const imageAspectRatio = imgWidth / imgHeight;
        const screenAspectRatio = previewW / previewH;
        
        let scaleX, scaleY, offsetX, offsetY;
        
        if (Platform.OS === 'web') {
          if (imageAspectRatio > screenAspectRatio) {
            scaleX = previewW / imgWidth;
            scaleY = scaleX;
            offsetX = 0;
            offsetY = (previewH - imgHeight * scaleY) / 2;
          } else {
            scaleY = previewH / imgHeight;
            scaleX = scaleY;
            offsetX = (previewW - imgWidth * scaleX) / 2;
            offsetY = 0;
          }
        } else {
          scaleX = previewW / imgWidth;
          scaleY = previewH / imgHeight;
          offsetX = 0;
          offsetY = 0;
        }
        
        if (!isFinite(scaleX) || !isFinite(scaleY) || scaleX <= 0 || scaleY <= 0) {
          return;
        }
        
        let scaledX = face.x * scaleX + offsetX;
        let scaledY = face.y * scaleY + offsetY;
        let scaledWidth = face.width * scaleX;
        let scaledHeight = face.height * scaleY;
        
        const paddingFactor = 0.35;
        const paddingX = scaledWidth * paddingFactor;
        const paddingY = scaledHeight * paddingFactor;
        scaledX -= paddingX;
        scaledY -= paddingY;
        scaledWidth += paddingX * 2;
        scaledHeight += paddingY * 2;
        
        if (!isFinite(scaledX) || !isFinite(scaledY) || !isFinite(scaledWidth) || !isFinite(scaledHeight)) {
          return;
        }
        
        const headerOffsetY = 0;
        const finalX = Math.max(0, Math.min(scaledX, previewW - 20));
        const finalY = Math.max(0, Math.min(scaledY + headerOffsetY, previewH - 20));
        const finalWidth = Math.max(40, Math.min(scaledWidth, previewW - finalX));
        const finalHeight = Math.max(40, Math.min(scaledHeight, previewH - finalY));
        
        // Scale eyes và smiles
        const scaledEyes = face.eyes?.map((eye: { x: number; y: number; width: number; height: number }) => ({
          x: Math.max(0, Math.min(eye.x * scaleX + offsetX, previewW - 20)),
          y: Math.max(0, Math.min(eye.y * scaleY + offsetY + headerOffsetY, previewH - 20)),
          width: Math.max(10, Math.min(eye.width * scaleX, previewW)),
          height: Math.max(10, Math.min(eye.height * scaleY, previewH)),
        })) || [];
        
        const scaledSmiles = face.smiles?.map((smile: { x: number; y: number; width: number; height: number }) => ({
          x: Math.max(0, Math.min(smile.x * scaleX + offsetX, previewW - 20)),
          y: Math.max(0, Math.min(smile.y * scaleY + offsetY + headerOffsetY, previewH - 20)),
          width: Math.max(10, Math.min(smile.width * scaleX, previewW)),
          height: Math.max(10, Math.min(smile.height * scaleY, previewH)),
        })) || [];
        
        // Smoothing
        const prev = faceBoxRef.current;
        const smoothed: FaceDetection = prev
          ? {
              x: prev.x * (1 - FACE_BOX_SMOOTHING_ALPHA) + finalX * FACE_BOX_SMOOTHING_ALPHA,
              y: prev.y * (1 - FACE_BOX_SMOOTHING_ALPHA) + finalY * FACE_BOX_SMOOTHING_ALPHA,
              width: prev.width * (1 - FACE_BOX_SMOOTHING_ALPHA) + finalWidth * FACE_BOX_SMOOTHING_ALPHA,
              height: prev.height * (1 - FACE_BOX_SMOOTHING_ALPHA) + finalHeight * FACE_BOX_SMOOTHING_ALPHA,
              eyes: scaledEyes,
              smiles: scaledSmiles,
            }
          : {
              x: finalX,
              y: finalY,
              width: finalWidth,
              height: finalHeight,
              eyes: scaledEyes,
              smiles: scaledSmiles,
            };
        
        faceBoxRef.current = smoothed;
        setFaceDetected(smoothed);
      } else {
        setFaceDetected(null);
        faceBoxRef.current = null;
      }
    };

    on('face:detected', handleFaceDetection);

    return () => {
      off('face:detected', handleFaceDetection);
    };
  }, [isConnected, showCamera, capturingFace, faceVerified, previewLayout, width, height]);

  // Send frames to socket for detection
  useEffect(() => {
    if (!showCamera || !isConnected || capturingFace || faceVerified) {
      return;
    }

    const sendFrame = async () => {
      if (!cameraRef.current) return;
      
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.3, // Low quality cho realtime
          base64: true,
          skipProcessing: true,
          exif: false,
        });

        if (photo.base64) {
          lastImageDimensions.current = {
            width: photo.width || width,
            height: photo.height || height,
          };
          
          emit('face:detect', {
            base64Image: `data:image/jpeg;base64,${photo.base64}`,
          });
        }
      } catch (error) {
        // Silent fail cho realtime detection
      }
    };

    const interval = setInterval(sendFrame, 150); // ~6-7 FPS
    detectIntervalRef.current = interval;

    return () => {
      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current);
        detectIntervalRef.current = null;
      }
    };
  }, [showCamera, isConnected, capturingFace, faceVerified, width, height, emit]);

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
        active: true,
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

  const handleStartFaceVerification = async () => {
    if (!currentSessionId) {
      showToast("Không tìm thấy phiên điểm danh", "error");
      return;
    }

    if (faceRetryCooldown > 0) {
      showToast(
        `Vui lòng chờ ${faceRetryCooldown}s trước khi thử xác thực lại.`,
        "warning",
      );
      return;
    }

    // Trên web, permission có thể hoạt động khác, chỉ check trên mobile
    if (!isWeb) {
      // Mobile (Expo): Kiểm tra và request permission nếu chưa có hoặc chưa được grant
      if (!permission || !permission.granted) {
        console.log('📷 [Mobile] Requesting camera permission...');
        const result = await requestPermission();
        console.log('📷 [Mobile] Permission result:', result);
        
        if (!result.granted) {
          showToast("Cần quyền truy cập camera để xác thực Face ID", "error");
          return;
        }
        
        // Permission đã được grant, tiếp tục
        console.log('✅ [Mobile] Camera permission granted');
      }
    } else {
      // Web: Permission thường được xử lý tự động bởi browser
      console.log('🌐 [Web] Skipping permission check, browser will handle it');
    }

    setFaceResult("idle");
    setShowCamera(true);
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;

    if (!currentSessionId) {
      showToast("Không tìm thấy phiên điểm danh", "error");
      return;
    }

    // Bắt buộc phải xác thực face trước
    if (!faceVerified || !verifiedFaceEncoding) {
      showToast(
        "Vui lòng xác thực Face ID trước khi điểm danh bằng OTP.",
        "error",
      );
      return;
    }

    // Face đã xác thực → gửi điểm danh với OTP + encoding đã lưu
    await submitAttendance();
  };

  const handleCaptureFace = async () => {
    if (!cameraRef.current) {
      showToast("Camera chưa sẵn sàng", "error");
      return;
    }

    setCapturingFace(true);
    setFaceResult("idle");
    try {
      // Capture photo từ camera
      // Tăng quality lên tối đa (1.0) để cải thiện nhận diện mặt trên mobile
      // Mobile thường có độ phân giải thấp hơn web, cần quality cao hơn
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0, // Maximum quality để tăng similarity trên mobile
        base64: true,
        skipProcessing: false, // Đảm bảo xử lý đầy đủ
        exif: false, // Tắt EXIF để giảm kích thước nhưng không ảnh hưởng chất lượng
        // Không set width/height để giữ nguyên resolution của camera
      });

      if (!photo.base64) {
        showToast("Không thể capture ảnh", "error");
        setCapturingFace(false);
        return;
      }

      const base64Image = `data:image/jpeg;base64,${photo.base64}`;

      // Lấy studentId để verify face với dữ liệu đã đăng ký trong DB
      const studentId = await getStudentIdFromToken();
      if (!studentId) {
        showToast("Không tìm thấy thông tin sinh viên", "error");
        setCapturingFace(false);
        return;
      }

      // Bước 1: Verify face từ camera (so với face đã đăng ký)
      const verifyResult = await faceService.verifyFromCamera({
        studentId,
        base64Image,
      });

      if (!verifyResult.isMatch) {
        showToast(
          verifyResult.message ||
            "Face không khớp với face đã đăng ký. Vui lòng thử lại.",
          "error",
        );
        setCapturingFace(false);
        setFaceResult("error");
        setFaceRetryCooldown(5);
        return;
      }

      // Bước 2: Extract encoding từ ảnh đã verify (giống QR code)
      const encodingResult = await faceService.extractEncodingFromCamera(
        base64Image,
      );

      if (
        !encodingResult.faceEncoding ||
        encodingResult.faceEncoding.length === 0
      ) {
        showToast("Không phát hiện khuôn mặt. Vui lòng thử lại.", "error");
        setCapturingFace(false);
        setFaceResult("error");
        setFaceRetryCooldown(5);
        return;
      }

      // Face khớp, lưu encoding (giống QR code)
      setFaceResult("success");
      setFaceVerified(true);
      setVerifiedFaceEncoding(encodingResult.faceEncoding);

      showToast(
        "Xác thực Face ID thành công. Bây giờ hãy nhập OTP để hoàn tất điểm danh.",
        "success",
      );
    } catch (error: any) {
      // Không log ERROR cho lỗi user input (face không tìm thấy, face quá xa, etc.)
      // Chỉ log để debug nếu cần
      if (__DEV__) {
        console.log("Face capture error:", error);
      }
      
      // Lấy message từ nhiều nguồn (ErrorResponse có message và detail)
      // Backend trả về ErrorResponse với field 'detail' chứa message chi tiết
      let errorMessage = "Không thể xử lý ảnh. Vui lòng thử lại.";
      
      // Ưu tiên lấy từ detail (message chi tiết từ backend)
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.data?.detail) {
        errorMessage = error.response.data.data.detail;
      } else if (error?.response?.data?.data?.message) {
        errorMessage = error.response.data.data.message;
      }
      
      // Hiển thị toast với message từ backend (đồng bộ web và app)
      showToast(errorMessage, "error");
      setFaceResult("error");
      setFaceRetryCooldown(5);
    } finally {
      setCapturingFace(false);
      setShowCamera(false);
    }
  };

  const submitAttendance = async () => {
    if (!faceVerified || !verifiedFaceEncoding) {
      showToast("Vui lòng xác thực Face ID trước khi điểm danh bằng OTP.", "error");
      return;
    }
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

      // Tạo attendance record với face encoding đã xác thực
      const record = await attendanceService.createRecord({
        sessionId: currentSessionId,
        studentId: studentId,
        method: AttendanceMethod.OTP,
        otpCode: otpCode,
        faceEncoding: verifiedFaceEncoding,
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
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

const contentMaxWidth = isDesktop ? 500 : "100%";
const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const otpInputSpacing = isDesktop ? 50 : isTablet ? 30 : 20;
  const isWeb = Platform.OS === "web";
  const scanBoxSize = isWeb
    ? Math.min(width * 0.7, 420)
    : Math.min(width * 0.8, 320);

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

              {/* Face Verification Status */}
              <View
                style={{
                  backgroundColor: faceVerified ? "#ECFDF5" : "#EFF6FF",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: faceVerified ? "#6EE7B7" : "#BFDBFE",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: "600",
                    color: faceVerified ? "#065F46" : "#1D4ED8",
                    marginBottom: 6,
                  }}
                >
                  {faceVerified
                    ? "Face ID đã được xác thực"
                    : "Bước 1: Xác thực Face ID"}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: 18,
                    color: "#4B5563",
                  }}
                >
                  {faceVerified
                    ? "Bạn có thể tiếp tục nhập mã OTP để hoàn tất điểm danh."
                    : "Vui lòng xác thực Face ID trước, sau đó mới nhập OTP để điểm danh."}
                </Text>
                {!faceVerified && (
                  <View style={{ marginTop: 10 }}>
                    <PrimaryButton
                      title={
                        faceRetryCooldown > 0
                          ? `Chờ ${faceRetryCooldown}s để xác thực lại`
                          : "Bắt đầu xác thực Face ID"
                      }
                      onPress={handleStartFaceVerification}
                      disabled={faceRetryCooldown > 0}
                    />
                  </View>
                )}
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
                    editable={faceVerified && !isExpired}
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
              title={
                !faceVerified
                  ? "Vui lòng xác thực Face ID trước"
                  : isExpired
                  ? "Hết thời gian"
                  : "Xác nhận"
              }
              onPress={handleSubmit}
              loading={loading}
              disabled={
                !faceVerified ||
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
              Bước 1: Nhập mã OTP 6 số mà giảng viên hiển thị trên lớp.
            </Text>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: "#78350F",
                marginTop: 4,
              }}
            >
              Bước 2: Hệ thống sẽ mở camera để xác thực Face ID. Chỉ khi face
              khớp với dữ liệu đã đăng ký thì điểm danh mới thành công.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Camera Modal for Face Capture (giống UI quét QR) */}
      {/* Trên web, không cần check permission.granted vì browser tự xử lý */}
      {showCamera && (isWeb || permission?.granted) && (
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
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
          {/* Overlay UI - dùng absolute positioning thay vì children */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "transparent",
              justifyContent: "space-between",
              padding: 20,
            }}
          >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Xác thực Face ID
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCamera(false);
                    setCapturingFace(false);
                  }}
                >
                  <CloseIcon size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Scanning Area Indicator với animation nhẹ nhàng */}
              <Animated.View
                style={{
                  alignSelf: "center",
                  width: scanBoxSize,
                  height: scanBoxSize,
                  borderWidth: 3,
                  borderColor:
                    capturingFace && faceResult === "idle"
                      ? "#3FA9F5"
                      : "#FFFFFF",
                  borderStyle: "dashed",
                  borderRadius: 12,
                  backgroundColor: "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale: !capturingFace && !faceVerified ? pulseAnim : 1 }],
                  // Dùng giá trị tĩnh cho opacity và shadow để tránh conflict với native driver
                  opacity: 1,
                  shadowColor: !capturingFace && !faceVerified ? "#FFFFFF" : "transparent",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: !capturingFace && !faceVerified ? 0.3 : 0,
                  shadowRadius: 20,
                  elevation: !capturingFace && !faceVerified ? 10 : 0,
                }}
              >
                {/* Đang xác thực */}
                {capturingFace && faceResult === "idle" && (
                  <View
                    style={{
                      backgroundColor: "rgba(0,0,0,0.7)",
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 14,
                        marginBottom: 8,
                        textAlign: "center",
                      }}
                    >
                      Đang xác thực...
                    </Text>
                  </View>
                )}

                {/* Thành công */}
                {!capturingFace && faceResult === "success" && (
                  <View
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.9)",
                      borderRadius: 8,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 40,
                        textAlign: "center",
                        marginBottom: 4,
                      }}
                    >
                      ✅
                    </Text>
                    <Text
                      style={{
                        color: "#FFFFFF",
                        marginTop: 4,
                        fontSize: 14,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      Xác thực thành công
                    </Text>
                  </View>
                )}

                {/* Thất bại */}
                {!capturingFace && faceResult === "error" && (
                  <View
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.9)",
                      borderRadius: 8,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 40,
                        textAlign: "center",
                        marginBottom: 4,
                      }}
                    >
                      ✖
                    </Text>
                    <Text
                      style={{
                        color: "#FFFFFF",
                        marginTop: 4,
                        fontSize: 14,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      Xác thực thất bại. Vui lòng đưa mặt lại gần và rõ hơn.
                    </Text>
                  </View>
                )}

                {/* Nút chụp ảnh mặc định */}
                {!capturingFace && faceResult === "idle" && (
                  <TouchableOpacity
                    onPress={handleCaptureFace}
                    disabled={faceRetryCooldown > 0}
                    style={{
                      backgroundColor:
                        faceRetryCooldown > 0
                          ? "rgba(156, 163, 175, 0.9)"
                          : "rgba(59, 130, 246, 0.9)",
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      {faceRetryCooldown > 0
                        ? `Vui lòng chờ ${faceRetryCooldown}s`
                        : "Chụp ảnh để xác thực"}
                    </Text>
                  </TouchableOpacity>
                )}
              </Animated.View>

              {/* Face Detection Box với mắt/miệng */}
              {faceDetected && (
                <>
                  {/* Face box */}
                  <View
                    style={{
                      position: "absolute",
                      left: faceDetected.x,
                      top: faceDetected.y,
                      width: faceDetected.width,
                      height: faceDetected.height,
                      borderWidth: Platform.OS === "web" ? 2.5 : 3,
                      borderColor: Colors.primary,
                      borderRadius: 12,
                      backgroundColor: Platform.OS === "web" ? "rgba(59, 130, 246, 0.05)" : "transparent",
                      shadowColor: Colors.primary,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: Platform.OS === "web" ? 0.3 : 0.5,
                      shadowRadius: Platform.OS === "web" ? 8 : 12,
                      elevation: Platform.OS === "android" ? 8 : 0,
                    }}
                  >
                    {/* Corner indicators */}
                    <View
                      style={{
                        position: "absolute",
                        top: -2,
                        left: -2,
                        width: Platform.OS === "web" ? 16 : 20,
                        height: Platform.OS === "web" ? 16 : 20,
                        borderTopWidth: Platform.OS === "web" ? 3 : 4,
                        borderLeftWidth: Platform.OS === "web" ? 3 : 4,
                        borderColor: Colors.primary,
                        borderTopLeftRadius: 8,
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: Platform.OS === "web" ? 16 : 20,
                        height: Platform.OS === "web" ? 16 : 20,
                        borderTopWidth: Platform.OS === "web" ? 3 : 4,
                        borderRightWidth: Platform.OS === "web" ? 3 : 4,
                        borderColor: Colors.primary,
                        borderTopRightRadius: 8,
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        bottom: -2,
                        left: -2,
                        width: Platform.OS === "web" ? 16 : 20,
                        height: Platform.OS === "web" ? 16 : 20,
                        borderBottomWidth: Platform.OS === "web" ? 3 : 4,
                        borderLeftWidth: Platform.OS === "web" ? 3 : 4,
                        borderColor: Colors.primary,
                        borderBottomLeftRadius: 8,
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: Platform.OS === "web" ? 16 : 20,
                        height: Platform.OS === "web" ? 16 : 20,
                        borderBottomWidth: Platform.OS === "web" ? 3 : 4,
                        borderRightWidth: Platform.OS === "web" ? 3 : 4,
                        borderColor: Colors.primary,
                        borderBottomRightRadius: 8,
                      }}
                    />
                  </View>

                  {/* Eye Detection Boxes */}
                  {faceDetected.eyes?.map((eye, index) => (
                    <View
                      key={`eye-${index}`}
                      style={{
                        position: "absolute",
                        left: eye.x,
                        top: eye.y,
                        width: eye.width,
                        height: eye.height,
                        borderWidth: Platform.OS === "web" ? 1.5 : 2,
                        borderColor: "#00B4D8",
                        borderRadius: Math.min(eye.width, eye.height) * 0.3,
                        backgroundColor: Platform.OS === "web" ? "rgba(0, 180, 216, 0.08)" : "transparent",
                        shadowColor: "#00B4D8",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: Platform.OS === "web" ? 0.2 : 0.4,
                        shadowRadius: Platform.OS === "web" ? 4 : 6,
                        elevation: Platform.OS === "android" ? 4 : 0,
                      }}
                    />
                  ))}

                  {/* Smile Detection Boxes */}
                  {faceDetected.smiles?.map((smile, index) => (
                    <View
                      key={`smile-${index}`}
                      style={{
                        position: "absolute",
                        left: smile.x,
                        top: smile.y,
                        width: smile.width,
                        height: smile.height,
                        borderWidth: Platform.OS === "web" ? 1.5 : 2,
                        borderColor: "#FFD60A",
                        borderRadius: Math.min(smile.width, smile.height) * 0.3,
                        backgroundColor: Platform.OS === "web" ? "rgba(255, 214, 10, 0.08)" : "transparent",
                        shadowColor: "#FFD60A",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: Platform.OS === "web" ? 0.2 : 0.4,
                        shadowRadius: Platform.OS === "web" ? 4 : 6,
                        elevation: Platform.OS === "android" ? 4 : 0,
                      }}
                    />
                  ))}
                </>
              )}

              {/* Instructions */}
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    lineHeight: 20,
                    textAlign: "center",
                  }}
                >
                  📸 Đưa khuôn mặt vào khung, đảm bảo ánh sáng đủ và nhấn nút để chụp ảnh xác thực Face ID. Đảm bảo khuôn mặt rõ, không che mắt và nằm trong khung.
                </Text>
              </View>
          </View>
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
