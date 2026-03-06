import React, { useState, useEffect, useMemo } from "react";
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
import { PrimaryButton } from "@/components/PrimaryButton";
import { CalendarIcon } from "@/components/Icons";
import Badge from "@/components/Badge";
import Toast, { useToast } from "@/components/Toast";
import { scheduleService, Schedule } from "@/apis";

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getSchedules();
      setSchedules(data);
    } catch (error: any) {
      console.error("Error loading schedules:", error);
      showToast(
        error.message || "Không thể tải danh sách lịch học",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [schedules]);

  const totalPages = Math.ceil(schedules.length / PAGE_SIZE);
  const paginatedSchedules = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return schedules.slice(start, start + PAGE_SIZE);
  }, [schedules, page]);

  const getDayName = (dayOfWeek: number) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[dayOfWeek] || `T${dayOfWeek}`;
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
            Quản lý lịch học
          </Text>

          <View style={{ marginBottom: isMobile ? 12 : 16 }}>
            <PrimaryButton
              title="+ Tạo lịch học mới"
              onPress={() => router.push("/academic-staff/schedules/create" as any)}
            />
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
                Đang tải danh sách lịch học...
              </Text>
            </View>
          ) : schedules.length > 0 ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 12,
                  color: Colors.textSecondary,
                }}
              >
                Tìm thấy {schedules.length} lịch học
              </Text>

              {paginatedSchedules.map((schedule: Schedule) => (
                <Card
                  key={schedule.id}
                  onPress={() =>
                    router.push(`/academic-staff/schedules/${schedule.id}` as any)
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
                      <CalendarIcon size={24} color={Colors.primary} />
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
                          {schedule.className || schedule.classCode}
                        </Text>
                        <Badge variant="info" size="small">
                          {getDayName(schedule.dayOfWeek)}
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
                        {schedule.subjectName || schedule.subjectCode}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: Colors.textSecondary,
                          }}
                        >
                          {schedule.startTime} - {schedule.endTime}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            color: Colors.textSecondary,
                          }}
                        >
                          Phòng: {schedule.room || "N/A"}
                        </Text>
                      </View>
                      {schedule.teacherName && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: Colors.textSecondary,
                            marginTop: 4,
                          }}
                          numberOfLines={1}
                        >
                          GV: {schedule.teacherName}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12, marginBottom: 16 }}>
                  <TouchableOpacity
                    style={[{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }, page === 1 && { backgroundColor: '#f8fafc', elevation: 0 }]}
                    disabled={page === 1}
                    onPress={() => setPage(p => p - 1)}
                  >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: page === 1 ? '#cbd5e1' : Colors.primary }}>{'<'}</Text>
                  </TouchableOpacity>

                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b' }}>Trang {page} / {totalPages}</Text>

                  <TouchableOpacity
                    style={[{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }, page === totalPages && { backgroundColor: '#f8fafc', elevation: 0 }]}
                    disabled={page === totalPages}
                    onPress={() => setPage(p => p + 1)}
                  >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: page === totalPages ? '#cbd5e1' : Colors.primary }}>{'>'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <CalendarIcon size={80} color={Colors.textSecondary} />
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Chưa có lịch học nào
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

