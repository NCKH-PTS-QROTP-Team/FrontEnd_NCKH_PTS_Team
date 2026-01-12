import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { mockUsers, User } from '@/constants/mockData';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import PrimaryButton from '@/components/PrimaryButton';
import DataTable from '@/components/DataTable';
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
  const isMobile = width < 768;
  const showTable = isDesktop; // Chỉ desktop mới hiển thị table

  const contentMaxWidth = isDesktop ? 1200 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

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
    return roleMap[role as keyof typeof roleMap] || { label: role, variant: 'neutral' as const };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal, paddingVertical, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          
          {/* Page Title */}
          <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: '600', marginBottom: isMobile ? 16 : 24, color: Colors.text }}>
            Quản lý người dùng
          </Text>
          
          {/* Actions */}
          <View style={{ flexDirection: isMobile ? 'column' : 'row', marginBottom: 16, gap: isMobile ? 12 : 8 }}>
            <View style={{ flex: isMobile ? undefined : 1 }}>
              <PrimaryButton
                title="+ Thêm người dùng"
                onPress={() => router.push('/admin/users/create' as any)}
              />
            </View>
            <View style={{ flex: isMobile ? undefined : 1 }}>
              <PrimaryButton
                title="↑ Upload CSV"
                variant="outline"
                onPress={() => alert('Upload CSV')}
              />
            </View>
          </View>

          {/* Search */}
          <TextInput
            style={{
              height: 48,
              borderWidth: 2,
              borderColor: Colors.gray200,
              borderRadius: 8,
              paddingHorizontal: 16,
              marginBottom: 16,
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row' }}>
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'admin', label: 'Admin' },
                { key: 'teacher', label: 'Giảng viên' },
                { key: 'student', label: 'Sinh viên' },
              ].map((role) => (
                <TouchableOpacity
                  key={role.key}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: selectedRole === role.key ? Colors.primary : Colors.gray100,
                  }}
                  onPress={() => setSelectedRole(role.key as any)}
                >
                  <Text
                    style={{
                      fontWeight: '500',
                      fontSize: 14,
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
              <Text style={{ fontSize: 14, marginBottom: 12, color: Colors.textSecondary }}>
                {filteredUsers.length} người dùng
              </Text>

              {/* Desktop: Table View */}
              {showTable ? (
                <DataTable
                  columns={[
                    {
                      key: 'avatar',
                      label: '',
                      width: 60,
                      align: 'center',
                      render: (user) => (
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: Colors.gray100,
                            alignSelf: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>
                            {user.name.charAt(0)}
                          </Text>
                        </View>
                      ),
                    },
                    {
                      key: 'name',
                      label: 'Họ và tên',
                      width: 200,
                      render: (user) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <Text style={{ fontWeight: '600', color: Colors.text, fontSize: 14 }}>
                            {user.name}
                          </Text>
                        </View>
                      ),
                    },
                    {
                      key: 'email',
                      label: 'Email',
                      width: 250,
                      render: (user) => (
                        <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                          {user.email}
                        </Text>
                      ),
                    },
                    {
                      key: 'role',
                      label: 'Vai trò',
                      width: 140,
                      render: (user) => {
                        const badgeData = getRoleBadge(user.role);
                        return (
                          <Badge variant={badgeData.variant} size="small">
                            {badgeData.label}
                          </Badge>
                        );
                      },
                    },
                    {
                      key: 'id',
                      label: 'Mã',
                      width: 120,
                      render: (user) => (
                        <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                          {user.studentId || user.teacherId || '-'}
                        </Text>
                      ),
                    },
                    {
                      key: 'status',
                      label: 'Trạng thái',
                      width: 120,
                      align: 'center',
                      render: (user) => (
                        <View style={{ alignItems: 'center' }}>
                          {!user.isActive && (
                            <Badge variant="neutral" size="small">
                              Vô hiệu
                            </Badge>
                          )}
                          {user.isActive && (
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success }} />
                          )}
                        </View>
                      ),
                    },
                  ]}
                  data={filteredUsers}
                  onRowPress={(user) => router.push(`/admin/users/${user.id}` as any)}
                  zebraStriping={true}
                  stickyHeader={true}
                />
              ) : (
                /* Mobile: Card View */
                <>
                  {filteredUsers.map((user) => (
                    <Card key={user.id} onPress={() => router.push(`/admin/users/${user.id}` as any)} style={{ marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            backgroundColor: Colors.gray100,
                          }}
                        >
                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primary }}>
                            {user.name.charAt(0)}
                          </Text>
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: 4, gap: 4 }}>
                            <Text style={{ fontWeight: '600', color: Colors.text, fontSize: 15 }}>
                              {user.name}
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                              {(() => {
                                const badgeData = getRoleBadge(user.role);
                                return (
                                  <Badge variant={badgeData.variant} size="small">
                                    {badgeData.label}
                                  </Badge>
                                );
                              })()}
                              {!user.isActive && (
                                <Badge variant="neutral" size="small">
                                  Vô hiệu
                                </Badge>
                              )}
                            </View>
                          </View>
                          <Text style={{ fontSize: 13, marginBottom: 4, color: Colors.textSecondary }}>
                            {user.email}
                          </Text>
                          {(user.studentId || user.teacherId) && (
                            <Text style={{ fontSize: 12, color: Colors.textLight }}>
                              {user.studentId || user.teacherId}
                            </Text>
                          )}
                        </View>
                      </View>
                    </Card>
                  ))}
                </>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && filteredUsers.length === 0 && (
            <View 
              style={{ 
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: Colors.gray200,
                borderRadius: 8,
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
                    style={{ fontSize: 20, fontWeight: '600', marginBottom: 8, marginTop: 16, color: Colors.text, lineHeight: 32, textAlign: 'center' }}
                  >
                    Không tìm thấy kết quả
                  </Text>
                  <Text 
                    style={{ fontSize: 16, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
                  >
                    Không tìm thấy người dùng nào phù hợp với "{searchQuery}". Thử tìm kiếm với từ khóa khác.
                  </Text>
                </>
              ) : (
                <>
                  <EmptyUsersIcon size={80} color={Colors.gray300} />
                  <Text 
                    style={{ fontSize: 20, fontWeight: '600', marginBottom: 8, marginTop: 16, color: Colors.text, lineHeight: 32, textAlign: 'center' }}
                  >
                    Chưa có người dùng
                  </Text>
                  <Text 
                    style={{ fontSize: 16, marginBottom: 16, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
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
