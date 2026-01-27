import React, { useState } from "react";
import { View, Text, ScrollView, Switch } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../../constants/colors";
import Input from "../../../components/Input";
import PrimaryButton from "../../../components/PrimaryButton";
import Card from "../../../components/Card";
import AppHeader from "../../../components/AppHeader";
export default function CreateUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    studentId: "",
    teacherId: "",
    password: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<any>({});

  const handleSubmit = () => {
    // Validation
    const newErrors: any = {};
    if (!formData.name) newErrors.name = "Vui lòng nhập họ tên";
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";

    if (formData.role === "student" && !formData.studentId) {
      newErrors.studentId = "Vui lòng nhập mã sinh viên";
    }
    if (formData.role === "teacher" && !formData.teacherId) {
      newErrors.teacherId = "Vui lòng nhập mã giảng viên";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Success
    alert("Tạo người dùng thành công!");
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View
          className="p-4"
          style={{ maxWidth: 600, width: "100%", alignSelf: "center" }}
        >
          <Card className="mb-4">
            <Text
              className="text-lg font-semibold mb-4"
              style={{ color: Colors.text }}
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
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry
              error={errors.password}
            />

            <View className="mb-4">
              <Text
                className="text-sm font-medium mb-2"
                style={{ color: Colors.gray700 }}
              >
                Vai trò *
              </Text>
              <View className="flex-row -mx-1">
                {[
                  { key: "admin", label: "Admin" },
                  { key: "teacher", label: "Giảng viên" },
                  { key: "student", label: "Sinh viên" },
                ].map((role) => (
                  <View key={role.key} className="flex-1 px-1">
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

            {formData.role === "student" && (
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

            {formData.role === "teacher" && (
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
              className="flex-row justify-between items-center py-3 border-t"
              style={{ borderTopColor: Colors.border }}
            >
              <Text className="font-medium" style={{ color: Colors.text }}>
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

          <View className="flex-row -mx-2">
            <View className="flex-1 px-2">
              <PrimaryButton
                title="Hủy"
                variant="outline"
                onPress={() => router.back()}
              />
            </View>
            <View className="flex-1 px-2">
              <PrimaryButton title="Tạo người dùng" onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
// Updated: 2026-01-02 13:16:07
