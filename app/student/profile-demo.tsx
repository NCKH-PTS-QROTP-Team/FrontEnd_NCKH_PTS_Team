import React from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import { Colors } from "@/constants/colors";
import { getWebShadow } from "@/constants/webStyles";

/**
 * Complete Example: Student Dashboard with Beautiful Header
 *
 * Features:
 * - Avatar with user name
 * - Notification dropdown
 * - User profile dropdown with logout
 * - Smooth animations and transitions
 * - Responsive design
 */

export default function StudentDashboardExample() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Page Content */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: 900,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Info Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              ...getWebShadow("md"),
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              ✨ Header mới với trải nghiệm người dùng tốt hơn
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                🎯 Các tính năng:
              </Text>
              <FeatureItem text="Avatar + Tên sinh viên hiển thị rõ ràng" />
              <FeatureItem text="Dropdown thông báo với icon chuông và badge số lượng" />
              <FeatureItem text="Dropdown profile với thông tin chi tiết" />
              <FeatureItem text="Menu với avatar, tên, email, vai trò" />
              <FeatureItem text="Các tùy chọn: Trang cá nhân, Cài đặt (Admin), Đăng xuất" />
              <FeatureItem text="Hiệu ứng hover mượt mà trên web" />
              <FeatureItem text="Click bên ngoài để đóng dropdown" />
              <FeatureItem text="Thiết kế responsive cho mobile/tablet/desktop" />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                🎨 Thiết kế UI/UX:
              </Text>
              <FeatureItem text="Màu sắc hài hòa với hệ thống" />
              <FeatureItem text="Icons trực quan dễ hiểu" />
              <FeatureItem text="Spacing và padding chuẩn" />
              <FeatureItem text="Shadow và border tinh tế" />
              <FeatureItem text="Animation smooth khi mở/đóng" />
              <FeatureItem text="Badge thông báo nổi bật" />
            </View>

            <View
              style={{
                marginTop: 16,
                padding: 16,
                backgroundColor: Colors.primary + "10",
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: Colors.primary,
              }}
            >
              <Text style={{ fontSize: 14, color: "#374151", lineHeight: 21 }}>
                💡 <Text style={{ fontWeight: "600" }}>Hướng dẫn sử dụng:</Text>{" "}
                Click vào avatar/tên để xem menu profile. Click vào icon chuông
                để xem thông báo. Click bên ngoài hoặc ESC để đóng dropdown.
              </Text>
            </View>
          </View>

          {/* Example Cards */}
          <View
            style={{
              flexDirection: Platform.OS === "web" ? "row" : "column",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <ExampleCard
              icon="👤"
              title="User Profile"
              description="Avatar + Tên + Dropdown menu với các tùy chọn profile"
              color={Colors.primary}
            />
            <ExampleCard
              icon="🔔"
              title="Thông báo"
              description="Icon chuông với badge số lượng và danh sách thông báo"
              color={Colors.warning}
            />
          </View>

          <View
            style={{
              flexDirection: Platform.OS === "web" ? "row" : "column",
              gap: 16,
            }}
          >
            <ExampleCard
              icon="⚙️"
              title="Cài đặt"
              description="Menu cài đặt cho Admin (hiển thị theo role)"
              color="#6B7280"
            />
            <ExampleCard
              icon="🚪"
              title="Đăng xuất"
              description="Thoát tài khoản an toàn với xác nhận"
              color={Colors.error}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Helper Components
function FeatureItem({ text }: { text: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 6,
      }}
    >
      <Text style={{ color: Colors.primary, marginRight: 8, fontSize: 14 }}>
        •
      </Text>
      <Text style={{ flex: 1, fontSize: 14, color: "#6B7280", lineHeight: 21 }}>
        {text}
      </Text>
    </View>
  );
}

function ExampleCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: color,
        ...getWebShadow("sm"),
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: color + "15",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#111827",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#6B7280",
          lineHeight: 21,
        }}
      >
        {description}
      </Text>
    </View>
  );
}
