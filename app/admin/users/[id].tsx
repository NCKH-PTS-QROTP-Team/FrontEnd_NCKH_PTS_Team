import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { mockUsers } from '../../../constants/mockData';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import PrimaryButton from '../../../components/PrimaryButton';
import Input from '../../../components/Input';

export default function UserDetail() {
  const { id } = useLocalSearchParams();
  const user = mockUsers.find(u => u.id === id);
  const [isActive, setIsActive] = useState(user?.isActive || false);
  const [isEditing, setIsEditing] = useState(false);

  const breadcrumbs = [
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'Người dùng', route: '/admin/users' },
    { label: user?.name || 'Chi tiết' },
  ];

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.textSecondary }}>Không tìm thấy người dùng</Text>
      </View>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleMap = {
      admin: { label: 'Admin', variant: 'error' as const },
      teacher: { label: 'Giảng viên', variant: 'primary' as const },
      student: { label: 'Sinh viên', variant: 'success' as const },
    };
    return roleMap[role as keyof typeof roleMap];
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa người dùng ${user.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            alert('Đã xóa người dùng');
            router.back();
          }
        },
      ]
    );
  };

  const handleResetPassword = () => {
    Alert.alert(
      'Xác nhận reset mật khẩu',
      'Mật khẩu mới sẽ được gửi qua email',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Reset', onPress: () => alert('Đã gửi mật khẩu mới qua email') },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
          
          {/* Page Title */}
          <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 24, color: Colors.text }}>
            Chi tiết người dùng
          </Text>
          
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
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: Colors.white }}>
                {user.name.charAt(0)}
              </Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: Colors.text }}>
              {user.name}
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {(() => {
                const badgeData = getRoleBadge(user.role);
                return (
                  <Badge variant={badgeData.variant}>
                    {badgeData.label}
                  </Badge>
                );
              })()}
              {!isActive && (
                <Badge variant="neutral">
                  Vô hiệu
                </Badge>
              )}
            </View>
            <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
              Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </Card>

          {/* Info */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: Colors.text }}>
              Thông tin chi tiết
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, marginBottom: 4, color: Colors.textSecondary }}>Email</Text>
              <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.text }}>{user.email}</Text>
            </View>

            {user.studentId && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, marginBottom: 4, color: Colors.textSecondary }}>Mã sinh viên</Text>
                <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.text }}>{user.studentId}</Text>
              </View>
            )}

            {user.teacherId && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, marginBottom: 4, color: Colors.textSecondary }}>Mã giảng viên</Text>
                <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.text }}>{user.teacherId}</Text>
              </View>
            )}

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, marginBottom: 4, color: Colors.textSecondary }}>ID</Text>
              <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.text }}>{user.id}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <Text style={{ fontWeight: '500', color: Colors.text }}>
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
