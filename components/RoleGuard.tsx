import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUserProfile } from "@/apis/config/apiClient";
import { UserRole } from "@/apis/types/auth.types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const checkRole = async () => {
      try {
        const user = await getCurrentUserProfile();
        if (!isMounted) return;
        
        if (!user) {
          // Not logged in
          setIsAllowed(false);
          return;
        }

        const userRole = user.role as UserRole;
        // Map frontend role terminology to backend UserRole if needed
        let normalizedUserRole = userRole;
        if (typeof userRole === 'string') {
          const upperRole = userRole.toUpperCase();
          if (upperRole === 'DEPARTMENT' || upperRole === 'ACADEMIC_STAFF') {
            normalizedUserRole = UserRole.ACADEMIC_STAFF;
          }
        }

        if (allowedRoles.includes(normalizedUserRole)) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } catch (error) {
        console.error("RoleGuard check error:", error);
        if (isMounted) setIsAllowed(false);
      }
    };

    checkRole();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles]);

  if (isAllowed === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isAllowed) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC", padding: 24 }}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Ionicons name="shield-half-outline" size={50} color="#EF4444" />
        </View>
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 12, textAlign: "center" }}>
          Truy cập bị từ chối
        </Text>
        <Text style={{ fontSize: 16, color: "#6B7280", textAlign: "center", marginBottom: 32, maxWidth: 400, lineHeight: 24 }}>
          Tài khoản của bạn không có quyền truy cập vào trang này. Vui lòng quay lại trang chủ hoặc đăng nhập với tài khoản phù hợp.
        </Text>
        
        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#D1D5DB",
              ...(Platform.OS === "web" ? { cursor: "pointer" } as any : {})
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#374151" }}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/auth/login")}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: "#2563EB",
              ...(Platform.OS === "web" ? { cursor: "pointer" } as any : {})
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>Về trang Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};
