import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import { otpService, attendanceService, faceService, scheduleService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import { AttendanceMethod, AttendanceSessionResponse } from "@/apis/types/attendance.types";
import { useToast } from "@/components/ToastProvider";
import { getFriendlyError } from "@/utils/errorMessages";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSocket } from "@/apis/socket/SocketProvider";
import { CheckCircleIcon, CloseIcon, ChevronLeftIcon, SchoolIcon, ClipboardIcon, InfoIcon, WarningIcon, LockIconFilled, HashIcon, UserIcon } from "@/components/Icons";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";

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

const FACE_BOX_SMOOTHING_ALPHA = 0.65;

export default function OTPAttendanceScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [recordStatus, setRecordStatus] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [availableSessions, setAvailableSessions] = useState<AttendanceSessionResponse[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturingFace, setCapturingFace] = useState(false);
  const [faceResult, setFaceResult] = useState<"idle" | "success" | "error">("idle");
  const [faceRetryCooldown, setFaceRetryCooldown] = useState(0);
  const [faceVerified, setFaceVerified] = useState(false);
  const [verifiedFaceEncoding, setVerifiedFaceEncoding] = useState<number[] | null>(null);
  const [faceDetected, setFaceDetected] = useState<FaceDetection | null>(null);
  const detectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const faceBoxRef = useRef<FaceDetection | null>(null);
  const detectingRef = useRef(false);
  const useSocketForDetection = false;
  const lastImageDimensions = useRef<{ width: number; height: number } | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { showToast } = useToast();
  const { isConnected, connect, disconnect, emit, on, off } = useSocket();
  const { width, height } = useWindowDimensions();
  const [previewLayout, setPreviewLayout] = useState<{ width: number; height: number }>({ width, height });

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isWeb = Platform.OS === "web";
  const contentMaxWidth = isDesktop ? 520 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const otpInputSpacing = isDesktop ? 50 : isTablet ? 30 : 20;
  const scanBoxSize = isWeb ? Math.min(width * 0.7, 420) : Math.min(width * 0.8, 320);
  const isExpired = false;

  // ─── Effects ──────────────────────────────────────────────────────────────

  // Cooldown countdown
  useEffect(() => {
    if (faceRetryCooldown <= 0) return;
    const timer = setInterval(() => {
      setFaceRetryCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [faceRetryCooldown]);

  // Pulse animation for scan frame
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showCamera && !capturingFace && !faceVerified) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      );
      pulseAnimation.start();
      return () => { pulseAnimation.stop(); pulseAnim.setValue(1); };
    } else {
      pulseAnim.setValue(1);
    }
  }, [showCamera, capturingFace, faceVerified]);

  // Socket connection when camera opens
  useEffect(() => {
    if (showCamera && !isConnected) connect();
    return () => { if (isConnected && !showCamera) disconnect(); };
  }, [showCamera, isConnected]);

  // Realtime face detection
  useEffect(() => {
    if (!showCamera || capturingFace || faceVerified || detectingRef.current || !cameraRef.current) return;

    const sendFrame = async () => {
      if (!cameraRef.current || capturingFace || faceVerified || detectingRef.current) return;
      try {
        detectingRef.current = true;
        const isMobile = Platform.OS !== "web";
        const photo = await cameraRef.current.takePictureAsync({
          quality: isMobile ? 0.3 : 0.15,
          base64: true,
          skipProcessing: isMobile ? false : true,
          shutterSound: false,
          exif: false,
        });
        if (photo.base64) {
          lastImageDimensions.current = { width: photo.width || width, height: photo.height || height };
          const result = await faceService.detectRealtime(photo.base64);
          if (result.faces && result.faces.length > 0) {
            const face = result.faces[0];
            const previewW = previewLayout.width || width;
            const previewH = previewLayout.height || height;
            const imgWidth = result.imageWidth || photo.width || previewW;
            const imgHeight = result.imageHeight || photo.height || previewH;
            if (imgWidth > 0 && imgHeight > 0) {
              const imageAspectRatio = imgWidth / imgHeight;
              const screenAspectRatio = previewW / previewH;
              let scaleX, scaleY, offsetX, offsetY;
              if (imageAspectRatio > screenAspectRatio) {
                scaleY = previewH / imgHeight; scaleX = scaleY;
                offsetX = (previewW - imgWidth * scaleX) / 2; offsetY = 0;
              } else {
                scaleX = previewW / imgWidth; scaleY = scaleX;
                offsetX = 0; offsetY = (previewH - imgHeight * scaleY) / 2;
              }
              if (isFinite(scaleX) && isFinite(scaleY) && scaleX > 0 && scaleY > 0) {
                let scaledX = face.x * scaleX + offsetX;
                let scaledY = face.y * scaleY + offsetY;
                let scaledWidth = face.width * scaleX;
                let scaledHeight = face.height * scaleY;
                if (Platform.OS !== "web") scaledX = previewW - scaledX - scaledWidth;
                const paddingFactor = Platform.OS === "web" ? 0.2 : 0.1;
                const paddingX = scaledWidth * paddingFactor; const paddingY = scaledHeight * paddingFactor;
                scaledX -= paddingX; scaledY -= paddingY; scaledWidth += paddingX * 2; scaledHeight += paddingY * 2;
                const finalX = Math.max(0, Math.min(scaledX, previewW - 20));
                const finalY = Math.max(0, Math.min(scaledY, previewH - 20));
                const finalWidth = Math.max(40, Math.min(scaledWidth, previewW - finalX));
                const finalHeight = Math.max(40, Math.min(scaledHeight, previewH - finalY));
                const prev = faceBoxRef.current;
                const smoothed: FaceDetection = prev
                  ? {
                      x: prev.x * (1 - FACE_BOX_SMOOTHING_ALPHA) + finalX * FACE_BOX_SMOOTHING_ALPHA,
                      y: prev.y * (1 - FACE_BOX_SMOOTHING_ALPHA) + finalY * FACE_BOX_SMOOTHING_ALPHA,
                      width: prev.width * (1 - FACE_BOX_SMOOTHING_ALPHA) + finalWidth * FACE_BOX_SMOOTHING_ALPHA,
                      height: prev.height * (1 - FACE_BOX_SMOOTHING_ALPHA) + finalHeight * FACE_BOX_SMOOTHING_ALPHA,
                      eyes: [], smiles: [],
                    }
                  : { x: finalX, y: finalY, width: finalWidth, height: finalHeight, eyes: [], smiles: [] };
                faceBoxRef.current = smoothed;
                setFaceDetected(smoothed);
              }
            }
          } else {
            setFaceDetected(null); faceBoxRef.current = null;
          }
        }
      } catch (error) {
        // Silent fail
      } finally {
        detectingRef.current = false;
      }
    };

    const interval = setInterval(sendFrame, Platform.OS === "web" ? 500 : 2000);
    detectIntervalRef.current = interval;
    return () => {
      if (detectIntervalRef.current) { clearInterval(detectIntervalRef.current); detectIntervalRef.current = null; }
    };
  }, [showCamera, isConnected, capturingFace, faceVerified, width, height, previewLayout, emit]);

  // Load active session on mount
  useEffect(() => {
    loadActiveSession();
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (faceRetryCooldown <= 0) return;
    const timer = setInterval(() => {
      setFaceRetryCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [faceRetryCooldown]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const loadActiveSession = async () => {
    try {
      setInitialLoading(true);
      const studentId = await getStudentIdFromToken();
      if (!studentId) { showToast("Không tìm thấy thông tin sinh viên", "error"); return; }

      const schedules = await scheduleService.getStudentSchedules(studentId);
      const enrolledCourseIds = new Set(schedules.map((s) => s.courseId).filter(Boolean));

      const allSessions = await attendanceService.getSessions({ active: true });
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const sessions = allSessions.filter((s) => {
        const isEnrolled = enrolledCourseIds.has(s.courseId);
        const sessionDate = (s.createdAt || s.startTime || "").split("T")[0];
        return isEnrolled && sessionDate === todayStr;
      });

      setAvailableSessions(sessions);

      const otpSessions = sessions.filter(
        (s) => s.method === AttendanceMethod.OTP && s.status === "ACTIVE"
      );

      if (otpSessions.length === 0) return;

      otpSessions.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

      const defaultSession = otpSessions[0];

      try {
        const myRecords = await attendanceService.getRecords({ sessionId: defaultSession.id, studentId });
        const myRecord = myRecords && myRecords.find((r) => r.studentId === studentId || r.studentCode === studentId);
        if (myRecord) {
          setSessionInfo({ id: defaultSession.id, classId: defaultSession.classId || "", classCode: defaultSession.classCode || "", className: defaultSession.className || "", subjectId: defaultSession.subjectId, subjectName: defaultSession.subjectName || "" });
          setCurrentSessionId(defaultSession.id);
          setRecordStatus(myRecord.status);
          setIsCompleted(true);
          showToast(`Bạn đã điểm danh ${defaultSession.subjectName || "môn này"} rồi!`, "success");
          return;
        }
      } catch (e) {}

      setSessionInfo({ id: defaultSession.id, classId: defaultSession.classId || "", classCode: defaultSession.classCode || "", className: defaultSession.className || "", subjectId: defaultSession.subjectId, subjectName: defaultSession.subjectName || "" });
      setCurrentSessionId(defaultSession.id);
    } catch (error: any) {
      console.error("Error loading active session:", error);
      showToast(error.message || "Không thể tải thông tin phiên điểm danh", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  // Removed countdown logic

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleStartFaceVerification = async () => {
    if (!currentSessionId) { showToast("Không tìm thấy phiên điểm danh", "error"); return; }
    if (faceRetryCooldown > 0) { showToast(`Vui lòng chờ ${faceRetryCooldown}s trước khi thử lại.`, "warning"); return; }
    if (!isWeb) {
      if (!permission || !permission.granted) {
        const result = await requestPermission();
        if (!result.granted) { showToast("Cần quyền truy cập camera để xác thực Face ID", "error"); return; }
      }
    }
    setFaceResult("idle");
    setShowCamera(true);
  };

  const handleCaptureFace = async () => {
    if (!cameraRef.current) { showToast("Camera chưa sẵn sàng", "error"); return; }
    setCapturingFace(true);
    setFaceResult("idle");
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: Platform.OS === "web" ? 0.9 : 0.7,
        base64: true,
        skipProcessing: false,
        shutterSound: false,
        exif: false,
      });
      if (!photo.base64) { showToast("Không thể capture ảnh", "error"); setCapturingFace(false); return; }
      const base64Image = `data:image/jpeg;base64,${photo.base64}`;
      const studentId = await getStudentIdFromToken();
      if (!studentId) { showToast("Không tìm thấy thông tin sinh viên", "error"); setCapturingFace(false); return; }

      const verifyResult = await faceService.verifyFromCamera({ studentId, base64Image });
      if (!verifyResult.isMatch) {
        showToast(verifyResult.message || "Face không khớp với face đã đăng ký. Vui lòng thử lại.", "error");
        setCapturingFace(false); setFaceResult("error"); setFaceRetryCooldown(5); return;
      }

      let faceEncoding: number[] | null = null;
      try {
        const encodingResult = await faceService.extractEncodingFromCamera(base64Image);
        if (encodingResult.faceEncoding && encodingResult.faceEncoding.length > 0) faceEncoding = encodingResult.faceEncoding;
      } catch (encError) { console.warn("Extract encoding failed:", encError); }

      setFaceResult("success"); setFaceVerified(true); setVerifiedFaceEncoding(faceEncoding);
      showToast("Xác thực Face ID thành công. Bây giờ hãy nhập OTP để hoàn tất điểm danh.", "success");
    } catch (error: any) {
      if (__DEV__) console.log("Face capture error:", error);
      const errorMessage = getFriendlyError(error);
      showToast(errorMessage, "error");
      setFaceResult("error"); setFaceRetryCooldown(5);
    } finally {
      setCapturingFace(false);
      setShowCamera(false);
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;
    if (!currentSessionId) { showToast("Không tìm thấy phiên điểm danh", "error"); return; }
    if (!faceVerified) { showToast("Vui lòng xác thực Face ID trước khi điểm danh bằng OTP.", "error"); return; }
    await submitAttendance();
  };

  const submitAttendance = async () => {
    if (!faceVerified) { showToast("Vui lòng xác thực Face ID trước.", "error"); return; }
    const otpCode = otp.join("");
    if (!currentSessionId) return;
    setLoading(true);
    try {
      const studentId = await getStudentIdFromToken();
      if (!studentId) { showToast("Không tìm thấy thông tin sinh viên", "error"); setLoading(false); return; }
      await attendanceService.createRecord({
        sessionId: currentSessionId,
        studentId,
        method: AttendanceMethod.OTP,
        otpCode,
        ...(verifiedFaceEncoding ? { faceEncoding: verifiedFaceEncoding } : {}),
      });
      showToast("Điểm danh thành công!", "success");
      setRecordStatus("PRESENT");
      setIsCompleted(true);
    } catch (error: any) {
      console.error("Error submitting attendance:", error);
      showToast(getFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  // Removed formatTime logic

  // ─── Loading State ────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingGradientBg}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingIconWrap}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
            <Text style={styles.loadingTitle}>Đang kiểm tra...</Text>
            <Text style={styles.loadingSubtitle}>Tìm kiếm phiên điểm danh OTP</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Camera Overlay ───────────────────────────────────────────────────────
  if (showCamera && (isWeb || permission?.granted)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar style="light" />
        <View style={isWeb ? styles.cameraWebWrap : { flex: 1, backgroundColor: "#000" }}>
          <View
            onLayout={(e) => {
              const { width: w, height: h } = e.nativeEvent.layout;
              setPreviewLayout({ width: w, height: h });
            }}
            style={isWeb ? styles.cameraWebInner : { flex: 1 }}
          >
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />

            {/* Overlay */}
            <View style={styles.cameraOverlay}>
              {/* Header */}
              <View style={styles.cameraHeader}>
                <View>
                  <Text style={styles.cameraHeaderTitle}>Xác thực Face ID</Text>
                  {sessionInfo && (
                    <Text style={styles.cameraHeaderSub}>{sessionInfo.subjectName}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => { setShowCamera(false); setCapturingFace(false); }}
                  style={styles.cameraCancelBtn}
                  {...getWebCursor()}
                >
                  <CloseIcon size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Scan Frame */}
              <Animated.View
                style={[
                  styles.scanFrame,
                  { width: scanBoxSize, height: scanBoxSize },
                  !capturingFace && !faceVerified
                    ? { transform: [{ scale: pulseAnim }] }
                    : {},
                  {
                    borderColor: capturingFace && faceResult === "idle" ? "#60a5fa" : "#FFFFFF",
                  },
                ]}
              />

              {/* Face Detection Box */}
              {faceDetected && (
                <>
                  <View style={[styles.faceBox, { left: faceDetected.x, top: faceDetected.y, width: faceDetected.width, height: faceDetected.height }]}>
                    <View style={[styles.faceCorner, styles.faceCornerTL]} />
                    <View style={[styles.faceCorner, styles.faceCornerTR]} />
                    <View style={[styles.faceCorner, styles.faceCornerBL]} />
                    <View style={[styles.faceCorner, styles.faceCornerBR]} />
                  </View>
                  {faceDetected.eyes?.map((eye, index) => (
                    <View key={`eye-${index}`} style={[styles.eyeBox, { left: eye.x, top: eye.y, width: eye.width, height: eye.height, borderRadius: Math.min(eye.width, eye.height) * 0.3 }]} />
                  ))}
                </>
              )}

              {/* Bottom Actions */}
              <View style={styles.cameraBottom}>
                {capturingFace && faceResult === "idle" && (
                  <View style={styles.cameraStatusCard}>
                    <ActivityIndicator size="small" color="#60a5fa" />
                    <Text style={styles.cameraStatusText}>Đang xác thực khuôn mặt...</Text>
                  </View>
                )}
                {!capturingFace && faceResult === "success" && (
                  <View style={[styles.cameraStatusCard, styles.cameraStatusSuccess]}>
                    <CheckCircleIcon size={22} color="#10b981" />
                    <Text style={[styles.cameraStatusText, { color: "#10b981" }]}>Xác thực thành công!</Text>
                  </View>
                )}
                {!capturingFace && faceResult === "error" && (
                  <View style={[styles.cameraStatusCard, styles.cameraStatusError]}>
                    <Text style={{ fontSize: 18 }}>✖</Text>
                    <Text style={[styles.cameraStatusText, { color: "#f87171" }]}>Xác thực thất bại</Text>
                  </View>
                )}
                {!capturingFace && faceResult === "idle" && (
                  <TouchableOpacity
                    onPress={handleCaptureFace}
                    disabled={faceRetryCooldown > 0}
                    style={[styles.cameraCaptureBtn, faceRetryCooldown > 0 && styles.cameraCaptureBtnDisabled]}
                    {...getWebCursor()}
                  >
                    <Text style={styles.cameraCaptureBtnText}>
                      {faceRetryCooldown > 0 ? `Chờ ${faceRetryCooldown}s...` : "📸 Chụp ảnh xác thực"}
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={styles.cameraHint}>
                  <Text style={styles.cameraHintText}>
                    Đưa khuôn mặt vào khung, đảm bảo ánh sáng đủ và khuôn mặt rõ nét
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main Screen ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />

      {/* Gradient Header */}
      <View style={styles.headerGradient}>
        <TouchableOpacity
          onPress={() => router.replace("/student/attendance-actions")}
          style={styles.backBtn}
          {...getWebCursor()}
        >
          <ChevronLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIconWrap}>
            <HashIcon size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Điểm danh OTP</Text>
          <Text style={styles.headerSubtitle}>Nhập mã OTP từ giảng viên để điểm danh</Text>
        </View>
        <View style={styles.headerWave} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" }}>

          {/* ── No Session State ── */}
          {!sessionInfo && !isCompleted && (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <InfoIcon size={40} color="#0d9488" />
              </View>
              <Text style={styles.emptyTitle}>Không có phiên điểm danh</Text>
              <Text style={styles.emptySubtitle}>
                Hiện tại không có phiên điểm danh OTP nào đang hoạt động cho các môn học của bạn.
              </Text>
              <TouchableOpacity
                onPress={loadActiveSession}
                style={styles.retryBtn}
                {...getWebCursor()}
              >
                <Text style={styles.retryBtnText}>↻ Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Completed State ── */}
          {isCompleted && (
            <View style={styles.completedCard}>
              <View style={styles.completedIconWrap}>
                <CheckCircleIcon size={56} color="#10b981" />
              </View>
              <Text style={styles.completedTitle}>Điểm danh thành công!</Text>
              {sessionInfo && (
                <Text style={styles.completedSubject}>{sessionInfo.subjectName}</Text>
              )}
              
              {recordStatus && (
                <View style={[
                  styles.statusBadge,
                  recordStatus === "PRESENT" ? styles.statusPresent : styles.statusLate
                ]}>
                  <Text style={[
                    styles.statusText,
                    recordStatus === "PRESENT" ? styles.statusTextPresent : styles.statusTextLate
                  ]}>
                    Trạng thái: {recordStatus === "PRESENT" ? "Có mặt" : recordStatus === "LATE" ? "Đi muộn" : recordStatus}
                  </Text>
                </View>
              )}
              
              <Text style={styles.completedDesc}>Bạn đã được ghi nhận điểm danh cho buổi học này.</Text>
              
              <TouchableOpacity
                onPress={() => router.replace("/student/attendance-actions")}
                style={styles.completedBackBtn}
                {...getWebCursor()}
              >
                <Text style={styles.completedBackBtnText}>Quay lại trang chính</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Active Session Flow ── */}
          {sessionInfo && !isCompleted && (
            <>
              {/* Session Selector (nếu có nhiều session) */}
              {availableSessions.filter((s) => s.method === AttendanceMethod.OTP && s.status === "ACTIVE").length > 1 && (
                <View style={styles.selectorCard}>
                  <Text style={styles.selectorLabel}>Chọn môn học</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.selectorRow}>
                      {availableSessions
                        .filter((s) => s.method === AttendanceMethod.OTP && s.status === "ACTIVE")
                        .map((s) => {
                          const isSelected = sessionInfo?.id === s.id;
                          return (
                            <TouchableOpacity
                              key={s.id}
                              onPress={async () => {
                                try {
                                  const studentId = await getStudentIdFromToken();
                                  if (studentId) {
                                    const myRecords = await attendanceService.getRecords({ sessionId: s.id, studentId });
                                    const myRecord = myRecords && myRecords.find((r) => r.studentId === studentId || r.studentCode === studentId);
                                    if (myRecord) {
                                      setSessionInfo({ id: s.id, classId: s.classId || "", classCode: s.classCode || "", className: s.className || "", subjectId: s.subjectId, subjectName: s.subjectName || "" });
                                      setCurrentSessionId(s.id);
                                      setRecordStatus(myRecord.status);
                                      setIsCompleted(true);
                                      showToast(`Bạn đã điểm danh ${s.subjectName || "môn này"} rồi!`, "success");
                                      return;
                                    }
                                  }
                                } catch (e) {}
                                setSessionInfo({ id: s.id, classId: s.classId || "", classCode: s.classCode || "", className: s.className || "", subjectId: s.subjectId, subjectName: s.subjectName || "" });
                                setCurrentSessionId(s.id);
                                setOtp(["", "", "", "", "", ""]);
                              }}
                              style={[styles.selectorChip, isSelected && styles.selectorChipActive]}
                              {...getWebCursor()}
                            >
                              <Text style={[styles.selectorChipText, isSelected && styles.selectorChipTextActive]}>
                                {s.subjectName}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Session Info Card */}
              <View style={styles.sessionCard}>
                <View style={styles.sessionCardHeader}>
                  <View style={styles.sessionBadge}>
                    <View style={styles.sessionBadgeDot} />
                    <Text style={styles.sessionBadgeText}>Đang hoạt động</Text>
                  </View>
                  <Text style={styles.sessionMethod}>OTP</Text>
                </View>
                <Text style={styles.sessionSubject}>{sessionInfo.subjectName}</Text>
                <View style={styles.sessionMeta}>
                  <View style={styles.sessionMetaItem}>
                    <SchoolIcon size={15} color="#4b5563" />
                    <Text style={styles.sessionMetaText}>{sessionInfo.className}</Text>
                  </View>
                  {sessionInfo.classCode && (
                    <View style={styles.sessionMetaItem}>
                      <ClipboardIcon size={15} color="#4b5563" />
                      <Text style={styles.sessionMetaText}>{sessionInfo.classCode}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Reminder Banner */}
              <View style={styles.reminderBanner}>
                <WarningIcon size={20} color="#b45309" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderTitle}>Buổi học đang diễn ra</Text>
                  <Text style={styles.reminderDesc}>
                    Hoàn tất xác thực Face ID và nhập OTP để ghi nhận điểm danh của bạn.
                  </Text>
                </View>
              </View>

              {/* Step 1: Face Verification */}
              <View style={[styles.stepCard, faceVerified && styles.stepCardDone]}>
                <View style={styles.stepHeader}>
                  <View style={[styles.stepBadge, faceVerified && styles.stepBadgeDone]}>
                    <Text style={styles.stepBadgeText}>{faceVerified ? "✓" : "1"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, faceVerified && styles.stepTitleDone]}>
                      {faceVerified ? "Face ID đã xác thực" : "Xác thực Face ID"}
                    </Text>
                    <Text style={styles.stepDesc}>
                      {faceVerified
                        ? "Nhận dạng khuôn mặt thành công"
                        : "Bước bắt buộc trước khi nhập OTP"}
                    </Text>
                  </View>
                  {faceVerified && <CheckCircleIcon size={22} color="#10b981" />}
                </View>
                {!faceVerified && (
                  <TouchableOpacity
                    onPress={handleStartFaceVerification}
                    disabled={capturingFace}
                    style={[styles.actionBtn, capturingFace && styles.actionBtnDisabled]}
                    {...getWebCursor()}
                  >
                    {capturingFace ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>  Đang xác thực...</Text>
                      </>
                    ) : (
                      <>
                        <UserIcon size={18} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>  Bắt đầu xác thực Face ID</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {faceRetryCooldown > 0 && !faceVerified && (
                  <Text style={styles.cooldownText}>Thử lại sau {faceRetryCooldown}s</Text>
                )}
              </View>

              {/* Step 2: OTP Input */}
              <View style={[styles.stepCard, !faceVerified && styles.stepCardLocked, faceVerified && styles.stepCardActive]}>
                <View style={styles.stepHeader}>
                  <View style={[styles.stepBadge, !faceVerified && styles.stepBadgeLocked, faceVerified && styles.stepBadgeActive]}>
                    <Text style={[styles.stepBadgeText, !faceVerified && { color: "#9ca3af" }]}>2</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, !faceVerified && styles.stepTitleLocked]}>Nhập mã OTP</Text>
                    <Text style={styles.stepDesc}>
                      {faceVerified
                        ? "Nhập mã 6 chữ số từ giảng viên"
                        : "Hoàn tất bước 1 để mở khóa"}
                    </Text>
                  </View>
                  {!faceVerified && <LockIconFilled size={18} color="#9ca3af" />}
                </View>

                {/* OTP Inputs */}
                {faceVerified && (
                  <>
                    <View style={styles.otpRow}>
                      {otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={(ref) => { inputRefs.current[index] = ref; }}
                          value={digit}
                          onChangeText={(text) => handleChange(text, index)}
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          maxLength={1}
                          keyboardType="number-pad"
                          editable={faceVerified}
                          style={[
                            styles.otpInput,
                            digit ? styles.otpInputFilled : {},
                            !faceVerified ? styles.otpInputDisabled : {},
                            Platform.OS === "web" && { outlineStyle: "none" as any },
                          ]}
                        />
                      ))}
                    </View>

                    <TouchableOpacity
                      onPress={handleSubmit}
                      disabled={!faceVerified || otp.join("").length !== 6 || !currentSessionId || loading}
                      style={[
                        styles.actionBtn,
                        styles.actionBtnOTP,
                        (!faceVerified || otp.join("").length !== 6 || !currentSessionId || loading) && styles.actionBtnDisabled,
                      ]}
                      {...getWebCursor()}
                    >
                      {loading ? (
                        <>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>  Đang xử lý...</Text>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon size={18} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>  Xác nhận điểm danh</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0d9488" },
  // Loading
  loadingGradientBg: { flex: 1, backgroundColor: "#0d9488", alignItems: "center", justifyContent: "center" },
  loadingContent: { alignItems: "center", gap: 12 },
  loadingIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  loadingTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  loadingSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
  // Header
  headerGradient: { backgroundColor: "#0d9488", paddingTop: 8, paddingBottom: 32, paddingHorizontal: 20, position: "relative" },
  headerContent: { alignItems: "center", gap: 6 },
  headerIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  headerIcon: { fontSize: 28 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.75)", textAlign: "center" },
  headerWave: { position: "absolute", bottom: 0, left: 0, right: 0, height: 20, backgroundColor: "#f0fdf8", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  // Scroll
  scrollView: { flex: 1, backgroundColor: "#f0fdf8" },
  scrollContent: { paddingTop: 8, paddingBottom: 40 },
  // Empty
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 32, alignItems: "center", marginTop: 12, shadowColor: "#0d9488", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#065f46", marginBottom: 8, textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, backgroundColor: "#0d9488" },
  retryBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  // Selector
  selectorCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginTop: 12, shadowColor: "#0d9488", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  selectorLabel: { fontSize: 12, fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  selectorRow: { flexDirection: "row", gap: 8 },
  selectorChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: "#99f6e4", backgroundColor: "#f0fdf4" },
  selectorChipActive: { borderColor: "#0d9488", backgroundColor: "#0d9488" },
  selectorChipText: { fontSize: 13, color: "#047857", fontWeight: "500" },
  selectorChipTextActive: { color: "#FFFFFF" },
  // Session Card
  sessionCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, marginTop: 12, shadowColor: "#0d9488", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4, borderLeftWidth: 4, borderLeftColor: "#0d9488" },
  sessionCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sessionBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#ecfdf5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  sessionBadgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#10b981" },
  sessionBadgeText: { fontSize: 12, color: "#059669", fontWeight: "600" },
  sessionMethod: { fontSize: 11, fontWeight: "700", color: "#0d9488", backgroundColor: "#ccfbf1", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  sessionSubject: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 12, lineHeight: 26 },
  sessionMeta: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  sessionMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  sessionMetaIcon: { fontSize: 14 },
  sessionMetaText: { fontSize: 13, color: "#4b5563", fontWeight: "500" },
  // Reminder Banner
  reminderBanner: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#fffbeb", borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: "#fbbf24" },
  reminderIcon: { fontSize: 22, marginTop: 1 },
  reminderTitle: { fontSize: 14, fontWeight: "700", color: "#92400e", marginBottom: 3 },
  reminderDesc: { fontSize: 13, color: "#78350f", lineHeight: 18 },
  // Step Cards
  stepCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, marginTop: 12, shadowColor: "#0d9488", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  stepCardDone: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0" },
  stepCardActive: { borderWidth: 1, borderColor: "#99f6e4" },
  stepCardLocked: { opacity: 0.65 },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  stepBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#0d9488", alignItems: "center", justifyContent: "center" },
  stepBadgeDone: { backgroundColor: "#10b981" },
  stepBadgeActive: { backgroundColor: "#0d9488" },
  stepBadgeLocked: { backgroundColor: "#e5e7eb" },
  stepBadgeText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  stepTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 2 },
  stepTitleDone: { color: "#065f46" },
  stepTitleLocked: { color: "#9ca3af" },
  stepDesc: { fontSize: 12, color: "#6b7280" },
  lockIcon: { fontSize: 18 },
  actionBtn: { flexDirection: "row", backgroundColor: "#0d9488", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", marginTop: 2 },
  actionBtnOTP: { backgroundColor: "#7c3aed", marginTop: 16 },
  actionBtnDisabled: { backgroundColor: "#9ca3af" },
  actionBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  cooldownText: { fontSize: 12, color: "#ef4444", textAlign: "center", marginTop: 8 },
  // OTP
  otpRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 16 },
  otpInput: { width: 48, height: 58, borderRadius: 14, borderWidth: 2, borderColor: "#e5e7eb", backgroundColor: "#f9fafb", textAlign: "center", fontSize: 24, fontWeight: "800", color: "#111827" },
  otpInputFilled: { borderColor: "#0d9488", backgroundColor: "#f0fdf4", color: "#065f46" },
  otpInputDisabled: { opacity: 0.5 },
  // Countdown
  countdownBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe" },
  countdownBadgeExpired: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  countdownText: { fontSize: 13, fontWeight: "700", color: "#3b82f6" },
  countdownTextExpired: { color: "#ef4444" },
  expiredBanner: { backgroundColor: "#fef2f2", borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#fecaca" },
  expiredText: { fontSize: 13, color: "#dc2626", textAlign: "center", lineHeight: 18 },
  // Camera
  cameraWebWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.75)", padding: 24 },
  cameraWebInner: { width: "100%", maxWidth: 480, aspectRatio: 3 / 4, borderRadius: 24, overflow: "hidden", backgroundColor: "#000" },
  cameraOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "transparent", justifyContent: "space-between", padding: 20 },
  cameraHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 14, padding: 14 },
  cameraHeaderTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  cameraHeaderSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  cameraCancelBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  scanFrame: { alignSelf: "center", borderWidth: 2.5, borderColor: "#FFFFFF", borderStyle: "dashed", borderRadius: 16, backgroundColor: "transparent" },
  faceBox: { position: "absolute", borderWidth: 2.5, borderColor: "#0d9488", borderRadius: 12, backgroundColor: "rgba(13,148,136,0.05)" },
  faceCorner: { position: "absolute", width: 18, height: 18, borderColor: "#0d9488" },
  faceCornerTL: { top: -2, left: -2, borderTopWidth: 3.5, borderLeftWidth: 3.5, borderTopLeftRadius: 8 },
  faceCornerTR: { top: -2, right: -2, borderTopWidth: 3.5, borderRightWidth: 3.5, borderTopRightRadius: 8 },
  faceCornerBL: { bottom: -2, left: -2, borderBottomWidth: 3.5, borderLeftWidth: 3.5, borderBottomLeftRadius: 8 },
  faceCornerBR: { bottom: -2, right: -2, borderBottomWidth: 3.5, borderRightWidth: 3.5, borderBottomRightRadius: 8 },
  eyeBox: { position: "absolute", borderWidth: 1.5, borderColor: "#00B4D8", backgroundColor: "rgba(0,180,216,0.08)" },
  cameraBottom: { gap: 12, width: "100%", maxWidth: 400, alignSelf: "center" },
  cameraStatusCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(15,15,15,0.75)", borderRadius: 12, padding: 14 },
  cameraStatusSuccess: { backgroundColor: "rgba(16,185,129,0.12)", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)" },
  cameraStatusError: { backgroundColor: "rgba(239,68,68,0.12)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" },
  cameraStatusText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  cameraCaptureBtn: { backgroundColor: "rgba(13,148,136,0.92)", borderRadius: 14, paddingVertical: 15, paddingHorizontal: 20, alignItems: "center" },
  cameraCaptureBtnDisabled: { backgroundColor: "rgba(107,114,128,0.8)" },
  cameraCaptureBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  cameraHint: { backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12, padding: 12 },
  cameraHintText: { color: "rgba(255,255,255,0.85)", fontSize: 13, textAlign: "center", lineHeight: 18 },
  backBtn: { position: "absolute", left: 16, top: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", zIndex: 10 },
  completedCard: { backgroundColor: "#ecfdf5", borderRadius: 20, padding: 32, alignItems: "center", marginTop: 12, borderWidth: 1, borderColor: "#a7f3d0" },
  completedIconWrap: { marginBottom: 16 },
  completedTitle: { fontSize: 22, fontWeight: "800", color: "#065f46", marginBottom: 6 },
  completedSubject: { fontSize: 16, fontWeight: "600", color: "#047857", marginBottom: 8 },
  completedDesc: { fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 20 },
  statusBadge: { marginVertical: 14, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, alignSelf: "center" },
  statusPresent: { backgroundColor: "#d1fae5", borderWidth: 1, borderColor: "#a7f3d0" },
  statusLate: { backgroundColor: "#fef3c7", borderWidth: 1, borderColor: "#fde68a" },
  statusText: { fontSize: 14, fontWeight: "700" },
  statusTextPresent: { color: "#065f46" },
  statusTextLate: { color: "#92400e" },
  completedBackBtn: { marginTop: 18, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14, backgroundColor: "#10b981", shadowColor: "#10b981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  completedBackBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});
