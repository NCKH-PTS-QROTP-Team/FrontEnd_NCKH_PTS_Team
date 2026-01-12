import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Platform, useWindowDimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import { mockSystemSettings } from '../../constants/mockData';
import Card from '../../components/Card';
import Input from '../../components/Input';
import PrimaryButton from '../../components/PrimaryButton';

export default function Settings() {
  const [settings, setSettings] = useState(mockSystemSettings);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleSave = () => {
    alert('Đã lưu cài đặt!');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: Platform.OS === 'web' ? (width >= 768 ? 24 : 16) : 16, maxWidth: 800, width: '100%', alignSelf: 'center' }}>
          
          {/* Page Title */}
          <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: '600', marginBottom: isMobile ? 16 : 24, color: Colors.text }}>
            Cài đặt hệ thống
          </Text>
          
          {/* OTP Settings */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: Colors.text }}>
              Cài đặt OTP
            </Text>

            <Input
              label="Thời gian hiệu lực OTP (giây)"
              placeholder="120"
              value={settings.otpValiditySeconds.toString()}
              onChangeText={(text) => setSettings({ ...settings, otpValiditySeconds: parseInt(text) || 120 })}
              keyboardType="numeric"
            />

            <Text style={{ fontSize: 12, marginTop: 8, color: Colors.textSecondary }}>
              Khuyến nghị: 60-180 giây
            </Text>
          </Card>

          {/* QR Code Settings */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: Colors.text }}>
              Cài đặt QR Code
            </Text>

            <Input
              label="Thời gian làm mới QR (giây)"
              placeholder="30"
              value={settings.qrRefreshSeconds.toString()}
              onChangeText={(text) => setSettings({ ...settings, qrRefreshSeconds: parseInt(text) || 30 })}
              keyboardType="numeric"
            />

            <Text style={{ fontSize: 12, marginTop: 8, color: Colors.textSecondary }}>
              QR Code sẽ tự động làm mới sau khoảng thời gian này
            </Text>
          </Card>

          {/* Attendance Rules */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: Colors.text }}>
              Quy tắc điểm danh
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '500', marginBottom: 4, color: Colors.text }}>
                  Cho phép điểm danh muộn
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                  Sinh viên có thể điểm danh sau giờ bắt đầu
                </Text>
              </View>
              <Switch
                value={settings.allowLateAttendance}
                onValueChange={(value) => setSettings({ ...settings, allowLateAttendance: value })}
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
                  onChangeText={(text) => setSettings({ ...settings, lateThresholdMinutes: parseInt(text) || 15 })}
                  keyboardType="numeric"
                />
                <Text style={{ fontSize: 12, marginTop: 8, color: Colors.textSecondary }}>
                  Điểm danh sau X phút sẽ được tính là "Muộn"
                </Text>
              </View>
            )}
          </Card>

          {/* Security Settings */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: Colors.text }}>
              Bảo mật
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '500', marginBottom: 4, color: Colors.text }}>
                  Bật xác thực GPS
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                  Yêu cầu sinh viên ở trong phạm vi lớp học
                </Text>
              </View>
              <Switch
                value={settings.enableGPS}
                onValueChange={(value) => setSettings({ ...settings, enableGPS: value })}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            {settings.enableGPS && (
              <View style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: Colors.warningLight }}>
                <Text style={{ fontSize: 12, color: Colors.warning }}>
                  ⚠ Tính năng GPS đang được phát triển
                </Text>
              </View>
            )}
          </Card>

          {/* Notification Settings */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: Colors.text }}>
              Thông báo
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
              <Text style={{ fontWeight: '500', color: Colors.text }}>
                Email thông báo cho giảng viên
              </Text>
              <Switch
                value={true}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
              <Text style={{ fontWeight: '500', color: Colors.text }}>
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
          <PrimaryButton
            title="Lưu cài đặt"
            onPress={handleSave}
          />

          {/* Reset to Default */}
          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              title="Khôi phục mặc định"
              variant="outline"
              onPress={() => {
                setSettings(mockSystemSettings);
                alert('Đã khôi phục cài đặt mặc định');
              }}
            />
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
