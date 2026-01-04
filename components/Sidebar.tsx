import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '@/constants/colors';
import { LogoutIcon } from './Icons';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route: string;
  badge?: number;
}

interface SidebarProps {
  menuItems: MenuItem[];
  userRole: 'admin' | 'teacher' | 'student';
  userName?: string;
}

export default function Sidebar({ menuItems, userRole, userName }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Only show sidebar on web
  if (Platform.OS !== 'web') {
    return null;
  }

  const roleColors = {
    admin: '#3FA9F5', // Primary blue
    teacher: '#10B981', // Success green
    student: '#F59E0B', // Warning amber
  };

  const roleLabels = {
    admin: 'Admin',
    teacher: 'Giảng viên',
    student: 'Sinh viên',
  };

  return (
    <View
      style={{
        width: 260,
        backgroundColor: Colors.white,
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        height: '100%',
        position: 'absolute' as any,
        top: 0,
        bottom: 0,
        left: 0,
      }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Logo & User Info - Match Figma exactly */}
        <View style={{ padding: 24 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: roleColors[userRole],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              borderWidth: 3,
              borderColor: Colors.white,
            }}
          >
            <Text style={{ color: Colors.white, fontSize: 22, fontWeight: 'bold' }}>
              {roleLabels[userRole][0]}
            </Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
            {userName || roleLabels[userRole]}
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280' }}>
            {roleLabels[userRole]}
          </Text>
        </View>

        {/* Menu Items - Match Figma exactly: padding 12px, item height 48px */}
        <View style={{ paddingHorizontal: 12, paddingTop: 0 }}>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.route || pathname?.startsWith(item.route + '/');
            const [isHovered, setIsHovered] = React.useState(false);
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(item.route as any)}
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 0,
                    marginBottom: 4,
                    borderRadius: 8,
                    height: 48,
                    backgroundColor: isActive ? '#E0F2FE' : 'transparent',
                    borderLeftWidth: isActive ? 3 : 0,
                    borderLeftColor: isActive ? '#3FA9F5' : 'transparent',
                  },
                  {
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  } as any,
                ]}
                activeOpacity={0.7}
                {...{
                  onMouseEnter: () => setIsHovered(true),
                  onMouseLeave: () => setIsHovered(false),
                } as any}
              >
                <View
                  style={[
                    {
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: isActive ? '#3FA9F5' : '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 12,
                      marginRight: 12,
                    },
                    {
                      transition: 'all 0.2s ease',
                    } as any,
                  ]}
                >
                  {item.icon}
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? '#3FA9F5' : '#111827',
                  }}
                >
                  {item.label}
                </Text>
                {item.badge && item.badge > 0 && (
                  <View
                    style={{
                      backgroundColor: '#EF4444',
                      borderRadius: 10,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      minWidth: 20,
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '600' }}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Logout Button - Match Figma: positioned at bottom, padding 16px, height 48px */}
      <View style={{ 
        padding: 16, 
        position: 'absolute' as any,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
      }}>
        <TouchableOpacity
          onPress={() => router.replace('/auth/login')}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 0,
              paddingVertical: 0,
              borderRadius: 8,
              height: 48,
              backgroundColor: '#FEE2E2',
              borderWidth: 1,
              borderColor: '#FECACA',
            },
            {
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            } as any,
          ]}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#EF4444' }}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
