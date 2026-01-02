import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { mockUsers, User } from '../../../constants/mockData';
import AppHeader from '../../../components/AppHeader';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import PrimaryButton from '../../../components/PrimaryButton';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const roleMap = {
      admin: { label: 'Admin', variant: 'error' as const },
      teacher: { label: 'Giảng viên', variant: 'primary' as const },
      student: { label: 'Sinh viên', variant: 'success' as const },
    };
    return roleMap[role as keyof typeof roleMap] || { label: role, variant: 'gray' as const };
  };

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Quản lý người dùng" showLogout={true} />
      
      <ScrollView className="flex-1">
        <View className="p-4" style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          
          {/* Actions */}
          <View className="flex-row mb-4">
            <PrimaryButton
              title="+ Thêm người dùng"
              onPress={() => router.push('/admin/users/create' as any)}
              className="flex-1 mr-2"
            />
            <PrimaryButton
              title="↑ Upload CSV"
              variant="outline"
              onPress={() => alert('Upload CSV')}
              className="flex-1"
            />
          </View>

          {/* Search */}
          <TextInput
            className="border rounded-xl px-4 py-3 mb-4"
            style={{ borderColor: Colors.border, color: Colors.text }}
            placeholder="Tìm kiếm theo tên, email..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Role Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'admin', label: 'Admin' },
                { key: 'teacher', label: 'Giảng viên' },
                { key: 'student', label: 'Sinh viên' },
              ].map((role) => (
                <TouchableOpacity
                  key={role.key}
                  className="px-4 py-2 rounded-full mr-2"
                  style={{
                    backgroundColor: selectedRole === role.key ? Colors.primary : Colors.gray100,
                  }}
                  onPress={() => setSelectedRole(role.key as any)}
                >
                  <Text
                    className="font-medium text-sm"
                    style={{
                      color: selectedRole === role.key ? Colors.white : Colors.gray700,
                    }}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* User List */}
          <Text className="text-sm mb-3" style={{ color: Colors.textSecondary }}>
            {filteredUsers.length} người dùng
          </Text>

          {filteredUsers.map((user) => (
            <Card key={user.id} onPress={() => router.push(`/admin/users/${user.id}` as any)} className="mb-3">
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: Colors.gray100 }}
                >
                  <Text className="text-xl font-bold" style={{ color: Colors.primary }}>
                    {user.name.charAt(0)}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-semibold mr-2" style={{ color: Colors.text }}>
                      {user.name}
                    </Text>
                    <Badge {...getRoleBadge(user.role)} size="sm" />
                    {!user.isActive && (
                      <Badge label="Vô hiệu" variant="gray" size="sm" />
                    )}
                  </View>
                  <Text className="text-sm mb-1" style={{ color: Colors.textSecondary }}>
                    {user.email}
                  </Text>
                  {(user.studentId || user.teacherId) && (
                    <Text className="text-xs" style={{ color: Colors.textLight }}>
                      {user.studentId || user.teacherId}
                    </Text>
                  )}
                </View>

                <Text className="text-2xl" style={{ color: Colors.gray300 }}>›</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:07
