import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { mockSchedules } from "@/constants/mockData";
import { Colors } from "@/constants/colors";
import WeeklyCalendar from "@/components/WeeklyCalendar";

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 800 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const cardPadding = isDesktop ? 24 : 16;

  // Get selected date info
  const weekdays = [
    "Chủ nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const dayName = weekdays[selectedDate.getDay()];
  const dateStr = `${dayName}, ${String(selectedDate.getDate()).padStart(
    2,
    "0",
  )}/${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${selectedDate.getFullYear()}`;

  // Filter schedules by selected date (for now, show all - you can add date filtering logic)
  const filteredSchedules = mockSchedules;
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: isDesktop ? 24 : 20,
          paddingBottom: isDesktop ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Weekly Calendar */}
          <View style={{ marginBottom: isDesktop ? 24 : 20 }}>
            <WeeklyCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </View>

          {/* Date Header */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: cardPadding,
              marginBottom: isDesktop ? 24 : 20,
              borderWidth: 1,
              borderColor: Colors.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: isMobile ? 12 : 14,
                lineHeight: isMobile ? 18 : 20,
                color: Colors.textLight,
                marginBottom: 4,
              }}
            >
              {isToday ? "Hôm nay" : "Ngày đã chọn"}
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 20 : isDesktop ? 24 : 22,
                lineHeight: isMobile ? 28 : isDesktop ? 32 : 30,
                fontWeight: "700",
                color: Colors.textHeading,
              }}
            >
              {dateStr}
            </Text>
          </View>

          {/* Schedule List */}
          <Text
            style={{
              fontSize: isMobile ? 16 : 18,
              lineHeight: isMobile ? 24 : 28,
              fontWeight: "700",
              color: Colors.textHeading,
              marginBottom: isDesktop ? 16 : 12,
            }}
          >
            Lịch học trong ngày
          </Text>

          <View>
            {filteredSchedules.length === 0 ? (
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 12,
                  padding: cardPadding,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 40,
                }}
              >
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
                <Text
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    lineHeight: isMobile ? 20 : 24,
                    fontWeight: "600",
                    color: Colors.text,
                    marginBottom: 4,
                  }}
                >
                  Không có lịch học
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    lineHeight: isMobile ? 18 : 20,
                    color: Colors.textSecondary,
                  }}
                >
                  Không có lịch học {isToday ? "hôm nay" : "ngày này"}
                </Text>
              </View>
            ) : (
              filteredSchedules.map((schedule, index) => (
                <TouchableOpacity
                  key={schedule.id}
                  activeOpacity={0.95}
                  style={{
                    backgroundColor: Colors.white,
                    borderRadius: 12,
                    padding: cardPadding,
                    marginBottom:
                      index < filteredSchedules.length - 1
                        ? isDesktop
                          ? 12
                          : 10
                        : 0,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {/* Course Name */}
                  <Text
                    style={{
                      fontSize: isMobile ? 16 : 18,
                      lineHeight: isMobile ? 24 : 28,
                      fontWeight: "600",
                      color: Colors.textHeading,
                      marginBottom: isMobile ? 6 : 8,
                    }}
                  >
                    {schedule.courseName}
                  </Text>

                  {/* Teacher */}
                  <Text
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      lineHeight: isMobile ? 20 : 21,
                      color: Colors.textLight,
                      marginBottom: isMobile ? 10 : 12,
                    }}
                  >
                    {schedule.teacher}
                  </Text>

                  {/* Time & Room */}
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    {/* Blue vertical line */}
                    <View
                      style={{
                        width: 3,
                        height: isMobile ? 40 : 44,
                        backgroundColor: Colors.primary,
                        borderRadius: 2,
                        marginRight: isMobile ? 10 : 12,
                      }}
                    />

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: isMobile ? 15 : 16,
                          lineHeight: isMobile ? 22 : 24,
                          fontWeight: "500",
                          color: Colors.textHeading,
                          marginBottom: isMobile ? 2 : 4,
                        }}
                      >
                        {schedule.time}
                      </Text>
                      <Text
                        style={{
                          fontSize: isMobile ? 13 : 14,
                          lineHeight: isMobile ? 20 : 21,
                          color: Colors.textSecondary,
                        }}
                      >
                        Phòng: {schedule.room}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
