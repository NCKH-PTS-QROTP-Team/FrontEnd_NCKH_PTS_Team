<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';

export default function OTPAttendanceScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
=======
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Colors } from "@/constants/colors";

export default function OTPAttendanceScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
>>>>>>> Phu
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
<<<<<<< HEAD
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
=======
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
>>>>>>> Phu
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
<<<<<<< HEAD
    const otpCode = otp.join('');
=======
    const otpCode = otp.join("");
>>>>>>> Phu
    if (otpCode.length !== 6) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
<<<<<<< HEAD
      alert('Điểm danh thành công!');
=======
      alert("Điểm danh thành công!");
>>>>>>> Phu
      router.back();
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
<<<<<<< HEAD
    return `${mins}:${secs.toString().padStart(2, '0')}`;
=======
    return `${mins}:${secs.toString().padStart(2, "0")}`;
>>>>>>> Phu
  };

  const isExpired = countdown === 0;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

<<<<<<< HEAD
  const contentMaxWidth = isDesktop ? 500 : '100%';
=======
  const contentMaxWidth = isDesktop ? 500 : "100%";
>>>>>>> Phu
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const otpInputSpacing = isDesktop ? 50 : isTablet ? 30 : 20;

  return (
<<<<<<< HEAD
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />
      
=======
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />

>>>>>>> Phu
      <ScrollView
        contentContainerStyle={{ paddingHorizontal, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
<<<<<<< HEAD
        <View style={{ maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          {/* Main Card */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
=======
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Main Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
>>>>>>> Phu
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              borderWidth: 1,
<<<<<<< HEAD
              borderColor: '#E5E7EB',
              shadowColor: '#000',
=======
              borderColor: "#E5E7EB",
              shadowColor: "#000",
>>>>>>> Phu
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Countdown Section */}
<<<<<<< HEAD
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 48, lineHeight: 56, marginBottom: 12 }}>⏱️</Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280', marginBottom: 8 }}>
                Thời gian còn lại
              </Text>
              <Text style={{ fontSize: 36, lineHeight: 44, fontWeight: 'bold', color: isExpired ? '#EF4444' : '#3FA9F5' }}>
                {formatTime(countdown)}
              </Text>
              {isExpired && (
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#EF4444', marginTop: 8 }}>
=======
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontSize: 48, lineHeight: 56, marginBottom: 12 }}>
                ⏱️
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Thời gian còn lại
              </Text>
              <Text
                style={{
                  fontSize: 36,
                  lineHeight: 44,
                  fontWeight: "bold",
                  color: isExpired ? "#EF4444" : "#3FA9F5",
                }}
              >
                {formatTime(countdown)}
              </Text>
              {isExpired && (
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#EF4444",
                    marginTop: 8,
                  }}
                >
>>>>>>> Phu
                  Hết thời gian điểm danh
                </Text>
              )}
            </View>

            {/* Course Info */}
<<<<<<< HEAD
            <View style={{ backgroundColor: '#E0F2FE', borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280', marginBottom: 4 }}>Môn học</Text>
              <Text style={{ fontSize: 18, lineHeight: 28, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                Lập trình cơ bản
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: '#4B5563' }}>
=======
            <View
              style={{
                backgroundColor: "#E0F2FE",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: "#6B7280",
                  marginBottom: 4,
                }}
              >
                Môn học
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  lineHeight: 28,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Lập trình cơ bản
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: "#4B5563" }}>
>>>>>>> Phu
                CS101 • Phòng A102
              </Text>
            </View>

            {/* OTP Input */}
            <View style={{ marginBottom: 24 }}>
<<<<<<< HEAD
              <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '600', color: '#111827', marginBottom: 16, textAlign: 'center' }}>
                Nhập mã OTP từ giảng viên
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: otpInputSpacing }}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
=======
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 24,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Nhập mã OTP từ giảng viên
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: otpInputSpacing,
                }}
              >
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
>>>>>>> Phu
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={1}
                    keyboardType="number-pad"
                    editable={!isExpired}
<<<<<<< HEAD
                    style={{
                      width: 50,
                      height: 56,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: digit ? Colors.primary : Colors.border,
                      backgroundColor: '#F9FAFB',
                      textAlign: 'center',
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: Colors.textHeading,
                      ...Platform.select({
                        web: { outlineStyle: 'none' },
                      }),
                    }}
=======
                    style={[
                      {
                        width: 50,
                        height: 56,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: digit ? Colors.primary : Colors.border,
                        backgroundColor: "#F9FAFB",
                        textAlign: "center",
                        fontSize: 24,
                        fontWeight: "bold",
                        color: Colors.textHeading,
                      },
                      Platform.OS === "web" && { outlineStyle: "none" as any },
                    ]}
>>>>>>> Phu
                  />
                ))}
              </View>
            </View>

            <PrimaryButton
              title={isExpired ? "Hết thời gian" : "Xác nhận"}
              onPress={handleSubmit}
              loading={loading}
<<<<<<< HEAD
              disabled={otp.join('').length !== 6 || isExpired}
=======
              disabled={otp.join("").length !== 6 || isExpired}
>>>>>>> Phu
            />
          </View>

          {/* Help Text */}
<<<<<<< HEAD
          <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FDE68A' }}>
            <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: '600', color: '#92400E', marginBottom: 8 }}>
              Hướng dẫn:
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: '#78350F' }}>
              Nhập mã OTP 6 số mà giảng viên hiển thị trên lớp để hoàn tất điểm danh.
=======
          <View
            style={{
              backgroundColor: "#FEF3C7",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#FDE68A",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                fontWeight: "600",
                color: "#92400E",
                marginBottom: 8,
              }}
            >
              Hướng dẫn:
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: "#78350F" }}>
              Nhập mã OTP 6 số mà giảng viên hiển thị trên lớp để hoàn tất điểm
              danh.
>>>>>>> Phu
            </Text>
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

// Updated: 2026-01-02 13:16:08
