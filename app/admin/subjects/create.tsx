import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import Input from "@/components/Input";
import PrimaryButton from "@/components/PrimaryButton";
import Card from "@/components/Card";
import { useToast } from "@/components/ToastProvider";
import {
  subjectService,
  CreateSubjectRequest,
} from "@/apis/services/subject.service";

export default function CreateSubject() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: "3",
    teacherLTId: "",
    teacherTHId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) newErrors.code = "Vui lòng nhập mã môn học";
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên môn học";
    if (!formData.credits.trim()) newErrors.credits = "Vui lòng nhập số tín chỉ";

    const credits = parseInt(formData.credits, 10);
    if (formData.credits && isNaN(credits)) {
      newErrors.credits = "Số tín chỉ phải là số";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      const request: CreateSubjectRequest = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        credits: credits,
      };
      if (formData.teacherLTId.trim()) request.teacherLTId = formData.teacherLTId.trim();
      if (formData.teacherTHId.trim()) request.teacherTHId = formData.teacherTHId.trim();

      await subjectService.createSubject(request);
      showToast("Tạo môn học thành công!", "success");
      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tạo môn học";
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
              label="ID GV Lý thuyết (tuỳ chọn)"
              placeholder="UUID giảng viên LT"
              value={formData.teacherLTId}
              onChangeText={(text) =>
                setFormData({ ...formData, teacherLTId: text })
              }
            />

            <Input
              label="ID GV Thực hành (tuỳ chọn)"
              placeholder="UUID giảng viên TH"
              value={formData.teacherTHId}
              onChangeText={(text) =>
                setFormData({ ...formData, teacherTHId: text })
              }
            />

            <Text
              style={{
                fontSize: 12,
                marginTop: 8,
                color: Colors.textSecondary,
              }}
            >
              Có thể phân công giảng viên sau từ trang quản lý môn học
            </Text>
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
                title={submitting ? "Đang tạo..." : "Tạo môn học"}
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
