import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { BellIcon } from "./Icons";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  time: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "OTP sắp hết hạn",
    message: "OTP cho buổi học Lập trình cơ bản sẽ hết hạn trong 30 giây",
    type: "warning",
    time: "2 phút trước",
    isRead: false,
  },
  {
    id: "2",
    title: "Điểm danh thành công",
    message: "Bạn đã điểm danh thành công cho môn Cơ sở dữ liệu",
    type: "success",
    time: "1 giờ trước",
    isRead: false,
  },
  {
    id: "3",
    title: "Nhắc nhở lịch học",
    message: "Buổi học Lập trình web sẽ bắt đầu trong 30 phút",
    type: "info",
    time: "2 giờ trước",
    isRead: true,
  },
];

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef<View>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "#10B981";
      case "warning":
        return "#F59E0B";
      case "error":
        return "#EF4444";
      case "info":
        return "#3FA9F5";
      default:
        return "#6B7280";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "error":
        return "✕";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push("/student/notifications");
  };

  return (
    <View ref={dropdownRef} style={{ position: "relative" }}>
      {/* Bell Icon Button */}
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: isOpen ? Colors.primaryDark : Colors.primary,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderWidth: 1,
          borderColor: Colors.primaryDark,
          boxShadow: "0 4px 12px rgba(7, 89, 133, 0.28)",
          ...(Platform.OS === "web" &&
            ({
              cursor: "pointer",
              transition: "all 0.2s ease",
            } as any)),
        }}
        {...(Platform.OS === "web" &&
          ({
            onMouseEnter: (e: any) => {
              if (!isOpen)
                e.currentTarget.style.backgroundColor = Colors.primaryDark;
            },
            onMouseLeave: (e: any) => {
              if (!isOpen)
                e.currentTarget.style.backgroundColor = Colors.primary;
            },
          } as any))}
      >
        <BellIcon size={20} color={Colors.white} />

        {/* Badge */}
        {unreadCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              backgroundColor: "#EF4444",
              borderRadius: 10,
              minWidth: 18,
              height: 18,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 4,
              borderWidth: 2,
              borderColor: "#FFFFFF",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 10,
                fontWeight: "bold",
                lineHeight: 14,
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown */}
      {isOpen && (
        <View
          style={{
            position: "absolute" as any,
            top: 48,
            right: 0,
            width: 380,
            maxHeight: 480,
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
            ...(Platform.OS === "web" &&
              ({
                animation: "slideDown 0.2s ease",
              } as any)),
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
              Thông báo
            </Text>
            {unreadCount > 0 && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  backgroundColor: "#DBEAFE",
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: Colors.primary,
                  }}
                >
                  {unreadCount} mới
                </Text>
              </View>
            )}
          </View>

          {/* Notifications List */}
          <ScrollView style={{ maxHeight: 360 }}>
            {notifications.length === 0 ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#9CA3AF",
                    textAlign: "center",
                  }}
                >
                  Không có thông báo nào
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => handleNotificationClick(notification.id)}
                  style={{
                    padding: 16,
                    backgroundColor: notification.isRead
                      ? "#FFFFFF"
                      : "#F9FAFB",
                    borderBottomWidth: 1,
                    borderBottomColor: "#F3F4F6",
                    ...(Platform.OS === "web" &&
                      ({
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                      } as any)),
                  }}
                  {...(Platform.OS === "web" &&
                    ({
                      onMouseEnter: (e: any) => {
                        e.currentTarget.style.backgroundColor = "#F3F4F6";
                      },
                      onMouseLeave: (e: any) => {
                        e.currentTarget.style.backgroundColor =
                          notification.isRead ? "#FFFFFF" : "#F9FAFB";
                      },
                    } as any))}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    {/* Type Icon */}
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: `${getTypeColor(notification.type)}15`,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: getTypeColor(notification.type),
                          fontWeight: "bold",
                        }}
                      >
                        {getTypeIcon(notification.type)}
                      </Text>
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#111827",
                            flex: 1,
                          }}
                        >
                          {notification.title}
                        </Text>
                        {!notification.isRead && (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: Colors.primary,
                              marginLeft: 8,
                            }}
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                          lineHeight: 18,
                          marginBottom: 4,
                        }}
                        numberOfLines={2}
                      >
                        {notification.message}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                        {notification.time}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity
            onPress={handleViewAll}
            style={{
              padding: 12,
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "#F3F4F6",
              backgroundColor: "#FAFAFA",
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              ...(Platform.OS === "web" &&
                ({
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                } as any)),
            }}
            {...(Platform.OS === "web" &&
              ({
                onMouseEnter: (e: any) => {
                  e.currentTarget.style.backgroundColor = "#F3F4F6";
                },
                onMouseLeave: (e: any) => {
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                },
              } as any))}
          >
            <Text
              style={{ fontSize: 14, fontWeight: "600", color: Colors.primary }}
            >
              Xem tất cả
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
