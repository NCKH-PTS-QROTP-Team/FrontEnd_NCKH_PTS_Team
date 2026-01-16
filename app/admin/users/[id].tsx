import React, { useState } from "react";
import { View, Text, ScrollView, Switch, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "../../../constants/colors";
import { mockUsers } from "../../../constants/mockData";
import AppHeader from "../../../components/AppHeader";
import Card from "../../../components/Card";
import Badge from "../../../components/Badge";
import PrimaryButton from "../../../components/PrimaryButton";
import Input from "../../../components/Input";

export default function UserDetail() {
  const { id } = useLocalSearchParams();
  const user = mockUsers.find((u) => u.id === id);
  const [isActive, setIsActive] = useState(user?.isActive || false);
  const [isEditing, setIsEditing] = useState(false);

  const breadcrumbs = [
    { label: "Dashboard", route: "/admin/dashboard" },
    { label: "Người dùng", route: "/admin/users" },
    { label: user?.name || "Chi tiết" },
  ];

  if (!user) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text style={{ color: Colors.textSecondary }}>
          Không tìm thấy người dùng
        </Text>
      </View>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleMap = {
      admin: { label: "Admin", variant: "error" as const },
      teacher: { label: "Giảng viên", variant: "primary" as const },
      student: { label: "Sinh viên", variant: "success" as const },
    };
    return roleMap[role as keyof typeof roleMap];
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa người dùng ${user.name}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            alert("Đã xóa người dùng");
            router.back();
          },
        },
      ]
    );
  };

  const handleResetPassword = () => {
    Alert.alert(
      "Xác nhận reset mật khẩu",
      "Mật khẩu mới sẽ được gửi qua email",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Reset",
          onPress: () => alert("Đã gửi mật khẩu mới qua email"),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <AppHeader
        title="Chi tiết người dùng"
        showLogout={true}
        breadcrumbs={breadcrumbs}
      />

      <ScrollView className="flex-1">
        <View
          className="p-4"
          style={{ maxWidth: 600, width: "100%", alignSelf: "center" }}
        >
          {/* Avatar & Name */}
          <Card style={{ alignItems: 'center', marginBottom: 16 }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                backgroundColor: Colors.primary,
              }}
            >
              <Text
                className="text-4xl font-bold"
                style={{ color: Colors.white }}
              >
                {user.name.charAt(0)}
              </Text>
            </View>
            <Text
              className="text-2xl font-bold mb-2"
              style={{ color: Colors.text }}
            >
              {user.name}
            </Text>
            <View className="flex-row mb-2">
              <Badge variant={getRoleBadge(user.role).variant}>
                {getRoleBadge(user.role).label}
              </Badge>
              {!isActive && (
                <Badge variant="neutral" style={{ marginLeft: 8 }}>
                  Vô hiệu
                </Badge>
              )}
            </View>
            <Text className="text-sm" style={{ color: Colors.textSecondary }}>
              Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </Card>

          {/* Info */}
          <Card className="mb-4">
            <Text
              className="text-lg font-semibold mb-4"
              style={{ color: Colors.text }}
            >
              Thông tin chi tiết
            </Text>

            <View className="mb-3">
              <Text
                className="text-sm mb-1"
                style={{ color: Colors.textSecondary }}
              >
                Email
              </Text>
              <Text
                className="text-base font-medium"
                style={{ color: Colors.text }}
              >
                {user.email}
              </Text>
            </View>

            {user.studentId && (
              <View className="mb-3">
                <Text
                  className="text-sm mb-1"
                  style={{ color: Colors.textSecondary }}
                >
                  Mã sinh viên
                </Text>
                <Text
                  className="text-base font-medium"
                  style={{ color: Colors.text }}
                >
                  {user.studentId}
                </Text>
              </View>
            )}

            {user.teacherId && (
              <View className="mb-3">
                <Text
                  className="text-sm mb-1"
                  style={{ color: Colors.textSecondary }}
                >
                  Mã giảng viên
                </Text>
                <Text
                  className="text-base font-medium"
                  style={{ color: Colors.text }}
                >
                  {user.teacherId}
                </Text>
              </View>
            )}

            <View className="mb-3">
              <Text
                className="text-sm mb-1"
                style={{ color: Colors.textSecondary }}
              >
                ID
              </Text>
              <Text
                className="text-base font-medium"
                style={{ color: Colors.text }}
              >
                {user.id}
              </Text>
            </View>

            <View
              className="flex-row justify-between items-center pt-3 border-t"
              style={{ borderTopColor: Colors.border }}
            >
              <Text className="font-medium" style={{ color: Colors.text }}>
                Trạng thái tài khoản
              </Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
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
              title="Xóa người dùng"
              variant="outline"
              onPress={handleDelete}
              style={{ borderColor: Colors.error }}
            />
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
