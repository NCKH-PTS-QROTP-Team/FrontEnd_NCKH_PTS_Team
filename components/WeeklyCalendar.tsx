import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface WeeklyCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export default function WeeklyCalendar({
  selectedDate,
  onDateSelect,
}: WeeklyCalendarProps) {
  const today = new Date();
  const currentSelectedDate = selectedDate || today;

  const startOfWeek = new Date(currentSelectedDate);
  startOfWeek.setDate(
    currentSelectedDate.getDate() - currentSelectedDate.getDay(),
  );

  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected =
      date.toDateString() === currentSelectedDate.toDateString();

    weekDays.push(
      <TouchableOpacity
        key={i}
        activeOpacity={0.7}
        onPress={() => onDateSelect?.(date)}
        style={{
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 4,
          borderRadius: 12,
          backgroundColor: isSelected ? "#3FA9F5" : "#F9FAFB",
          alignItems: "center",
          borderWidth: isSelected ? 0 : 1,
          borderColor: "#E5E7EB",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            lineHeight: 16,
            fontWeight: "600",
            color: isSelected ? "#FFFFFF" : "#6B7280",
            marginBottom: 4,
          }}
        >
          {days[i]}
        </Text>
        <Text
          style={{
            fontSize: 18,
            lineHeight: 24,
            fontWeight: "bold",
            color: isSelected ? "#FFFFFF" : "#111827",
          }}
        >
          {date.getDate()}
        </Text>
        {isToday && !isSelected && (
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#3FA9F5",
              marginTop: 4,
            }}
          />
        )}
      </TouchableOpacity>,
    );
  }

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 8,
        }}
      >
        {weekDays}
      </View>
    </View>
  );
}
