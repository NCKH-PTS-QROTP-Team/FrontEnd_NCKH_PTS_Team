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
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "@/components/ToastProvider";
import { Colors } from "@/constants/colors";
import { Spinner } from "@/components/Spinner";

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { showToast } = useToast();

  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isMobile = width < 768;
  const containerPadding = isDesktop ? 48 : isTablet ? 32 : 16;

  // ── Multi-step State (For Mobile) ──
  // Step 1: Tài khoản, Step 2: Cá nhân, Step 3: Học tập
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // ── Form State ──
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [className, setClassName] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const logoNameImage = require("../../assets/logoname.png");

  // ── Override browser autofill ──
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

  // ── Validation ──
  const isStep1Valid = studentId.trim().length > 0 && password.trim().length >= 6;
  const isStep2Valid = fullName.trim().length > 0 && email.trim().length > 0 && dob.trim().length > 0 && gender.trim().length > 0;
  const isStep3Valid = faculty.trim().length > 0 && major.trim().length > 0 && className.trim().length > 0;
  
  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid;

  const handleNextStep = () => {
    if (currentStep === 1 && !isStep1Valid) {
      showToast("Vui lòng điền đầy đủ thông tin tài khoản", "error");
      return;
    }
    if (currentStep === 2 && !isStep2Valid) {
      showToast("Vui lòng điền đầy đủ thông tin cá nhân", "error");
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    if (!isFormValid) {
      showToast("Vui lòng kiểm tra lại thông tin", "error");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showToast("Đăng ký thành công!", "success");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      showToast("Đã có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Section Renderers ──
  const renderAccountInfo = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>THÔNG TIN TÀI KHOẢN</Text>
      <View style={isMobile ? styles.colLayout : styles.rowLayout}>
        <View style={styles.inputWrapper}>
          <Text style={getLabelStyle(isMobile)}>Mã sinh viên</Text>
          <View style={[inputContainerStyle, { height: isMobile ? 44 : 48 }]}>
            <Ionicons name="person-outline" size={isMobile ? 18 : 20} color="#94a3b8" />
            <TextInput
              value={studentId}
              onChangeText={setStudentId}
              placeholder="VD: 21123456"
              placeholderTextColor="#a0aec0"
              style={getTextInputStyle(isMobile)}
            />
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={getLabelStyle(isMobile)}>Mật khẩu</Text>
          <View style={[inputContainerStyle, { height: isMobile ? 44 : 48 }]}>
            <Ionicons name="lock-closed-outline" size={isMobile ? 18 : 20} color="#94a3b8" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              placeholderTextColor="#a0aec0"
              secureTextEntry={!showPassword}
              style={getTextInputStyle(isMobile)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPersonalInfo = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>THÔNG TIN CÁ NHÂN</Text>
      
      {/* Full Name */}
      <View style={[styles.inputWrapper, { width: "100%", marginBottom: 16 }]}>
        <Text style={getLabelStyle(isMobile)}>Họ và tên</Text>
        <View style={[inputContainerStyle, { height: isMobile ? 44 : 48 }]}>
          <Ionicons name="person-circle-outline" size={isMobile ? 18 : 20} color="#94a3b8" />
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="VD: Nguyễn Văn A"
            placeholderTextColor="#a0aec0"
            style={getTextInputStyle(isMobile)}
          />
        </View>
      </View>

      {/* Row: Email & Phone */}
      <View style={isMobile ? styles.colLayout : styles.rowLayout}>
        <View style={styles.inputWrapper}>
          <Text style={getLabelStyle(isMobile)}>Email IUH</Text>
          <View style={[inputContainerStyle, { height: isMobile ? 44 : 48 }]}>
            <Ionicons name="mail-outline" size={isMobile ? 18 : 20} color="#94a3b8" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="VD: 21123456@student.iuh.edu.vn"
              placeholderTextColor="#a0aec0"
              keyboardType="email-address"
              style={getTextInputStyle(isMobile)}
            />
          </View>
          <Text style={styles.helperText}>Chỉ chấp nhận email có đuôi @student.iuh.edu.vn</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={getLabelStyle(isMobile)}>Số điện thoại (tùy chọn)</Text>
          <View style={[inputContainerStyle, { height: isMobile ? 44 : 48 }]}>
            <Ionicons name="call-outline" size={isMobile ? 18 : 20} color="#94a3b8" />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="VD: 0912345678"
              placeholderTextColor="#a0aec0"
              keyboardType="phone-pad"
              style={getTextInputStyle(isMobile)}
            />
          </View>
        </View>
      </View>

      {/* Row: DOB & Gender */}
      <View style={isMobile ? styles.colLayout : styles.rowLayout}>
        <View style={styles.inputWrapper}>
          <Text style={getLabelStyle(isMobile)}>Ngày sinh</Text>
          <View style={[inputContainerStyle, { height: isMobile ? 44 : 48 }]}>
            <Ionicons name="calendar-outline" size={isMobile ? 18 : 20} color="#94a3b8" />
            <TextInput
              value={dob}
              onChangeText={setDob}
              placeholder="dd/mm/yyyy"
              placeholderTextColor="#a0aec0"
              style={getTextInputStyle(isMobile)}
            />
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={getLabelStyle(isMobile)}>Giới tính</Text>
          <View style={[inputContainerStyle, { height: isMobile ? 44 : 48 }]}>
            <Ionicons name="male-female-outline" size={isMobile ? 18 : 20} color="#94a3b8" />
            <TextInput
              value={gender}
              onChangeText={setGender}
              placeholder="Nam / Nữ"
              placeholderTextColor="#a0aec0"
              style={getTextInputStyle(isMobile)}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderAcademicInfo = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>THÔNG TIN HỌC TẬP</Text>
      
      {/* Row: Khoa & Chuyên ngành */}
      <View style={isMobile ? styles.colLayout : styles.rowLayout}>
        <View style={styles.inputWrapper}>
          <Text style={getLabelStyle(isMobile)}>Khoa</Text>
          <View style={[inputContainerStyle, { height: isMobile ? 44 : 48 }]}>
            <Ionicons name="business-outline" size={isMobile ? 18 : 20} color="#94a3b8" />
            <TextInput
              value={faculty}
              onChangeText={setFaculty}
              placeholder="VD: CNTT"
              placeholderTextColor="#a0aec0"
              style={getTextInputStyle(isMobile)}
            />
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={getLabelStyle(isMobile)}>Chuyên ngành</Text>
          <View style={[inputContainerStyle, { height: isMobile ? 44 : 48 }]}>
            <Ionicons name="book-outline" size={isMobile ? 18 : 20} color="#94a3b8" />
            <TextInput
              value={major}
              onChangeText={setMajor}
              placeholder="VD: KTPM"
              placeholderTextColor="#a0aec0"
              style={getTextInputStyle(isMobile)}
            />
          </View>
        </View>
      </View>

      {/* Lớp học */}
      <View style={[styles.inputWrapper, { width: "100%" }]}>
        <Text style={getLabelStyle(isMobile)}>Lớp học</Text>
        <View style={[inputContainerStyle, { height: isMobile ? 44 : 48 }]}>
          <Ionicons name="people-outline" size={isMobile ? 18 : 20} color="#94a3b8" />
          <TextInput
            value={className}
            onChangeText={setClassName}
            placeholder="VD: DHKTPM17A"
            placeholderTextColor="#a0aec0"
            style={getTextInputStyle(isMobile)}
          />
        </View>
      </View>
    </View>
  );

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
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          {/* ── Card ── */}
          <View
            style={{
              width: "100%",
              maxWidth: isMobile ? 480 : 800,
              backgroundColor: Colors.white,
              borderRadius: 16,
              paddingHorizontal: isDesktop ? 40 : isTablet ? 32 : 20,
              paddingVertical: isDesktop ? 44 : isTablet ? 36 : 28,
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
                style={{ height: isMobile ? 40 : 50, resizeMode: "contain", marginBottom: isMobile ? 12 : 16 }}
              />
              <Text
                style={{
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: "800",
                  color: "#1e3a5f",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                ĐĂNG KÝ TÀI KHOẢN SINH VIÊN
              </Text>
            </View>

            {/* ── Step Indicator (Mobile Only) ── */}
            {isMobile && (
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 }}>
                {[1, 2, 3].map((step) => (
                  <View
                    key={step}
                    style={{
                      height: 6,
                      width: 40,
                      borderRadius: 3,
                      backgroundColor: currentStep >= step ? "#3b82f6" : "#e2e8f0",
                    }}
                  />
                ))}
              </View>
            )}

            {/* ── Form Sections ── */}
            {!isMobile ? (
              // Desktop: Show all
              <View style={{ gap: 24, marginBottom: 32 }}>
                {renderAccountInfo()}
                {renderPersonalInfo()}
                {renderAcademicInfo()}
              </View>
            ) : (
              // Mobile: Wizard Flow
              <View style={{ marginBottom: 24 }}>
                {currentStep === 1 && renderAccountInfo()}
                {currentStep === 2 && renderPersonalInfo()}
                {currentStep === 3 && renderAcademicInfo()}
              </View>
            )}

            {/* ── Actions ── */}
            <View style={{ marginTop: 8 }}>
              {isMobile && currentStep < totalSteps ? (
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {currentStep > 1 && (
                    <TouchableOpacity
                      onPress={handlePrevStep}
                      style={[styles.btnSecondary, { flex: 1 }]}
                    >
                      <Text style={styles.btnSecondaryText}>Quay lại</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={handleNextStep}
                    style={[styles.btnPrimary, { flex: 2 }]}
                  >
                    <Text style={styles.btnPrimaryText}>Tiếp tục</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {isMobile && currentStep === 3 && (
                    <TouchableOpacity
                      onPress={handlePrevStep}
                      style={[styles.btnSecondary, { flex: 1 }]}
                    >
                      <Text style={styles.btnSecondaryText}>Quay lại</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading || (!isMobile && !isFormValid)}
                    activeOpacity={0.85}
                    style={[
                      styles.btnPrimary,
                      { flex: 2, backgroundColor: (!isMobile && !isFormValid) ? "#d1d5db" : "#ea580c" },
                      (Platform.OS === "web" && isFormValid) ? { background: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)" } as any : {}
                    ]}
                  >
                    {loading ? (
                      <Spinner size={20} color="#fff" />
                    ) : (
                      <Text style={styles.btnPrimaryText}>Đăng ký</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── Login Link ── */}
            <View style={{ alignItems: "center", marginTop: 24 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.back()}
                style={Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}}
              >
                <Text
                  style={{
                    fontSize: isMobile ? 14 : 15,
                    fontWeight: "600",
                    color: "#3b82f6",
                  }}
                >
                  Đã có tài khoản? Đăng nhập
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────

const getLabelStyle = (isMobile: boolean) => ({
  fontSize: isMobile ? 13 : 14,
  fontWeight: "700" as const,
  color: "#1e293b",
  marginBottom: isMobile ? 6 : 8,
});

const inputContainerStyle: any = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  borderWidth: 1.5,
  borderColor: "#e2e8f0",
  borderRadius: 10,
  backgroundColor: "#ffffff",
  paddingHorizontal: 14,
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

const styles = StyleSheet.create({
  sectionContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...(Platform.OS === "web" ? { boxShadow: "0 2px 8px rgba(0,0,0,0.02)" } : {}),
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  rowLayout: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  colLayout: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 6,
    marginLeft: 4,
  },
  btnPrimary: {
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ea580c",
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  },
  btnPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  btnSecondary: {
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  },
  btnSecondaryText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "700",
  },
});
