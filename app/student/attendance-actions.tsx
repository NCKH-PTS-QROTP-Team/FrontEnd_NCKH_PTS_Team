import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import { HashIcon, QrCodeIcon, UserIcon, ChevronRightIcon, InfoIcon } from "@/components/Icons";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";

export default function StudentAttendanceActionsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [activeTab, setActiveTab] = useState<"qr" | "otp" | "face">("qr");

  const getTabColor = (tab: "qr" | "otp" | "face") => {
    switch (tab) {
      case "qr": return "#3b82f6";
      case "otp": return "#0d9488";
      case "face": return "#8b5cf6";
    }
  };

  const getTabBg = (tab: "qr" | "otp" | "face") => {
    switch (tab) {
      case "qr": return "#eff6ff";
      case "otp": return "#f0fdf4";
      case "face": return "#f5f3ff";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: Colors.white,
          borderBottomWidth: 1,
          borderBottomColor: "#e2e8f0",
          paddingHorizontal: 24,
          paddingVertical: 18,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: "#0f172a",
            letterSpacing: 0.3,
          }}
        >
          Điểm danh lớp học
        </Text>
      </View>

      {/* Tab Selectors */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: Colors.white,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab("qr")}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderRadius: 14,
            backgroundColor: activeTab === "qr" ? getTabBg("qr") : "#f1f5f9",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderWidth: 1.5,
            borderColor: activeTab === "qr" ? "#bfdbfe" : "transparent",
            ...getWebCursor(),
          }}
        >
          <QrCodeIcon
            size={18}
            color={activeTab === "qr" ? getTabColor("qr") : "#64748b"}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: activeTab === "qr" ? "700" : "600",
              color: activeTab === "qr" ? getTabColor("qr") : "#64748b",
            }}
          >
            Quét QR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("otp")}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderRadius: 14,
            backgroundColor: activeTab === "otp" ? getTabBg("otp") : "#f1f5f9",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderWidth: 1.5,
            borderColor: activeTab === "otp" ? "#99f6e4" : "transparent",
            ...getWebCursor(),
          }}
        >
          <HashIcon
            size={18}
            color={activeTab === "otp" ? getTabColor("otp") : "#64748b"}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: activeTab === "otp" ? "700" : "600",
              color: activeTab === "otp" ? getTabColor("otp") : "#64748b",
            }}
          >
            Mã OTP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("face")}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderRadius: 14,
            backgroundColor: activeTab === "face" ? getTabBg("face") : "#f1f5f9",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderWidth: 1.5,
            borderColor: activeTab === "face" ? "#c7d2fe" : "transparent",
            ...getWebCursor(),
          }}
        >
          <UserIcon
            size={18}
            color={activeTab === "face" ? getTabColor("face") : "#64748b"}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: activeTab === "face" ? "700" : "600",
              color: activeTab === "face" ? getTabColor("face") : "#64748b",
            }}
          >
            Khuôn mặt
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          maxWidth: 540,
          width: "100%" as any,
          alignSelf: "center" as any,
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "qr" ? (
          <TouchableOpacity
            onPress={() => router.push("/student/qr-attendance")}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 24,
              padding: 28,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.05,
              shadowRadius: 24,
              elevation: 4,
              ...getWebCursor(),
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                backgroundColor: "#eff6ff",
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <QrCodeIcon size={44} color="#3b82f6" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#1e293b",
                marginBottom: 8,
              }}
            >
              Điểm danh bằng QR Code
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#64748b",
                textAlign: "center",
                lineHeight: 20,
                paddingHorizontal: 12,
              }}
            >
              Quét mã QR động hiển thị trên màn hình giảng viên để xác nhận nhanh sự hiện diện của bạn trong lớp học.
            </Text>
            <View
              style={{
                marginTop: 24,
                paddingVertical: 12,
                paddingHorizontal: 28,
                backgroundColor: "#3b82f6",
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text style={{ color: Colors.white, fontWeight: "700", fontSize: 14 }}>
                Mở camera quét mã
              </Text>
              <ChevronRightIcon size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ) : activeTab === "otp" ? (
          <TouchableOpacity
            onPress={() => router.push("/student/otp-attendance")}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 24,
              padding: 28,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              shadowColor: "#0d9488",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.05,
              shadowRadius: 24,
              elevation: 4,
              ...getWebCursor(),
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                backgroundColor: "#f0fdf4",
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <HashIcon size={44} color="#0d9488" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#1e293b",
                marginBottom: 8,
              }}
            >
              Điểm danh bằng OTP
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#64748b",
                textAlign: "center",
                lineHeight: 20,
                paddingHorizontal: 12,
              }}
            >
              Nhập mã số xác thực gồm 6 chữ số được giảng viên cung cấp trực tiếp tại lớp để xác nhận điểm danh.
            </Text>
            <View
              style={{
                marginTop: 24,
                paddingVertical: 12,
                paddingHorizontal: 28,
                backgroundColor: "#0d9488",
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text style={{ color: Colors.white, fontWeight: "700", fontSize: 14 }}>
                Bắt đầu nhập OTP
              </Text>
              <ChevronRightIcon size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/student/face-attendance")}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 24,
              padding: 28,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              shadowColor: "#8b5cf6",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.05,
              shadowRadius: 24,
              elevation: 4,
              ...getWebCursor(),
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                backgroundColor: "#f5f3ff",
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <UserIcon size={44} color="#8b5cf6" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#1e293b",
                marginBottom: 8,
              }}
            >
              Điểm danh Khuôn mặt
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#64748b",
                textAlign: "center",
                lineHeight: 20,
                paddingHorizontal: 12,
              }}
            >
              Sử dụng camera trước để quét khuôn mặt và xác thực thông tin sinh viên bằng công nghệ nhận diện AI.
            </Text>
            <View
              style={{
                marginTop: 24,
                paddingVertical: 12,
                paddingHorizontal: 28,
                backgroundColor: "#8b5cf6",
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text style={{ color: Colors.white, fontWeight: "700", fontSize: 14 }}>
                Quét khuôn mặt ngay
              </Text>
              <ChevronRightIcon size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Beautiful Instructions Box */}
        <View
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: 20,
            padding: 20,
            marginTop: 24,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            shadowColor: "#0f172a",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.01,
            shadowRadius: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <InfoIcon size={20} color={getTabColor(activeTab)} />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: "#1e293b",
              }}
            >
              Hướng dẫn thực hiện:
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: "#475569", lineHeight: 22 }}>
            {activeTab === "qr"
              ? "1. Cho phép ứng dụng sử dụng Camera khi có yêu cầu.\n2. Chọn đúng môn học đang diễn ra trong danh sách của lớp học.\n3. Hoàn tất bước 1: Xác thực khuôn mặt cá nhân.\n4. Hướng camera về phía mã QR trên màn hình của giảng viên để ghi nhận."
              : activeTab === "otp"
                ? "1. Lấy mã OTP gồm 6 chữ số do giảng viên cung cấp trực tiếp tại lớp.\n2. Thực hiện xác thực khuôn mặt sinh viên trước tiên.\n3. Nhập chính xác mã OTP vào các ô tương ứng và xác nhận gửi đi."
                : "1. Đứng ở nơi có đủ điều kiện ánh sáng rõ ràng.\n2. Căn chỉnh góc mặt thẳng trước camera điện thoại.\n3. Nhấn bắt đầu quét và chờ hệ thống nhận diện thành công."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
