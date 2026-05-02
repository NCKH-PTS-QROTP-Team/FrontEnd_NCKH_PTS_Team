import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Toast, { useToast } from "@/components/Toast";
import { Colors } from "@/constants/colors";
import { Spinner } from "@/components/Spinner";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { toast, showToast, hideToast } = useToast();

  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isMobile = width < 768;
  const containerPadding = isDesktop ? 48 : isTablet ? 32 : 16;

  const logoNameImage = require("../../assets/logoname.png");

  // ── Override browser autofill background on web ──
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const style = document.createElement("style");
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
        -webkit-text-fill-color: #1e293b !important;
        transition: background-color 5000s ease-in-out 0s;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const isFormValid = email.trim().length > 0 && isValidEmail(email);

  const handleResetPassword = async () => {
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Email không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      showToast("Link đặt lại mật khẩu đã được gửi đến email của bạn!", "success");
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      showToast("Đã có lỗi xảy ra. Vui lòng thử lại sau.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f0f4f8" }}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: containerPadding,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* ── Card ── */}
          <View
            style={{
              width: "100%",
              maxWidth: 480,
              backgroundColor: Colors.white,
              borderRadius: 16,
              paddingHorizontal: isDesktop ? 36 : isTablet ? 32 : 24,
              paddingVertical: isDesktop ? 40 : isTablet ? 36 : 30,
              ...(Platform.OS === "web"
                ? ({
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                  } as any)
                : {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.12,
                    shadowRadius: 24,
                    elevation: 8,
                  }),
            }}
          >
            {/* ── Logo & Title ── */}
            <View style={{ alignItems: "center", marginBottom: isMobile ? 24 : 32 }}>
              <Image
                source={logoNameImage}
                style={{ height: isMobile ? 36 : 46, resizeMode: "contain", marginBottom: isMobile ? 12 : 18 }}
              />
              <Text
                style={{
                  fontSize: isMobile ? 16 : 20,
                  fontWeight: "800",
                  color: "#1e3a5f",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                QUÊN MẬT KHẨU
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 14 : 15,
                  color: "#475569",
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Nhập email của bạn để nhận link đặt lại mật khẩu
              </Text>
            </View>

            {/* ── Email Field ── */}
            <View style={{ marginBottom: isMobile ? 20 : 28 }}>
              <Text style={getLabelStyle(isMobile)}>Email</Text>
              <View
                style={[
                  inputContainerStyle,
                  {
                    height: isMobile ? 44 : 50,
                    borderColor: emailError
                      ? "#ef4444"
                      : "#e2e8f0",
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={isMobile ? 18 : 20}
                  color={emailError ? "#ef4444" : "#94a3b8"}
                />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#a0aec0"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                  style={getTextInputStyle(isMobile)}
                />
              </View>
              {emailError ? (
                <Text style={errorTextStyle}>{emailError}</Text>
              ) : null}
            </View>

            {/* ── Reset Button (Orange Gradient) ── */}
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading || !isFormValid}
              activeOpacity={0.85}
              style={{
                borderRadius: 10,
                height: isMobile ? 44 : 50,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isFormValid ? "#ea580c" : "#d1d5db",
                marginBottom: isMobile ? 24 : 32,
                ...(Platform.OS === "web"
                  ? ({
                      cursor: loading || !isFormValid ? "not-allowed" : "pointer",
                      transition: "all 0.25s ease",
                      background: isFormValid
                        ? "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)"
                        : "#d1d5db",
                    } as any)
                  : {}),
                ...(isFormValid && Platform.OS !== "web"
                  ? {
                      shadowColor: "#ea580c",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }
                  : {}),
              }}
            >
              {loading ? (
                <Spinner size={20} color="#fff" />
              ) : (
                <Text
                  style={{
                    color: isFormValid ? "#ffffff" : "#9ca3af",
                    fontSize: 16,
                    fontWeight: "700",
                    letterSpacing: 0.3,
                  }}
                >
                  Gửi email đặt lại mật khẩu
                </Text>
              )}
            </TouchableOpacity>

            {/* ── Back to Login Link ── */}
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.back()}
                style={[
                  { flexDirection: "row", alignItems: "center", gap: 6 },
                  Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}
                ]}
              >
                <Ionicons name="arrow-back" size={16} color="#3b82f6" />
                <Text
                  style={{
                    fontSize: isMobile ? 14 : 15,
                    fontWeight: "600",
                    color: "#3b82f6",
                  }}
                >
                  Quay về trang đăng nhập
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </KeyboardAvoidingView>
  );
}

// ── Shared Styles ────────────────────────────────────────────────────

const getLabelStyle = (isMobile: boolean) => ({
  fontSize: isMobile ? 13 : 15,
  fontWeight: "700" as const,
  color: "#1e293b",
  marginBottom: isMobile ? 6 : 10,
});

const inputContainerStyle: any = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  borderWidth: 1.5,
  borderRadius: 10,
  backgroundColor: "#ffffff",
  paddingHorizontal: 16,
  ...(Platform.OS === "web" ? { transition: "all 0.2s ease" } : {}),
};

const getTextInputStyle = (isMobile: boolean) => ({
  flex: 1,
  marginLeft: 10,
  fontSize: isMobile ? 14 : 15,
  color: "#1e293b",
  height: "100%",
  ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
});

const errorTextStyle = {
  fontSize: 13,
  color: "#ef4444",
  marginTop: 6,
  marginLeft: 4,
};
