import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { userService } from "@/apis";
import PrimaryButton from "@/components/PrimaryButton";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "@/components/Avatar";
import { useRouter } from "expo-router";

interface ProfileAndSettingsProps {
  user: any;
  loading?: boolean;
  onShowToast: (message: string, type: "success" | "error") => void;
  statsItems?: Array<{
    label: string;
    value: string | number;
    tone?: string;
  }>;
}

export default function ProfileAndSettings({
  user,
  loading,
  onShowToast,
  statsItems,
}: ProfileAndSettingsProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1100;

  const [submitting, setSubmitting] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  React.useEffect(() => {
    setDisplayName(user?.name || "");
  }, [user?.name]);

  const roleConfig = useMemo(() => {
    const role = String(user?.role || "").toUpperCase();

    if (role === "ADMIN") {
      return {
        title: "Quản trị hệ thống",
        subtitle: "Toàn quyền quản lý nền tảng",
        gradient: ["#1f3d8e", "#2f57bf"] as [string, string],
        stats: [
          { label: "Vai trò", value: "Admin", tone: Colors.primaryDark },
          {
            label: "Trạng thái",
            value: user?.isActive ? "Đang hoạt động" : "Tạm khóa",
            tone: user?.isActive ? Colors.success : Colors.warning,
          },
          { label: "Bảo mật", value: "Mức cao", tone: "#1f3d8e" },
        ],
        actions: [
          {
            icon: "settings-outline",
            label: "Cài đặt hệ thống",
            description: "Cấu hình chung nền tảng",
            route: "/admin/settings",
          },
          {
            icon: "people-outline",
            label: "Quản lý người dùng",
            description: "Tài khoản, vai trò và quyền",
            route: "/admin/users",
          },
          {
            icon: "notifications-outline",
            label: "Thông báo quản trị",
            description: "Theo dõi cảnh báo hệ thống",
            route: "/admin/dashboard",
          },
        ],
      };
    }

    if (role === "TEACHER") {
      return {
        title: "Giảng viên",
        subtitle: "Lớp học, lịch dạy và điểm danh",
        gradient: ["#1f3d8e", "#3b82f6"] as [string, string],
        stats: [
          {
            label: "Mã giảng viên",
            value: user?.teacherId || "N/A",
            tone: Colors.primaryDark,
          },
          {
            label: "Trạng thái",
            value: user?.isActive ? "Sẵn sàng" : "Tạm nghỉ",
            tone: user?.isActive ? Colors.success : Colors.warning,
          },
          { label: "Vai trò", value: "Teacher", tone: "#1f3d8e" },
        ],
        actions: [
          {
            icon: "school-outline",
            label: "Quản lý lớp chủ nhiệm",
            description: "Theo dõi lớp và sinh viên được phụ trách",
            route: "/teacher/advisee-class",
          },
          {
            icon: "notifications-outline",
            label: "Thông báo",
            description: "Lịch dạy, buổi điểm danh",
            route: "/teacher/notifications",
          },
          {
            icon: "calendar-outline",
            label: "Lịch giảng dạy",
            description: "Theo dõi lịch tuần",
            route: "/teacher/dashboard",
          },
          {
            icon: "checkbox-outline",
            label: "Quản lý buổi học",
            description: "Mở QR/OTP điểm danh",
            route: "/teacher/class-list",
          },
        ],
      };
    }

    if (role === "ACADEMIC_STAFF" || role === "DEPARTMENT") {
      return {
        title: "Giáo vụ khoa",
        subtitle: "Điều phối lớp học và dữ liệu khoa",
        gradient: ["#1f3d8e", "#2563eb"] as [string, string],
        stats: [
          {
            label: "Vai trò",
            value: "Academic Staff",
            tone: Colors.primaryDark,
          },
          {
            label: "Trạng thái",
            value: user?.isActive ? "Đang hoạt động" : "Tạm khóa",
            tone: user?.isActive ? Colors.success : Colors.warning,
          },
          { label: "Vận hành", value: "Ổn định", tone: "#1f3d8e" },
        ],
        actions: [
          {
            icon: "notifications-outline",
            label: "Thông báo khoa",
            description: "Nhắc lịch, thay đổi kế hoạch",
            route: "/academic-staff/dashboard",
          },
          {
            icon: "people-outline",
            label: "Quản lý sinh viên",
            description: "Danh sách, lớp, phân công",
            route: "/academic-staff/students",
          },
          {
            icon: "calendar-outline",
            label: "Điều phối lịch",
            description: "Lịch học và phòng học",
            route: "/academic-staff/schedules",
          },
        ],
      };
    }

    return {
      title: "Sinh viên",
      subtitle: "Thông tin tài khoản và học tập",
      gradient: ["#1f3d8e", "#60a5fa"] as [string, string],
      stats: [
        {
          label: "Mã sinh viên",
          value: user?.studentId || "N/A",
          tone: Colors.primaryDark,
        },
        {
          label: "Trạng thái",
          value: user?.isActive ? "Đang học" : "Tạm dừng",
          tone: user?.isActive ? Colors.success : Colors.warning,
        },
        { label: "Tài khoản", value: "Student", tone: "#1f3d8e" },
      ],
      actions: [
        {
          icon: "notifications-outline",
          label: "Thông báo",
          description: "Nhắc lịch học và điểm danh",
          route: "/student/notifications",
        },
        {
          icon: "calendar-outline",
          label: "Lịch học",
          description: "Xem lịch theo tuần",
          route: "/student/schedule",
        },
        {
          icon: "person-circle-outline",
          label: "Dữ liệu khuôn mặt",
          description: "Cập nhật khuôn mặt điểm danh",
          route: "/student/register-face",
        },
      ],
    };
  }, [user]);

  const effectiveStats = statsItems?.length ? statsItems : roleConfig.stats;

  const navigateQuickAction = (route: string) => {
    router.push(route as any);
  };

  const handleUpdateProfile = async () => {
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      onShowToast("Tên hiển thị không được để trống.", "error");
      return;
    }

    if (trimmedName === (user?.name || "").trim()) {
      onShowToast("Bạn chưa thay đổi thông tin.", "error");
      return;
    }

    try {
      setSavingProfile(true);
      await userService.updateUser(user.id, { name: trimmedName });
      onShowToast("Cập nhật thông tin thành công!", "success");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      onShowToast(
        error?.message ||
          error?.response?.data?.message ||
          "Không thể cập nhật thông tin",
        "error",
      );
    } finally {
      setSavingProfile(false);
    }
  };

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

  const cardBaseStyle = {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: isDesktop ? 24 : 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  } as const;

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
    <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 24, alignItems: isDesktop ? "flex-start" : "stretch" }}>
      {/* LEFT COLUMN (Identity) */}
      <View style={{ width: isDesktop ? 340 : "100%", gap: 20, position: isDesktop ? ("sticky" as any) : "relative", top: isDesktop ? 0 : 0 }}>
        {/* 1) Profile Gradient Cluster */}
        <View
          style={{
            borderRadius: 20,
            overflow: "hidden",
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={roleConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={{ padding: isDesktop ? 28 : 24 }}>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, fontWeight: "600" }}>
              Hồ sơ vai trò
            </Text>
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 6 }}>
              {roleConfig.title}
            </Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 20 }}>
              {roleConfig.subtitle}
            </Text>

            <View
              style={{
                marginTop: 28,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.15)",
                padding: 20,
              }}
            >
              <View style={{ flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <Avatar
                  name={user?.name || "User"}
                  src={user?.avatar}
                  size="xlarge"
                  bordered
                />
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 22, fontWeight: "700", color: "#FFFFFF", marginBottom: 4, textAlign: "center" }}>
                    {user?.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", marginBottom: 12, textAlign: "center" }}>
                    {user?.email}
                  </Text>
                  <View style={{ backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFFFFF" }}>
                      {getRoleName(user?.role)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ gap: 0 }}>
                {user?.studentId ? (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)", paddingVertical: 14 }}>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>MSSV</Text>
                    <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>{user.studentId}</Text>
                  </View>
                ) : null}
                {user?.teacherId ? (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)", paddingVertical: 14 }}>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>MSGV</Text>
                    <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>{user.teacherId}</Text>
                  </View>
                ) : null}
                <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)", paddingTop: 14 }}>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Trạng thái</Text>
                  <Text style={{ color: user?.isActive ? "#4ade80" : "#fbbf24", fontSize: 14, fontWeight: "600" }}>
                    {user?.isActive ? "Đang hoạt động" : "Tạm khóa"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* RIGHT COLUMN (Content) */}
      <View style={{ flex: 1, gap: 24, width: "100%" }}>
        
        {/* Stats Grid */}
        <View style={cardBaseStyle}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 16 }}>
            Thống kê nhanh
          </Text>
          <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}>
            {effectiveStats.map((item, index) => (
              <View
                key={`${item.label}-${index}`}
                style={{
                  flex: 1,
                  backgroundColor: "#F8FAFC",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  padding: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14, color: "#64748B", marginBottom: 8, fontWeight: "500", textAlign: "center" }}>
                  {item.label}
                </Text>
                <Text style={{ fontSize: 28, fontWeight: "800", color: item.tone || Colors.primaryDark }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={cardBaseStyle}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 16 }}>
            Lối tắt chức năng
          </Text>
          <View style={{ flexDirection: isDesktop ? "row" : "column", flexWrap: "wrap", gap: 16 }}>
            {roleConfig.actions.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => navigateQuickAction(action.route)}
                style={{
                  width: isDesktop ? "calc(50% - 8px)" as any : "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 16,
                  padding: 16,
                  backgroundColor: "#FFFFFF",
                }}
                activeOpacity={0.7}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + "15", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={action.icon as any} size={22} color={Colors.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 4 }}>
                    {action.label}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 18 }}>
                    {action.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Update Info */}
        <View style={cardBaseStyle}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 20 }}>
            Cập nhật thông tin
          </Text>

          <View style={{ gap: 16, marginBottom: 24 }}>
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, color: "#475569", fontWeight: "600" }}>Họ và tên</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#9CA3AF"
                style={{ borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, backgroundColor: "#F8FAFC", paddingHorizontal: 16, height: 50, color: "#0F172A", fontSize: 15 }}
              />
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, color: "#475569", fontWeight: "600" }}>Email</Text>
              <View style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, backgroundColor: "#F1F5F9", paddingHorizontal: 16, height: 50, justifyContent: "center" }}>
                <Text style={{ color: "#64748B", fontSize: 15 }}>{user?.email || "N/A"}</Text>
              </View>
            </View>
          </View>

          <PrimaryButton title="Lưu thông tin" onPress={handleUpdateProfile} loading={savingProfile} style={{ marginBottom: 32, borderRadius: 12 }} />

          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 20, borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 24 }}>
            Đổi mật khẩu
          </Text>

          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, paddingHorizontal: 16, height: 50, backgroundColor: "#F8FAFC" }}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
              <TextInput style={{ flex: 1, fontSize: 15, color: "#0F172A" }} secureTextEntry={!showOldPass} value={oldPassword} onChangeText={setOldPassword} placeholder="Mật khẩu hiện tại" placeholderTextColor="#94A3B8" />
              <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)} style={{ padding: 6 }}>
                <Ionicons name={showOldPass ? "eye-outline" : "eye-off-outline"} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, paddingHorizontal: 16, height: 50, backgroundColor: "#F8FAFC" }}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
              <TextInput style={{ flex: 1, fontSize: 15, color: "#0F172A" }} secureTextEntry={!showNewPass} value={newPassword} onChangeText={setNewPassword} placeholder="Mật khẩu mới" placeholderTextColor="#94A3B8" />
              <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)} style={{ padding: 6 }}>
                <Ionicons name={showNewPass ? "eye-outline" : "eye-off-outline"} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, paddingHorizontal: 16, height: 50, backgroundColor: "#F8FAFC", marginBottom: 8 }}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
              <TextInput style={{ flex: 1, fontSize: 15, color: "#0F172A" }} secureTextEntry={!showConfirmPass} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Nhập lại mật khẩu mới" placeholderTextColor="#94A3B8" />
              <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={{ padding: 6 }}>
                <Ionicons name={showConfirmPass ? "eye-outline" : "eye-off-outline"} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <PrimaryButton title="Cập nhật mật khẩu" onPress={handleChangePassword} loading={submitting} style={{ borderRadius: 12 }} />
          </View>
        </View>

      </View>
    </View>
  );
}
