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
import { Colors } from "@/constants/colors";
import { getRoleFromToken, getUserIdFromToken, getStudentIdFromToken } from "@/apis/utils/jwt";
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
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
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
              s.name.toLowerCase().includes(subjectName.toLowerCase())
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
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
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
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
      window.removeEventListener("chatbox:open", openFromHeader as EventListener);
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
      const response = await fetch(`${CHAT_SERVICE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          sessionId: "fe-default",
          role: currentRole ?? "UNKNOWN",
          userId: currentUserId,
          display_name: currentName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json() as {
        answer?: string;
        intent?: string;
        downloadExcel?: boolean;
        download_excel?: boolean;
        subjectName?: string | null;
        subject_name?: string | null;
      };

      const answerText =
        data.answer ??
        "Chat-service không trả về nội dung. Vui lòng kiểm tra lại service AI/chat-service.";
      const hasDownloadExcelFlag =
        data.downloadExcel === true || data.download_excel === true;
      // Fallback: nếu API không trả downloadExcel nhưng nội dung có nhắc nút Tải file Excel → vẫn hiển thị nút
      const showExcelButton =
        hasDownloadExcelFlag ||
        (answerText.includes("Tải file Excel") && answerText.includes("Bấm nút"));
      const subjectName =
        data.subjectName ?? data.subject_name ?? undefined;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: answerText,
        sender: "bot",
        timestamp: new Date(),
        downloadExcel: showExcelButton,
        subjectName: subjectName || undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        text:
          "Không kết nối được tới AI/chat-service. Hãy kiểm tra:\n" +
          "- Service đã được chạy với `uvicorn app.main:app --port 8091` chưa?\n" +
          "- IP/port trong CHAT_SERVICE_URL đã đúng chưa?",
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
          bottom: isWeb ? 24 : 100,
          right: isWeb ? 24 : 16,
          width: isMobile ? 56 : 64,
          height: isMobile ? 56 : 64,
          borderRadius: isMobile ? 28 : 32,
          backgroundColor: Colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
          zIndex: 1000,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 24 }}>💬</Text>
      </TouchableOpacity>
    );
  }

  // Chat window dimensions
  // Mobile: không có thu gọn, luôn full hoặc đóng
  // Web: có thu gọn
  const chatWidth = isWeb ? (isMobile ? "90%" : 380) : "100%";
  const chatHeight = isWeb 
    ? (isMinimized ? 56 : 500) 
    : "100%"; // Mobile: luôn full screen để dễ xử lý keyboard

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
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: Colors.primary,
          minHeight: 56,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: Colors.white + "30",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 18 }}>💬</Text>
          </View>
          {!isMinimized && (
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: Colors.white,
                }}
              >
                Trợ lý ảo
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: Colors.white + "CC",
                }}
              >
                Sẵn sàng hỗ trợ
              </Text>
            </View>
          )}
          {isMinimized && isWeb && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: Colors.white,
                flex: 1,
              }}
            >
              Nhấn để mở rộng
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* Nút thu gọn chỉ hiển thị trên web và khi không minimized */}
          {!isMinimized && isWeb && (
            <TouchableOpacity
              onPress={toggleChat}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: Colors.white + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 14, color: Colors.white }}>−</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: Colors.white + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16, color: Colors.white }}>×</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Messages - Only show when not minimized */}
      {!isMinimized && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
          enabled={!isWeb}
        >
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
                    marginBottom: message.sender === "bot" && message.downloadExcel ? 8 : 0,
                    justifyContent:
                      message.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <View
                    style={{
                      maxWidth: "75%",
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor:
                        message.sender === "user"
                          ? Colors.primary
                          : Colors.white,
                      borderWidth: message.sender === "bot" ? 1 : 0,
                      borderColor: Colors.border,
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
                      <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>
                        {downloadingExcel === message.id ? "Đang tải..." : "Tải file Excel"}
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
              paddingHorizontal: 12,
              paddingVertical: 12,
              backgroundColor: Colors.white,
              borderTopWidth: 1,
              borderTopColor: Colors.border,
              gap: 8,
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={Colors.textSecondary}
              style={{
                flex: 1,
                fontSize: 14,
                color: Colors.textHeading,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: Colors.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
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
              <Text
                style={{
                  fontSize: 16,
                  color:
                    inputText.trim() && !isLoading
                      ? Colors.white
                      : Colors.textSecondary,
                }}
              >
                ➤
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </Animated.View>
  );
};
