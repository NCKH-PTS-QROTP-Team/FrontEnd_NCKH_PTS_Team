import React, { useState, useRef, useEffect } from "react";
import { View, Text, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Avatar } from "./Avatar";
import { LogoutIcon, UserIcon } from "./Icons";
import { Colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { authService } from "@/apis/services/auth.service";

interface UserProfileDropdownProps {
  userName: string;
  userAvatar?: string;
  userRole?:
    | "student"
    | "teacher"
    | "admin"
    | "department"
    | "academic-staff"
    | string;
  userEmail?: string;
}

export default function UserProfileDropdown({
  userName,
  userAvatar,
  userRole = "student",
  userEmail,
}: UserProfileDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS === "web" && isOpen) {
      const handleClickOutside = (event: any) => {
        if (
          dropdownRef.current &&
          !(dropdownRef.current as any).contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const doLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.replace("/auth/login");
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    doLogout();
  };

  const handleProfileAndSettings = () => {
    setIsOpen(false);
    if (userRole === "student") {
      router.push("/student/profile");
    } else if (userRole === "teacher") {
      router.push("/teacher/profile");
    } else if (userRole === "department") {
      router.push("/department/profile");
    } else if (userRole === "admin") {
      router.push("/admin/settings");
    } else {
      router.push("/academic-staff/profile");
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "student":
        return "Sinh viên";
      case "teacher":
        return "Giảng viên";
      case "admin":
        return "Quản trị viên";
      case "department":
        return "Giáo vụ khoa";
      default:
        return "";
    }
  };

  return (
    <View ref={dropdownRef} style={{ position: "relative" }}>
      {/* Dropdown Trigger Button */}
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingVertical: 8,
          minHeight: 44,
          borderRadius: 8,
          ...(Platform.OS === "web" ? { cursor: "pointer", transition: "background-color 0.2s" } : {})
        }}
        {...(Platform.OS === "web" ? {
          onMouseEnter: (e: any) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"; },
          onMouseLeave: (e: any) => { e.currentTarget.style.backgroundColor = "transparent"; }
        } : {})}
      >

        {/* Avatar */}
        <Avatar name={userName} src={userAvatar} size="small" bordered />

        {/* User Name */}
        <Text
          style={{
            marginLeft: 10,
            fontSize: 14,
            fontWeight: "700",
            color: "#1e3a8a",
            maxWidth: 150,
          }}
          numberOfLines={1}
        >
          {userName}
        </Text>

        {/* Dropdown Arrow */}
        <Text
          style={{
            marginLeft: 8,
            fontSize: 12,
            color: "#64748b",
            transform: isOpen ? [{ rotate: "180deg" }] : [{ rotate: "0deg" }],
            ...(Platform.OS === "web" &&
              ({
                transition: "transform 0.2s ease",
              } as any)),
          }}
        >
          ▼
        </Text>
      </TouchableOpacity>

      {/* Dropdown Menu */}
      {isOpen && (
        <View
          style={{
            position: "absolute" as any,
            top: 56,
            right: 0,
            width: 280,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            zIndex: 2000,
            overflow: "hidden",
            ...(Platform.OS === "web" &&
              ({
                animation: "slideDown 0.2s ease",
              } as any)),
          }}
        >
          {/* User Info Header */}
          <View
            style={{
              padding: 16,
              backgroundColor: "#F9FAFB",
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Avatar name={userName} src={userAvatar} size="medium" bordered />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {userName}
                </Text>
                <View
                  style={{
                    alignSelf: "flex-start",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    backgroundColor: Colors.primary + "15",
                    borderRadius: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: Colors.primary,
                    }}
                  >
                    {getRoleName(userRole)}
                  </Text>
                </View>
              </View>
            </View>
            {userEmail && (
              <Text
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  marginTop: 4,
                }}
                numberOfLines={1}
              >
                {userEmail}
              </Text>
            )}
          </View>

          {/* Menu Items */}
          <View style={{ paddingVertical: 4 }}>
            {/* Profile and Settings */}
            <TouchableOpacity
              onPress={handleProfileAndSettings}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                ...(Platform.OS === "web" &&
                  ({
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                  } as any)),
              }}
              {...(Platform.OS === "web" &&
                ({
                  onMouseEnter: (e: any) => {
                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                  },
                  onMouseLeave: (e: any) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  },
                } as any))}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: Colors.primary + "15",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <UserIcon size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
                >
                  Tài khoản & Cài đặt
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  Thông tin cá nhân, mật khẩu
                </Text>
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "#E5E7EB",
                marginVertical: 4,
              }}
            />

            {/* Logout */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                ...(Platform.OS === "web" &&
                  ({
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                  } as any)),
              }}
              {...(Platform.OS === "web" &&
                ({
                  onMouseEnter: (e: any) => {
                    e.currentTarget.style.backgroundColor = "#FEF2F2";
                  },
                  onMouseLeave: (e: any) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  },
                } as any))}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <LogoutIcon size={18} color={Colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: Colors.error,
                  }}
                >
                  Đăng xuất
                </Text>
                <Text style={{ fontSize: 12, color: "#FCA5A5", marginTop: 2 }}>
                  Thoát khỏi tài khoản
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
