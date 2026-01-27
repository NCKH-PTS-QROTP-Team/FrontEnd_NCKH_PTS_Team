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
}

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
  const [currentStep, setCurrentStep] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [faceDetected, setFaceDetected] = useState<FaceDetection | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<{ width: number; height: number }>({
    width,
    height,
  });
  const cameraRef = useRef<CameraView>(null);
  const detectIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
        
        setFaceDetected({
          x: finalX,
          y: finalY,
          width: finalWidth,
          height: finalHeight,
        });
      } else {
        setFaceDetected(null);
      }
    };

    on('face:detected', handleFaceDetection);

    return () => {
      off('face:detected', handleFaceDetection);
    };
  }, [isConnected, width, height, on, off, useSocketForDetection]);

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
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.3,
          base64: true,
          skipProcessing: true,
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
                
                setFaceDetected({
                  x: finalX,
                  y: finalY,
                  width: finalWidth,
                  height: finalHeight,
                });
              }
            }
          } else {
            setFaceDetected(null);
          }
        }

        } catch (error: any) {
          // Ignore camera not ready errors (sẽ retry ở lần tiếp theo)
          if (error?.message?.includes('camera data') || error?.message?.includes('HTMLVideoElement')) {
            // Camera chưa sẵn sàng, bỏ qua frame này
            setFaceDetected(null);
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
  }, [cameraActive, capturing, detecting, isConnected, emit, width, height]);

  const handleCapture = async () => {
    if (!cameraRef.current || !studentId || capturing) {
      return;
    }
    
    // Warning nếu không có face detected, nhưng vẫn cho phép chụp
    if (!faceDetected) {
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
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: false, // Đảm bảo image được process đầy đủ
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

      // Animation fade
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
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

  const handleCancel = () => {
    setCameraActive(false); // Tắt camera
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current);
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
      setCameraActive(false);
    };
  }, []);

  // Loading state
  if (loadingStudentId || !permission) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 16, color: Colors.textSecondary }}>
            {loadingStudentId ? "Đang tải thông tin..." : "Đang tải camera..."}
          </Text>
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
                  borderWidth: 3,
                  borderColor: Colors.primary,
                  borderRadius: 12,
                  backgroundColor: "transparent",
                }}
              >
                {/* Corner indicators */}
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    left: -2,
                    width: 20,
                    height: 20,
                    borderTopWidth: 4,
                    borderLeftWidth: 4,
                    borderColor: Colors.primary,
                    borderTopLeftRadius: 8,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderTopWidth: 4,
                    borderRightWidth: 4,
                    borderColor: Colors.primary,
                    borderTopRightRadius: 8,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -2,
                    left: -2,
                    width: 20,
                    height: 20,
                    borderBottomWidth: 4,
                    borderLeftWidth: 4,
                    borderColor: Colors.primary,
                    borderBottomLeftRadius: 8,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderBottomWidth: 4,
                    borderRightWidth: 4,
                    borderColor: Colors.primary,
                    borderBottomRightRadius: 8,
                  }}
                />
              </View>
            )}

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
                  {faceDetected
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
                  {faceDetected
                    ? "Nhấn nút bên dưới để chụp ảnh"
                    : "Đảm bảo ánh sáng đủ và khuôn mặt rõ ràng"}
                </Text>
              </View>

              {/* Capture Button */}
              <PrimaryButton
                title={
                  capturing
                    ? "Đang xử lý..."
                    : currentStep === FACE_ANGLES.length - 1
                    ? "Hoàn tất"
                    : "Chụp ảnh"
                }
                onPress={handleCapture}
                loading={capturing}
                disabled={capturing}
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