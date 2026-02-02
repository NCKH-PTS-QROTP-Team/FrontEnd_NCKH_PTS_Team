import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { EyeIcon } from "@/components/Icons";
import Toast, { useToast } from "@/components/Toast";
import { attendanceService, AttendanceSessionResponse } from "@/apis";

export default function AttendanceSessions() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sessions, setSessions] = useState<AttendanceSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  useEffect(() => {
    loadSessions();
  }, [filter]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== "all") {
        params.status = filter.toUpperCase();
      }
      const data = await attendanceService.getSessions(params);
      setSessions(data);
    } catch (error: any) {
      console.error("Error loading sessions:", error);
      showToast(
        error.message || "Không thể tải danh sách phiên điểm danh",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions;

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return { variant: "success" as const, label: "Đang diễn ra" };
      case "COMPLETED":
        return { variant: "neutral" as const, label: "Đã kết thúc" };
      case "CANCELLED":
        return { variant: "error" as const, label: "Đã hủy" };
      default:
        return { variant: "neutral" as const, label: status || "N/A" };
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal,
            paddingVertical,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: "600",
              marginBottom: isMobile ? 16 : 24,
              color: Colors.text,
            }}
          >
            Giám sát phiên điểm danh
          </Text>

          {/* Filter */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {(["all", "active", "completed"] as const).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor:
                    filter === f ? Colors.primary : Colors.gray100,
                }}
              >
                <Text
                  style={{
                    color: filter === f ? "#FFF" : Colors.text,
                    fontWeight: filter === f ? "600" : "400",
                  }}
                >
                  {f === "all"
                    ? "Tất cả"
                    : f === "active"
                    ? "Đang diễn ra"
                    : "Đã kết thúc"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
                Đang tải danh sách phiên điểm danh...
              </Text>
            </View>
          ) : filteredSessions.length > 0 ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 12,
                  color: Colors.textSecondary,
                }}
              >
                Tìm thấy {filteredSessions.length} phiên điểm danh
              </Text>

              {filteredSessions.map((session) => {
                const badge = getStatusBadge(session.status);
                return (
                  <Card
                    key={session.id}
                    onPress={() =>
                      router.push(`/academic-staff/sessions/${session.id}` as any)
                    }
                    style={{ marginBottom: 8 }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                    >
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          backgroundColor: Colors.primary + "15",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <EyeIcon size={24} color={Colors.primary} />
                      </View>

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View
                          style={{
                            flexDirection: isMobile ? "column" : "row",
                            alignItems: isMobile ? "flex-start" : "center",
                            marginBottom: 4,
                            gap: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: "600",
                              fontSize: 15,
                              color: Colors.text,
                            }}
                            numberOfLines={1}
                          >
                            {session.className || session.classCode || "N/A"}
                          </Text>
                          <Badge variant={badge.variant} size="small">
                            {badge.label}
                          </Badge>
                        </View>
                        <Text
                          style={{
                            fontSize: 13,
                            color: Colors.textSecondary,
                            marginBottom: 4,
                          }}
                          numberOfLines={1}
                        >
                          {session.subjectName || "N/A"}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: Colors.textSecondary,
                          }}
                        >
                          {new Date(session.startTime).toLocaleString("vi-VN")}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <EyeIcon size={80} color={Colors.textSecondary} />
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Không có phiên điểm danh nào
              </Text>
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

