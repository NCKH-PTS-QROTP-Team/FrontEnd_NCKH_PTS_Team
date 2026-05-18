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
            width: 240,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 8,
            borderWidth: 1,
            borderColor: "#F3F4F6",
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
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Avatar name={userName} src={userAvatar} size="medium" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {userName}
                </Text>
                {userEmail && (
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                    }}
                    numberOfLines={1}
                  >
                    {userEmail}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={{ paddingVertical: 8 }}>
            {/* Profile and Settings */}
            <TouchableOpacity
              onPress={handleProfileAndSettings}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 10,
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
              <View style={{ marginRight: 12 }}>
                <UserIcon size={18} color="#4B5563" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>
                Tài khoản & Cài đặt
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "#F3F4F6",
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
                paddingVertical: 10,
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
              <View style={{ marginRight: 12 }}>
                <LogoutIcon size={18} color={Colors.error} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: "500", color: Colors.error }}>
                Đăng xuất
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
