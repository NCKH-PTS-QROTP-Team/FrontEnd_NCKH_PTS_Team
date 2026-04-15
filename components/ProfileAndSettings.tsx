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
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E6EBF2",
  } as const;

  const desktopGridStyle = {
    display: "grid",
    gridTemplateColumns:
      "minmax(280px,1.15fr) minmax(280px,1fr) minmax(220px,0.85fr)",
    gridTemplateAreas: `
      "identity update stats"
      "identity actions actions"
    `,
    gap: "16px",
    alignItems: "stretch",
  } as any;

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
    <View style={{ gap: 20 }}>
      <View style={isDesktop ? desktopGridStyle : { gap: 16 }}>
        {/* 1) Profile Gradient Cluster */}
        <View
          style={[
            isDesktop && ({ gridArea: "identity", minHeight: 360 } as any),
            {
              minHeight: isDesktop ? 360 : undefined,
              borderRadius: 18,
              overflow: "hidden",
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.16,
              shadowRadius: 20,
              elevation: 5,
            },
          ]}
        >
          <LinearGradient
            colors={roleConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={{ padding: 22, minHeight: isDesktop ? 360 : undefined }}>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
                marginBottom: 8,
              }}
            >
              Hồ sơ vai trò
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: "#fff",
                marginBottom: 4,
              }}
            >
              {roleConfig.title}
            </Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
              {roleConfig.subtitle}
            </Text>

            <View
              style={{
                marginTop: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.12)",
                padding: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <Avatar
                  name={user?.name || "User"}
                  src={user?.avatar}
                  size="xlarge"
                  bordered
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#FFFFFF",
                      marginBottom: 4,
                    }}
                  >
                    {user?.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.9)",
                      marginBottom: 8,
                    }}
                  >
                    {user?.email}
                  </Text>
                  <View
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    >
                      {getRoleName(user?.role)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ gap: 10 }}>
                {user?.studentId ? (
                  <Text
                    style={{ color: "rgba(255,255,255,0.92)", fontSize: 14 }}
                  >
                    MSSV: {user.studentId}
                  </Text>
                ) : null}
                {user?.teacherId ? (
                  <Text
                    style={{ color: "rgba(255,255,255,0.92)", fontSize: 14 }}
                  >
                    MSGV: {user.teacherId}
                  </Text>
                ) : null}
                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
                  Trạng thái: {user?.isActive ? "Đang hoạt động" : "Tạm khóa"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2) Update Info Cluster */}
        <View
          style={[cardBaseStyle, isDesktop && ({ gridArea: "update" } as any)]}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 14,
            }}
          >
            Cập nhật thông tin
          </Text>

          <View style={{ gap: 12, marginBottom: 14 }}>
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 13, color: "#6B7280", fontWeight: "600" }}
              >
                Họ và tên
              </Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#9CA3AF"
                style={{
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 10,
                  backgroundColor: "#F9FAFB",
                  paddingHorizontal: 12,
                  height: 46,
                  color: "#111827",
                  fontSize: 15,
                }}
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 13, color: "#6B7280", fontWeight: "600" }}
              >
                Email
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 10,
                  backgroundColor: "#F3F4F6",
                  paddingHorizontal: 12,
                  height: 46,
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#6B7280", fontSize: 14 }}>
                  {user?.email || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <PrimaryButton
            title="Lưu thông tin"
            onPress={handleUpdateProfile}
            loading={savingProfile}
            style={{ marginBottom: 16 }}
          />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 10,
            }}
          >
            Đổi mật khẩu
          </Text>

          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 46,
                backgroundColor: "#F9FAFB",
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#9CA3AF"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={{ flex: 1, fontSize: 14, color: "#111827" }}
                secureTextEntry={!showOldPass}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Mật khẩu hiện tại"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowOldPass(!showOldPass)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={showOldPass ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 46,
                backgroundColor: "#F9FAFB",
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#9CA3AF"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={{ flex: 1, fontSize: 14, color: "#111827" }}
                secureTextEntry={!showNewPass}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mật khẩu mới"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowNewPass(!showNewPass)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={showNewPass ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 46,
                backgroundColor: "#F9FAFB",
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#9CA3AF"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={{ flex: 1, fontSize: 14, color: "#111827" }}
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
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <PrimaryButton
              title="Cập nhật mật khẩu"
              onPress={handleChangePassword}
              loading={submitting}
            />
          </View>
        </View>

        {/* 3) Stats Cluster */}
        <View
          style={[cardBaseStyle, isDesktop && ({ gridArea: "stats" } as any)]}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 14,
            }}
          >
            Thống kê nhanh
          </Text>
          <View style={{ gap: 10 }}>
            {effectiveStats.map((item, index) => (
              <View
                key={`${item.label}-${index}`}
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  padding: 12,
                }}
              >
                <Text
                  style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: item.tone || Colors.primaryDark,
                  }}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4) Quick Actions Cluster */}
        <View
          style={[cardBaseStyle, isDesktop && ({ gridArea: "actions" } as any)]}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 14,
            }}
          >
            Quick actions
          </Text>

          <View style={{ gap: 10 }}>
            {roleConfig.actions.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => navigateQuickAction(action.route)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: "#FFFFFF",
                }}
                activeOpacity={0.85}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: Colors.primary + "18",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={20}
                    color={Colors.primaryDark}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#0F172A",
                      marginBottom: 2,
                    }}
                  >
                    {action.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>
                    {action.description}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Mobile/Table: keep more spacing between clusters */}
      {!isDesktop ? <View style={{ height: 4 }} /> : null}
    </View>
  );
}
