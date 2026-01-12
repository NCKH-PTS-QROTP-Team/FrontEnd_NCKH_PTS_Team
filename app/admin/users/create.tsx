import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../../constants/colors';
import Input from '../../../components/Input';
import PrimaryButton from '../../../components/PrimaryButton';
import Card from '../../../components/Card';

export default function CreateUser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    studentId: '',
    teacherId: '',
    password: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<any>({});

  const handleSubmit = () => {
    // Validation
    const newErrors: any = {};
    if (!formData.name) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    
    if (formData.role === 'student' && !formData.studentId) {
      newErrors.studentId = 'Vui lòng nhập mã sinh viên';
    }
    if (formData.role === 'teacher' && !formData.teacherId) {
      newErrors.teacherId = 'Vui lòng nhập mã giảng viên';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Success
    alert('Tạo người dùng thành công!');
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
          
          {/* Page Title */}
          <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 24, color: Colors.text }}>
            Thêm người dùng mới
          </Text>
          
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: Colors.text }}>
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
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              error={errors.password}
            />

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: Colors.gray700 }}>
                Vai trò *
              </Text>
              <View style={{ flexDirection: 'row', marginHorizontal: -4 }}>
                {[
                  { key: 'admin', label: 'Admin' },
                  { key: 'teacher', label: 'Giảng viên' },
                  { key: 'student', label: 'Sinh viên' },
                ].map((role) => (
                  <View key={role.key} style={{ flex: 1, paddingHorizontal: 4 }}>
                    <PrimaryButton
                      title={role.label}
                      variant={formData.role === role.key ? 'primary' : 'outline'}
                      onPress={() => setFormData({ ...formData, role: role.key })}
                    />
                  </View>
                ))}
              </View>
            </View>

            {formData.role === 'student' && (
              <Input
                label="Mã sinh viên *"
                placeholder="SV001"
                value={formData.studentId}
                onChangeText={(text) => setFormData({ ...formData, studentId: text })}
                error={errors.studentId}
              />
            )}

            {formData.role === 'teacher' && (
              <Input
                label="Mã giảng viên *"
                placeholder="GV001"
                value={formData.teacherId}
                onChangeText={(text) => setFormData({ ...formData, teacherId: text })}
                error={errors.teacherId}
              />
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <Text style={{ fontWeight: '500', color: Colors.text }}>
                Kích hoạt tài khoản
              </Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </Card>

          <View style={{ flexDirection: 'row', marginHorizontal: -8 }}>
            <View style={{ flex: 1, paddingHorizontal: 8 }}>
              <PrimaryButton
                title="Hủy"
                variant="outline"
                onPress={() => router.back()}
              />
            </View>
            <View style={{ flex: 1, paddingHorizontal: 8 }}>
              <PrimaryButton
                title="Tạo người dùng"
                onPress={handleSubmit}
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
