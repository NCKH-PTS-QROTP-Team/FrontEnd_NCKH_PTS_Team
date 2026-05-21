import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import Input from "@/components/Input";
import PrimaryButton from "@/components/PrimaryButton";
import Card from "@/components/Card";
import { useToast } from "@/components/ToastProvider";
import { classService, CreateClassRequest } from "@/apis/services/class.service";

export default function CreateClass() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    teacherId: "",
    subjectId: "",
    semesterId: "",
    studentCount: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) newErrors.code = "Vui lòng nhập mã lớp";
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên lớp";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      const request: CreateClassRequest = {
        code: formData.code.trim(),
        name: formData.name.trim(),
      };
      if (formData.teacherId.trim()) request.teacherId = formData.teacherId.trim();
      if (formData.subjectId.trim()) request.subjectId = formData.subjectId.trim();
      if (formData.semesterId.trim()) request.semesterId = formData.semesterId.trim();
      if (formData.studentCount.trim()) {
        const count = parseInt(formData.studentCount, 10);
        if (!isNaN(count)) request.studentCount = count;
      }

      await classService.createClass(request);
      showToast("Tạo lớp học thành công!", "success");
      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tạo lớp học";
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
              Thông tin lớp học
            </Text>

            <Input
              label="Mã lớp *"
              placeholder="CNTT01"
              value={formData.code}
              onChangeText={(text) => setFormData({ ...formData, code: text })}
              error={errors.code}
            />

            <Input
              label="Tên lớp *"
              placeholder="Công nghệ thông tin 01"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={errors.name}
            />

            <Input
              label="ID giảng viên"
              placeholder="UUID giảng viên (tuỳ chọn)"
              value={formData.teacherId}
              onChangeText={(text) =>
                setFormData({ ...formData, teacherId: text })
              }
              error={errors.teacherId}
            />

            <Input
              label="ID môn học"
              placeholder="UUID môn học (tuỳ chọn)"
              value={formData.subjectId}
              onChangeText={(text) =>
                setFormData({ ...formData, subjectId: text })
              }
              error={errors.subjectId}
            />

            <Input
              label="ID học kỳ"
              placeholder="UUID học kỳ (tuỳ chọn)"
              value={formData.semesterId}
              onChangeText={(text) =>
                setFormData({ ...formData, semesterId: text })
              }
            />

            <Input
              label="Sĩ số"
              placeholder="45"
              value={formData.studentCount}
              onChangeText={(text) =>
                setFormData({ ...formData, studentCount: text })
              }
              keyboardType="numeric"
            />
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
                title={submitting ? "Đang tạo..." : "Tạo lớp học"}
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
