import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Table from './Table';
import Badge from './Badge';
import { Colors } from '../constants/colors';
import { EmptyUsersIcon, EmptySearchIcon, EmptyDocumentIcon } from './EmptyStateIllustration';

export default function TableDemo() {
  // Sample data
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com', role: 'teacher', status: 'active' },
    { id: 3, name: 'Lê Văn C', email: 'c@example.com', role: 'student', status: 'inactive' },
    { id: 4, name: 'Phạm Thị D', email: 'd@example.com', role: 'student', status: 'active' },
    { id: 5, name: 'Hoàng Văn E', email: 'e@example.com', role: 'teacher', status: 'active' },
  ];

  const columns = [
    {
      key: 'name',
      label: 'Họ và tên',
      width: 200,
      render: (item: any) => (
        <Text className="font-medium" style={{ color: Colors.text }}>
          {item.name}
        </Text>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      width: 250,
      render: (item: any) => (
        <Text style={{ color: Colors.textSecondary }}>
          {item.email}
        </Text>
      ),
    },
    {
      key: 'role',
      label: 'Vai trò',
      width: 150,
      render: (item: any) => {
        const roleMap: any = {
          admin: { label: 'Admin', variant: 'primary' },
          teacher: { label: 'Giảng viên', variant: 'success' },
          student: { label: 'Sinh viên', variant: 'warning' },
        };
        const role = roleMap[item.role];
        return <Badge variant={role.variant}>{role.label}</Badge>;
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: 120,
      render: (item: any) => (
        <Badge
          variant={item.status === 'active' ? 'success' : 'neutral'}
        >
          {item.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: 150,
      align: 'right' as const,
      render: (item: any) => (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <TouchableOpacity 
            style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              backgroundColor: Colors.infoLight,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '500' }}>
              Sửa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              backgroundColor: Colors.errorLight,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: Colors.error, fontSize: 13, fontWeight: '500' }}>
              Xóa
            </Text>
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6" style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
        <Text className="text-3xl font-bold mb-2" style={{ color: Colors.text, lineHeight: 48 }}>
          Table Components
        </Text>
        <Text className="text-base mb-8" style={{ color: Colors.textSecondary, lineHeight: 24 }}>
          Enhanced tables with hover, striping, sticky headers, and empty states
        </Text>

        {/* Table with data */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            User Table with Data
          </Text>
          <Table
            columns={columns}
            data={users}
            onRowPress={(item) => console.log('Clicked:', item)}
            stickyHeader={true}
            zebraStriping={true}
          />
        </View>

        {/* Empty state - No users */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Empty State - No Users
          </Text>
          <Table
            columns={columns}
            data={[]}
            emptyState={{
              title: 'Chưa có người dùng',
              description: 'Bắt đầu bằng cách thêm người dùng mới vào hệ thống. Click nút "Thêm người dùng" ở trên để bắt đầu.',
              icon: <EmptyUsersIcon size={80} color={Colors.gray300} />
            }}
          />
        </View>

        {/* Empty state - No search results */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Empty State - No Search Results
          </Text>
          <Table
            columns={columns}
            data={[]}
            emptyState={{
              title: 'Không tìm thấy kết quả',
              description: 'Không tìm thấy người dùng nào phù hợp với từ khóa tìm kiếm. Thử tìm kiếm với từ khóa khác.',
              icon: <EmptySearchIcon size={80} color={Colors.gray300} />
            }}
          />
        </View>

        {/* Empty state - No documents */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Empty State - No Documents
          </Text>
          <Table
            columns={[
              { key: 'title', label: 'Tài liệu', width: 300 },
              { key: 'date', label: 'Ngày tạo', width: 150 },
              { key: 'size', label: 'Kích thước', width: 120 },
            ]}
            data={[]}
            emptyState={{
              title: 'Chưa có tài liệu',
              description: 'Tải lên tài liệu đầu tiên của bạn để bắt đầu chia sẻ nội dung.',
              icon: <EmptyDocumentIcon size={80} color={Colors.gray300} />
            }}
          />
        </View>

        {/* Specifications */}
        <View className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: Colors.text }}>
            Table Specifications
          </Text>
          <View className="space-y-2">
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Row hover: bg-gray-50 with 0.15s transition
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Zebra striping: even rows bg-gray-50/50
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Sticky header: Fixed at top when scrolling (web)
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Cell padding: 12px vertical, 16px horizontal
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Actions column: align-right for better UX
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Empty state: Illustration + helpful text
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
