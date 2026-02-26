import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, useWindowDimensions, TextInput, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import { UserIcon } from "@/components/Icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import Toast, { useToast } from "@/components/Toast";
import { authService } from "@/apis";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      console.error("Error loading user info:", error);
      showToast("Không thể tải thông tin tài khoản", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: isDesktop ? 32 : isMobile ? 20 : 24,
        }}
      >
        <View
          style={{
            maxWidth: isDesktop ? 800 : "100%",
            width: "100%",
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              fontSize: isDesktop ? 32 : isMobile ? 24 : 28,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 24,
            }}
          >
            Thông tin tài khoản
          </Text>

          {loading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 48,
              }}
            >
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Đang tải thông tin...
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: isMobile ? 20 : 24,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: Colors.primary + "15",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <UserIcon size={40} color={Colors.primary} />
                </View>
                <Text
                  style={{
                    fontSize: isMobile ? 20 : 24,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  {user?.name || "Người dùng"}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                  }}
                >
                  {user?.email || ""}
                </Text>
              </View>

              <View style={{ gap: 16 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Vai trò
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#F3F4F6",
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#111827",
                      }}
                    >
                      {user?.role === "ACADEMIC_STAFF" ? "Giáo vụ" : user?.role || "N/A"}
                    </Text>
                  </View>
                </View>

                {user?.studentId && (
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      Mã sinh viên
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#F3F4F6",
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: "#111827",
                        }}
                      >
                        {user.studentId}
                      </Text>
                    </View>
                  </View>
                )}

                {user?.teacherId && (
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      Mã giảng viên
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#F3F4F6",
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: "#111827",
                        }}
                      >
                        {user.teacherId}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}

