import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
  useWindowDimensions,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  getRoleFromToken,
  getUserIdFromToken,
  getStudentIdFromToken,
} from "@/apis/utils/jwt";
import { getAuthToken, getCurrentUserProfile } from "@/apis/config/apiClient";
import { reportService, subjectService } from "@/apis";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const CHAT_SERVICE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:8091"
    : "http://192.168.1.12:8091"; // TODO: đổi IP này thành IP máy chạy AI/chat-service khi test trên device

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  downloadExcel?: boolean;
  /** Tên môn khi user hỏi xuất báo cáo theo môn → tải Excel chỉ môn đó */
  subjectName?: string | null;
}

interface ChatBoxProps {
  onClose?: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [downloadingExcel, setDownloadingExcel] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  // Load role, userId, display name sau khi user đã login
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [role, userId, studentId, profile] = await Promise.all([
          getRoleFromToken(),
          getUserIdFromToken(),
          getStudentIdFromToken(),
          getCurrentUserProfile(),
        ]);
        if (!isMounted) return;
        setCurrentRole(role);
        setCurrentUserId(role === "STUDENT" && studentId ? studentId : userId);
        setCurrentName(profile?.name ?? null);
      } catch (error) {
        console.error("Không lấy được role/userId/profile:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to keyboard events on mobile
  useEffect(() => {
    if (isWeb) return;

    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: any) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [isWeb]);

  const handleDownloadExcel = async (messageId: string) => {
    try {
      setDownloadingExcel(messageId);
      const message = messages.find((m) => m.id === messageId);
      const subjectName = message?.subjectName;
      let subjectId: string | undefined;
      if (subjectName) {
        try {
          const subjects = await subjectService.getSubjects();
          const subject = subjects.find(
            (s) =>
              s.name === subjectName ||
              s.name.toLowerCase().includes(subjectName.toLowerCase()),
          );
          if (subject) subjectId = subject.id;
        } catch (_) {
          /* ignore: xuất toàn bộ nếu không tìm được môn */
        }
      }
      const baseFilename = subjectName
        ? `Bao_cao_diem_danh_${subjectName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}`
        : `Bao_cao_diem_danh_${new Date().toISOString().slice(0, 10)}`;
      const filename = `${baseFilename}.xlsx`;
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const blob = await reportService.exportExcel(undefined, subjectId);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const token = await getAuthToken();
        if (!token) return;
        const url = reportService.getExportExcelUrl(undefined, subjectId);
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, btoa(binary), {
          encoding: FileSystem.EncodingType.Base64,
        });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: "Lưu file Excel",
          });
        }
      }
    } catch (error) {
      console.error("Download Excel error:", error);
    } finally {
      setDownloadingExcel(null);
    }
  };

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;

    const openFromHeader = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener("chatbox:open", openFromHeader as EventListener);
    return () => {
      window.removeEventListener(
        "chatbox:open",
        openFromHeader as EventListener,
      );
    };
  }, [isWeb]);

  useEffect(() => {
    if (isOpen && !isMinimized && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const groqMessages = [
        {
          role: "system",
          content: `Bạn là trợ lý ảo ĐỘC QUYỀN của hệ thống quản lý học vụ trường Đại học. Bạn CẦN TUÂN THỦ NGHIÊM NGẶT CÁC QUY TẮC SAU:

1. VAI TRÒ VÀ NGƯỜI DÙNG: Bạn đang hỗ trợ người dùng có vai trò: ${currentRole ?? "Chưa rõ"}. Tên của họ là: ${currentName ?? "Bạn"}.
2. PHẠM VI TRẢ LỜI: BẠN CHỈ ĐƯỢC PHÉP trả lời các câu hỏi liên quan ĐẾN VIỆC SỬ DỤNG HỆ THỐNG này (lịch học, điểm danh, lịch thi, danh sách lớp, quy chế học vụ).
3. TỪ CHỐI TUYỆT ĐỐI: 
   - KHÔNG trả lời bất kỳ câu hỏi nào về lập trình, logic code, công nghệ phần mềm, thuật toán.
   - KHÔNG trả lời các kiến thức chung ngoài xã hội, giải trí, toán học, văn học, v.v.
   - KHÔNG viết code, KHÔNG dịch thuật, KHÔNG làm thơ.
   -> Nếu người dùng hỏi những thứ này, HÃY TỪ CHỐI NGAY LẬP TỨC: "Xin lỗi, tôi là trợ lý học vụ. Tôi chỉ hỗ trợ các vấn đề liên quan đến lịch học, điểm danh và chức năng của hệ thống."
4. HƯỚNG DẪN CHỨC NĂNG HỆ THỐNG:
   - Nếu là Sinh viên (STUDENT): Xưng hô "bạn - trợ lý". CHỈ hướng dẫn xem lịch học, lịch thi, lịch sử điểm danh của bản thân.
     + Cách quét mặt điểm danh: Hướng dẫn bạn sinh viên vào màn hình Điểm danh, cấp quyền camera, đưa khuôn mặt vào khung hình tròn, giữ thẳng và chờ hệ thống nhận diện.
     + KHÔNG CUNG CẤP thông tin hay quyền hạn của Giảng viên/Admin.
   - Nếu là Giảng viên (TEACHER): Xưng hô "thầy/cô - trợ lý".
     + Cách bật điểm danh: Hướng dẫn thầy/cô vào Lịch giảng dạy -> Chọn buổi học -> Nhấn nút "Bắt đầu điểm danh" -> Hệ thống sẽ tạo phiên và tự động phát mã QR hoặc bắt đầu nhận diện khuôn mặt sinh viên.
     + Hướng dẫn xem danh sách lớp, xuất báo cáo điểm danh.
   - Nếu là Giáo vụ (ACADEMIC_STAFF): Hướng dẫn các chức năng quản lý lớp học, xếp lịch.
   - Nếu là Admin (ADMIN): Hướng dẫn quản trị hệ thống, cấp quyền.`,
        },
        ...messages
          .filter(m => m.id !== "1") // Bỏ qua câu chào mặc định ban đầu để tiết kiệm token
          .map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        {
          role: "user",
          content: userMessage.text,
        },
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Free tier, nhanh, hỗ trợ tiếng Việt tốt
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const answerText = data.choices?.[0]?.message?.content ?? "Xin lỗi, tôi không thể xử lý yêu cầu lúc này.";

      // Vẫn giữ lại logic nút tải Excel nếu AI tình cờ nhắc đến
      const showExcelButton = answerText.includes("Tải file Excel") && answerText.includes("Bấm nút");

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: answerText,
        sender: "bot",
        timestamp: new Date(),
        downloadExcel: showExcelButton,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "Không kết nối được tới AI (Groq API). Vui lòng kiểm tra lại mạng hoặc API Key.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else if (isMinimized) {
      // Chỉ web mới có thu gọn
      if (isWeb) {
        setIsMinimized(false);
      }
    } else {
      // Chỉ web mới có thu gọn
      if (isWeb) {
        setIsMinimized(true);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    onClose?.();
  };

  // Chat button (always visible when closed)
  if (!isOpen) {
    return (
      <TouchableOpacity
        onPress={toggleChat}
        style={{
          position: isWeb ? ("fixed" as any) : "absolute",
          bottom: isWeb ? 24 : 110,
          right: isWeb ? 24 : 16,
          width: isMobile ? 52 : 64,
          height: isMobile ? 52 : 64,
          borderRadius: isMobile ? 26 : 32,
          backgroundColor: Colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
          zIndex: 1000,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubbles" size={30} color={Colors.white} />
      </TouchableOpacity>
    );
  }

  // Chat window dimensions
  // Mobile: không có thu gọn, luôn full hoặc đóng
  // Web: có thu gọn
  const chatWidth = isWeb ? (isMobile ? "90%" : 380) : "100%";
  const chatHeight = isWeb ? (isMinimized ? 56 : 500) : "100%"; // Mobile: luôn full screen để dễ xử lý keyboard

  return (
    <Animated.View
      style={{
        position: isWeb ? ("fixed" as any) : "absolute",
        bottom: isWeb ? 24 : 0,
        right: isWeb ? 24 : 0,
        width: chatWidth,
        height: chatHeight,
        maxHeight: isWeb ? 600 : "90%",
        backgroundColor: Colors.white,
        borderRadius: isWeb ? 12 : isMinimized ? 28 : 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
        zIndex: 1000,
        overflow: "hidden",
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          },
        ],
      }}
    >
      {/* Header - Always visible, even when minimized (web only) */}
      <TouchableOpacity
        onPress={isMinimized && isWeb ? toggleChat : undefined}
        activeOpacity={isMinimized && isWeb ? 0.7 : 1}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 14,
          backgroundColor: Colors.white,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
          minHeight: 64,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.primary + "15",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="chatbubbles" size={20} color={Colors.primary} />
          </View>
          {!isMinimized && (
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: Colors.textHeading,
                }}
              >
                Trợ lý ảo
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981", marginRight: 6 }} />
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.textSecondary,
                  }}
                >
                  Trực tuyến
                </Text>
              </View>
            </View>
          )}
          {isMinimized && isWeb && (
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: Colors.textHeading,
                flex: 1,
              }}
            >
              Nhấn để mở rộng
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {!isMinimized && isWeb && (
            <TouchableOpacity
              onPress={toggleChat}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Messages - Only show when not minimized */}
      {!isMinimized && (
        <View style={{ flex: 1, paddingBottom: keyboardHeight }}>
          <ScrollView
            ref={scrollViewRef}
            style={{
              flex: 1,
              backgroundColor: Colors.surface,
            }}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 8,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <View key={message.id} style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    marginBottom:
                      message.sender === "bot" && message.downloadExcel ? 8 : 0,
                    justifyContent:
                      message.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <View
                    style={{
                      maxWidth: "80%",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 20,
                      borderTopLeftRadius: message.sender === "bot" ? 4 : 20,
                      borderTopRightRadius: message.sender === "user" ? 4 : 20,
                      backgroundColor:
                        message.sender === "user"
                          ? Colors.primary
                          : "#F3F4F6",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        color:
                          message.sender === "user"
                            ? Colors.white
                            : Colors.textHeading,
                      }}
                    >
                      {message.text}
                    </Text>
                  </View>
                </View>
                {message.sender === "bot" && message.downloadExcel && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      paddingLeft: 4,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleDownloadExcel(message.id)}
                      disabled={downloadingExcel === message.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#10B981",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 10,
                        gap: 8,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      activeOpacity={0.7}
                    >
                      {downloadingExcel === message.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={{ fontSize: 18 }}>📥</Text>
                      )}
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#fff",
                        }}
                      >
                        {downloadingExcel === message.id
                          ? "Đang tải..."
                          : "Tải file Excel"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            {isLoading && (
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: Colors.white,
                    borderWidth: 1,
                    borderColor: Colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                    Đang soạn...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input - Fixed at bottom, above keyboard */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 12),
              backgroundColor: Colors.white,
              borderTopWidth: 1,
              borderTopColor: "#F3F4F6",
              gap: 12,
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Hỏi trợ lý ảo..."
              placeholderTextColor={Colors.textSecondary}
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textHeading,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: "#F9FAFB",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
              }}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              onKeyPress={(e: any) => {
                if (Platform.OS === "web" && e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  inputText.trim() && !isLoading
                    ? Colors.primary
                    : Colors.gray200,
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="send"
                size={16}
                color={
                  inputText.trim() && !isLoading
                    ? Colors.white
                    : Colors.textSecondary
                }
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
};
