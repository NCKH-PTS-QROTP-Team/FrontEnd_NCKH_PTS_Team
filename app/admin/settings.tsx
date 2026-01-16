import React, { useState } from "react";
import { View, Text, ScrollView, Switch } from "react-native";
import { Colors } from "../../constants/colors";
import { mockSystemSettings } from "../../constants/mockData";
import AppHeader from "../../components/AppHeader";
import Card from "../../components/Card";
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";

export default function Settings() {
  const [settings, setSettings] = useState(mockSystemSettings);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleSave = () => {
    alert("Đã lưu cài đặt!");
  };

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Cài đặt hệ thống" showLogout={true} />

      <ScrollView className="flex-1">
        <View
          className="p-4"
          style={{ maxWidth: 800, width: "100%", alignSelf: "center" }}
        >
          {/* OTP Settings */}
          <Card className="mb-4">
            <Text
              className="text-lg font-semibold mb-4"
              style={{ color: Colors.text }}
            >
              Cài đặt OTP
            </Text>

            <Input
              label="Thời gian hiệu lực OTP (giây)"
              placeholder="120"
              value={settings.otpValiditySeconds.toString()}
              onChangeText={(text) =>
                setSettings({
                  ...settings,
                  otpValiditySeconds: parseInt(text) || 120,
                })
              }
              keyboardType="numeric"
            />

            <Text
              className="text-xs mt-2"
              style={{ color: Colors.textSecondary }}
            >
              Khuyến nghị: 60-180 giây
            </Text>
          </Card>

          {/* QR Code Settings */}
          <Card className="mb-4">
            <Text
              className="text-lg font-semibold mb-4"
              style={{ color: Colors.text }}
            >
              Cài đặt QR Code
            </Text>

            <Input
              label="Thời gian làm mới QR (giây)"
              placeholder="30"
              value={settings.qrRefreshSeconds.toString()}
              onChangeText={(text) =>
                setSettings({
                  ...settings,
                  qrRefreshSeconds: parseInt(text) || 30,
                })
              }
              keyboardType="numeric"
            />

            <Text
              className="text-xs mt-2"
              style={{ color: Colors.textSecondary }}
            >
              QR Code sẽ tự động làm mới sau khoảng thời gian này
            </Text>
          </Card>

          {/* Attendance Rules */}
          <Card className="mb-4">
            <Text
              className="text-lg font-semibold mb-4"
              style={{ color: Colors.text }}
            >
              Quy tắc điểm danh
            </Text>

            <View
              className="flex-row justify-between items-center py-3 border-b"
              style={{ borderBottomColor: Colors.border }}
            >
              <View className="flex-1">
                <Text
                  className="font-medium mb-1"
                  style={{ color: Colors.text }}
                >
                  Cho phép điểm danh muộn
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: Colors.textSecondary }}
                >
                  Sinh viên có thể điểm danh sau giờ bắt đầu
                </Text>
              </View>
              <Switch
                value={settings.allowLateAttendance}
                onValueChange={(value) =>
                  setSettings({ ...settings, allowLateAttendance: value })
                }
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            {settings.allowLateAttendance && (
              <View style={{ marginTop: 16 }}>
                <Input
                  label="Ngưỡng muộn (phút)"
                  placeholder="15"
                  value={settings.lateThresholdMinutes.toString()}
                  onChangeText={(text) =>
                    setSettings({
                      ...settings,
                      lateThresholdMinutes: parseInt(text) || 15,
                    })
                  }
                  keyboardType="numeric"
                />
                <Text
                  className="text-xs mt-2"
                  style={{ color: Colors.textSecondary }}
                >
                  Điểm danh sau X phút sẽ được tính là "Muộn"
                </Text>
              </View>
            )}
          </Card>

          {/* Security Settings */}
          <Card className="mb-4">
            <Text
              className="text-lg font-semibold mb-4"
              style={{ color: Colors.text }}
            >
              Bảo mật
            </Text>

            <View className="flex-row justify-between items-center py-3">
              <View className="flex-1">
                <Text
                  className="font-medium mb-1"
                  style={{ color: Colors.text }}
                >
                  Bật xác thực GPS
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: Colors.textSecondary }}
                >
                  Yêu cầu sinh viên ở trong phạm vi lớp học
                </Text>
              </View>
              <Switch
                value={settings.enableGPS}
                onValueChange={(value) =>
                  setSettings({ ...settings, enableGPS: value })
                }
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            {settings.enableGPS && (
              <View
                className="mt-3 p-3 rounded-xl"
                style={{ backgroundColor: Colors.warningLight }}
              >
                <Text className="text-xs" style={{ color: Colors.warning }}>
                  ⚠ Tính năng GPS đang được phát triển
                </Text>
              </View>
            )}
          </Card>

          {/* Notification Settings */}
          <Card className="mb-4">
            <Text
              className="text-lg font-semibold mb-4"
              style={{ color: Colors.text }}
            >
              Thông báo
            </Text>

            <View
              className="flex-row justify-between items-center py-3 border-b"
              style={{ borderBottomColor: Colors.border }}
            >
              <Text className="font-medium" style={{ color: Colors.text }}>
                Email thông báo cho giảng viên
              </Text>
              <Switch
                value={true}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View
              className="flex-row justify-between items-center py-3 border-b"
              style={{ borderBottomColor: Colors.border }}
            >
              <Text className="font-medium" style={{ color: Colors.text }}>
                Email thông báo cho sinh viên
              </Text>
              <Switch
                value={true}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ fontWeight: '500', color: Colors.text }}>
                Cảnh báo vắng quá nhiều
              </Text>
              <Switch
                value={true}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </Card>

          {/* Save Button */}
          <PrimaryButton title="Lưu cài đặt" onPress={handleSave} />

          {/* Reset to Default */}
          <PrimaryButton
            title="Khôi phục mặc định"
            variant="outline"
            onPress={() => {
              setSettings(mockSystemSettings);
              alert("Đã khôi phục cài đặt mặc định");
            }}
            className="mt-3"
          />
        </View>
      </ScrollView>
    </View>
  );
}
