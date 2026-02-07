import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Colors } from "@/constants/colors";
import { qrService, attendanceService, faceService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import { AttendanceMethod } from "@/apis/types/attendance.types";
import Toast, { useToast } from "@/components/Toast";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { useSocket } from "@/apis/socket/SocketProvider";
import { CheckCircleIcon, CloseIcon, UserIcon } from "@/components/Icons";

interface SessionInfo {
  id: string;
  classId: string;
  classCode: string;
  className: string;
  subjectId: string;
  subjectName: string;
}

type Step = "checking" | "face-verification" | "qr-scanning" | "completed";

interface FaceDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  eyes?: Array<{ x: number; y: number; width: number; height: number }>;
  smiles?: Array<{ x: number; y: number; width: number; height: number }>;
}

export default function QRAttendanceScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("checking");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceVerifying, setFaceVerifying] = useState(false);
  const [faceResult, setFaceResult] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [faceRetryCooldown, setFaceRetryCooldown] = useState(0);
  const [faceVerifiedEncoding, setFaceVerifiedEncoding] = useState<number[] | null>(null);
  const [faceDetected, setFaceDetected] = useState<FaceDetection | null>(null);
  const detectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { showToast } = useToast();
  const { socket, isConnected, connect, disconnect, emit, on, off } = useSocket();
  const { width, height } = useWindowDimensions();
  const [previewLayout, setPreviewLayout] = useState<{ width: number; height: number }>({
    width,
    height,
  });
  const lastImageDimensions = useRef<{ width: number; height: number } | null>(null);
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isWeb = Platform.OS === "web";

  const contentMaxWidth = isDesktop ? 500 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  // Kích thước khung quét (viền chụp mặt) – scale theo platform
  // Web: to hơn vì camera xa; App (mobile): vừa với màn nhỏ
  const scanBoxSize = isWeb
    ? Math.min(width * 0.7, 420)
    : Math.min(width * 0.8, 320);

  // Đếm lùi cooldown sau khi xác thực thất bại để tránh spam
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

  // Socket realtime detection cho face, eyes, smiles
  const useSocketForDetection = true; // Bật socket detection
  const FACE_BOX_SMOOTHING_ALPHA = 0.65;
  const faceBoxRef = useRef<FaceDetection | null>(null);

  // Connect socket khi camera mở và ở bước face-verification
  useEffect(() => {
    if (useSocketForDetection && showCamera && step === "face-verification" && !isConnected) {
      connect();
    }
  }, [showCamera, step, isConnected, useSocketForDetection]);

  // Listen socket events cho face detection results
  useEffect(() => {
    if (!isConnected || !useSocketForDetection || step !== "face-verification") return;

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
  }, [isConnected, useSocketForDetection, step, previewLayout, width, height]);

  // Send frames to socket for detection
  useEffect(() => {
    if (!showCamera || step !== "face-verification" || !isConnected || !useSocketForDetection || faceVerifying) {
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
  }, [showCamera, step, isConnected, useSocketForDetection, faceVerifying, width, height, emit]);

  // Tạo animation pulse nhẹ nhàng cho khung scan khi đang ở bước face-verification
  useEffect(() => {
    if (showCamera && step === "face-verification" && !faceVerifying && !faceVerified) {
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
  }, [showCamera, step, faceVerifying, faceVerified]);

  // Connect socket khi mở camera face verification
  useEffect(() => {
    if (showCamera && step === "face-verification" && !isConnected) {
      connect();
    }
    return () => {
      if (isConnected && !showCamera) {
        disconnect();
      }
    };
  }, [showCamera, step, isConnected]);

  // Socket realtime face detection (chỉ khi face-verification)
  useEffect(() => {
    if (!isConnected || !showCamera || step !== "face-verification" || faceVerifying || faceVerified) {
      return;
    }

    const sendFrame = async () => {
      if (!cameraRef.current || faceVerifying || faceVerified) return;
      
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.3, // Low quality cho realtime detection
          base64: true,
          skipProcessing: true,
        });

        if (photo?.base64) {
          emit("face:detect", { base64Image: photo.base64 });
        }
      } catch (error) {
        // Silent fail cho realtime detection
      }
    };

    const interval = setInterval(sendFrame, 200); // Mỗi 200ms
    detectIntervalRef.current = interval;

    return () => {
      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current);
        detectIntervalRef.current = null;
      }
    };
  }, [isConnected, showCamera, step, faceVerifying, faceVerified, emit]);

  // Listen socket events cho face detection results
  useEffect(() => {
    if (!isConnected || step !== "face-verification") return;

    const handleFaceDetection = (data: any) => {
      if (!data || faceVerifying || faceVerified) return;
      
      if (data.faces && data.faces.length > 0) {
        const face = data.faces[0];
        const previewW = previewLayout.width || width;
        const previewH = previewLayout.height || height;
        const imgWidth = data.imageWidth || previewW;
        const imgHeight = data.imageHeight || previewH;
        
        if (!imgWidth || !imgHeight || imgWidth <= 0 || imgHeight <= 0) return;
        
        const scaleX = previewW / imgWidth;
        const scaleY = previewH / imgHeight;
        
        if (!isFinite(scaleX) || !isFinite(scaleY) || scaleX <= 0 || scaleY <= 0) return;
        
        const scaledX = face.x * scaleX;
        const scaledY = face.y * scaleY;
        const scaledW = face.width * scaleX;
        const scaledH = face.height * scaleY;
        
        const scaledEyes = face.eyes?.map((eye: any) => ({
          x: eye.x * scaleX,
          y: eye.y * scaleY,
          width: eye.width * scaleX,
          height: eye.height * scaleY,
        })) || [];
        
        const scaledSmiles = face.smiles?.map((smile: { x: number; y: number; width: number; height: number }) => ({
          x: smile.x * scaleX,
          y: smile.y * scaleY,
          width: smile.width * scaleX,
          height: smile.height * scaleY,
        })) || [];
        
        setFaceDetected({
          x: Math.max(0, Math.min(scaledX, previewW - 20)),
          y: Math.max(0, Math.min(scaledY, previewH - 20)),
          width: Math.max(40, Math.min(scaledW, previewW)),
          height: Math.max(40, Math.min(scaledH, previewH)),
          eyes: scaledEyes,
          smiles: scaledSmiles,
        });
      } else {
        setFaceDetected(null);
      }
    };

    on("face:detected", handleFaceDetection);
    return () => {
      off("face:detected", handleFaceDetection);
    };
  }, [isConnected, step, faceVerifying, faceVerified, previewLayout, width, height, on, off]);

  // Check face registration and load session on mount
  useEffect(() => {
    checkFaceRegistrationAndLoadSession();
  }, []);

  const checkFaceRegistrationAndLoadSession = async () => {
    try {
      setLoading(true);
      const studentId = await getStudentIdFromToken();
      if (!studentId) {
        showToast("Không tìm thấy thông tin sinh viên", "error");
        return;
      }

      // Check if student has registered face
      try {
        await faceService.getByStudentId(studentId);
        // Face đã đăng ký, tiếp tục load session
      } catch (error: any) {
        // Face chưa đăng ký, redirect tới trang đăng ký
        showToast("Bạn chưa đăng ký face ID. Vui lòng đăng ký trước khi điểm danh", "error");
    setTimeout(() => {
          router.replace("/student/register-face");
        }, 2000);
        return;
      }

      // Load active session
      const sessions = await attendanceService.getSessions({
        active: true,
      });

      // Tìm session QR active
      const qrSession = sessions.find(
        (s) => s.method === AttendanceMethod.QR && s.status === "ACTIVE"
      );

      if (!qrSession) {
        showToast("Không có phiên điểm danh QR nào đang hoạt động", "error");
        return;
      }

      setSessionInfo({
        id: qrSession.id,
        classId: qrSession.classId,
        classCode: qrSession.className,
        className: qrSession.className,
        subjectId: qrSession.subjectId,
        subjectName: qrSession.subjectName,
      });
      setCurrentSessionId(qrSession.id);
      setStep("face-verification");
    } catch (error: any) {
      console.error("Error checking face registration:", error);
      showToast("Không thể tải thông tin phiên điểm danh", "error");
      // Đảm bảo loading được reset ngay cả khi có lỗi
      setStep("face-verification"); // Vẫn cho phép user thử xác thực face
    } finally {
      setLoading(false);
    }
  };

  const handleStartFaceVerification = async () => {
    console.log('🚀 handleStartFaceVerification called');
    console.log('📊 State check - loading:', loading, 'faceVerifying:', faceVerifying, 'permission:', permission, 'isWeb:', isWeb);
    
    if (loading || faceVerifying) {
      console.warn('⚠️ Button is disabled, ignoring press');
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
          showToast("Cần quyền truy cập camera để xác thực face", "error");
          return;
        }
        
        // Permission đã được grant, tiếp tục
        console.log('✅ [Mobile] Camera permission granted');
      }
    } else {
      // Web: Permission thường được xử lý tự động bởi browser
      console.log('🌐 [Web] Skipping permission check, browser will handle it');
    }

    console.log('✅ Opening camera...');
    // Mở camera, chờ người dùng nhấn nút "Chụp ảnh để xác thực"
    setShowCamera(true);
    setFaceVerifying(false);
    setFaceResult("idle");
  };

  const handleFaceCapture = async () => {
    if (!cameraRef.current || faceVerifying || !currentSessionId) return;

    try {
      setFaceVerifying(true);
      // Tăng quality lên tối đa (1.0) để cải thiện nhận diện mặt trên mobile
      // Mobile thường có độ phân giải thấp hơn web, cần quality cao hơn
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0, // Maximum quality để tăng similarity trên mobile
        base64: true,
        skipProcessing: false, // Đảm bảo xử lý đầy đủ
        exif: false, // Tắt EXIF để giảm kích thước nhưng không ảnh hưởng chất lượng
        // Không set width/height để giữ nguyên resolution của camera
      });

      if (!photo?.base64) {
        throw new Error("Không thể chụp ảnh");
      }

      // Log để debug: kiểm tra kích thước ảnh
      if (__DEV__) {
        console.log('📸 Photo info:', {
          width: photo.width,
          height: photo.height,
          base64Length: photo.base64?.length,
          uri: photo.uri,
        });
      }

      // Verify face
      const studentId = await getStudentIdFromToken();
      if (!studentId) {
        throw new Error("Không tìm thấy thông tin sinh viên");
      }
      
      const verifyResult = await faceService.verifyFromCamera({
        studentId,
        base64Image: `data:image/jpeg;base64,${photo.base64}`,
      });

      if (!verifyResult.isMatch) {
        showToast(
          (verifyResult.message || "Face không khớp. Vui lòng thử lại") +
            " Bạn có thể thử lại sau 5 giây.",
          "error",
        );
        setFaceVerifying(false);
        setFaceResult("error");
        setFaceRetryCooldown(5);
        // Giữ overlay "thất bại" một chút cho user thấy rõ
        setTimeout(() => {
          setShowCamera(false);
          setFaceResult("idle");
        }, 1200);
        return;
      }

      // Extract encoding từ ảnh đã verify
      const encodingResult = await faceService.extractEncodingFromCamera(
        `data:image/jpeg;base64,${photo.base64}`
      );

      // Face khớp, lưu encoding
      setFaceVerified(true);
      setFaceVerifiedEncoding(encodingResult.faceEncoding);
      setFaceVerifying(false);
      setFaceResult("success");
      showToast(
        verifyResult.message ||
          "Xác thực face thành công! Bây giờ bạn có thể quét QR code",
        "success",
      );
      // Giữ overlay "thành công" rồi mới chuyển sang bước quét QR
      setTimeout(() => {
        setShowCamera(false);
        setFaceResult("idle");
        setStep("qr-scanning");
      }, 1200);
    } catch (error: any) {
      // Không log ERROR cho lỗi user input (face không tìm thấy, face quá xa, etc.)
      // Chỉ log để debug nếu cần
      if (__DEV__) {
        console.log("Face verification error:", error);
      }
      
      // Lấy message từ nhiều nguồn (ErrorResponse có message và detail)
      // Backend trả về ErrorResponse với field 'detail' chứa message chi tiết
      let errorMessage = "Không thể xác thực face. Vui lòng thử lại sau 5 giây.";
      
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
      setFaceVerifying(false);
      setFaceResult("error");
       // Lỗi kỹ thuật cũng áp cooldown để tránh spam server
      setFaceRetryCooldown(5);
      setTimeout(() => {
        setShowCamera(false);
        setFaceResult("idle");
      }, 1200);
    }
  };

  const handleStartQRScan = async () => {
    if (!faceVerified) {
      showToast("Vui lòng xác thực face trước", "error");
      return;
    }

    // Trên web, permission có thể hoạt động khác, chỉ check trên mobile
    if (!isWeb) {
      // Mobile (Expo): Kiểm tra và request permission nếu chưa có hoặc chưa được grant
      if (!permission || !permission.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          showToast("Cần quyền truy cập camera để quét QR code", "error");
          return;
        }
      }
    }

    setShowCamera(true);
    setScanning(true);
    setScanned(false);
  };

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || !currentSessionId || !faceVerified || !faceVerifiedEncoding) return;

      setScanned(true);
    setScanning(false);

    try {
      // Verify QR code
      const isValid = await qrService.verifyQR({
        sessionId: currentSessionId,
        token: data,
      });

      if (!isValid) {
        showToast("QR code không hợp lệ hoặc đã hết hạn", "error");
        setScanned(false);
        setShowCamera(false);
        return;
      }

      // Create attendance record với face encoding đã verify
      const studentId = await getStudentIdFromToken();
      if (!currentSessionId || !faceVerifiedEncoding || !studentId) {
        throw new Error("Missing required data");
      }
      const record = await attendanceService.createRecord({
        sessionId: currentSessionId,
        studentId,
        method: AttendanceMethod.QR,
        qrToken: data,
        faceEncoding: faceVerifiedEncoding,
      });

      showToast("Điểm danh thành công!", "success");
      setStep("completed");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Error processing QR scan:", error);
      showToast(
        error.response?.data?.message || "Không thể xử lý QR code",
        "error"
      );
      setScanned(false);
      setShowCamera(false);
    }
  };

  const handleCancel = () => {
    if (step === "face-verification") {
      setShowCamera(false);
      setFaceVerifying(false);
      setFaceResult("idle");
    } else if (step === "qr-scanning") {
      setShowCamera(false);
      setScanning(false);
      setScanned(false);
    }
  };

  if (step === "checking" || loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F9FAFB" }}
        edges={["top"]}
      >
        <StatusBar style="dark" />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 14,
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            Đang kiểm tra và tải thông tin...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionInfo) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <View
        style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
        }}
      >
        <Text
          style={{
              fontSize: 16,
              color: "#6B7280",
            textAlign: "center",
          }}
        >
            Không có phiên điểm danh QR nào đang hoạt động
        </Text>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      {showCamera ? (
        <View style={{ flex: 1 }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={step === "face-verification" ? "front" : "back"}
            barcodeScannerSettings={
              step === "qr-scanning"
                ? {
                    barcodeTypes: ["qr"],
                  }
                : undefined
            }
            onBarcodeScanned={
              step === "qr-scanning" && !scanned
                ? handleBarCodeScanned
                : undefined
            }
          />
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
                  {step === "face-verification"
                    ? "Xác thực Face ID"
                    : "Quét QR Code"}
                </Text>
                <TouchableOpacity onPress={handleCancel}>
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
                    step === "face-verification"
                      ? faceVerifying
                        ? "#3FA9F5"
                        : "#FFFFFF"
                      : scanning
                      ? "#3FA9F5"
                      : "#FFFFFF",
                  borderStyle: "dashed",
                  borderRadius: 12,
                  backgroundColor: "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale: step === "face-verification" && !faceVerifying && !faceVerified ? pulseAnim : 1 }],
                  // Dùng giá trị tĩnh cho opacity và shadow để tránh conflict với native driver
                  opacity: 1,
                  shadowColor: step === "face-verification" && !faceVerifying && !faceVerified ? "#FFFFFF" : "transparent",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: step === "face-verification" && !faceVerifying && !faceVerified ? 0.3 : 0,
                  shadowRadius: 20,
                  elevation: step === "face-verification" && !faceVerifying && !faceVerified ? 10 : 0,
                }}
              >
                {/* Face verifying spinner */}
                {step === "face-verification" && faceVerifying && (
                  <View
                    style={{
                      backgroundColor: "rgba(0,0,0,0.7)",
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text
                      style={{
                        color: "#FFFFFF",
                        marginTop: 8,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      Đang xác thực...
                    </Text>
                  </View>
                )}

                {/* Face verify result overlay */}
                {step === "face-verification" &&
                  !faceVerifying &&
                  faceResult === "success" && (
                    <View
                      style={{
                        backgroundColor: "rgba(16, 185, 129, 0.9)",
                        borderRadius: 8,
                        padding: 16,
                        alignItems: "center",
                      }}
                    >
                      <CheckCircleIcon size={40} color="#FFFFFF" />
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

                {step === "face-verification" &&
                  !faceVerifying &&
                  faceResult === "error" && (
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
                        Xác thực thất bại
                      </Text>
                    </View>
                  )}

                {/* Default: button chụp ảnh */}
                {step === "face-verification" &&
                  !faceVerifying &&
                  faceResult === "idle" && (
                  <TouchableOpacity
                    onPress={faceRetryCooldown > 0 ? undefined : handleFaceCapture}
                    style={{
                      backgroundColor:
                        faceRetryCooldown > 0
                          ? "rgba(156, 163, 175, 0.9)" // xám khi cooldown
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
                {step === "qr-scanning" && scanned && (
                  <View
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.9)",
                      borderRadius: 8,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <CheckCircleIcon size={40} color="#FFFFFF" />
                    <Text
                      style={{
                        color: "#FFFFFF",
                        marginTop: 8,
                        fontSize: 14,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      Quét thành công!
                    </Text>
                  </View>
                )}
              </Animated.View>

              {/* Face Detection Box - chỉ hiển thị khi ở bước face-verification */}
              {step === "face-verification" && faceDetected && (
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
                    textAlign: "center",
                  }}
                >
                  {step === "face-verification"
                    ? "📸 Đưa khuôn mặt vào khung, đảm bảo ánh sáng đủ và nhấn nút để chụp ảnh xác thực"
                    : scanning
                    ? "Hướng camera vào QR code"
                    : scanned
                    ? "Đang xử lý..."
                    : "Nhấn để bắt đầu quét"}
                </Text>
              </View>
          </View>
        </View>
      ) : (
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
          {/* Course Info */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 20,
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
            <View
              style={{
                backgroundColor: "#D1FAE5",
                borderRadius: 12,
                padding: 16,
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
                  {sessionInfo.subjectName}
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: "#4B5563" }}>
                  {sessionInfo.className}
              </Text>
            </View>
          </View>

            {step === "face-verification" && (
              <>
                {/* Face Verification Card */}
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
                  <View
                    style={{
                      backgroundColor: "#FEF3C7",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#92400E",
                        marginBottom: 8,
                      }}
                    >
                      Bước 1: Xác thực Face ID
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        color: "#78350F",
                      }}
                    >
                      Vui lòng xác thực face ID trước khi quét QR code để điểm danh
                    </Text>
                  </View>

            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 16,
                aspectRatio: 1,
                maxWidth: isDesktop ? 400 : "100%",
                alignSelf: "center",
                width: "100%",
                borderWidth: 3,
                      borderColor: "#E5E7EB",
                borderStyle: "dashed",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                padding: isDesktop ? 24 : 16,
              }}
            >
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <UserIcon size={36} color="#6B7280" />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 24,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                        Xác thực Face ID
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    Nhấn nút bên dưới để bắt đầu
                  </Text>
                </View>
                  </View>

                  <PrimaryButton
                    title="Bắt đầu xác thực Face ID"
                    onPress={() => {
                      console.log('🔘 Button pressed! loading:', loading, 'faceVerifying:', faceVerifying);
                      handleStartFaceVerification();
                    }}
                    disabled={loading || faceVerifying}
                    loading={faceVerifying}
                  />
                </View>
              </>
            )}

            {step === "qr-scanning" && (
              <>
                {/* QR Scanner Card */}
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
                  <View
                    style={{
                      backgroundColor: "#ECFDF5",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 20,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ marginRight: 8 }}>
                      <CheckCircleIcon size={20} color="#047857" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#047857",
                          marginBottom: 4,
                        }}
                      >
                        Face ID đã được xác thực
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#065F46",
                        }}
                      >
                        Bây giờ bạn có thể quét QR code
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 16,
                      aspectRatio: 1,
                      maxWidth: isDesktop ? 400 : "100%",
                      alignSelf: "center",
                      width: "100%",
                      borderWidth: 3,
                      borderColor: "#E5E7EB",
                      borderStyle: "dashed",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 24,
                      padding: isDesktop ? 24 : 16,
                    }}
                  >
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                          backgroundColor: "#F3F4F6",
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 36,
                        lineHeight: 44,
                        fontWeight: "bold",
                            color: "#6B7280",
                      }}
                    >
                          QR
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 24,
                      fontWeight: "600",
                          color: "#111827",
                      marginBottom: 8,
                          textAlign: "center",
                    }}
                  >
                        Sẵn sàng quét QR
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      textAlign: "center",
                    }}
                  >
                        Nhấn nút bên dưới để bắt đầu
                  </Text>
                </View>
                  </View>

                  <PrimaryButton
                    title="Bắt đầu quét QR Code"
                    onPress={handleStartQRScan}
                    disabled={loading || scanning || !faceVerified}
                    loading={scanning}
                  />
                </View>
              </>
            )}

            {step === "completed" && (
              <View
                style={{
                  backgroundColor: "#ECFDF5",
                  borderRadius: 16,
                  padding: 24,
                  alignItems: "center",
                }}
              >
                <View style={{ marginBottom: 16 }}>
                  <CheckCircleIcon size={60} color="#047857" />
                </View>
                  <Text
                    style={{
                    fontSize: 20,
                      fontWeight: "600",
                    color: "#047857",
                      marginBottom: 8,
                    }}
                  >
                  Điểm danh thành công!
                  </Text>
                  <Text
                  style={{
                    fontSize: 14,
                    color: "#065F46",
                    textAlign: "center",
                  }}
                >
                  Bạn đã điểm danh thành công cho môn học này
                  </Text>
                </View>
              )}

          {/* Help Text */}
          <View
            style={{
              backgroundColor: "#E0F2FE",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#BFDBFE",
                marginTop: 24,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                fontWeight: "600",
                color: "#1E40AF",
                marginBottom: 8,
              }}
            >
              Hướng dẫn:
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: "#1E3A8A" }}>
                {step === "face-verification"
                  ? "1. Nhấn 'Bắt đầu xác thực Face ID' và chụp ảnh để xác thực\n2. Sau khi xác thực thành công, bạn sẽ được chuyển tới bước quét QR code"
                  : "Nhấn 'Bắt đầu quét QR Code' và hướng camera vào QR code mà giảng viên hiển thị để hoàn tất điểm danh."}
            </Text>
          </View>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}
