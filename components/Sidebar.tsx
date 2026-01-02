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
    admin: Colors.primary,
    teacher: Colors.success,
    student: Colors.warning,
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
        borderRightColor: Colors.gray200,
        height: '100%',
        position: 'absolute' as any,
        top: 0,
        bottom: 0,
        left: 0,
      }}
    >
      <ScrollView style={{ flex: 1 }}>
        {/* Logo & User Info */}
        <View style={{ padding: 24, borderBottomWidth: 1, borderBottomColor: Colors.gray200 }}>
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
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{ color: Colors.white, fontSize: 22, fontWeight: 'bold' }}>
              {roleLabels[userRole][0]}
            </Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 4 }}>
            {userName || roleLabels[userRole]}
          </Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
            {roleLabels[userRole]}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={{ paddingVertical: 16 }}>
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
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    marginHorizontal: 12,
                    marginBottom: 4,
                    borderRadius: 8,
                    backgroundColor: isActive ? Colors.infoLight : (isHovered ? '#F9FAFB' : 'transparent'),
                    borderLeftWidth: isActive ? 3 : 0,
                    borderLeftColor: isActive ? Colors.primary : 'transparent',
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
                      backgroundColor: isActive ? Colors.primary : (isHovered ? '#E5E7EB' : Colors.gray100),
                      alignItems: 'center',
                      justifyContent: 'center',
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
                    color: isActive ? Colors.primary : Colors.text,
                  }}
                >
                  {item.label}
                </Text>
                {item.badge && item.badge > 0 && (
                  <View
                    style={{
                      backgroundColor: Colors.error,
                      borderRadius: 10,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      minWidth: 20,
                      alignItems: 'center',
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

      {/* Logout Button */}
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: Colors.gray200 }}>
        <TouchableOpacity
          onPress={() => router.replace('/auth/login')}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: Colors.errorLight,
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
          <View style={{ marginRight: 8 }}>
            <LogoutIcon size={18} color={Colors.error} />
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.error }}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
