import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsManagement() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const settingsSections = [
    {
      title: "Thông báo",
      items: [
        {
          id: "notifications",
          icon: "notifications" as const,
          label: "Thông báo push",
          description: "Nhận thông báo về hoạt động mới",
          value: notifications,
          onToggle: setNotifications,
          type: "switch" as const,
        },
        {
          id: "email",
          icon: "mail" as const,
          label: "Thông báo email",
          description: "Gửi báo cáo qua email",
          value: emailAlerts,
          onToggle: setEmailAlerts,
          type: "switch" as const,
        },
      ],
    },
    {
      title: "Dữ liệu",
      items: [
        {
          id: "backup",
          icon: "cloud-upload" as const,
          label: "Sao lưu tự động",
          description: "Tự động sao lưu dữ liệu hàng ngày",
          value: autoBackup,
          onToggle: setAutoBackup,
          type: "switch" as const,
        },
        {
          id: "export",
          icon: "download" as const,
          label: "Xuất dữ liệu",
          description: "Tải xuống dữ liệu dạng Excel/PDF",
          type: "button" as const,
          onPress: () =>
            Alert.alert("Xuất dữ liệu", "Chức năng đang phát triển"),
        },
        {
          id: "import",
          icon: "cloud-download" as const,
          label: "Nhập dữ liệu",
          description: "Import dữ liệu từ file Excel",
          type: "button" as const,
          onPress: () =>
            Alert.alert("Nhập dữ liệu", "Chức năng đang phát triển"),
        },
      ],
    },
    {
      title: "Giao diện",
      items: [
        {
          id: "darkMode",
          icon: "moon" as const,
          label: "Chế độ tối",
          description: "Sử dụng giao diện tối",
          value: darkMode,
          onToggle: setDarkMode,
          type: "switch" as const,
        },
        {
          id: "language",
          icon: "language" as const,
          label: "Ngôn ngữ",
          description: "Tiếng Việt",
          type: "button" as const,
          onPress: () => Alert.alert("Ngôn ngữ", "Chức năng đang phát triển"),
        },
      ],
    },
    {
      title: "Hệ thống",
      items: [
        {
          id: "permissions",
          icon: "shield-checkmark" as const,
          label: "Phân quyền",
          description: "Quản lý quyền truy cập",
          type: "button" as const,
          onPress: () => Alert.alert("Phân quyền", "Chức năng đang phát triển"),
        },
        {
          id: "logs",
          icon: "document-text" as const,
          label: "Nhật ký hoạt động",
          description: "Xem lịch sử thao tác",
          type: "button" as const,
          onPress: () => Alert.alert("Nhật ký", "Chức năng đang phát triển"),
        },
        {
          id: "about",
          icon: "information-circle" as const,
          label: "Thông tin ứng dụng",
          description: "Phiên bản 1.0.0",
          type: "button" as const,
          onPress: () =>
            Alert.alert(
              "Thông tin",
              "Hệ thống quản lý Giáo vụ khoa\nPhiên bản 1.0.0\n© 2024",
            ),
        },
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, { padding: 0 }]}>
      <LinearGradient
        colors={["#1E3A8A", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 64,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          zIndex: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff" }}>
              Cài đặt hệ thống
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                marginTop: 4,
              }}
            >
              Quản lý tài khoản và tuỳ chọn
            </Text>
          </View>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="settings" size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      {/* Profile Section */}
      <View
        style={[styles.profileSection, { marginTop: 10, marginHorizontal: 16 }]}
      >
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Giáo vụ khoa CNTT</Text>
          <Text style={styles.profileEmail}>giaovu@university.edu.vn</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={item.type === "button" ? item.onPress : undefined}
                  disabled={item.type === "switch"}
                  activeOpacity={item.type === "button" ? 0.7 : 1}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: getIconColor(item.icon) + "20" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={getIconColor(item.icon)}
                    />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingDescription}>
                      {item.description}
                    </Text>
                  </View>
                  {item.type === "switch" ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
                      thumbColor={item.value ? "#3b82f6" : "#f1f5f9"}
                    />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#94a3b8"
                    />
                  )}
                </TouchableOpacity>
                {itemIndex < section.items.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Danger Zone */}
      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Vùng nguy hiểm</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() =>
            Alert.alert("Xác nhận", "Bạn có chắc muốn xóa toàn bộ cache?", [
              { text: "Hủy", style: "cancel" },
              {
                text: "Xóa",
                style: "destructive",
                onPress: () => Alert.alert("Thành công", "Đã xóa cache"),
              },
            ])
          }
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={styles.dangerButtonText}>Xóa cache</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() =>
            Alert.alert(
              "Xác nhận",
              "Bạn có chắc muốn đặt lại tất cả cài đặt?",
              [
                { text: "Hủy", style: "cancel" },
                {
                  text: "Đặt lại",
                  style: "destructive",
                  onPress: () =>
                    Alert.alert("Thành công", "Đã đặt lại cài đặt"),
                },
              ],
            )
          }
        >
          <Ionicons name="refresh-outline" size={20} color="#ef4444" />
          <Text style={styles.dangerButtonText}>Đặt lại cài đặt</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function getIconColor(iconName: string): string {
  const colorMap: { [key: string]: string } = {
    notifications: "#3b82f6",
    mail: "#8b5cf6",
    "cloud-upload": "#10b981",
    download: "#06b6d4",
    "cloud-download": "#14b8a6",
    moon: "#6366f1",
    language: "#f59e0b",
    "shield-checkmark": "#ec4899",
    "document-text": "#84cc16",
    "information-circle": "#64748b",
  };
  return colorMap[iconName] || "#3b82f6";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  profileSection: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#64748b",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#64748b",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 72,
  },
  dangerZone: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ef4444",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  dangerButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ef4444",
    marginLeft: 12,
  },
});
