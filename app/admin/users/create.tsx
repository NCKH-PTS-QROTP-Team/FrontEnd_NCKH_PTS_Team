import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import Input from "@/components/Input";
import PrimaryButton from "@/components/PrimaryButton";
import Card from "@/components/Card";
import { useToast } from "@/components/ToastProvider";
import { userService, CreateUserRequest } from "@/apis/services/user.service";
import { UserRole } from "@/apis/types/auth.types";

export default function CreateUser() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STUDENT" as string,
    studentId: "",
    teacherId: "",
    password: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!formData.password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (formData.role === "STUDENT" && !formData.studentId.trim()) {
      newErrors.studentId = "Vui lòng nhập mã sinh viên";
    }
    if (formData.role === "TEACHER" && !formData.teacherId.trim()) {
      newErrors.teacherId = "Vui lòng nhập mã giảng viên";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      const request: CreateUserRequest = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role as UserRole,
        isActive: formData.isActive,
      };
      if (formData.role === "STUDENT" && formData.studentId.trim()) {
        request.studentId = formData.studentId.trim();
      }
      if (formData.role === "TEACHER" && formData.teacherId.trim()) {
        request.teacherId = formData.teacherId.trim();
      }

      await userService.createUser(request);
      showToast("Tạo người dùng thành công!", "success");
      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tạo người dùng";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            padding: 16,
            maxWidth: 600,
            width: "100%",
            alignSelf: "center",
          }}
        >
          <Card style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 16,
                color: Colors.text,
              }}
            >
              Thông tin cơ bản
            </Text>

            <Input
              label="Họ và tên *"
              placeholder="Nhập họ tên đầy đủ"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={errors.name}
            />

            <Input
              label="Email *"
              placeholder="email@edu.vn"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Mật khẩu *"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry
              error={errors.password}
            />

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  marginBottom: 8,
                  color: Colors.gray700,
                }}
              >
                Vai trò *
              </Text>
              <View style={{ flexDirection: "row", marginHorizontal: -4 }}>
                {[
                  { key: "ADMIN", label: "Admin" },
                  { key: "TEACHER", label: "Giảng viên" },
                  { key: "STUDENT", label: "Sinh viên" },
                ].map((role) => (
                  <View key={role.key} style={{ flex: 1, paddingHorizontal: 4 }}>
                    <PrimaryButton
                      title={role.label}
                      variant={
                        formData.role === role.key ? "primary" : "outline"
                      }
                      onPress={() =>
                        setFormData({ ...formData, role: role.key })
                      }
                    />
                  </View>
                ))}
              </View>
            </View>

            {formData.role === "STUDENT" && (
              <Input
                label="Mã sinh viên *"
                placeholder="SV001"
                value={formData.studentId}
                onChangeText={(text) =>
                  setFormData({ ...formData, studentId: text })
                }
                error={errors.studentId}
              />
            )}

            {formData.role === "TEACHER" && (
              <Input
                label="Mã giảng viên *"
                placeholder="GV001"
                value={formData.teacherId}
                onChangeText={(text) =>
                  setFormData({ ...formData, teacherId: text })
                }
                error={errors.teacherId}
              />
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: Colors.border,
              }}
            >
              <Text style={{ fontWeight: "500", color: Colors.text }}>
                Kích hoạt tài khoản
              </Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value })
                }
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </Card>

          <View style={{ flexDirection: "row", marginHorizontal: -8 }}>
            <View style={{ flex: 1, paddingHorizontal: 8 }}>
              <PrimaryButton
                title="Hủy"
                variant="outline"
                onPress={() => router.back()}
              />
            </View>
            <View style={{ flex: 1, paddingHorizontal: 8 }}>
              <PrimaryButton
                title={submitting ? "Đang tạo..." : "Tạo người dùng"}
                onPress={handleSubmit}
                disabled={submitting}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
