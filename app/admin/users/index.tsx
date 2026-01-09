import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/colors';
import { mockUsers, User } from '@/constants/mockData';
import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyUsersIcon, EmptySearchIcon } from '@/components/EmptyStateIllustration';
import { SkeletonCard } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import Toast, { useToast } from '@/components/Toast';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 1200 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  // Simulate data fetching
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    setError(false);
    
    // Simulate API call
    setTimeout(() => {
      // Randomly simulate error (10% chance)
      if (Math.random() < 0.1) {
        setError(true);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, 1000);
  };

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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />
      <AppHeader title="Quản lý người dùng" showLogout={true} />
      
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal, paddingVertical: 24, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          
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
            className="border-2 rounded-lg px-4 mb-4"
            style={{
              height: 48,
              borderColor: Colors.gray200,
              color: Colors.text,
              lineHeight: 24,
              ...Platform.select({
                web: { outlineStyle: 'none' as any },
              }),
            }}
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

          {/* Loading State */}
          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* Error State */}
          {!loading && error && (
            <ErrorState
              title="Không thể tải dữ liệu người dùng"
              message="Đã có lỗi xảy ra khi tải danh sách người dùng. Vui lòng thử lại."
              onRetry={loadUsers}
            />
          )}

          {/* User List */}
          {!loading && !error && filteredUsers.length > 0 && (
            <>
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
            </>
          )}

          {/* Empty State */}
          {!loading && !error && filteredUsers.length === 0 && (
            <View 
              className="bg-white border rounded-lg"
              style={{ 
                borderColor: Colors.gray200,
                padding: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 24,
              }}
            >
              {searchQuery ? (
                <>
                  <EmptySearchIcon size={80} color={Colors.gray300} />
                  <Text 
                    className="text-xl font-semibold mb-2 mt-4" 
                    style={{ color: Colors.text, lineHeight: 32, textAlign: 'center' }}
                  >
                    Không tìm thấy kết quả
                  </Text>
                  <Text 
                    className="text-base" 
                    style={{ color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
                  >
                    Không tìm thấy người dùng nào phù hợp với "{searchQuery}". Thử tìm kiếm với từ khóa khác.
                  </Text>
                </>
              ) : (
                <>
                  <EmptyUsersIcon size={80} color={Colors.gray300} />
                  <Text 
                    className="text-xl font-semibold mb-2 mt-4" 
                    style={{ color: Colors.text, lineHeight: 32, textAlign: 'center' }}
                  >
                    Chưa có người dùng
                  </Text>
                  <Text 
                    className="text-base mb-4" 
                    style={{ color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
                  >
                    Bắt đầu bằng cách thêm người dùng mới vào hệ thống.
                  </Text>
                  <PrimaryButton
                    title="+ Thêm người dùng"
                    onPress={() => router.push('/admin/users/create' as any)}
                  />
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
}
