import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Colors } from "@/constants/colors";
import { LogoutIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route: string;
  badge?: number;
}

interface SidebarProps {
  menuItems: MenuItem[];
  userRole: "admin" | "teacher" | "student" | "department";
  userName?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  menuItems,
  userRole,
  userName,
  collapsed: externalCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    label: string;
    left: number;
    top: number;
  } | null>(null);

  // Use external state if provided, otherwise use internal state
  const collapsed =
    externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleCollapse =
    onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const sidebarWidth = collapsed ? 80 : 260;

  const renderMenuIcon = (
    icon: React.ReactNode,
    isActive: boolean,
    isHovered: boolean,
  ) => {
    const iconColor = isActive ? "#FFFFFF" : isHovered ? "#1E40AF" : "#2563EB";

    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, {
        color: iconColor,
      });
    }

    return icon;
  };

  // Only show sidebar on web
  if (Platform.OS !== "web") {
    return null;
  }

  const roleColors = {
    admin: Colors.primary,
    teacher: "#10B981", // Success green
    student: "#F59E0B", // Warning amber
    department: "#2563eb", // Department blue
  };

  const roleLabels = {
    admin: "Admin",
    teacher: "Giảng viên",
    student: "Sinh viên",
    department: "Giáo vụ khoa",
  };

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
        borderRightWidth: 1,
        borderRightColor: "#E5E7EB",
        ...(Platform.OS === "web" &&
          ({
            transition: "width 0.3s ease",
          } as any)),
      }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Toggle Button */}
        <View
          style={{
            paddingTop: 16,
            paddingHorizontal: collapsed ? 8 : 12,
            alignItems: "flex-end",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={toggleCollapse}
            style={[
              {
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                alignItems: "center",
                justifyContent: "center",
              },
              Platform.OS === "web" &&
                ({
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                } as any),
            ]}
            activeOpacity={0.7}
            {...(Platform.OS === "web" &&
              ({
                onMouseEnter: (e: any) => {
                  e.currentTarget.style.backgroundColor = "#EFF6FF";
                  e.currentTarget.style.borderColor = "#93C5FD";
                },
                onMouseLeave: (e: any) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#CBD5E1";
                },
              } as any))}
          >
            {collapsed ? (
              <ChevronRightIcon size={16} color="#1E40AF" />
            ) : (
              <ChevronLeftIcon size={16} color="#1E40AF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Menu Items - Match Figma exactly: padding 12px, item height 48px */}
        <View
          style={{
            paddingHorizontal: collapsed ? 8 : 12,
            paddingTop: collapsed ? 60 : 0,
          }}
        >
          {menuItems.map((item, index) => {
            // Normalize routes - handle both /student/home and /(student)/home formats
            const normalizedPathname = pathname?.replace(
              /^\/\(student\)/,
              "/student",
            );
            const normalizedRoute = item.route.replace(
              /^\/\(student\)/,
              "/student",
            );
            const isActive =
              normalizedPathname === normalizedRoute ||
              (normalizedPathname &&
                normalizedPathname.startsWith(normalizedRoute + "/"));
            const isHovered = hoveredIndex === index;

            return (
              <View
                key={index}
                style={{
                  position: "relative" as any,
                }}
                {...(Platform.OS === "web" &&
                  ({
                    onMouseEnter: (e: any) => {
                      setHoveredIndex(index);
                      if (!collapsed) return;

                      const rect = e.currentTarget?.getBoundingClientRect?.();
                      if (!rect) return;

                      setTooltip({
                        label: item.label,
                        left: rect.right + 10,
                        top: rect.top + rect.height / 2,
                      });
                    },
                    onMouseLeave: () => {
                      setHoveredIndex(null);
                      setTooltip(null);
                    },
                  } as any))}
              >
                <TouchableOpacity
                  onPress={() => router.push(item.route as any)}
                  style={[
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: collapsed ? 0 : 8,
                      paddingVertical: 0,
                      marginBottom: 4,
                      borderRadius: 8,
                      height: 48,
                      backgroundColor: isActive
                        ? "#1E3A8A"
                        : isHovered
                          ? "#EFF6FF"
                          : "transparent",
                      borderLeftWidth: 0,
                      borderLeftColor: "transparent",
                      justifyContent: collapsed ? "center" : "flex-start",
                    },
                    {
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    } as any,
                  ]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      {
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: isActive
                          ? "rgba(255,255,255,0.22)"
                          : isHovered
                            ? "#DBEAFE"
                            : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: collapsed ? 0 : 12,
                        marginRight: collapsed ? 0 : 12,
                      },
                      {
                        transition: "all 0.2s ease",
                      } as any,
                    ]}
                  >
                    {renderMenuIcon(item.icon, isActive, isHovered)}
                  </View>
                  {!collapsed && (
                    <>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 14,
                          fontWeight: isActive ? "600" : "400",
                          color: isActive ? "#FFFFFF" : "#1E3A8A",
                          opacity: collapsed ? 0 : 1,
                          ...(Platform.OS === "web" &&
                            ({
                              transition: "opacity 0.2s ease",
                            } as any)),
                        }}
                      >
                        {item.label}
                      </Text>
                      {item.badge && item.badge > 0 && (
                        <View
                          style={{
                            backgroundColor: "#EF4444",
                            borderRadius: 10,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            minWidth: 20,
                            alignItems: "center",
                            marginRight: 12,
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: "600",
                            }}
                          >
                            {item.badge > 99 ? "99+" : item.badge}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Global tooltip (only when collapsed) */}
      {Platform.OS === "web" && collapsed && tooltip && (
        <View
          style={{
            position: "fixed" as any,
            left: tooltip.left,
            top: tooltip.top,
            transform: [{ translateY: -12 }],
            backgroundColor: "#111827",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            zIndex: 9999,
            pointerEvents: "none" as any,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: "500",
            }}
          >
            {tooltip.label}
          </Text>
          <View
            style={{
              position: "absolute" as any,
              left: -4,
              top: "50%",
              transform: [{ translateY: -4 }],
              width: 0,
              height: 0,
              borderTopWidth: 4,
              borderBottomWidth: 4,
              borderRightWidth: 4,
              borderTopColor: "transparent",
              borderBottomColor: "transparent",
              borderRightColor: "#111827",
            }}
          />
        </View>
      )}

      {/* Logout Button - Match Figma: positioned at bottom, padding 16px, height 48px */}
      <View
        style={{
          padding: collapsed ? 8 : 16,
          position: "absolute" as any,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={() => router.replace("/auth/login")}
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "center",
              paddingHorizontal: 0,
              paddingVertical: 0,
              borderRadius: 8,
              height: 48,
              backgroundColor: "#FEE2E2",
              borderWidth: 1,
              borderColor: "#FECACA",
            },
            {
              transition: "all 0.2s ease",
              cursor: "pointer",
            } as any,
          ]}
          activeOpacity={0.8}
        >
          {collapsed ? (
            <LogoutIcon size={18} color="#EF4444" />
          ) : (
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#EF4444" }}>
              Đăng xuất
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
