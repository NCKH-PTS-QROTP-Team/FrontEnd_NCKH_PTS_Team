import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import { HashIcon, QrCodeIcon } from "@/components/Icons";

export default function AttendanceActionsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [activeTab, setActiveTab] = useState<"otp" | "qr">("otp");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: Colors.white,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: Colors.textHeading,
            textAlign: "center",
          }}
        >
          Tạo phiên điểm danh
        </Text>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: Colors.white,
          paddingHorizontal: 16,
          paddingTop: 12,
          gap: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab("otp")}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor:
              activeTab === "otp" ? Colors.primary + "15" : Colors.gray50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <HashIcon
            size={20}
            color={activeTab === "otp" ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={{
              fontSize: 15,
              fontWeight: activeTab === "otp" ? "600" : "400",
              color:
                activeTab === "otp" ? Colors.primary : Colors.textSecondary,
            }}
          >
            Mã OTP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("qr")}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: activeTab === "qr" ? "#10B98115" : Colors.gray50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <QrCodeIcon
            size={20}
            color={activeTab === "qr" ? "#10B981" : Colors.textSecondary}
          />
          <Text
            style={{
              fontSize: 15,
              fontWeight: activeTab === "qr" ? "600" : "400",
              color: activeTab === "qr" ? "#10B981" : Colors.textSecondary,
            }}
          >
            QR Code
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "otp" ? (
          <TouchableOpacity
            onPress={() => router.push("/teacher/generate-otp")}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 24,
              borderWidth: 2,
              borderColor: "#DBEAFE",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "#DBEAFE",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "bold",
                  color: Colors.primary,
                }}
              >
                123
              </Text>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: Colors.textHeading,
                marginBottom: 8,
              }}
            >
              Tạo mã OTP
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                textAlign: "center",
              }}
            >
              Sinh mã số 6 chữ số để sinh viên điểm danh
            </Text>
            <View
              style={{
                marginTop: 20,
                paddingVertical: 12,
                paddingHorizontal: 24,
                backgroundColor: Colors.primary,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: Colors.white, fontWeight: "600" }}>
                Bắt đầu →
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/teacher/generate-qr")}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 24,
              borderWidth: 2,
              borderColor: "#D1FAE5",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "#D1FAE5",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <QrCodeIcon size={48} color="#10B981" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: Colors.textHeading,
                marginBottom: 8,
              }}
            >
              Tạo QR Code
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                textAlign: "center",
              }}
            >
              Hiển thị mã QR trên lớp để sinh viên quét
            </Text>
            <View
              style={{
                marginTop: 20,
                paddingVertical: 12,
                paddingHorizontal: 24,
                backgroundColor: "#10B981",
                borderRadius: 12,
              }}
            >
              <Text style={{ color: Colors.white, fontWeight: "600" }}>
                Bắt đầu →
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Instructions */}
        <View
          style={{
            backgroundColor: "#FEF3C7",
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
            borderWidth: 1,
            borderColor: "#FDE68A",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#92400E",
              marginBottom: 8,
            }}
          >
            💡 Hướng dẫn:
          </Text>
          <Text style={{ fontSize: 13, color: "#78350F", lineHeight: 20 }}>
            {activeTab === "otp"
              ? "1. Nhấn 'Bắt đầu' để tạo mã OTP\n2. Hiển thị mã trên màn hình cho sinh viên\n3. Sinh viên nhập mã để điểm danh\n4. Mã có hiệu lực trong 5 phút"
              : "1. Nhấn 'Bắt đầu' để tạo QR code\n2. Hiển thị mã QR trên màn hình hoặc máy chiếu\n3. Sinh viên dùng app quét mã để điểm danh\n4. Mã có hiệu lực trong 5 phút"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
