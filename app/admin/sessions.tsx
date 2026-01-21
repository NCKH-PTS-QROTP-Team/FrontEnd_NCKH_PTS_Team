import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/colors";
import { mockAttendanceSessions } from "../../constants/mockData";
import AppHeader from "../../components/AppHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";

export default function AttendanceSessions() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredSessions = mockAttendanceSessions.filter((session) => {
    if (filter === "all") return true;
    return session.status === filter;
  });

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Giám sát điểm danh" showLogout={true} />

      <ScrollView className="flex-1">
        <View
          className="p-4"
          style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}
        >
          {/* Summary Cards */}
          <View style={{ flexDirection: isMobile ? 'column' : 'row', marginBottom: isMobile ? 12 : 16, marginHorizontal: -8, gap: isMobile ? 8 : 0 }}>
            <View style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8, marginBottom: isMobile ? 8 : 0 }}>
              <Card>
                <Text
                  className="text-3xl font-bold mb-1"
                  style={{ color: Colors.primary }}
                >
                  {
                    mockAttendanceSessions.filter((s) => s.status === "active")
                      .length
                  }
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: Colors.textSecondary }}
                >
                  Đang diễn ra
                </Text>
              </Card>
            </View>
            <View style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8, marginBottom: isMobile ? 8 : 0 }}>
              <Card>
                <Text
                  className="text-3xl font-bold mb-1"
                  style={{ color: Colors.success }}
                >
                  {mockAttendanceSessions.reduce(
                    (sum, s) => sum + s.present,
                    0
                  )}
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: Colors.textSecondary }}
                >
                  Có mặt
                </Text>
              </Card>
            </View>
            <View style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8 }}>
              <Card>
                <Text
                  className="text-3xl font-bold mb-1"
                  style={{ color: Colors.error }}
                >
                  {mockAttendanceSessions.reduce((sum, s) => sum + s.absent, 0)}
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: Colors.textSecondary }}
                >
                  Vắng mặt
                </Text>
              </Card>
            </View>
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row">
              {[
                { key: "all", label: "Tất cả" },
                { key: "active", label: "Đang diễn ra" },
                { key: "completed", label: "Đã kết thúc" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={{
                    backgroundColor:
                      filter === item.key ? Colors.primary : Colors.gray100,
                  }}
                  onPress={() => setFilter(item.key as any)}
                >
                  <Text
                    style={{
                      color:
                        filter === item.key ? Colors.white : Colors.gray700,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Sessions List */}
          <Text
            className="text-sm mb-3"
            style={{ color: Colors.textSecondary }}
          >
            {filteredSessions.length} buổi học
          </Text>

          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              onPress={() => alert(`Chi tiết ${session.className}`)}
              className="mb-3"
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text
                      className="font-semibold text-base mr-2"
                      style={{ color: Colors.text }}
                    >
                      {session.classCode}
                    </Text>
                    <Badge
                      label={
                        session.status === "active"
                          ? "Đang diễn ra"
                          : "Đã kết thúc"
                      }
                      variant={session.status === "active" ? "success" : "gray"}
                      size="sm"
                    />
                    <Badge
                      label={session.method.toUpperCase()}
                      variant="primary"
                      size="sm"
                    />
                  </View>

                  <Text className="text-sm mb-1" style={{ color: Colors.text }}>
                    {session.subject}
                  </Text>

                  <View className="flex-row items-center mb-2">
                    <Text
                      className="text-xs mr-1"
                      style={{ color: Colors.textSecondary }}
                    >
                      👨‍🏫
                    </Text>
                    <Text
                      className="text-xs mr-3"
                      style={{ color: Colors.textSecondary }}
                    >
                      {session.teacher}
                    </Text>
                    <Text
                      className="text-xs mr-1"
                      style={{ color: Colors.textSecondary }}
                    >
                      ⏰
                    </Text>
                    <Text
                      className="text-xs"
                      style={{ color: Colors.textSecondary }}
                    >
                      {session.startTime}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}

          {filteredSessions.length === 0 && (
            <Card style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text }}>
                Không có buổi học
              </Text>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center' }}>
                Chưa có dữ liệu phù hợp với bộ lọc hiện tại.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
