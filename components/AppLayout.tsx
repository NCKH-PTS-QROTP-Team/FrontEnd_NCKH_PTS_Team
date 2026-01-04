import React from 'react';
import { View, Platform } from 'react-native';
import Sidebar from './Sidebar';

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
  const isWeb = Platform.OS === 'web';

  if (!isWeb || !showSidebar) {
    return <>{children}</>;
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
      <Sidebar menuItems={menuItems} userRole={userRole} userName={userName} />
      <View style={{ flex: 1, marginLeft: 260 }}>
        {children}
      </View>
    </View>
  );
}
