import React, { useState } from "react";
import { View, Platform, Text, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import Sidebar from "./Sidebar";
import NotificationDropdown from "./NotificationDropdown";
import UserProfileDropdown from "./UserProfileDropdown";
import { Colors } from "@/constants/colors";

// Import logo IUH
const logoNameImage = require('@/assets/logoname.png');

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route: string;
  badge?: number;
}

interface AppLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  userRole: "admin" | "teacher" | "student";
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  showSidebar?: boolean;
}

export default function AppLayout({
  children,
  menuItems,
  userRole,
  userName,
  userEmail,
  userAvatar,
  showSidebar = true,
}: AppLayoutProps) {
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const [collapsed, setCollapsed] = useState(false);
  const { width: windowWidth } = useWindowDimensions();

  // Responsive breakpoints
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const sidebarWidth = collapsed ? 80 : 260;

  // Responsive values
  const headerHeight = isMobile ? 56 : 64;
  const headerPadding = isMobile ? 12 : isTablet ? 16 : 24;
  const logoFontSize = isMobile ? 16 : 20;
  const badgeFontSize = isMobile ? 10 : 12;
  const badgePadding = isMobile ? 8 : 12;
  const roleLabels = {
    admin: "Admin",
    teacher: "Giảng viên",
    student: "Sinh viên",
  };

  // On mobile or non-web: no sidebar, just content (bottom nav handled in _layout)
  if (!isWeb || !showSidebar || isMobile) {
    return <>{children}</>;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed Header */}
      <View
        style={{
          position: "fixed" as any,
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          zIndex: 1000,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: headerPadding,
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Text
            style={{
              fontSize: logoFontSize,
              fontWeight: "bold",
              color: Colors.primary,
              marginRight: isMobile ? 8 : 16,
              ...(isMobile ? { maxWidth: "50%" } : {}),
            }}
            numberOfLines={1}
          >
            {isMobile ? "Điểm danh" : "OTP & Điểm Danh"}
          </Text>
          {!isMobile && (
            <View
              style={{
                paddingHorizontal: badgePadding,
                paddingVertical: 4,
                backgroundColor: `${Colors.primary}15`,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: badgeFontSize,
                  fontWeight: "600",
                  color: Colors.primary,
                }}
              >
                {roleLabels[userRole]}
              </Text>
            </View>
          )}
        </View>

        {/* Right Side: Notifications + User Profile */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: isMobile ? 8 : 12,
          }}
        >
          <NotificationDropdown />
          <UserProfileDropdown
            userName={userName || roleLabels[userRole]}
            userEmail={userEmail}
            userAvatar={userAvatar}
            userRole={userRole}
          />
        </View>
      </View>

      {/* Main Container with Sidebar and Content */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          marginTop: headerHeight, // Space for fixed header
        }}
      >
        {/* Fixed Sidebar */}
        <View
          style={{
            position: "fixed" as any,
            top: headerHeight,
            bottom: 0,
            left: 0,
            width: sidebarWidth,
            ...(Platform.OS === "web" &&
              ({
                transition: "width 0.3s ease",
              } as any)),
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
            ...(Platform.OS === "web" &&
              ({
                transition: "margin-left 0.3s ease",
              } as any)),
          }}
        >
          {children}
        </View>
      </View>
    </View>
  );
}
