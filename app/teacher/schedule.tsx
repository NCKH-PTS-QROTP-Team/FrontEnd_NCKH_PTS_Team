import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import MobileGradientHeader from "@/components/MobileGradientHeader";
import RoleWeeklyScheduleTable, {
  type ScheduleFilterView,
} from "@/components/RoleWeeklyScheduleTable";
import {
  scheduleService,
  type Schedule,
} from "@/apis/services/schedule.service";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";

function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatWeekRange(baseDate: Date) {
  const start = startOfWeekMonday(baseDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("vi-VN")} - ${end.toLocaleDateString("vi-VN")}`;
}

export default function TeacherScheduleScreen() {
  const router = useRouter();
  const { showToast, hideToast, toast } = useToast();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 1024;
  const isWeb = Platform.OS === "web";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weekDate, setWeekDate] = useState(new Date());
  const [filterView, setFilterView] = useState<ScheduleFilterView>("all");
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const contentPadding = isDesktop ? 24 : isMobile ? 16 : 20;

  const weekLabel = useMemo(() => formatWeekRange(weekDate), [weekDate]);

  const loadWeeklySchedules = async (showPageLoading = true) => {
    try {
      if (showPageLoading) setLoading(true);
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) {
        showToast("Không tìm thấy thông tin giảng viên", "error");
        return;
      }

      const fromDate = toIsoDate(startOfWeekMonday(weekDate));
      const toDateObj = new Date(startOfWeekMonday(weekDate));
      toDateObj.setDate(toDateObj.getDate() + 6);
      const toDate = toIsoDate(toDateObj);

      const data = await scheduleService.getSchedules({
        teacherId,
        fromDate,
        toDate,
      });

      setSchedules(data || []);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải lịch theo tuần.";
      showToast(msg, "error");
    } finally {
      if (showPageLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklySchedules();
  }, [weekDate]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadWeeklySchedules(false);
    } finally {
      setRefreshing(false);
    }
  };

  const changeWeek = (delta: number) => {
    setWeekDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * 7);
      return next;
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F1F5F9" }}
        edges={["top"]}
      >
        <StatusBar style="dark" />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={{ marginTop: 10, color: Colors.textSecondary }}>
            Đang tải lịch theo tuần...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F1F5F9" }}
      edges={["top"]}
    >
      <StatusBar style={isMobile ? "light" : "dark"} />

      {isMobile ? (
        <MobileGradientHeader
          title="Lịch theo tuần"
          subtitle={weekLabel}
          icon="calendar"
          actions={[
            {
              icon: "notifications",
              onPress: () => router.push("/teacher/notifications"),
              accessibilityLabel: "Mở thông báo",
            },
            {
              icon: "person",
              onPress: () => router.push("/teacher/profile"),
              accessibilityLabel: "Mở hồ sơ",
            },
          ]}
          style={{ marginHorizontal: 0, marginTop: 0, marginBottom: 12 }}
        />
      ) : null}

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          isMobile ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1E3A8A"]}
              tintColor="#1E3A8A"
            />
          ) : undefined
        }
        contentContainerStyle={{
          paddingHorizontal: contentPadding,
          paddingTop: isMobile ? 0 : 14,
          paddingBottom: isMobile ? 108 : 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: 1400,
            width: "100%",
            alignSelf: "center",
            gap: 12,
          }}
        >
          {!isMobile ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                padding: 16,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}
              >
                Lịch theo tuần
              </Text>
              <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                {weekLabel}
              </Text>
            </View>
          ) : null}

          <RoleWeeklyScheduleTable
            weekLabel={weekLabel}
            schedules={schedules}
            filterView={filterView}
            onFilterChange={setFilterView}
            onChangeWeek={changeWeek}
          />
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}
