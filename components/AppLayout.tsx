import React, { useEffect, useState } from "react";
import { View, Platform, Text, useWindowDimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import Sidebar from "./Sidebar";
import NotificationDropdown from "./NotificationDropdown";
import UserProfileDropdown from "./UserProfileDropdown";
import AIChatHeaderButton from "./AIChatHeaderButton";
import { Colors } from "@/constants/colors";
import { getCurrentUserProfile } from "@/apis/config/apiClient";

const logoNameImage = require("@/assets/logo.png");

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route: string;
  badge?: number;
}

interface AppLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  userRole: "admin" | "teacher" | "student" | "department";
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
  const [currentName, setCurrentName] = useState<string | undefined>(userName);
  const [currentEmail, setCurrentEmail] = useState<string | undefined>(
    userEmail,
  );

  // Responsive breakpoints
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const sidebarWidth = collapsed ? 80 : 260;

  // Responsive values
  const headerHeight = isMobile ? 56 : 64;
  const headerPadding = isMobile ? 12 : isTablet ? 16 : 24;
  const logoFontSize = isMobile ? 16 : 22;
  const badgeFontSize = isMobile ? 10 : 12;
  const badgePadding = isMobile ? 8 : 12;
  const roleLabels = {
    admin: "Admin",
    teacher: "Giảng viên",
    student: "Sinh viên",
    department: "Giáo vụ khoa",
  };

  // Tự load thông tin user hiện tại từ storage (đã lưu sau login)
  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      // Nếu đã có name/email từ props thì ưu tiên dùng, không gọi API nữa
      if (userName && userEmail) return;

      try {
        const user = await getCurrentUserProfile();
        if (!isMounted) return;
        if (user) {
          setCurrentName(user.name);
          setCurrentEmail(user.email);
        }
      } catch (error) {
        console.warn(
          "Không đọc được thông tin user hiện tại từ storage:",
          error,
        );
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [userName, userEmail]);

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
          backgroundColor: "#EEF2F6",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          zIndex: 1000,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: headerPadding,
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(8, 47, 73, 0.08)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {!isMobile && (
            <Image
              source={logoNameImage}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                marginRight: 12,
              }}
              resizeMode="contain"
            />
          )}

          <Text
            style={{
              fontSize: logoFontSize,
              fontWeight: "700",
              color: Colors.gray900,
              letterSpacing: 0.2,
              marginRight: isMobile ? 8 : 16,
              ...(isMobile ? { maxWidth: "50%" } : {}),
            }}
            numberOfLines={1}
          >
            Điểm danh
          </Text>

          {!isMobile && (
            <View
              style={{
                paddingHorizontal: badgePadding,
                paddingVertical: 4,
                backgroundColor: `${Colors.primaryDark}12`,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  fontSize: badgeFontSize,
                  fontWeight: "600",
                  color: Colors.primaryDark,
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
            gap: isMobile ? 8 : 14,
          }}
        >
          <AIChatHeaderButton />
          <NotificationDropdown />
          <UserProfileDropdown
            userName={currentName || roleLabels[userRole]}
            userEmail={currentEmail}
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
            userName={currentName}
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
