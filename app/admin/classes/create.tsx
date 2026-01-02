import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../../constants/colors';
import AppHeader from '../../../components/AppHeader';
import Input from '../../../components/Input';
import PrimaryButton from '../../../components/PrimaryButton';
import Card from '../../../components/Card';

export default function CreateClass() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    teacherId: '',
    subjectId: '',
    semester: 'HK1-2026',
  });

  const [errors, setErrors] = useState<any>({});

  const handleSubmit = () => {
    const newErrors: any = {};
    if (!formData.code) newErrors.code = 'Vui lòng nhập mã lớp';
    if (!formData.name) newErrors.name = 'Vui lòng nhập tên lớp';
    if (!formData.teacherId) newErrors.teacherId = 'Vui lòng chọn giảng viên';
    if (!formData.subjectId) newErrors.subjectId = 'Vui lòng chọn môn học';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    alert('Tạo lớp học thành công!');
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Tạo lớp học mới" />
      
      <ScrollView className="flex-1">
        <View className="p-4" style={{ maxWidth: 600, width: '100%', alignSelf: 'center' }}>
          
          <Card className="mb-4">
            <Text className="text-lg font-semibold mb-4" style={{ color: Colors.text }}>
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
              label="Mã giảng viên *"
              placeholder="GV001"
              value={formData.teacherId}
              onChangeText={(text) => setFormData({ ...formData, teacherId: text })}
              error={errors.teacherId}
            />

            <Input
              label="Mã môn học *"
              placeholder="CS101"
              value={formData.subjectId}
              onChangeText={(text) => setFormData({ ...formData, subjectId: text })}
              error={errors.subjectId}
            />

            <Input
              label="Học kỳ *"
              placeholder="HK1-2026"
              value={formData.semester}
              onChangeText={(text) => setFormData({ ...formData, semester: text })}
            />
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
              <PrimaryButton
                title="Tạo lớp học"
                onPress={handleSubmit}
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:06
