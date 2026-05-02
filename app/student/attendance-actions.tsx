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
import { HashIcon, QrCodeIcon, UserIcon } from "@/components/Icons";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";

export default function StudentAttendanceActionsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [activeTab, setActiveTab] = useState<"qr" | "otp" | "face">("qr");

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
          Điểm danh
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
          onPress={() => setActiveTab("qr")}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: activeTab === "qr" ? "#10B98115" : Colors.gray50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            ...getWebCursor(),
          }}
        >
          <QrCodeIcon
            size={18}
            color={activeTab === "qr" ? "#10B981" : Colors.textSecondary}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: activeTab === "qr" ? "600" : "400",
              color: activeTab === "qr" ? "#10B981" : Colors.textSecondary,
            }}
          >
            QR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("otp")}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor:
              activeTab === "otp" ? Colors.primary + "15" : Colors.gray50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            ...getWebCursor(),
          }}
        >
          <HashIcon
            size={18}
            color={activeTab === "otp" ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: activeTab === "otp" ? "600" : "400",
              color:
                activeTab === "otp" ? Colors.primary : Colors.textSecondary,
            }}
          >
            OTP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("face")}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor:
              activeTab === "face" ? "#8B5CF615" : Colors.gray50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            ...getWebCursor(),
          }}
        >
          <UserIcon
            size={18}
            color={activeTab === "face" ? "#8B5CF6" : Colors.textSecondary}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: activeTab === "face" ? "600" : "400",
              color:
                activeTab === "face" ? "#8B5CF6" : Colors.textSecondary,
            }}
          >
            Face
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, maxWidth: 600, width: "100%" as any, alignSelf: "center" as any }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "qr" ? (
          <TouchableOpacity
            onPress={() => router.push("/student/qr-attendance")}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 24,
              borderWidth: 2,
              borderColor: "#D1FAE5",
              alignItems: "center",
              ...getWebShadow("md"),
              ...getWebCursor(),
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
              Quét mã QR
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                textAlign: "center",
              }}
            >
              Quét mã QR từ giảng viên để điểm danh
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
                Mở camera →
              </Text>
            </View>
          </TouchableOpacity>
        ) : activeTab === "otp" ? (
          <TouchableOpacity
            onPress={() => router.push("/student/otp-attendance")}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 24,
              borderWidth: 2,
              borderColor: "#DBEAFE",
              alignItems: "center",
              ...getWebShadow("md"),
              ...getWebCursor(),
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
              Nhập mã OTP
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                textAlign: "center",
              }}
            >
              Nhập mã OTP 6 số từ giảng viên để điểm danh
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
            onPress={() => router.push("/student/face-attendance")}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 24,
              borderWidth: 2,
              borderColor: "#EDE9FE",
              alignItems: "center",
              ...getWebShadow("md"),
              ...getWebCursor(),
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "#EDE9FE",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <UserIcon size={48} color="#8B5CF6" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: Colors.textHeading,
                marginBottom: 8,
              }}
            >
              Quét mặt điểm danh
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                textAlign: "center",
              }}
            >
              Quét khuôn mặt để xác thực và điểm danh
            </Text>
            <View
              style={{
                marginTop: 20,
                paddingVertical: 12,
                paddingHorizontal: 24,
                backgroundColor: "#8B5CF6",
                borderRadius: 12,
              }}
            >
              <Text style={{ color: Colors.white, fontWeight: "600" }}>
                Mở camera →
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Instructions */}
        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
            borderWidth: 1,
            borderColor: "#DBEAFE",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1E40AF",
              marginBottom: 8,
            }}
          >
            💡 Hướng dẫn:
          </Text>
          <Text style={{ fontSize: 13, color: "#1E3A8A", lineHeight: 20 }}>
            {activeTab === "qr"
              ? "1. Nhấn 'Mở camera' để bật camera\n2. Hướng camera vào mã QR của giảng viên\n3. Chờ hệ thống xác nhận điểm danh\n4. Mã QR có hiệu lực trong 5 phút"
              : activeTab === "otp"
              ? "1. Nhấn 'Bắt đầu' để mở form nhập mã\n2. Nhập 6 chữ số OTP từ giảng viên\n3. Nhấn 'Xác nhận' để hoàn tất\n4. Mã OTP có hiệu lực trong 5 phút"
              : "1. Nhấn 'Mở camera' để bật camera selfie\n2. Đặt khuôn mặt trong khung\n3. Nhấn 'Quét mặt để điểm danh'\n4. Chờ hệ thống xác thực (cần đăng ký face trước)"}
          </Text>
        </View>

        {/* Quick Stats */}
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            ...getWebShadow("sm"),
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: Colors.textHeading,
              marginBottom: 12,
            }}
          >
            📊 Thống kê hôm nay
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: Colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                Đã điểm danh
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#10B981",
                }}
              >
                3
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: Colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                Còn lại
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: Colors.primary,
                }}
              >
                2
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
