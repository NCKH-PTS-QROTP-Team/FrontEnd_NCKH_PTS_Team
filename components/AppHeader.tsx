import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import ConfirmDialog, { useConfirmDialog } from "@/components/ConfirmDialog";
import { Colors } from "@/constants/colors";
import Breadcrumbs from "./Breadcrumbs";
import UserProfileDropdown from "./UserProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";

interface BreadcrumbItem {
  label: string;
  route?: string;
}

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  showLogout?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  // User profile props
  showUserProfile?: boolean;
  userName?: string;
  userAvatar?: string;
  userRole?: "student" | "teacher" | "admin";
  userEmail?: string;
  // Notifications
  showNotifications?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  rightAction,
  showLogout = false,
  breadcrumbs,
  showUserProfile = false,
  userName = "User",
  userAvatar,
  userRole = "student",
  userEmail,
  showNotifications = false,
}) => {
  const router = useRouter();
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { confirm, dialogProps } = useConfirmDialog();

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleLogout = () => {
    confirm({
      title: "Đăng xuất",
      message: "Bạn có chắc muốn đăng xuất?",
      confirmText: "Đăng xuất",
      variant: "danger",
      onConfirm: () => router.replace("/auth/login"),
    });
  };

  return (
    <View
      className="bg-white border-b border-gray-200"
      style={{
        paddingTop: Platform.OS === "web" ? 0 : 40,
        paddingBottom: Platform.OS === "web" ? 0 : 16,
        paddingHorizontal: Platform.OS === "web" ? 20 : 20,
        height: Platform.OS === "web" ? 64 : undefined,
        justifyContent: "center",
        ...(Platform.OS === "web" &&
          ({
            position: "sticky" as any,
            top: 0,
            zIndex: 100,
            backgroundColor: isScrolled
              ? "rgba(255, 255, 255, 0.9)"
              : "#FFFFFF",
            backdropFilter: isScrolled ? "blur(10px)" : "none",
            WebkitBackdropFilter: isScrolled ? "blur(10px)" : "none",
            transition: "all 0.2s ease",
            boxShadow: isScrolled ? "0 1px 3px rgba(0, 0, 0, 0.05)" : "none",
          } as any)),
      }}
    >
      <View
        className="flex-col"
        style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} />
        )}

        {/* Header Content */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {showBack && (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  marginRight: 12,
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: isBackHovered
                    ? Colors.gray100
                    : "transparent",
                  transform: isBackHovered ? [{ scale: 1.05 }] : [{ scale: 1 }],
                  ...(Platform.OS === "web" &&
                    ({
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    } as any)),
                }}
                activeOpacity={0.6}
                {...(Platform.OS === "web" &&
                  ({
                    onMouseEnter: () => setIsBackHovered(true),
                    onMouseLeave: () => setIsBackHovered(false),
                  } as any))}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: Colors.primary,
                    lineHeight: 20,
                  }}
                >
                  ←
                </Text>
              </TouchableOpacity>
            )}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                color: "#111827",
                lineHeight: 32,
                letterSpacing: -0.01,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          {/* Right Section: Notifications + User Profile + Logout */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {/* Notifications */}
            {showNotifications && <NotificationDropdown />}

            {/* User Profile */}
            {showUserProfile && (
              <UserProfileDropdown
                userName={userName}
                userAvatar={userAvatar}
                userRole={userRole}
                userEmail={userEmail}
              />
            )}

            {/* Legacy Logout Button (kept for backward compatibility) */}
            {showLogout && !showUserProfile && (
              <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-50 px-4"
                style={{
                  borderRadius: 8,
                  minHeight: 44,
                  paddingVertical: 10,
                  transform: isLogoutHovered
                    ? [{ scale: 1.03 }]
                    : [{ scale: 1 }],
                  backgroundColor: isLogoutHovered ? "#FEE2E2" : "#FEF2F2",
                  ...(Platform.OS === "web" &&
                    ({
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    } as any)),
                }}
                activeOpacity={0.8}
                {...(Platform.OS === "web" &&
                  ({
                    onMouseEnter: () => setIsLogoutHovered(true),
                    onMouseLeave: () => setIsLogoutHovered(false),
                  } as any))}
              >
                <Text
                  className="text-sm"
                  style={{ color: Colors.error, lineHeight: 21 }}
                >
                  Đăng xuất
                </Text>
              </TouchableOpacity>
            )}

            {/* Custom Right Action */}
            {rightAction && <View>{rightAction}</View>}
          </View>
        </View>
      </View>
      <ConfirmDialog {...dialogProps} />
    </View>
  );
};

export default AppHeader;
