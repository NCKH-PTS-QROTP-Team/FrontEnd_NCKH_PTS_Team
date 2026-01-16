<<<<<<< HEAD
import React from 'react';
import { View, Text, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { mockSchedules } from '@/constants/mockData';
import { Colors } from '@/constants/colors';
=======
import React from "react";
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
>>>>>>> Phu

export default function ScheduleScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

<<<<<<< HEAD
  const contentMaxWidth = isDesktop ? 800 : '100%';
=======
  const contentMaxWidth = isDesktop ? 800 : "100%";
>>>>>>> Phu
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const cardPadding = isDesktop ? 24 : 16;

  // Get current date
  const today = new Date();
<<<<<<< HEAD
  const weekdays = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = weekdays[today.getDay()];
  const dateStr = `${dayName}, ${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="dark" />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal, 
=======
  const weekdays = [
    "Chủ nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const dayName = weekdays[today.getDay()];
  const dateStr = `${dayName}, ${String(today.getDate()).padStart(
    2,
    "0"
  )}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

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
>>>>>>> Phu
          paddingVertical: isDesktop ? 24 : 20,
          paddingBottom: isDesktop ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
<<<<<<< HEAD
        <View style={{ maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          {/* Date Header */}
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: 16,
            padding: cardPadding,
            marginBottom: isDesktop ? 24 : 20,
            borderWidth: 1,
            borderColor: Colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}>
            <Text style={{ 
              fontSize: isMobile ? 12 : 14, 
              lineHeight: isMobile ? 18 : 20, 
              color: Colors.textLight, 
              marginBottom: 4,
            }}>
              Hôm nay
            </Text>
            <Text style={{ 
              fontSize: isMobile ? 20 : isDesktop ? 24 : 22, 
              lineHeight: isMobile ? 28 : isDesktop ? 32 : 30, 
              fontWeight: '700', 
              color: Colors.textHeading 
            }}>
=======
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
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
              Hôm nay
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 20 : isDesktop ? 24 : 22,
                lineHeight: isMobile ? 28 : isDesktop ? 32 : 30,
                fontWeight: "700",
                color: Colors.textHeading,
              }}
            >
>>>>>>> Phu
              {dateStr}
            </Text>
          </View>

          {/* Schedule List */}
<<<<<<< HEAD
          <Text style={{ 
            fontSize: isMobile ? 16 : 18, 
            lineHeight: isMobile ? 24 : 28, 
            fontWeight: '700', 
            color: Colors.textHeading, 
            marginBottom: isDesktop ? 16 : 12,
          }}>
            Lịch học trong ngày
          </Text>
          
          <View>
            {mockSchedules.length === 0 ? (
              <View style={{
                backgroundColor: Colors.white,
                borderRadius: 12,
                padding: cardPadding,
                borderWidth: 1,
                borderColor: Colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 40,
              }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
                <Text style={{ 
                  fontSize: isMobile ? 14 : 16, 
                  lineHeight: isMobile ? 20 : 24, 
                  fontWeight: '600', 
                  color: Colors.text,
                  marginBottom: 4,
                }}>
                  Không có lịch học
                </Text>
                <Text style={{ 
                  fontSize: isMobile ? 12 : 14, 
                  lineHeight: isMobile ? 18 : 20, 
                  color: Colors.textSecondary 
                }}>
=======
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
            {mockSchedules.length === 0 ? (
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
>>>>>>> Phu
                  Hôm nay bạn không có buổi học nào
                </Text>
              </View>
            ) : (
              mockSchedules.map((schedule, index) => (
                <TouchableOpacity
                  key={schedule.id}
                  activeOpacity={0.95}
                  style={{
                    backgroundColor: Colors.white,
                    borderRadius: 12,
                    padding: cardPadding,
<<<<<<< HEAD
                    marginBottom: index < mockSchedules.length - 1 ? (isDesktop ? 12 : 10) : 0,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    shadowColor: '#000',
=======
                    marginBottom:
                      index < mockSchedules.length - 1
                        ? isDesktop
                          ? 12
                          : 10
                        : 0,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    shadowColor: "#000",
>>>>>>> Phu
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {/* Course Name */}
<<<<<<< HEAD
                  <Text style={{ 
                    fontSize: isMobile ? 16 : 18, 
                    lineHeight: isMobile ? 24 : 28, 
                    fontWeight: '600', 
                    color: Colors.textHeading,
                    marginBottom: isMobile ? 6 : 8,
                  }}>
=======
                  <Text
                    style={{
                      fontSize: isMobile ? 16 : 18,
                      lineHeight: isMobile ? 24 : 28,
                      fontWeight: "600",
                      color: Colors.textHeading,
                      marginBottom: isMobile ? 6 : 8,
                    }}
                  >
>>>>>>> Phu
                    {schedule.courseName}
                  </Text>

                  {/* Teacher */}
<<<<<<< HEAD
                  <Text style={{ 
                    fontSize: isMobile ? 13 : 14, 
                    lineHeight: isMobile ? 20 : 21, 
                    color: Colors.textLight,
                    marginBottom: isMobile ? 10 : 12,
                  }}>
=======
                  <Text
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      lineHeight: isMobile ? 20 : 21,
                      color: Colors.textLight,
                      marginBottom: isMobile ? 10 : 12,
                    }}
                  >
>>>>>>> Phu
                    {schedule.teacher}
                  </Text>

                  {/* Time & Room */}
<<<<<<< HEAD
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    {/* Blue vertical line */}
                    <View style={{
                      width: 3,
                      height: isMobile ? 40 : 44,
                      backgroundColor: Colors.primary,
                      borderRadius: 2,
                      marginRight: isMobile ? 10 : 12,
                    }} />
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: isMobile ? 15 : 16, 
                        lineHeight: isMobile ? 22 : 24, 
                        fontWeight: '500',
                        color: Colors.textHeading,
                        marginBottom: isMobile ? 2 : 4,
                      }}>
                        {schedule.time}
                      </Text>
                      <Text style={{ 
                        fontSize: isMobile ? 13 : 14, 
                        lineHeight: isMobile ? 20 : 21, 
                        color: Colors.textSecondary 
                      }}>
=======
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
>>>>>>> Phu
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
<<<<<<< HEAD
    </View>
=======
    </SafeAreaView>
>>>>>>> Phu
  );
}
