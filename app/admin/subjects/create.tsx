import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../../constants/colors";
import AppHeader from "../../../components/AppHeader";
import Input from "../../../components/Input";
import PrimaryButton from "../../../components/PrimaryButton";
import Card from "../../../components/Card";

export default function CreateSubject() {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: "3",
    teacherId: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleSubmit = () => {
    const newErrors: any = {};
    if (!formData.code) newErrors.code = "Vui lòng nhập mã môn học";
    if (!formData.name) newErrors.name = "Vui lòng nhập tên môn học";
    if (!formData.credits) newErrors.credits = "Vui lòng nhập số tín chỉ";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    alert("Tạo môn học thành công!");
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Tạo môn học mới" showLogout={true} />

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
              Thông tin môn học
            </Text>

            <Input
              label="Mã môn học *"
              placeholder="CS101"
              value={formData.code}
              onChangeText={(text) => setFormData({ ...formData, code: text })}
              error={errors.code}
            />

            <Input
              label="Tên môn học *"
              placeholder="Lập trình cơ bản"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={errors.name}
            />

            <Input
              label="Số tín chỉ *"
              placeholder="3"
              value={formData.credits}
              onChangeText={(text) =>
                setFormData({ ...formData, credits: text })
              }
              keyboardType="numeric"
              error={errors.credits}
            />

            <Input
              label="Mã giảng viên (tùy chọn)"
              placeholder="GV001"
              value={formData.teacherId}
              onChangeText={(text) =>
                setFormData({ ...formData, teacherId: text })
              }
            />

            <Text
              className="text-xs mt-2"
              style={{ color: Colors.textSecondary }}
            >
              Có thể phân công giảng viên sau
            </Text>
          </Card>

          <View style={{ flexDirection: 'row', marginHorizontal: -8 }}>
            <View style={{ flex: 1, paddingHorizontal: 8 }}>
              <PrimaryButton
                title="Hủy"
                variant="outline"
                onPress={() => router.back()}
              />
            </View>
            <View className="flex-1 px-2">
              <PrimaryButton title="Tạo môn học" onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
