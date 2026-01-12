import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import Tabs from '@/components/Tabs';
import DataTable from '@/components/DataTable';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 1200 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;
  const showTable = isDesktop;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Tabs
        tabs={[
          { key: 'overview', label: 'Tổng quan' },
          { key: 'class', label: 'Theo lớp' },
          { key: 'teacher', label: 'Theo GV' },
          { key: 'student', label: 'Theo SV' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal, paddingVertical, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          
          {activeTab === 'overview' && (
            <>
              {/* Summary Stats */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: isMobile ? 16 : 24, marginHorizontal: -8 }}>
                {[
                  { label: 'Tổng buổi học', value: '1,234', color: Colors.primary },
                  { label: 'Tổng sinh viên', value: '5,678', color: Colors.success },
                  { label: 'Tỷ lệ điểm danh TB', value: '87%', color: Colors.warning },
                  { label: 'Số lớp hoạt động', value: '45', color: Colors.info },
                ].map((stat, index) => (
                  <View key={index} style={{ width: isDesktop ? '25%' : isTablet ? '50%' : '100%', paddingHorizontal: 8, marginBottom: isMobile ? 12 : 16 }}>
                    <Card style={{ padding: isMobile ? 16 : 20 }}>
                      <Text style={{ fontSize: isMobile ? 28 : 36, fontWeight: 'bold', marginBottom: 8, color: stat.color, lineHeight: isMobile ? 36 : 44 }}>
                        {stat.value}
                      </Text>
                      <Text style={{ fontSize: isMobile ? 12 : 13, color: Colors.textSecondary, lineHeight: 18 }}>
                        {stat.label}
                      </Text>
                    </Card>
                  </View>
                ))}
              </View>

              {/* Chart Placeholder */}
              <Card style={{ marginBottom: isMobile ? 16 : 24, padding: isMobile ? 16 : 24 }}>
                <Text style={{ fontWeight: '600', fontSize: isMobile ? 16 : 18, marginBottom: isMobile ? 12 : 16, color: Colors.text }}>
                  Biểu đồ điểm danh theo thời gian
                </Text>
                <View
                  style={{
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: isMobile ? 250 : 300,
                    backgroundColor: Colors.gray50,
                    borderWidth: 1,
                    borderColor: Colors.gray200,
                    borderStyle: 'dashed',
                  }}
                >
                  <Text style={{ fontSize: 48, marginBottom: 8 }}>📊</Text>
                  <Text style={{ fontSize: isMobile ? 14 : 16, color: Colors.textSecondary, fontWeight: '500' }}>
                    Biểu đồ sẽ được hiển thị tại đây
                  </Text>
                </View>
              </Card>

              {/* Faculty-wide Stats */}
              <Card style={{ marginBottom: isMobile ? 16 : 24, padding: isMobile ? 16 : 24 }}>
                <Text style={{ fontWeight: '600', fontSize: isMobile ? 16 : 18, marginBottom: isMobile ? 16 : 20, color: Colors.text }}>
                  Thống kê toàn trường
                </Text>
                
                {/* Desktop: Table View */}
                {showTable ? (
                  <DataTable
                    columns={[
                      {
                        key: 'label',
                        label: 'Khoa',
                        width: 200,
                        render: (faculty) => (
                          <Text style={{ fontWeight: '500', fontSize: 14, color: Colors.text }}>
                            {faculty.label}
                          </Text>
                        ),
                      },
                      {
                        key: 'present',
                        label: 'Có mặt',
                        width: 120,
                        align: 'center',
                        render: (faculty) => (
                          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.success }}>
                            {faculty.present}
                          </Text>
                        ),
                      },
                      {
                        key: 'late',
                        label: 'Muộn',
                        width: 120,
                        align: 'center',
                        render: (faculty) => (
                          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.warning }}>
                            {faculty.late}
                          </Text>
                        ),
                      },
                      {
                        key: 'absent',
                        label: 'Vắng',
                        width: 120,
                        align: 'center',
                        render: (faculty) => (
                          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.error }}>
                            {faculty.absent}
                          </Text>
                        ),
                      },
                      {
                        key: 'total',
                        label: 'Tổng',
                        width: 120,
                        align: 'center',
                        render: (faculty) => (
                          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>
                            {faculty.total}
                          </Text>
                        ),
                      },
                      {
                        key: 'rate',
                        label: 'Tỷ lệ',
                        width: 120,
                        align: 'center',
                        render: (faculty) => (
                          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.primary }}>
                            {Math.round((faculty.present / faculty.total) * 100)}%
                          </Text>
                        ),
                      },
                    ]}
                    data={[
                      { label: 'Khoa CNTT', present: 456, late: 34, absent: 23, total: 513 },
                      { label: 'Khoa Kinh tế', present: 389, late: 28, absent: 31, total: 448 },
                      { label: 'Khoa Ngoại ngữ', present: 234, late: 19, absent: 12, total: 265 },
                    ]}
                    zebraStriping={true}
                    stickyHeader={true}
                  />
                ) : (
                  /* Mobile: Card View */
                  <>
                    {[
                      { label: 'Khoa CNTT', present: 456, late: 34, absent: 23, total: 513 },
                      { label: 'Khoa Kinh tế', present: 389, late: 28, absent: 31, total: 448 },
                      { label: 'Khoa Ngoại ngữ', present: 234, late: 19, absent: 12, total: 265 },
                    ].map((faculty, index) => (
                      <View
                        key={index}
                        style={{
                          paddingVertical: isMobile ? 14 : 16,
                          borderBottomWidth: index === 2 ? 0 : 1,
                          borderBottomColor: index === 2 ? 'transparent' : Colors.border,
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <Text style={{ fontWeight: '600', fontSize: isMobile ? 15 : 16, color: Colors.text }}>
                            {faculty.label}
                          </Text>
                          <View style={{ 
                            paddingHorizontal: 12, 
                            paddingVertical: 4, 
                            borderRadius: 12, 
                            backgroundColor: `${Colors.primary}15` 
                          }}>
                            <Text style={{ fontSize: isMobile ? 13 : 14, fontWeight: '600', color: Colors.primary }}>
                              {Math.round((faculty.present / faculty.total) * 100)}%
                            </Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success, marginRight: 6 }} />
                            <Text style={{ fontSize: isMobile ? 12 : 13, fontWeight: '500', color: Colors.success }}>
                              {faculty.present}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.warning, marginRight: 6 }} />
                            <Text style={{ fontSize: isMobile ? 12 : 13, fontWeight: '500', color: Colors.warning }}>
                              {faculty.late}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error, marginRight: 6 }} />
                            <Text style={{ fontSize: isMobile ? 12 : 13, fontWeight: '500', color: Colors.error }}>
                              {faculty.absent}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: isMobile ? 12 : 13, fontWeight: '500', color: Colors.textSecondary }}>
                              Tổng: {faculty.total}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </Card>
            </>
          )}

          {activeTab === 'class' && (
            <Card style={{ padding: isMobile ? 16 : 24 }}>
              <Text style={{ fontWeight: '600', fontSize: isMobile ? 16 : 18, marginBottom: 8, color: Colors.text }}>
                Báo cáo theo lớp học
              </Text>
              <Text style={{ fontSize: isMobile ? 13 : 14, marginBottom: isMobile ? 16 : 20, color: Colors.textSecondary, lineHeight: 20 }}>
                Chọn lớp và khoảng thời gian để xem báo cáo chi tiết
              </Text>
              <PrimaryButton
                title="Chọn lớp học"
                variant="outline"
                onPress={() => alert('Chọn lớp')}
              />
            </Card>
          )}

          {activeTab === 'teacher' && (
            <Card style={{ padding: isMobile ? 16 : 24 }}>
              <Text style={{ fontWeight: '600', fontSize: isMobile ? 16 : 18, marginBottom: 8, color: Colors.text }}>
                Báo cáo theo giảng viên
              </Text>
              <Text style={{ fontSize: isMobile ? 13 : 14, marginBottom: isMobile ? 16 : 20, color: Colors.textSecondary, lineHeight: 20 }}>
                Xem thống kê điểm danh của từng giảng viên
              </Text>
              <PrimaryButton
                title="Chọn giảng viên"
                variant="outline"
                onPress={() => alert('Chọn GV')}
              />
            </Card>
          )}

          {activeTab === 'student' && (
            <Card style={{ padding: isMobile ? 16 : 24 }}>
              <Text style={{ fontWeight: '600', fontSize: isMobile ? 16 : 18, marginBottom: 8, color: Colors.text }}>
                Báo cáo theo sinh viên
              </Text>
              <Text style={{ fontSize: isMobile ? 13 : 14, marginBottom: isMobile ? 16 : 20, color: Colors.textSecondary, lineHeight: 20 }}>
                Xem lịch sử điểm danh chi tiết của sinh viên
              </Text>
              <PrimaryButton
                title="Chọn sinh viên"
                variant="outline"
                onPress={() => alert('Chọn SV')}
              />
            </Card>
          )}

          {/* Export Section */}
          <Card style={{ marginTop: isMobile ? 16 : 24, padding: isMobile ? 16 : 24 }}>
            <Text style={{ fontWeight: '600', marginBottom: isMobile ? 16 : 20, fontSize: isMobile ? 16 : 18, color: Colors.text }}>
              Xuất báo cáo
            </Text>
            <View style={{ flexDirection: isMobile ? 'column' : 'row', marginHorizontal: -8, gap: isMobile ? 12 : 0 }}>
              <View style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8, marginBottom: isMobile ? 0 : 0 }}>
                <PrimaryButton
                  title="Excel"
                  variant="outline"
                  onPress={() => alert('Export Excel')}
                />
              </View>
              <View style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8, marginBottom: isMobile ? 0 : 0 }}>
                <PrimaryButton
                  title="PDF"
                  variant="outline"
                  onPress={() => alert('Export PDF')}
                />
              </View>
              <View style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8 }}>
                <PrimaryButton
                  title="CSV"
                  variant="outline"
                  onPress={() => alert('Export CSV')}
                />
              </View>
            </View>
          </Card>

        </View>
      </ScrollView>
    </View>
  );
}
