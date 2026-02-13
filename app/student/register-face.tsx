import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Platform,
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
import { useSocket } from "@/apis/socket/SocketProvider";
import {
  UserIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
} from "@/components/Icons";

// Định nghĩa các góc mặt
type FaceAngle = "straight" | "left" | "right" | "up" | "down";

interface FaceAngleStep {
  id: FaceAngle;
  title: string;
  instruction: string;
  IconComponent: React.FC<{ size?: number; color?: string }>;
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
const READY_STABLE_FRAMES = 3; // số frame liên tiếp đạt điều kiện để auto-capture
const AUTO_CAPTURE_COUNTDOWN_SEC = 3;

const FACE_ANGLES: FaceAngleStep[] = [
  {
    id: "straight",
    title: "Bước 1/5: Nhìn thẳng",
    instruction: "Nhìn thẳng vào camera, đảm bảo ánh sáng đủ và khuôn mặt rõ ràng",
    IconComponent: UserIcon,
  },
  {
    id: "left",
    title: "Bước 2/5: Quay trái",
    instruction: "Từ từ quay đầu sang trái, giữ khuôn mặt trong khung",
    IconComponent: ArrowLeftIcon,
  },
  {
    id: "right",
    title: "Bước 3/5: Quay phải",
    instruction: "Từ từ quay đầu sang phải, giữ khuôn mặt trong khung",
    IconComponent: ArrowRightIcon,
  },
  {
    id: "up",
    title: "Bước 4/5: Nhìn lên",
    instruction: "Nhẹ nhàng ngửa đầu lên, mắt vẫn nhìn vào camera",
    IconComponent: ArrowUpIcon,
  },
  {
    id: "down",
    title: "Bước 5/5: Nhìn xuống",
    instruction: "Nhẹ nhàng cúi đầu xuống, mắt vẫn nhìn vào camera",
    IconComponent: ArrowDownIcon,
  },
];

export default function RegisterFaceScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loadingStudentId, setLoadingStudentId] = useState(true);
  const [checkingFaceStatus, setCheckingFaceStatus] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [faceDetected, setFaceDetected] = useState<FaceDetection | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [isReadyToCapture, setIsReadyToCapture] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [previewLayout, setPreviewLayout] = useState<{ width: number; height: number }>({
    width,
    height,
  });
  const cameraRef = useRef<CameraView>(null);
  const detectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stableFramesRef = useRef(0);
  const faceBoxRef = useRef<FaceDetection | null>(null);
  // Lưu image dimensions để scale coordinates chính xác
  const lastImageDimensions = useRef<{ width: number; height: number } | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { socket, isConnected, connect, disconnect, emit, on, off } = useSocket();

  // Responsive layout
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const maxContentWidth = isDesktop ? 480 : isTablet ? 420 : width;
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;
  const currentAngle = FACE_ANGLES[currentStep];
  const progress = ((currentStep + 1) / FACE_ANGLES.length) * 100;
  
  // Enable socket khi backend đã có socket server (port 8081)
  const useSocketForDetection = false; // Tạm tắt để dùng API fallback
  // Auto-capture: chỉ bật trên web, mobile sẽ chụp thủ công để tránh chớp màn hình
  const enableAutoCapture = Platform.OS === "web";

  const getGuideRect = (previewW: number, previewH: number) => {
    // Match UI guide frame: top 25%, left/right 10%, aspectRatio 0.75
    const x = previewW * 0.1;
    const w = previewW * 0.8;
    const h = w / 0.75;
    const y = previewH * 0.25;
    return { x, y, w, h };
  };

  const isFaceInsideGuide = (face: FaceDetection, previewW: number, previewH: number) => {
    const guide = getGuideRect(previewW, previewH);
    const cx = face.x + face.width / 2;
    const cy = face.y + face.height / 2;

    const centerInside =
      cx >= guide.x &&
      cx <= guide.x + guide.w &&
      cy >= guide.y &&
      cy <= guide.y + guide.h;

    // Face should not be too small / too big relative to guide frame
    const minW = guide.w * 0.22;
    const maxW = guide.w * 0.92;

    return centerInside && face.width >= minW && face.width <= maxW;
  };

  const updateFaceDetection = (next: FaceDetection | null) => {
    if (!next) {
      faceBoxRef.current = null;
      stableFramesRef.current = 0;
      setIsReadyToCapture(false);
      setFaceDetected(null);
      return;
    }

    const prev = faceBoxRef.current;
    const smoothed: FaceDetection = prev
      ? {
          x: prev.x * FACE_BOX_SMOOTHING_ALPHA + next.x * (1 - FACE_BOX_SMOOTHING_ALPHA),
          y: prev.y * FACE_BOX_SMOOTHING_ALPHA + next.y * (1 - FACE_BOX_SMOOTHING_ALPHA),
          width: prev.width * FACE_BOX_SMOOTHING_ALPHA + next.width * (1 - FACE_BOX_SMOOTHING_ALPHA),
          height: prev.height * FACE_BOX_SMOOTHING_ALPHA + next.height * (1 - FACE_BOX_SMOOTHING_ALPHA),
        }
      : next;

    faceBoxRef.current = smoothed;
    setFaceDetected(smoothed);

    const previewW = previewLayout.width || width;
    const previewH = previewLayout.height || height;
    const inside = isFaceInsideGuide(smoothed, previewW, previewH);

    stableFramesRef.current = inside ? stableFramesRef.current + 1 : 0;
    setIsReadyToCapture(stableFramesRef.current >= READY_STABLE_FRAMES);
  };

  // Lấy studentId từ JWT token
  useEffect(() => {
    const loadStudentId = async () => {
      try {
        setLoadingStudentId(true);
        const id = await getStudentIdFromToken();

        if (!id) {
          showToast("Không thể lấy thông tin sinh viên. Vui lòng đăng nhập lại.", "error");
          setTimeout(() => {
            router.replace("/auth/login");
          }, 3000);
          return;
        }

        setStudentId(id);
      } catch (error) {
        console.error("Error loading studentId:", error);
        showToast("Lỗi khi tải thông tin. Vui lòng thử lại.", "error");
        setTimeout(() => {
          router.replace("/auth/login");
        }, 3000);
      } finally {
        setLoadingStudentId(false);
      }
    };
    loadStudentId();
  }, []);

  // Check nếu sinh viên đã đăng ký khuôn mặt chưa (trải nghiệm kiểu banking)
  useEffect(() => {
    if (!studentId) return;

    const checkStatus = async () => {
      try {
        setCheckingFaceStatus(true);
        const info = await faceService.getByStudentId(studentId);

        // Có face data => đã đăng ký
        if (info?.registeredAnglesCount && info.registeredAnglesCount > 0) {
          setAlreadyRegistered(true);
          setCameraActive(false);
        } else {
          // Có record nhưng không có angles count (hiếm) vẫn xem là đã đăng ký
          setAlreadyRegistered(true);
          setCameraActive(false);
        }
      } catch (err: any) {
        // 404 => chưa đăng ký, cho phép vào flow
        const status = err?.response?.status;
        if (status === 404) {
          setAlreadyRegistered(false);
          setCameraActive(true);
        } else {
          // Lỗi khác: không chặn user, chỉ cảnh báo nhẹ
          setAlreadyRegistered(false);
        }
      } finally {
        setCheckingFaceStatus(false);
      }
    };

    checkStatus();
  }, [studentId]);

  // Connect socket khi mount và camera active
  useEffect(() => {
    if (useSocketForDetection && cameraActive && !isConnected) {
      connect();
    }
  }, [cameraActive, isConnected, useSocketForDetection]);

  // Listen socket events cho face detection results
  useEffect(() => {
    if (!isConnected || !useSocketForDetection) return;

    const handleFaceDetection = (data: any) => {
      if (!data) return;
      
      if (data.faces && data.faces.length > 0) {
        const face = data.faces[0];
        
        // Ưu tiên dùng image dimensions từ server response, fallback về cached dimensions
        const previewW = previewLayout.width || width;
        const previewH = previewLayout.height || height;
        const imgWidth = data.imageWidth || lastImageDimensions.current?.width || previewW;
        const imgHeight = data.imageHeight || lastImageDimensions.current?.height || previewH;
        
        // Validate dimensions
        if (!imgWidth || !imgHeight || imgWidth <= 0 || imgHeight <= 0) {
          return;
        }
        
        // Trên web, camera preview có thể có behavior khác
        // Tính scale dựa trên aspect ratio để giữ tỷ lệ đúng
        const imageAspectRatio = imgWidth / imgHeight;
        const screenAspectRatio = previewW / previewH;
        
        let scaleX, scaleY, offsetX, offsetY;
        
        // Web: Camera preview thường COVER (giữ aspect ratio, crop nếu cần)
        // Mobile: Có thể STRETCH (fill screen)
        if (Platform.OS === 'web') {
          // Web: Giữ aspect ratio (COVER mode)
          if (imageAspectRatio > screenAspectRatio) {
            // Image rộng hơn → scale theo width, crop height
            scaleX = previewW / imgWidth;
            scaleY = scaleX; // Uniform scale
            offsetX = 0;
            offsetY = (previewH - imgHeight * scaleY) / 2;
          } else {
            // Image cao hơn → scale theo height, crop width
            scaleY = previewH / imgHeight;
            scaleX = scaleY; // Uniform scale
            offsetX = (previewW - imgWidth * scaleX) / 2;
            offsetY = 0;
          }
        } else {
          // Mobile: Stretch mode (fill screen)
          scaleX = previewW / imgWidth;
          scaleY = previewH / imgHeight;
          offsetX = 0;
          offsetY = 0;
        }
        
        // Validate scale
        if (!isFinite(scaleX) || !isFinite(scaleY) || scaleX <= 0 || scaleY <= 0) {
          return;
        }
        
        // Scale coordinates từ Mat space sang preview space (giống project gốc vẽ trực tiếp)
        let scaledX = face.x * scaleX + offsetX;
        let scaledY = face.y * scaleY + offsetY;
        let scaledWidth = face.width * scaleX;
        let scaledHeight = face.height * scaleY;
        
        // Mở rộng bbox để bao phủ toàn bộ mặt hơn (35%)
        const paddingFactor = 0.35;
        const paddingX = scaledWidth * paddingFactor;
        const paddingY = scaledHeight * paddingFactor;
        scaledX -= paddingX;
        scaledY -= paddingY;
        scaledWidth += paddingX * 2;
        scaledHeight += paddingY * 2;
        
        // Validate coordinates
        if (!isFinite(scaledX) || !isFinite(scaledY) || !isFinite(scaledWidth) || !isFinite(scaledHeight)) {
          return;
        }
        
        // Header offset - để 0 vì preview layout đã bao gồm header overlay
        const headerOffsetY = 0;
        
        // Clamp để không ra ngoài preview bounds
        const finalX = Math.max(0, Math.min(scaledX, previewW - 20));
        const finalY = Math.max(0, Math.min(scaledY + headerOffsetY, previewH - 20));
        const finalWidth = Math.max(40, Math.min(scaledWidth, previewW - finalX));
        const finalHeight = Math.max(40, Math.min(scaledHeight, previewH - finalY));
        
        // Scale eyes và smiles nếu có từ socket response
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
        
        updateFaceDetection({
          x: finalX,
          y: finalY,
          width: finalWidth,
          height: finalHeight,
          eyes: scaledEyes,
          smiles: scaledSmiles,
        });
      } else {
        updateFaceDetection(null);
      }
    };

    on('face:detected', handleFaceDetection);

    return () => {
      off('face:detected', handleFaceDetection);
    };
  }, [isConnected, width, height, on, off, useSocketForDetection, previewLayout]);

  // Detect face realtime qua socket (fallback về API nếu socket chưa ready)
  useEffect(() => {
    if (!cameraActive || capturing || detecting || !cameraRef.current) {
      return;
    }

    // Capture frame và detect
    detectIntervalRef.current = setInterval(async () => {
      if (!cameraRef.current || detecting) return;

      try {
        setDetecting(true);

        // Capture frame nhỏ để detect (quality thấp để nhanh)
        // Tăng quality để cải thiện nhận diện mặt
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5, // Quality thấp cho realtime detection (nhanh)
          skipProcessing: true, // Skip processing để detect nhanh hơn
          exif: false,
          base64: true,
        });

        if (!photo.base64) {
          setDetecting(false);
          return;
        }

        // Lưu image dimensions để scale coordinates sau này
        const photoWidth = photo.width || width;
        const photoHeight = photo.height || height;
        lastImageDimensions.current = {
          width: photoWidth,
          height: photoHeight,
        };

        // Optimized: Use socket if available, fallback to REST API
        if (useSocketForDetection && isConnected && socket) {
          // Send frame via socket (faster real-time detection) kèm image dimensions
          emit('face:detect', {
            base64Image: photo.base64,
            timestamp: Date.now(),
            imageWidth: photo.width || width,
            imageHeight: photo.height || height,
          });
          // Note: Response sẽ được handle trong handleFaceDetection (socket listener)
        } else {
          // Dùng API (fallback hoặc default) - LUÔN chạy nếu socket không available
          const result = await faceService.detectRealtime(photo.base64);

          if (result.faces && result.faces.length > 0) {
            const face = result.faces[0];
            const previewW = previewLayout.width || width;
            const previewH = previewLayout.height || height;
            const imgWidth = result.imageWidth || photo.width || previewW;
            const imgHeight = result.imageHeight || photo.height || previewH;
            
            // Validate dimensions
            if (imgWidth > 0 && imgHeight > 0) {
              // Web: COVER mode (uniform scale), Mobile: STRETCH mode
              const imageAspectRatio = imgWidth / imgHeight;
              const screenAspectRatio = previewW / previewH;
              
              let scaleX, scaleY, offsetX, offsetY;
              
              if (Platform.OS === 'web') {
                // Web: Giữ aspect ratio
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
                // Mobile: Stretch
                scaleX = previewW / imgWidth;
                scaleY = previewH / imgHeight;
                offsetX = 0;
                offsetY = 0;
              }
              
              if (isFinite(scaleX) && isFinite(scaleY) && scaleX > 0 && scaleY > 0) {
                let scaledX = face.x * scaleX + offsetX;
                let scaledY = face.y * scaleY + offsetY;
                let scaledWidth = face.width * scaleX;
                let scaledHeight = face.height * scaleY;
                
                // Mở rộng bbox để bao phủ toàn bộ mặt hơn (35%)
                const paddingFactor = 0.35;
                const paddingX = scaledWidth * paddingFactor;
                const paddingY = scaledHeight * paddingFactor;
                scaledX -= paddingX;
                scaledY -= paddingY;
                scaledWidth += paddingX * 2;
                scaledHeight += paddingY * 2;
                
                // Validate coordinates
                if (!isFinite(scaledX) || !isFinite(scaledY) || !isFinite(scaledWidth) || !isFinite(scaledHeight)) {
                  return;
                }
                
                // Header offset - để 0 vì preview layout đã bao gồm header overlay
                const headerOffsetY = 0;
                
                // Clamp để không ra ngoài preview bounds
                const finalX = Math.max(0, Math.min(scaledX, previewW - 20));
                const finalY = Math.max(0, Math.min(scaledY + headerOffsetY, previewH - 20));
                const finalWidth = Math.max(40, Math.min(scaledWidth, previewW - finalX));
                const finalHeight = Math.max(40, Math.min(scaledHeight, previewH - finalY));
                
                updateFaceDetection({
                  x: finalX,
                  y: finalY,
                  width: finalWidth,
                  height: finalHeight,
                });
              }
            }
          } else {
            updateFaceDetection(null);
          }
        }

        } catch (error: any) {
          // Ignore camera not ready errors (sẽ retry ở lần tiếp theo)
          if (error?.message?.includes('camera data') || error?.message?.includes('HTMLVideoElement')) {
            // Camera chưa sẵn sàng, bỏ qua frame này
            updateFaceDetection(null);
          }
          // Silently handle other errors
      } finally {
        setDetecting(false);
      }
    }, useSocketForDetection && isConnected ? 400 : 500); // Socket: 400ms (tối ưu) vs API: 500ms

    return () => {
      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current);
      }
    };
  }, [cameraActive, capturing, detecting, isConnected, emit, width, height, previewLayout]);

  const handleCapture = async (opts?: { isAuto?: boolean }) => {
    if (!cameraRef.current || !studentId || capturing) {
      return;
    }
    
    // Warning nếu không có face detected, nhưng vẫn cho phép chụp
    if (!faceDetected && !opts?.isAuto) {
      showToast("Chưa phát hiện khuôn mặt. Vẫn sẽ thử chụp...", "warning");
    }

    try {
      setCapturing(true);
      
      // Đợi một chút để camera ổn định trước khi capture
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!cameraRef.current) {
        showToast("Camera chưa sẵn sàng", "error");
        setCameraActive(true);
        return;
      }

      // Capture photo chất lượng cao
      // Tăng quality lên tối đa (1.0) để cải thiện nhận diện mặt trên mobile
      // Mobile thường có độ phân giải thấp hơn web, cần quality cao hơn
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0, // Maximum quality để tăng similarity trên mobile
        skipProcessing: false, // Đảm bảo image được process đầy đủ
        exif: false,
        base64: true,
      });

      if (!photo.base64) {
        showToast("Không thể chụp ảnh. Vui lòng thử lại.", "error");
        setCameraActive(true);
        return;
      }
      
      // Tắt camera sau khi capture thành công
      setCameraActive(false);

      const base64Image = photo.base64;

      // Đăng ký góc mặt đầu tiên hoặc thêm góc mặt mới
      let result;
      if (currentStep === 0) {
        result = await faceService.registerFromCamera({
          studentId,
          base64Image,
        });
      } else {
        result = await faceService.addFaceAngle({
          studentId,
          base64Image,
        });
      }

      // Lấy thông tin mắt/miệng từ extract encoding để hiển thị trên UI
      try {
        const encodingResult = await faceService.extractEncodingFromCamera(
          `data:image/jpeg;base64,${photo.base64}`
        );
        if (encodingResult.eyes && encodingResult.smiles && encodingResult.faceX !== undefined) {
          // Scale coordinates từ image dimensions về preview dimensions
          const previewW = previewLayout.width || width;
          const previewH = previewLayout.height || height;
          const imgWidth = photo.width || previewW;
          const imgHeight = photo.height || previewH;
          const scaleX = previewW / imgWidth;
          const scaleY = previewH / imgHeight;
          
          setFaceDetected({
            x: encodingResult.faceX * scaleX,
            y: encodingResult.faceY! * scaleY,
            width: (encodingResult.faceWidth || 0) * scaleX,
            height: (encodingResult.faceHeight || 0) * scaleY,
            eyes: encodingResult.eyes.map(eye => ({
              x: eye.x * scaleX,
              y: eye.y * scaleY,
              width: eye.width * scaleX,
              height: eye.height * scaleY,
            })),
            smiles: encodingResult.smiles.map(smile => ({
              x: smile.x * scaleX,
              y: smile.y * scaleY,
              width: smile.width * scaleX,
              height: smile.height * scaleY,
            })),
          });
        }
      } catch (error) {
        // Nếu không lấy được thông tin mắt/miệng, không sao, vẫn tiếp tục
        console.warn("Could not get eyes/smiles info:", error);
      }

      // Animation fade
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start();

      showToast(`Đã đăng ký góc mặt ${currentStep + 1}/5 thành công!`, "success");

      // Chuyển sang bước tiếp theo
      setTimeout(() => {
        if (currentStep < FACE_ANGLES.length - 1) {
          setCurrentStep(currentStep + 1);
          setCameraActive(true); // Bật lại camera cho bước tiếp theo
        } else {
          // Hoàn thành
          setCameraActive(false); // Tắt camera khi hoàn thành
          showToast("Đăng ký khuôn mặt hoàn tất! 🎉", "success");
          setTimeout(() => {
            router.back();
          }, 2000);
        }
      }, 1000);
    } catch (error: any) {
      console.error("Face registration error:", error);
      showToast(
        error.message || "Không thể kết nối server. Vui lòng thử lại.",
        "error"
      );
      setCameraActive(true); // Bật lại camera nếu lỗi
    } finally {
      setCapturing(false);
    }
  };

  // Auto-capture kiểu ngân hàng: khi face "ready" ổn định -> đếm ngược -> chụp
  useEffect(() => {
    // Trên mobile (Expo), tắt auto-capture để tránh camera bị tắt/bật liên tục gây chớp màn
    if (!enableAutoCapture) return;

    if (!cameraActive || capturing) return;

    // Nếu mất điều kiện ready thì hủy countdown
    if (!isReadyToCapture) {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setCountdown(null);
      return;
    }

    // Nếu đã countdown rồi thì thôi
    if (countdownTimerRef.current || countdown !== null) return;

    setCountdown(AUTO_CAPTURE_COUNTDOWN_SEC);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          // Trigger capture (manual logic giữ nguyên)
          setTimeout(() => {
            handleCapture({ isAuto: true });
          }, 0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cameraActive, capturing, isReadyToCapture, countdown, enableAutoCapture]);

  // Reset UI state khi đổi step / tắt camera
  useEffect(() => {
    stableFramesRef.current = 0;
    setIsReadyToCapture(false);
    setCountdown(null);
    faceBoxRef.current = null;
    setFaceDetected(null);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, [currentStep, cameraActive]);

  const handleCancel = () => {
    setCameraActive(false); // Tắt camera
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    // Stop emitting frames
    off('face:detected');
    router.back();
  };

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setCameraActive(false);
    };
  }, []);

  // Loading state
  if (loadingStudentId || checkingFaceStatus || !permission) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 16, color: Colors.textSecondary }}>
            {loadingStudentId
              ? "Đang tải thông tin..."
              : checkingFaceStatus
              ? "Đang kiểm tra trạng thái đăng ký khuôn mặt..."
              : "Đang tải camera..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Đã đăng ký face rồi -> chặn vào flow, trải nghiệm kiểu banking
  if (alreadyRegistered) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <StatusBar style="dark" />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: paddingHorizontal,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 520,
              backgroundColor: Colors.white,
              borderRadius: 18,
              padding: 20,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: Colors.textHeading,
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Bạn đã đăng ký khuôn mặt rồi
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 18,
              }}
            >
              Khuôn mặt của bạn đã được đăng ký trước đó. Nếu bạn cần đăng ký lại,
              vui lòng liên hệ quản trị viên.
            </Text>
            <PrimaryButton title="Quay lại" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Permission denied
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
            Vui lòng cho phép truy cập camera để đăng ký khuôn mặt
          </Text>
          <PrimaryButton title="Cấp quyền camera" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {/* Camera View */}
      {cameraActive && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: Platform.OS === "web" ? "center" : "flex-start",
          }}
        >
          <View
            style={
              Platform.OS === "web"
                ? {
                    width: Math.min(maxContentWidth, width),
                    aspectRatio: 3 / 4,
                    maxHeight: height,
                    borderRadius: 24,
                    overflow: "hidden",
                  }
                : {
                    flex: 1,
                    alignSelf: "stretch",
                  }
            }
            onLayout={(e) => {
              const { width: pw, height: ph } = e.nativeEvent.layout;
              if (pw > 0 && ph > 0) {
                setPreviewLayout({ width: pw, height: ph });
              }
            }}
          >
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
          
            {/* Overlay - Tách ra ngoài CameraView để tránh warning */}
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
            {/* Top Header với Progress Bar */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                paddingTop: 40,
                paddingHorizontal: paddingHorizontal,
                zIndex: 10,
              }}
            >
              {/* Ready chip */}
              {(isReadyToCapture || countdown !== null) && (
                <View
                  style={{
                    alignSelf: "center",
                    marginBottom: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor:
                      countdown !== null
                        ? "rgba(0, 180, 216, 0.95)"
                        : "rgba(34, 197, 94, 0.95)",
                  }}
                >
                  <Text
                    style={{
                      color: "#000",
                      fontSize: 12,
                      fontWeight: "700",
                      letterSpacing: 0.2,
                    }}
                  >
                    {countdown !== null ? `Đang chụp: ${countdown}` : "Sẵn sàng"}
                  </Text>
                </View>
              )}

              {/* Progress Bar */}
              <View
                style={{
                  height: 4,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: 2,
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    backgroundColor: Colors.primary,
                    borderRadius: 2,
                  }}
                />
              </View>

              {/* Step Title */}
              <Text
                style={{
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: "700",
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                {currentAngle.title}
              </Text>
            </View>

            {/* Face Detection Box - Banking style */}
            {faceDetected && (
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
            )}

            {/* Eye Detection Boxes */}
            {faceDetected?.eyes?.map((eye, index) => (
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
            {faceDetected?.smiles?.map((smile, index) => (
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

            {/* Guide Frame - Banking style */}
            <View
              style={{
                position: "absolute",
                top: "25%",
                left: "10%",
                right: "10%",
                aspectRatio: 0.75,
                borderWidth: 2,
                borderColor: faceDetected ? Colors.primary : "rgba(255,255,255,0.5)",
                borderRadius: 20,
                borderStyle: "dashed",
              }}
            />

            {/* Bottom Overlay */}
            <Animated.View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                paddingHorizontal: paddingHorizontal,
                paddingBottom: 40,
                paddingTop: 24,
                backgroundColor: "rgba(0,0,0,0.85)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                opacity: fadeAnim,
              }}
            >
              {/* Icon và Instruction */}
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                <View style={{ marginBottom: 12 }}>
                  {faceDetected ? (
                    <CheckCircleIcon size={64} color={Colors.primary} />
                  ) : (
                    <currentAngle.IconComponent size={64} color={Colors.white} />
                  )}
                </View>
                <Text
                  style={{
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: "600",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  {countdown !== null
                    ? `Giữ yên... chụp sau ${countdown}`
                    : isReadyToCapture
                    ? "Giữ yên... đang chuẩn bị chụp"
                    : faceDetected
                    ? "Khuôn mặt đã được nhận diện"
                    : currentAngle.instruction}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  {countdown !== null
                    ? "Đừng di chuyển để ảnh rõ nét"
                    : isReadyToCapture
                    ? "Hệ thống sẽ tự chụp nếu bạn giữ ổn định"
                    : faceDetected
                    ? "Giữ mặt trong khung nét đứt để tự chụp"
                    : "Đảm bảo ánh sáng đủ và khuôn mặt rõ ràng"}
                </Text>
              </View>

              {/* Capture Button */}
              <PrimaryButton
                title={
                  capturing
                    ? "Đang xử lý..."
                    : countdown !== null
                    ? `Chụp sau ${countdown}`
                    : currentStep === FACE_ANGLES.length - 1
                    ? "Hoàn tất"
                    : "Chụp ảnh"
                }
                onPress={handleCapture}
                loading={capturing}
                disabled={capturing || countdown !== null}
              />

              {/* Back Button */}
              <TouchableOpacity
                onPress={handleCancel}
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
                    opacity: 0.8,
                  }}
                >
                  Hủy
              </Text>
            </TouchableOpacity>
            </Animated.View>
            </View>
          </View>
        </View>
      )}

      {/* Loading overlay khi không có camera */}
      {!cameraActive && capturing && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ color: Colors.white, marginTop: 16 }}>
            Đang xử lý...
          </Text>
        </View>
      )}

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