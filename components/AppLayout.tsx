import React, { useState } from 'react';
import { View, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import { Colors } from '@/constants/colors';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route: string;
  badge?: number;
}

interface AppLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  userRole: 'admin' | 'teacher' | 'student';
  userName?: string;
  showSidebar?: boolean;
}

export default function AppLayout({ 
  children, 
  menuItems, 
  userRole, 
  userName,
  showSidebar = true 
}: AppLayoutProps) {
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const [collapsed, setCollapsed] = useState(false);
  
  const sidebarWidth = collapsed ? 80 : 260;

  if (!isWeb || !showSidebar) {
    return <>{children}</>;
  }

  const roleLabels = {
    admin: 'Admin',
    teacher: 'Giảng viên',
    student: 'Sinh viên',
  };

  return (
    <View style={{ flex: 1, height: '100vh' }}>
      {/* Fixed Header */}
      <View
        style={{
          position: 'fixed' as any,
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          zIndex: 1000,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: Colors.primary,
            marginRight: 16 
          }}>
            OTP & Điểm Danh
          </Text>
          <View style={{ 
            paddingHorizontal: 12, 
            paddingVertical: 4, 
            backgroundColor: `${Colors.primary}15`,
            borderRadius: 12 
          }}>
            <Text style={{ 
              fontSize: 12, 
              fontWeight: '600', 
              color: Colors.primary 
            }}>
              {roleLabels[userRole]}
            </Text>
          </View>
        </View>

        {/* Notification Dropdown */}
        <NotificationDropdown />
      </View>

      {/* Main Container with Sidebar and Content */}
      <View style={{ 
        flex: 1, 
        flexDirection: 'row',
        marginTop: 64, // Space for fixed header
      }}>
        {/* Fixed Sidebar */}
        <View
          style={{
            position: 'fixed' as any,
            top: 64,
            bottom: 0,
            left: 0,
            width: sidebarWidth,
            ...(Platform.OS === 'web' && {
              transition: 'width 0.3s ease',
            } as any),
          }}
        >
          <Sidebar 
            menuItems={menuItems} 
            userRole={userRole} 
            userName={userName}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
        </View>

        {/* Scrollable Content Area */}
        <View 
          style={{ 
            flex: 1,
            marginLeft: sidebarWidth,
            ...(Platform.OS === 'web' && {
              transition: 'margin-left 0.3s ease',
            } as any),
          }}
        >
          {children}
        </View>
      </View>
    </View>
  );
}
