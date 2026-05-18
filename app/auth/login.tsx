import React, { useState, useEffect, useCallback } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "@/components/ToastProvider";
import { Colors } from "@/constants/colors";
import { mockUsers } from "@/constants/mockData";
import { authService } from "@/apis";
import { Spinner } from "@/components/Spinner";

// ── Captcha Generator ────────────────────────────────────────────────

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generateCaptchaText(length = 5): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
}

const CAPTCHA_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#9b59b6",
  "#e67e22", "#1abc9c", "#c0392b", "#2980b9",
  "#8e44ad", "#d35400", "#16a085", "#2c3e50",
];

const CaptchaImage = ({ text, onRefresh }: { text: string; onRefresh: () => void }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      {/* Captcha visual */}
      <View
        style={{
          flex: 1,
          height: Platform.OS === 'web' && window.innerWidth < 768 ? 40 : 50,
          backgroundColor: "#f8fafc",
          borderRadius: 10,
          overflow: "hidden",
          borderWidth: 1.5,
          borderColor: "#e2e8f0",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Noise lines (decorative) */}
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 10,
            right: 40,
            height: 1,
            backgroundColor: "#e74c3c",
            opacity: 0.25,
            transform: [{ rotate: "-8deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            right: 10,
            height: 1,
            backgroundColor: "#3498db",
            opacity: 0.2,
            transform: [{ rotate: "5deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 14,
            left: 5,
            right: 20,
            height: 1,
            backgroundColor: "#2ecc71",
            opacity: 0.25,
            transform: [{ rotate: "3deg" }],
          }}
        />
        {/* Captcha characters */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          {text.split("").map((char, i) => (
            <Text
              key={i}
              style={{
                fontSize: 22 + (i % 3) * 4,
                fontWeight: i % 2 === 0 ? "800" : "500",
                color: CAPTCHA_COLORS[i % CAPTCHA_COLORS.length],
                fontStyle: i % 3 === 0 ? "italic" : "normal",
                transform: [
                  { rotate: `${(i % 2 === 0 ? 1 : -1) * (5 + i * 3)}deg` },
                  { translateY: (i % 2 === 0 ? -3 : 3) },
                ],
                letterSpacing: 2,
                textShadowColor: "rgba(0,0,0,0.08)",
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 1,
                fontFamily: i % 2 === 0 ? undefined : Platform.OS === "web" ? "serif" : undefined,
              }}
            >
              {char}
            </Text>
          ))}
        </View>
      </View>

      {/* Refresh button */}
      <TouchableOpacity
        onPress={onRefresh}
        style={{
          width: Platform.OS === 'web' && window.innerWidth < 768 ? 36 : 40,
          height: Platform.OS === 'web' && window.innerWidth < 768 ? 36 : 40,
          borderRadius: 8,
          backgroundColor: "#f1f5f9",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: "#e2e8f0",
          ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={20} color="#64748b" />
      </TouchableOpacity>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════
// ██  LOGIN SCREEN  ██
// ══════════════════════════════════════════════════════════════════════

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { showToast } = useToast();

  // ── Captcha State ──
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isMobile = width < 768;
  const containerPadding = isDesktop ? 48 : isTablet ? 32 : 0; // 0 for mobile so it spans full width

  const logoNameImage = require("../../assets/logoname.png");

  // Generate captcha on mount
  const refreshCaptcha = useCallback(() => {
    setCaptchaText(generateCaptchaText(5));
    setCaptchaInput("");
    setCaptchaError("");
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, []);

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

  // ── Check if form is valid ──
  const isFormValid =
    username.trim().length > 0 &&
    password.trim().length > 0 &&
    captchaInput.trim().length > 0;

  // ══════════════════════════════════════════════════════════════════
  // ██  BUSINESS LOGIC — PRESERVED EXACTLY  ██
  // ══════════════════════════════════════════════════════════════════

  const handleLogin = async () => {
    setUsernameError("");
    setPasswordError("");
    setCaptchaError("");

    if (!username.trim()) {
      setUsernameError("Vui lòng nhập mã tài khoản");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu");
      return;
    }

    // Validate captcha
    if (captchaInput.trim().toLowerCase() !== captchaText.toLowerCase()) {
      setCaptchaError("Mã xác thực không đúng");
      refreshCaptcha();
      return;
    }

    setLoading(true);

    try {
      // Gọi API login thật
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      const loginResponse = await authService.login({
        loginId: trimmedUsername,
        password: trimmedPassword,
      });

      console.log("Login successful, response:", loginResponse);
      showToast("Đăng nhập thành công!", "success");

      // Navigate based on role after a brief delay
      setTimeout(() => {
        try {
          switch (loginResponse.role.toLowerCase()) {
            case "admin":
              router.replace("/admin/dashboard" as any);
              break;
            case "teacher":
              router.replace("/teacher/dashboard" as any);
              break;
            case "student":
              router.replace("/student/home" as any);
              break;
            case "academic_staff":
              router.replace("/department/dashboard" as any);
              break;
            default:
              showToast("Vai trò không hợp lệ", "error");
          }
        } catch (error) {
          console.error("Navigation error:", error);
        }
      }, 500);

      setLoading(false);
    } catch (error: any) {
      console.error("Login error:", error);

      // Fallback: Thử dùng mock data nếu API không khả dụng
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      const mockUser = mockUsers.find(
        (u) =>
          u.username.toLowerCase() === trimmedUsername.toLowerCase() &&
          u.password === trimmedPassword &&
          u.isActive,
      );

      if (mockUser && error.isNetworkError) {
        console.log("API không khả dụng, dùng mock data");
        showToast("Đăng nhập thành công (mock)!", "success");

        const mockToken = btoa(
          JSON.stringify({
            studentId: mockUser.studentId,
            teacherId: mockUser.teacherId,
            role: mockUser.role,
            userId: mockUser.id,
          }),
        );

        await authService.logout();
        const { setAuthToken, setCurrentUserProfile } = await import("@/apis/config/apiClient");
        await setAuthToken(mockToken);
        await setCurrentUserProfile({
          userId: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        });

        setTimeout(() => {
          switch (mockUser.role) {
            case "admin":
              router.replace("/admin/dashboard" as any);
              break;
            case "teacher":
              router.replace("/teacher/dashboard" as any);
              break;
            case "student":
              router.replace("/student/home" as any);
              break;
            case "academic_staff":
              router.replace("/department/dashboard" as any);
              break;
          }
        }, 500);
      } else {
        showToast(
          error.message || "Tài khoản hoặc mật khẩu không đúng",
          "error",
        );
        setPasswordError("Tài khoản hoặc mật khẩu không đúng");
        refreshCaptcha();
      }

      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // ██  UI RENDER  ██
  // ══════════════════════════════════════════════════════════════════

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isMobile ? Colors.white : "#f0f4f8" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
              paddingTop: isMobile ? 16 : 0,
              backgroundColor: isMobile ? Colors.white : "transparent",
            }}
          >
            {/* ── Login Card ── */}
            <View
              style={{
                width: "100%",
                maxWidth: 440,
                backgroundColor: Colors.white,
                borderRadius: isMobile ? 0 : 16,
                paddingHorizontal: isDesktop ? 32 : isTablet ? 28 : 24,
                paddingVertical: isDesktop ? 36 : isTablet ? 30 : 24,
                ...(Platform.OS === "web" && !isMobile
                  ? ({
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                  } as any)
                  : isMobile ? {} : {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.12,
                    shadowRadius: 24,
                    elevation: 8,
                  }),
              }}
            >
              <View style={{ alignItems: "center", marginBottom: isMobile ? 24 : 28 }}>
                <Image
                  source={logoNameImage}
                  style={{ height: isMobile ? 40 : 50, resizeMode: "contain", marginBottom: isMobile ? 12 : 14 }}
                />
                <Text
                  style={{
                    fontSize: isMobile ? 18 : 18,
                    fontWeight: "800",
                    color: "#1e3a5f",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  Đăng nhập hệ thống
                </Text>
              </View>

              {/* ── Mã tài khoản ── */}
              <View style={{ marginBottom: isMobile ? 16 : 18 }}>
                <Text style={getLabelStyle(isMobile)}>Mã tài khoản</Text>
                <View
                  style={[
                    inputContainerStyle,
                    {
                      height: isMobile ? 48 : 48,
                      borderColor: usernameError
                        ? "#ef4444"
                        : "#e2e8f0",
                    },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={isMobile ? 16 : 18}
                    color={usernameError ? "#ef4444" : "#94a3b8"}
                  />
                  <TextInput
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setUsernameError("");
                    }}
                    placeholder="Nhập Mã tài khoản"
                    placeholderTextColor="#a0aec0"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    style={[getTextInputStyle(isMobile), { outlineStyle: 'none' } as any]}
                  />
                </View>
                {usernameError ? (
                  <Text style={errorTextStyle}>{usernameError}</Text>
                ) : null}
              </View>

              {/* ── Mật khẩu ── */}
              <View style={{ marginBottom: isMobile ? 16 : 18 }}>
                <Text style={getLabelStyle(isMobile)}>Mật khẩu</Text>
                <View
                  style={[
                    inputContainerStyle,
                    {
                      height: isMobile ? 48 : 48,
                      borderColor: passwordError
                        ? "#ef4444"
                        : "#e2e8f0",
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={isMobile ? 16 : 18}
                    color={passwordError ? "#ef4444" : "#94a3b8"}
                  />
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError("");
                    }}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#a0aec0"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    style={getTextInputStyle(isMobile)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={isMobile ? 18 : 20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={errorTextStyle}>{passwordError}</Text>
                ) : null}
              </View>

              {/* ── Mã xác thực (Captcha) ── */}
              <View style={{ marginBottom: isMobile ? 16 : 22 }}>
                <Text style={getLabelStyle(isMobile)}>Mã xác thực</Text>
                <View
                  style={[
                    inputContainerStyle,
                    {
                      height: isMobile ? 40 : 48,
                      borderColor: captchaError
                        ? "#ef4444"
                        : "#e2e8f0",
                      marginBottom: isMobile ? 6 : 10,
                    },
                  ]}
                >
                  <TextInput
                    value={captchaInput}
                    onChangeText={(text) => {
                      setCaptchaInput(text);
                      setCaptchaError("");
                    }}
                    placeholder="Nhập mã xác thực"
                    placeholderTextColor="#a0aec0"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleLogin}
                    style={[getTextInputStyle(isMobile), { marginLeft: 0 }]}
                  />
                  <TouchableOpacity
                    onPress={refreshCaptcha}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}}
                  >
                    <Ionicons name="refresh" size={isMobile ? 18 : 20} color="#64748b" />
                  </TouchableOpacity>
                </View>
                {captchaError ? (
                  <Text style={[errorTextStyle, { marginTop: -6, marginBottom: 6 }]}>
                    {captchaError}
                  </Text>
                ) : null}
                <CaptchaImage text={captchaText} onRefresh={refreshCaptcha} />
              </View>

              {/* ── Nút Đăng nhập (Orange Gradient) ── */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading || !isFormValid}
                activeOpacity={0.85}
                style={{
                  borderRadius: 10,
                  height: isMobile ? 42 : 48,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isFormValid ? "#204195" : "#d1d5db",
                  marginBottom: isMobile ? 16 : 24,
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
                    Đăng nhập
                  </Text>
                )}
              </TouchableOpacity>

              {/* ── Links ── */}
              <View style={{ alignItems: "center", gap: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/auth/register" as any)}
                  style={Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: "600",
                      color: "#3b82f6",
                      textDecorationLine: "underline",
                    }}
                  >
                    Chưa có tài khoản? Đăng ký
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/auth/forgot-password" as any)}
                  style={Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: "600",
                      color: "#3b82f6",
                      textDecorationLine: "underline",
                    }}
                  >
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Shared Styles ────────────────────────────────────────────────────

const getLabelStyle = (isMobile: boolean) => ({
  fontSize: isMobile ? 13 : 14,
  fontWeight: "600" as const,
  color: "#334155",
  marginBottom: isMobile ? 4 : 8,
});

const inputContainerStyle: any = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  borderWidth: 1,
  borderRadius: 10,
  backgroundColor: "#ffffff",
  paddingHorizontal: 14,
  ...(Platform.OS === "web" ? { transition: "all 0.2s ease" } : {}),
};

const getTextInputStyle = (isMobile: boolean) => ({
  flex: 1,
  marginLeft: 8,
  fontSize: isMobile ? 14 : 15,
  color: "#1e293b",
  height: "100%",
  ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
});

const errorTextStyle = {
  fontSize: 12,
  color: "#ef4444",
  marginTop: 4,
  marginLeft: 4,
};

// Updated: 2026-05-02
