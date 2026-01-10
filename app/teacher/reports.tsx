import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';

export default function ReportsScreen() {
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 900 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar style="dark" />
      <AppHeader title="Báo cáo & Thống kê" showBack showLogout={!isWeb} />
      
      <ScrollView
        contentContainerStyle={{ paddingHorizontal, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          {/* Summary Card */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 20, lineHeight: 28, fontWeight: 'bold', color: '#111827', marginBottom: 20 }}>
              Tổng quan học kỳ
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 28, lineHeight: 36, fontWeight: 'bold', color: '#3FA9F5', marginBottom: 4 }}>156</Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280' }}>Tổng buổi</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 28, lineHeight: 36, fontWeight: 'bold', color: '#10B981', marginBottom: 4 }}>128</Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280' }}>Có mặt</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 28, lineHeight: 36, fontWeight: 'bold', color: '#F59E0B', marginBottom: 4 }}>18</Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280' }}>Đi muộn</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 28, lineHeight: 36, fontWeight: 'bold', color: '#EF4444', marginBottom: 4 }}>10</Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280' }}>Vắng</Text>
              </View>
            </View>
          </View>

          {/* Chart Placeholder */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 18, lineHeight: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
              Biểu đồ chuyên cần
            </Text>
            <View style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 12,
              padding: 48,
              height: 250,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <View style={{ width: 64, height: 64, backgroundColor: '#E5E7EB', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 32, lineHeight: 40, color: '#6B7280' }}>☰</Text>
              </View>
              <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280', textAlign: 'center' }}>
                Biểu đồ thống kê sẽ hiển thị ở đây
              </Text>
            </View>
          </View>

          {/* Export Options */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 18, lineHeight: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
              Xuất báo cáo
            </Text>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#D1FAE5',
                borderWidth: 2,
                borderColor: '#A7F3D0',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 40, height: 40, backgroundColor: '#D1FAE5', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 20, lineHeight: 24, fontWeight: 'bold', color: '#10B981' }}>=</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '600', color: '#111827' }}>
                      Xuất file Excel
                    </Text>
                    <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280' }}>
                      Danh sách điểm danh chi tiết
                    </Text>
                  </View>
                </View>
                <Text style={{ color: '#047857', fontSize: 14, lineHeight: 20, fontWeight: '600' }}>Tải về</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#FEE2E2',
                borderWidth: 2,
                borderColor: '#FECACA',
                borderRadius: 12,
                padding: 16,
              }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 40, height: 40, backgroundColor: '#FEE2E2', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 20, lineHeight: 24, fontWeight: 'bold', color: '#EF4444' }}>P</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '600', color: '#111827' }}>
                      Xuất file PDF
                    </Text>
                    <Text style={{ fontSize: 14, lineHeight: 20, color: '#6B7280' }}>
                      Báo cáo tổng hợp
                    </Text>
                  </View>
                </View>
                <Text style={{ color: '#DC2626', fontSize: 14, lineHeight: 20, fontWeight: '600' }}>Tải về</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
