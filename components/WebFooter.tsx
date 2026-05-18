import React from "react";
import { View, Text, Platform, useWindowDimensions, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getWebCursor } from "@/constants/webStyles";

const iuhLogo = require("@/assets/logo.png"); // Using the existing logo

export default function WebFooter() {
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;

  if (Platform.OS !== "web") return null;

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingVertical: 48,
        paddingHorizontal: isMobile ? 24 : 48,
        marginTop: 60,
      }}
    >
      <View
        style={{
          maxWidth: 1200,
          width: "100%",
          alignSelf: "center",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          gap: 40,
        }}
      >
        {/* Left Side: Logo & Address */}
        <View style={{ flex: isMobile ? undefined : 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Image
              source={iuhLogo}
              style={{ width: 48, height: 48, marginRight: 16 }}
              resizeMode="contain"
            />
            <View>
              <Text style={{ color: "#1e3a8a", fontSize: 16, fontWeight: "700" }}>Industrial</Text>
              <Text style={{ color: "#1e3a8a", fontSize: 16, fontWeight: "700" }}>University of</Text>
              <Text style={{ color: "#1e3a8a", fontSize: 16, fontWeight: "700" }}>Ho Chi Minh City</Text>
            </View>
          </View>
          <Text style={{ color: "#4b5563", fontSize: 14, lineHeight: 22 }}>
            Số 12 Nguyễn Văn Bảo, P.4, Q. Gò Vấp, TP.HCM
          </Text>
        </View>

        {/* Right Side: Links Container */}
        <View
          style={{
            flex: isMobile ? undefined : 3,
            flexDirection: isMobile ? "column" : "row",
            gap: 40,
            justifyContent: "flex-end",
          }}
        >
          {/* Column 1: Liên kết nhanh */}
          <View style={{ flex: isMobile ? undefined : 1 }}>
            <Text style={{ color: "#1e3a8a", fontSize: 14, fontWeight: "700", marginBottom: 16, textTransform: "uppercase" }}>
              Liên kết nhanh
            </Text>
            <View style={{ height: 1, backgroundColor: "#e5e7eb", marginBottom: 16, width: "100%" }} />
            <TouchableOpacity style={{ marginBottom: 12, ...getWebCursor() }}>
              <Text style={{ color: "#4b5563", fontSize: 14 }}>Trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginBottom: 12, ...getWebCursor() }}>
              <Text style={{ color: "#4b5563", fontSize: 14 }}>Website IUH</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginBottom: 12, ...getWebCursor() }}>
              <Text style={{ color: "#4b5563", fontSize: 14 }}>Cổng sinh viên</Text>
            </TouchableOpacity>
          </View>

          {/* Column 2: Hệ thống */}
          <View style={{ flex: isMobile ? undefined : 1 }}>
            <Text style={{ color: "#1e3a8a", fontSize: 14, fontWeight: "700", marginBottom: 16, textTransform: "uppercase" }}>
              Hệ thống
            </Text>
            <View style={{ height: 1, backgroundColor: "#e5e7eb", marginBottom: 16, width: "100%" }} />
            <TouchableOpacity style={{ marginBottom: 12, ...getWebCursor() }}>
              <Text style={{ color: "#4b5563", fontSize: 14 }}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Copyright */}
      <View
        style={{
          maxWidth: 1200,
          width: "100%",
          alignSelf: "center",
          marginTop: 48,
          paddingTop: 24,
          borderTopWidth: 1,
          borderColor: "#e5e7eb",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#6b7280", fontSize: 12 }}>
          © 2026 Hệ thống điểm danh - Đại học Công nghiệp TP.HCM
        </Text>
      </View>
    </View>
  );
}
