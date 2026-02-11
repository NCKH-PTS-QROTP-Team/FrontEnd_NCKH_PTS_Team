import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import Input from "@/components/Input";
import Toast, { useToast } from "@/components/Toast";
import { Colors } from "@/constants/colors";
import { mockUsers } from "@/constants/mockData";
import { authService } from "@/apis";

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { toast, showToast, hideToast } = useToast();

  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const containerPadding = isDesktop ? 48 : isTablet ? 32 : 20;

  const logoNameImage = require("../../assets/logoname.png");

  const handleLogin = async () => {
    setUsernameError("");
    setPasswordError("");

    if (!username.trim()) {
      setUsernameError("Vui lòng nhập tên đăng nhập");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu");
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
            case "department":
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

        // Tạo mock JWT token đơn giản (chỉ để test)
        // Trong production, phải dùng API thật
        const mockToken = btoa(
          JSON.stringify({
            studentId: mockUser.studentId,
            teacherId: mockUser.teacherId,
            role: mockUser.role,
            userId: mockUser.id,
          }),
        );

        // Lưu mock token
        await authService.logout(); // Clear trước
        const { setAuthToken } = await import("@/apis/config/apiClient");
        await setAuthToken(mockToken);

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
            case "department":
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
      }

      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f5f7fb" }}
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
          <View
            style={{
              width: "100%",
              maxWidth: 440,
              backgroundColor: Colors.white,
              borderRadius: 12,
              paddingHorizontal: isDesktop ? 28 : 24,
              paddingVertical: isDesktop ? 30 : 26,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 4,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            {/* Logo & title */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Image
                source={logoNameImage}
                style={{ height: 42, resizeMode: "contain", marginBottom: 10 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: Colors.textHeading,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Đăng nhập hệ thống
              </Text>
            </View>

            <Input
              label="Tên đăng nhập"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError("");
              }}
              placeholder="admin, GVK001, GV001, SV001"
              error={usernameError || undefined}
              success={
                username.trim().length > 0 && !usernameError ? true : undefined
              }
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Input
              label="Mật khẩu"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError("");
              }}
              placeholder="Nhập mật khẩu"
              error={passwordError || undefined}
              success={
                password.trim().length > 0 && !passwordError ? true : undefined
              }
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <PrimaryButton
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              disabled={!username.trim() || !password.trim()}
            />
            {/* Demo Accounts */}
            <View style={{ marginTop: 18 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.textSecondary,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Tài khoản demo
              </Text>
              <View
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: Colors.textSecondary,
                    lineHeight: 20,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>Admin:</Text> admin /
                  admin123
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: Colors.textSecondary,
                    lineHeight: 20,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>Giáo vụ khoa:</Text> GVK001 /
                  department123
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: Colors.textSecondary,
                    lineHeight: 20,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>Giảng viên:</Text> GV001 /
                  teacher123
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: Colors.textSecondary,
                    lineHeight: 20,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>Sinh viên:</Text> SV001 /
                  student123
                </Text>
              </View>
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

// Updated: 2026-01-02 13:16:07
