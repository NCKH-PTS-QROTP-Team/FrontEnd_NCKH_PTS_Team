import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { userService } from "@/apis";
import PrimaryButton from "@/components/PrimaryButton";

interface ProfileAndSettingsProps {
  user: any;
  loading?: boolean;
  onShowToast: (message: string, type: "success" | "error") => void;
  headerContent?: React.ReactNode;
}

export default function ProfileAndSettings({
  user,
  loading,
  onShowToast,
  headerContent,
}: ProfileAndSettingsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      onShowToast("Vui lòng điền đầy đủ các trường mật khẩu.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      onShowToast("Mật khẩu mới và Nhập lại mật khẩu không khớp.", "error");
      return;
    }

    if (newPassword.length < 6) {
      onShowToast("Mật khẩu mới phải có ít nhất 6 ký tự.", "error");
      return;
    }

    try {
      setSubmitting(true);
      await userService.updatePassword(user.id, {
        oldPassword,
        newPassword,
      });

      onShowToast("Đổi mật khẩu thành công!", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      onShowToast(
        error?.response?.data?.message || "Lỗi khi đổi mật khẩu",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "TEACHER":
        return "Giảng viên";
      case "STUDENT":
        return "Sinh viên";
      case "ACADEMIC_STAFF":
        return "Giáo vụ khoa";
      default:
        return role;
    }
  };

  if (loading || !user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 48,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ gap: 24 }}>
      {/* Header Content injected from parent (like stats) */}
      {headerContent}

      {/* User Info Card */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          borderWidth: 1,
          borderColor: "#F3F4F6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: Colors.primary + "1A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ fontSize: 24, fontWeight: "800", color: Colors.primary }}
            >
              {user?.name?.trim().charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 4,
              }}
            >
              {user?.name}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <View
                style={{
                  backgroundColor: Colors.primary + "1A",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: Colors.primary,
                  }}
                >
                  {getRoleName(user?.role)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <Text style={{ fontSize: 15, color: "#374151" }}>
              {user?.email}
            </Text>
          </View>
          {user?.studentId && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons name="id-card-outline" size={20} color="#6B7280" />
              <Text style={{ fontSize: 15, color: "#374151" }}>
                MSSV: {user.studentId}
              </Text>
            </View>
          )}
          {user?.teacherId && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons name="id-card-outline" size={20} color="#6B7280" />
              <Text style={{ fontSize: 15, color: "#374151" }}>
                MSGV: {user.teacherId}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Change Password Card */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          borderWidth: 1,
          borderColor: "#F3F4F6",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 16,
          }}
        >
          Đổi mật khẩu
        </Text>

        <View style={{ gap: 16 }}>
          {/* Old Password */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#4B5563" }}>
              Mật khẩu hiện tại
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 48,
                backgroundColor: "#F9FAFB",
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#111827" }}
                secureTextEntry={!showOldPass}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowOldPass(!showOldPass)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={showOldPass ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#4B5563" }}>
              Mật khẩu mới
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 48,
                backgroundColor: "#F9FAFB",
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#111827" }}
                secureTextEntry={!showNewPass}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowNewPass(!showNewPass)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={showNewPass ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#4B5563" }}>
              Nhập lại mật khẩu mới
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 48,
                backgroundColor: "#F9FAFB",
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#111827" }}
                secureTextEntry={!showConfirmPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPass(!showConfirmPass)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={showConfirmPass ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            <PrimaryButton
              title="Cập nhật mật khẩu"
              onPress={handleChangePassword}
              loading={submitting}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
