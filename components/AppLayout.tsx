import React, { useEffect, useState } from "react";
import { View, Platform, Text, useWindowDimensions, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import Sidebar from "./Sidebar";
import NotificationDropdown from "./NotificationDropdown";
import UserProfileDropdown from "./UserProfileDropdown";
import AIChatHeaderButton from "./AIChatHeaderButton";
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
  const pathname = usePathname();
  const isWeb = Platform.OS === "web";
  const [collapsed, setCollapsed] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [currentName, setCurrentName] = useState<string | undefined>(userName);
  const [currentEmail, setCurrentEmail] = useState<string | undefined>(
    userEmail,
  );
  const [showNavMenu, setShowNavMenu] = useState(false);

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

          {!isMobile && (
            <View style={{ height: 36, width: 2, backgroundColor: "#e2e8f0", marginHorizontal: 12 }} />
          )}

          <View style={{ flexDirection: "column", justifyContent: "center", marginRight: isMobile ? 8 : 24, ...(isMobile ? { maxWidth: "50%" } : {}) }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e3a8a", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Đại học Công nghiệp TP. Hồ Chí Minh
            </Text>
            <View style={{ height: 1.5, backgroundColor: "#1e3a8a", marginVertical: 3, width: "100%" }} />
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#1e3a8a", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Hệ thống điểm danh
            </Text>
          </View>

          {/* Top Navigation Inline (Web/Desktop Only) */}
          {!isMobile && (
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 24, gap: 12 }}>
              {/* Standalone Items */}
              {menuItems.filter(item => ["Trang chủ", "Lịch học"].includes(item.label)).map((item, index) => {
                const isActive = pathname === item.route;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => router.push(item.route as any)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: isActive ? "#eff6ff" : "transparent",
                      borderRadius: 8,
                      ...(Platform.OS === "web" ? { cursor: "pointer", transition: "background-color 0.2s" } : {})
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e3a8a", textTransform: "uppercase" }}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}

              {/* ĐIỂM DANH Dropdown */}
              <View
                style={{ position: "relative" }}
                {...(Platform.OS === "web" ? {
                  onMouseEnter: () => setActiveDropdown("diemdanh"),
                  onMouseLeave: () => setActiveDropdown(null)
                } : {})}
              >
                <TouchableOpacity
                  onPress={() => setActiveDropdown(activeDropdown === "diemdanh" ? null : "diemdanh")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: activeDropdown === "diemdanh" ? "#eff6ff" : "transparent",
                    borderRadius: 8,
                    gap: 4,
                    ...(Platform.OS === "web" ? { cursor: "pointer", transition: "background-color 0.2s" } : {})
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e3a8a", textTransform: "uppercase" }}>ĐIỂM DANH</Text>
                  <Ionicons name="chevron-down" size={14} color="#1e3a8a" />
                </TouchableOpacity>

                {activeDropdown === "diemdanh" && (
                  <View style={{
                    position: "absolute" as any,
                    top: "100%",
                    left: 0,
                    paddingTop: 4, // Invisible hit area bridge
                    zIndex: 1002,
                  }}>
                    <View style={{
                      minWidth: 180,
                      backgroundColor: "#ffffff",
                      borderRadius: 8,
                      padding: 8,
                      ...(Platform.OS === "web" ? { boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" } : {})
                    }}>
                      {menuItems.filter(item => ["Điểm danh QR", "Điểm danh OTP", "Điểm danh Face"].includes(item.label)).map((item, index) => {
                        let displayLabel = item.label;
                        if (item.label === "Điểm danh QR") displayLabel = "MÃ QR";
                        if (item.label === "Điểm danh OTP") displayLabel = "MÃ OTP";
                        if (item.label === "Điểm danh Face") displayLabel = "NHẬN DIỆN";
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => { setActiveDropdown(null); router.push(item.route as any); }}
                            style={{ padding: 12, borderRadius: 6, ...(Platform.OS === "web" ? { cursor: "pointer", transition: "background-color 0.15s" } : {}) }}
                            onMouseEnter={(e: any) => { e.target.style.backgroundColor = "#f8fafc"; }}
                            onMouseLeave={(e: any) => { e.target.style.backgroundColor = "transparent"; }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e3a8a", textTransform: "uppercase" }}>{displayLabel}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>

              {/* KHÁC Dropdown */}
              <View
                style={{ position: "relative" }}
                {...(Platform.OS === "web" ? {
                  onMouseEnter: () => setActiveDropdown("khac"),
                  onMouseLeave: () => setActiveDropdown(null)
                } : {})}
              >
                <TouchableOpacity
                  onPress={() => setActiveDropdown(activeDropdown === "khac" ? null : "khac")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: activeDropdown === "khac" ? "#eff6ff" : "transparent",
                    borderRadius: 8,
                    gap: 4,
                    ...(Platform.OS === "web" ? { cursor: "pointer", transition: "background-color 0.2s" } : {})
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e3a8a", textTransform: "uppercase" }}>KHÁC</Text>
                  <Ionicons name="chevron-down" size={14} color="#1e3a8a" />
                </TouchableOpacity>

                {activeDropdown === "khac" && (
                  <View style={{
                    position: "absolute" as any,
                    top: "100%",
                    left: 0,
                    paddingTop: 4, // Invisible hit area bridge
                    zIndex: 1002,
                  }}>
                    <View style={{
                      minWidth: 160,
                      backgroundColor: "#ffffff",
                      borderRadius: 8,
                      padding: 8,
                      ...(Platform.OS === "web" ? { boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" } : {})
                    }}>
                      {menuItems.filter(item => ["Lịch sử", "Thông báo"].includes(item.label)).map((item, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => { setActiveDropdown(null); router.push(item.route as any); }}
                            style={{ padding: 12, borderRadius: 6, ...(Platform.OS === "web" ? { cursor: "pointer", transition: "background-color 0.15s" } : {}) }}
                            onMouseEnter={(e: any) => { e.target.style.backgroundColor = "#f8fafc"; }}
                            onMouseLeave={(e: any) => { e.target.style.backgroundColor = "transparent"; }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e3a8a", textTransform: "uppercase" }}>{item.label}</Text>
                          </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Right Side: Role Badge + User Profile */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: isMobile ? 8 : 14,
          }}
        >
          {/* Role Badge (from Image 1) */}
          {!isMobile && (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: "#e2e8f0",
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#1e3a8a",
                }}
              >
                {roleLabels[userRole]}
              </Text>
            </View>
          )}

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

      {/* Main Container with Content Only (Sidebar removed) */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          marginTop: headerHeight, // Space for fixed header
        }}
      >
        {/* Scrollable Content Area */}
        <View
          style={{
            flex: 1,
            // marginLeft: sidebarWidth Removed!
          }}
        >
          {children}
        </View>
      </View>
    </View>
  );
}
