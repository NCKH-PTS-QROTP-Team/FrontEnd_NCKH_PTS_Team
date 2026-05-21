import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Switch, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/colors";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import PrimaryButton from "@/components/PrimaryButton";
import ConfirmDialog, { useConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/ToastProvider";
import { SkeletonCard } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { userService, User } from "@/apis/services/user.service";

export default function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { confirm, dialogProps } = useConfirmDialog();
  const { showToast } = useToast();

  useEffect(() => {
    if (id) loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserById(id as string);
      setUser(data);
      setIsActive(data.isActive);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không tìm thấy người dùng";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      ADMIN: { label: "Admin", variant: "error" as const },
      TEACHER: { label: "Giảng viên", variant: "primary" as const },
      STUDENT: { label: "Sinh viên", variant: "success" as const },
      ACADEMIC_STAFF: { label: "Giáo vụ", variant: "warning" as const },
    };
    return (
      roleMap[role as keyof typeof roleMap] || {
        label: role,
        variant: "gray" as const,
      }
    );
  };

  const handleToggleActive = async (value: boolean) => {
    if (!user) return;
    try {
      setTogglingActive(true);
      setIsActive(value);
      await userService.updateUser(user.id, { isActive: value });
      showToast(
        value ? "Đã kích hoạt tài khoản" : "Đã vô hiệu hóa tài khoản",
        "success"
      );
    } catch (err: any) {
      setIsActive(!value); // revert
      const message =
        err?.response?.data?.message || err?.message || "Lỗi cập nhật";
      showToast(message, "error");
    } finally {
      setTogglingActive(false);
    }
  };

  const handleDelete = () => {
    if (!user) return;
    confirm({
      title: "Xác nhận xóa",
      message: `Bạn có chắc muốn xóa người dùng ${user.name}?`,
      confirmText: "Xóa",
      variant: "danger",
      onConfirm: async () => {
        try {
          setDeleting(true);
          await userService.deleteUser(user.id);
          showToast("Đã xóa người dùng", "success");
          router.back();
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Không thể xóa người dùng";
          showToast(message, "error");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const handleResetPassword = () => {
    if (!user) return;
    confirm({
      title: "Xác nhận reset mật khẩu",
      message: "Mật khẩu sẽ được đặt lại. Bạn có chắc chắn?",
      confirmText: "Reset",
      onConfirm: async () => {
        try {
          await userService.updatePassword(user.id, {
            newPassword: "student123",
          });
          showToast("Đã reset mật khẩu thành công", "success");
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Không thể reset mật khẩu";
          showToast(message, "error");
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF", padding: 16 }}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <ErrorState
          title="Không tìm thấy người dùng"
          message={error || "Người dùng không tồn tại"}
          onRetry={loadUser}
        />
      </View>
    );
  }

  const badgeData = getRoleBadge(user.role);

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
          {/* Avatar & Name */}
          <Card style={{ alignItems: "center", marginBottom: 16 }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                backgroundColor: Colors.primary,
              }}
            >
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "bold",
                  color: Colors.white,
                }}
              >
                {user.name.charAt(0)}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 8,
                color: Colors.text,
              }}
            >
              {user.name}
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <Badge variant={badgeData.variant}>{badgeData.label}</Badge>
              {!isActive && (
                <Badge variant="neutral" style={{ marginLeft: 8 }}>
                  Vô hiệu
                </Badge>
              )}
            </View>
            <Text
              style={{ fontSize: 14, color: Colors.textSecondary }}
            >
              Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </Card>

          {/* Info */}
          <Card style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 16,
                color: Colors.text,
              }}
            >
              Thông tin chi tiết
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 4,
                  color: Colors.textSecondary,
                }}
              >
                Email
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: Colors.text,
                }}
              >
                {user.email}
              </Text>
            </View>

            {user.studentId && (
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    marginBottom: 4,
                    color: Colors.textSecondary,
                  }}
                >
                  Mã sinh viên
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: Colors.text,
                  }}
                >
                  {user.studentId}
                </Text>
              </View>
            )}

            {user.teacherId && (
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    marginBottom: 4,
                    color: Colors.textSecondary,
                  }}
                >
                  Mã giảng viên
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: Colors.text,
                  }}
                >
                  {user.teacherId}
                </Text>
              </View>
            )}

            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 4,
                  color: Colors.textSecondary,
                }}
              >
                ID
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: Colors.text,
                }}
              >
                {user.id}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: Colors.border,
              }}
            >
              <Text style={{ fontWeight: "500", color: Colors.text }}>
                Trạng thái tài khoản
              </Text>
              <Switch
                value={isActive}
                onValueChange={handleToggleActive}
                disabled={togglingActive}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </Card>

          {/* Actions */}
          <Card style={{ marginBottom: 16 }}>
            <View style={{ marginBottom: 12 }}>
              <PrimaryButton
                title="Reset mật khẩu"
                variant="outline"
                onPress={handleResetPassword}
              />
            </View>
            <PrimaryButton
              title={deleting ? "Đang xóa..." : "Xóa người dùng"}
              variant="outline"
              onPress={handleDelete}
              disabled={deleting}
              style={{ borderColor: Colors.error }}
            />
          </Card>
        </View>
      </ScrollView>
      <ConfirmDialog {...dialogProps} />
    </View>
  );
}
