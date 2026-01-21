import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/colors";
import { mockAttendanceSessions } from "../../constants/mockData";
import AppHeader from "../../components/AppHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import DataTable from "../../components/DataTable";

export default function AttendanceSessions() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const showTable = isDesktop || isTablet;

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
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              marginBottom: isMobile ? 12 : 16,
              marginHorizontal: -8,
              gap: isMobile ? 8 : 0,
            }}
          >
            <View
              style={{
                flex: isMobile ? undefined : 1,
                paddingHorizontal: 8,
                marginBottom: isMobile ? 8 : 0,
              }}
            >
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
            <View
              style={{
                flex: isMobile ? undefined : 1,
                paddingHorizontal: 8,
                marginBottom: isMobile ? 8 : 0,
              }}
            >
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
            <View
              style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8 }}
            >
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
                  className="px-4 py-2 rounded-lg mr-2"
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

          {filteredSessions.length === 0 ? (
            <Card style={{ padding: 24, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: Colors.text,
                  marginBottom: 8,
                }}
              >
                Không có buổi học
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Chưa có dữ liệu phù hợp với bộ lọc hiện tại.
              </Text>
            </Card>
          ) : showTable ? (
            /* Desktop/Tablet: Table View */
            <DataTable
              columns={[
                {
                  key: "classCode",
                  label: "Lớp học",
                  width: 120,
                  render: (session) => (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: Colors.text,
                      }}
                    >
                      {session.classCode}
                    </Text>
                  ),
                },
                {
                  key: "subject",
                  label: "Môn học",
                  width: 200,
                  render: (session) => (
                    <Text style={{ fontSize: 14, color: Colors.text }}>
                      {session.subject}
                    </Text>
                  ),
                },
                {
                  key: "teacher",
                  label: "Giảng viên",
                  width: 150,
                  render: (session) => (
                    <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                      {session.teacher}
                    </Text>
                  ),
                },
                {
                  key: "startTime",
                  label: "Thời gian",
                  width: 100,
                  render: (session) => (
                    <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                      {session.startTime}
                    </Text>
                  ),
                },
                {
                  key: "status",
                  label: "Trạng thái",
                  width: 140,
                  align: "center",
                  render: (session) => (
                    <Badge
                      variant={
                        session.status === "active" ? "success" : "neutral"
                      }
                      size="small"
                    >
                      {session.status === "active"
                        ? "Đang diễn ra"
                        : "Đã kết thúc"}
                    </Badge>
                  ),
                },
                {
                  key: "method",
                  label: "Phương thức",
                  width: 120,
                  align: "center",
                  render: (session) => (
                    <Badge variant="primary" size="small">
                      {session.method.toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  key: "present",
                  label: "Có mặt",
                  width: 100,
                  align: "center",
                  render: (session) => (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: Colors.success,
                      }}
                    >
                      {session.present}
                    </Text>
                  ),
                },
                {
                  key: "late",
                  label: "Muộn",
                  width: 100,
                  align: "center",
                  render: (session) => (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: Colors.warning,
                      }}
                    >
                      {session.late}
                    </Text>
                  ),
                },
                {
                  key: "absent",
                  label: "Vắng",
                  width: 100,
                  align: "center",
                  render: (session) => (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: Colors.error,
                      }}
                    >
                      {session.absent}
                    </Text>
                  ),
                },
                {
                  key: "total",
                  label: "Tổng",
                  width: 100,
                  align: "center",
                  render: (session) => (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: Colors.text,
                      }}
                    >
                      {session.total}
                    </Text>
                  ),
                },
                {
                  key: "attendanceRate",
                  label: "Tỷ lệ",
                  width: 100,
                  align: "center",
                  render: (session) => (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: Colors.primary,
                      }}
                    >
                      {Math.round((session.present / session.total) * 100)}%
                    </Text>
                  ),
                },
              ]}
              data={filteredSessions}
              onRowPress={(session) => alert(`Chi tiết ${session.className}`)}
              zebraStriping={true}
              stickyHeader={false}
            />
          ) : (
            /* Mobile: Card View */
            <>
              {filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  onPress={() => alert(`Chi tiết ${session.className}`)}
                  style={{ marginBottom: 12 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                          flexWrap: "wrap",
                          gap: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "600",
                            fontSize: 15,
                            marginRight: 8,
                            color: Colors.text,
                          }}
                        >
                          {session.classCode}
                        </Text>
                        <Badge
                          variant={
                            session.status === "active" ? "success" : "neutral"
                          }
                          size="small"
                        >
                          {session.status === "active"
                            ? "Đang diễn ra"
                            : "Đã kết thúc"}
                        </Badge>
                        <Badge variant="primary" size="small">
                          {session.method.toUpperCase()}
                        </Badge>
                      </View>

                      <Text
                        style={{
                          fontSize: 13,
                          marginBottom: 4,
                          color: Colors.text,
                        }}
                      >
                        {session.subject}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              marginRight: 4,
                              color: Colors.textSecondary,
                            }}
                          >
                            👨‍🏫
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: Colors.textSecondary,
                            }}
                          >
                            {session.teacher}
                          </Text>
                        </View>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              marginRight: 4,
                              color: Colors.textSecondary,
                            }}
                          >
                            ⏰
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: Colors.textSecondary,
                            }}
                          >
                            {session.startTime}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Attendance Stats */}
                  <View
                    className="flex-row border-t pt-3"
                    style={{ borderTopColor: Colors.border }}
                  >
                    <View className="flex-1 items-center">
                      <Text
                        className="text-2xl font-bold mb-1"
                        style={{ color: Colors.success }}
                      >
                        {session.present}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: Colors.textSecondary }}
                      >
                        Có mặt
                      </Text>
                    </View>
                    <View
                      className="flex-1 items-center border-l border-r"
                      style={{ borderColor: Colors.border }}
                    >
                      <Text
                        className="text-2xl font-bold mb-1"
                        style={{ color: Colors.warning }}
                      >
                        {session.late}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: Colors.textSecondary }}
                      >
                        Muộn
                      </Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text
                        className="text-2xl font-bold mb-1"
                        style={{ color: Colors.error }}
                      >
                        {session.absent}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: Colors.textSecondary }}
                      >
                        Vắng
                      </Text>
                    </View>
                    <View
                      className="flex-1 items-center border-l"
                      style={{ borderColor: Colors.border }}
                    >
                      <Text
                        className="text-2xl font-bold mb-1"
                        style={{ color: Colors.text }}
                      >
                        {session.total}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: Colors.textSecondary }}
                      >
                        Tổng
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="mt-3">
                    <View
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: Colors.gray200 }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${(session.present / session.total) * 100}%`,
                          backgroundColor: Colors.success,
                        }}
                      />
                    </View>
                    <Text
                      className="text-xs text-right mt-1"
                      style={{ color: Colors.textSecondary }}
                    >
                      {Math.round((session.present / session.total) * 100)}%
                      điểm danh
                    </Text>
                  </View>
                </Card>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
