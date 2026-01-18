import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import { mockSchedules } from "@/constants/mockData";
import { AppHeader } from "@/components/AppHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function ScheduleManagement() {
  const [selectedView, setSelectedView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const showTable = isDesktop; // Chỉ desktop mới hiển thị table

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  const addDays = (date: Date, days: number) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  };

  const formatDisplayDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const weekLabel = useMemo(() => {
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const dayOfWeek = firstDay.getDay() || 7; // Monday-first idea: treat Sunday as 7
    const weekNumber = Math.ceil((currentDate.getDate() + dayOfWeek - 1) / 7);
    const monthYear = currentDate.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
    return `Tuần ${weekNumber}, ${monthYear}`;
  }, [currentDate]);

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  // Gắn ngày thật cho mockSchedules (nếu chưa có)
  const schedulesWithDate = useMemo(() => {
    const baseDate = currentDate;
    const withDate = mockSchedules.map((s, idx) => {
      if ((s as any).date) return s as any;
      const date = addDays(baseDate, idx);
      const iso = date.toISOString().split("T")[0];
      return { ...s, date: iso };
    });

    // Sort theo ngày + giờ bắt đầu (nếu có)
    return withDate.slice().sort((a: any, b: any) => {
      const [aStart] = String(a.time || "").split(" - ");
      const [bStart] = String(b.time || "").split(" - ");
      const aDateTime = new Date(`${a.date}T${aStart || "00:00"}`);
      const bDateTime = new Date(`${b.date}T${bStart || "00:00"}`);
      return aDateTime.getTime() - bDateTime.getTime();
    });
  }, [currentDate]);

  // Sort function
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Toggle direction: asc -> desc -> null (no sort)
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // Sorted data
  const sortedSchedules = useMemo(() => {
    if (!sortColumn || !sortDirection) return schedulesWithDate;

    return [...schedulesWithDate].sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;

      if (sortColumn === "date") {
        const [aStart] = String(a.time || "").split(" - ");
        const [bStart] = String(b.time || "").split(" - ");
        aValue = new Date(`${a.date}T${aStart || "00:00"}`).getTime();
        bValue = new Date(`${b.date}T${bStart || "00:00"}`).getTime();
      } else if (sortColumn === "time") {
        const [aStart] = String(a.time || "").split(" - ");
        const [bStart] = String(b.time || "").split(" - ");
        aValue = aStart || "";
        bValue = bStart || "";
      } else {
        aValue = a[sortColumn] || "";
        bValue = b[sortColumn] || "";
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [schedulesWithDate, sortColumn, sortDirection]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (selectedView === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (selectedView === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateInputChange = (value: string) => {
    const newDate = new Date(value);
    if (!isNaN(newDate.getTime())) {
      setCurrentDate(newDate);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      upcoming: { label: "Sắp diễn ra", variant: "primary" as const },
      "in-progress": { label: "Đang diễn ra", variant: "success" as const },
      completed: { label: "Đã kết thúc", variant: "neutral" as const },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "neutral" as const,
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      <AppHeader title="Quản lý lịch học" showLogout={true} />

      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal,
            paddingVertical: 24,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          <PrimaryButton
            title="+ Tạo lịch học mới"
            onPress={() => alert("Tạo lịch học")}
            style={{ marginBottom: 16 }}
          />

          {/* View Toggle */}
          <View
            style={{ flexDirection: "row", marginBottom: isMobile ? 12 : 16 }}
          >
            <TouchableOpacity
              style={{
                backgroundColor:
                  selectedView === "week" ? Colors.primary : Colors.white,
                borderColor: Colors.primary,
              }}
              onPress={() => setSelectedView("week")}
            >
              <Text
                className="text-center font-medium"
                style={{
                  color:
                    selectedView === "week" ? Colors.white : Colors.primary,
                }}
              >
                Tuần
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor:
                  selectedView === "month" ? Colors.primary : Colors.white,
                borderColor: Colors.primary,
              }}
              onPress={() => setSelectedView("month")}
            >
              <Text
                className="text-center font-medium"
                style={{
                  color:
                    selectedView === "month" ? Colors.white : Colors.primary,
                }}
              >
                Tháng
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Week/Month Header */}
          <Card style={{ backgroundColor: Colors.gray50, marginBottom: 16 }}>
            <View className="flex-row justify-between items-center">
              <TouchableOpacity className="p-2">
                <Text className="text-2xl" style={{ color: Colors.primary }}>
                  ‹
                </Text>
              </TouchableOpacity>
              <Text
                className="font-semibold text-base"
                style={{ color: Colors.text }}
              >
                {selectedView === "week"
                  ? "Tuần 1, Tháng 1 2026"
                  : "Tháng 1 2026"}
              </Text>
              <TouchableOpacity className="p-2">
                <Text className="text-2xl" style={{ color: Colors.primary }}>
                  ›
                </Text>
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 16,
                    color: Colors.text,
                    marginBottom: 4,
                  }}
                >
                  {selectedView === "week" ? weekLabel : monthLabel}
                </Text>
                <TouchableOpacity onPress={handleToday}>
                  <Text style={{ fontSize: 13, color: Colors.primary }}>
                    Hôm nay
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {Platform.OS === "web" ? (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.gray300,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    {/* Native HTML date input for web */}
                    <input
                      type="date"
                      value={currentDate.toISOString().split("T")[0]}
                      onChange={(e) => handleDateInputChange(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 13,
                        color: "#111827",
                      }}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleToday}
                    style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                  >
                    <Text style={{ fontSize: 13, color: Colors.primary }}>
                      Chọn ngày
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={{ padding: 8 }} onPress={handleNext}>
                  <Text style={{ fontSize: 24, color: Colors.primary }}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Schedule List */}
          <Text
            className="text-sm mb-3"
            style={{ color: Colors.textSecondary }}
          >
            {mockSchedules.length} buổi học
          </Text>

          {mockSchedules.map((schedule) => (
            <Card
              key={schedule.id}
              onPress={() => alert(`Chi tiết ${schedule.courseName}`)}
              style={{ marginBottom: 12 }}
            >
              <View className="flex-row items-start">
                <View
                  className="w-16 rounded-xl items-center justify-center mr-3 py-3"
                  style={{ backgroundColor: Colors.infoLight }}
                >
                  <Text
                    className="text-xs font-semibold mb-1"
                    style={{ color: Colors.primary }}
                  >
                    {schedule.time.split(" - ")[0]}
                  </Text>
                  <Text className="text-xs" style={{ color: Colors.primary }}>
                    {schedule.time.split(" - ")[1]}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className="font-semibold text-base"
                      style={{ color: Colors.text }}
                    >
                      {schedule.courseCode}
                    </Text>
                    <Badge
                      variant={getStatusBadge(schedule.status).variant}
                      size="small"
                    >
                      {getStatusBadge(schedule.status).label}
                    </Badge>
                  </View>

                  <Text className="text-sm mb-2" style={{ color: Colors.text }}>
                    {schedule.courseName}
                  </Text>

                  <View className="flex-row flex-wrap">
                    <View className="flex-row items-center mr-4 mb-1">
                      <Text
                        className="text-xs mr-1"
                        style={{ color: Colors.textSecondary }}
                      >
                        📍
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: Colors.textSecondary }}
                      >
                        {schedule.room}
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <Text
                        className="text-xs mr-1"
                        style={{ color: Colors.textSecondary }}
                      >
                        👨‍🏫
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: Colors.textSecondary }}
                      >
                        {schedule.teacher}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              marginRight: 4,
                              color: Colors.textSecondary,
                            }}
                          >
                            📍
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: Colors.textSecondary,
                            }}
                          >
                            {schedule.room}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
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
                            {schedule.teacher}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                <Text
                  className="text-2xl ml-2"
                  style={{ color: Colors.gray300 }}
                >
                  ›
                </Text>
              </View>
            </Card>
          ))}

          {/* Bulk Actions */}
          <Card style={{ marginTop: 16 }}>
            <Text
              style={{
                fontWeight: "600",
                marginBottom: 12,
                color: Colors.text,
              }}
            >
              Thao tác hàng loạt
            </Text>
            <PrimaryButton
              title="Import lịch từ Excel"
              variant="outline"
              onPress={() => alert("Import Excel")}
              style={{ marginBottom: 8 }}
            />
            <PrimaryButton
              title="Export lịch học"
              variant="outline"
              onPress={() => alert("Export")}
            />
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
