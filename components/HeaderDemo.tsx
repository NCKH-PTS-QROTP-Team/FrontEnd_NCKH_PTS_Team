import React from 'react';
import { View, ScrollView } from 'react-native';
import AppHeader from '@/components/AppHeader';

/**
 * Demo page showing how to use the new AppHeader with UserProfile and Notifications
 * 
 * Usage Examples:
 */

export default function HeaderDemo() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* Example 1: Student Header with Profile and Notifications */}
        <AppHeader
          title="Trang chủ"
          showUserProfile={true}
          userName="Nguyễn Văn An"
          userEmail="nguyenvanan@student.edu.vn"
          userRole="student"
          showNotifications={true}
        />

        {/* Example 2: Teacher Header */}
        {/* 
        <AppHeader
          title="Danh sách lớp"
          showUserProfile={true}
          userName="Trần Thị B"
          userEmail="tranthib@teacher.edu.vn"
          userRole="teacher"
          showNotifications={true}
          showBack={true}
        />
        */}

        {/* Example 3: Admin Header with Settings */}
        {/* 
        <AppHeader
          title="Quản trị hệ thống"
          showUserProfile={true}
          userName="Admin User"
          userEmail="admin@system.edu.vn"
          userRole="admin"
          showNotifications={true}
          breadcrumbs={[
            { label: 'Dashboard', route: '/admin/dashboard' },
            { label: 'Cài đặt' }
          ]}
        />
        */}

        {/* Example 4: With Custom Avatar */}
        {/* 
        <AppHeader
          title="Hồ sơ cá nhân"
          showUserProfile={true}
          userName="Phạm Thị C"
          userAvatar="https://i.pravatar.cc/150?img=5"
          userEmail="phamthic@student.edu.vn"
          userRole="student"
          showNotifications={true}
        />
        */}

        <View style={{ padding: 20 }}>
          {/* Your page content here */}
        </View>
      </ScrollView>
    </View>
  );
}
