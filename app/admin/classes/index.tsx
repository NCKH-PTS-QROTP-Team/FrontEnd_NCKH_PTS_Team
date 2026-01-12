import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { mockClasses } from '@/constants/mockData';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import DataTable from '@/components/DataTable';
import { EmptySearchIcon, EmptyListIcon } from '@/components/EmptyStateIllustration';

export default function ClassManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const showTable = isDesktop; // Chỉ desktop mới hiển thị table

  const contentMaxWidth = isDesktop ? 1200 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  const filteredClasses = mockClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal, paddingVertical, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          
          {/* Page Title */}
          <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: '600', marginBottom: isMobile ? 16 : 24, color: Colors.text }}>
            Quản lý lớp học
          </Text>
          
          <View style={{ marginBottom: isMobile ? 12 : 16 }}>
            <PrimaryButton
              title="+ Tạo lớp học mới"
              onPress={() => router.push('/admin/classes/create' as any)}
            />
          </View>

          <TextInput
            style={{
              height: isMobile ? 44 : 48,
              borderWidth: 2,
              borderColor: Colors.gray200,
              borderRadius: 8,
              paddingHorizontal: isMobile ? 12 : 16,
              marginBottom: isMobile ? 12 : 16,
              color: Colors.text,
              lineHeight: 24,
              fontSize: isMobile ? 14 : 16,
              ...Platform.select({
                web: { outlineStyle: 'none' as any },
              }),
            }}
            placeholder="Tìm kiếm lớp học..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {filteredClasses.length > 0 ? (
            <>
              <Text style={{ fontSize: 14, marginBottom: 12, color: Colors.textSecondary }}>
                {filteredClasses.length} lớp học
              </Text>

              {/* Desktop: Table View */}
              {showTable ? (
                <DataTable
                  columns={[
                    {
                      key: 'code',
                      label: 'Mã lớp',
                      width: 120,
                      render: (cls) => (
                        <Text style={{ fontWeight: '600', fontSize: 14, color: Colors.text }}>
                          {cls.code}
                        </Text>
                      ),
                    },
                    {
                      key: 'name',
                      label: 'Tên lớp',
                      width: 250,
                      render: (cls) => (
                        <Text style={{ fontSize: 14, color: Colors.text }}>
                          {cls.name}
                        </Text>
                      ),
                    },
                    {
                      key: 'subject',
                      label: 'Môn học',
                      width: 200,
                      render: (cls) => (
                        <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                          {cls.subject}
                        </Text>
                      ),
                    },
                    {
                      key: 'teacher',
                      label: 'Giảng viên',
                      width: 180,
                      render: (cls) => (
                        <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                          {cls.teacher}
                        </Text>
                      ),
                    },
                    {
                      key: 'semester',
                      label: 'Học kỳ',
                      width: 120,
                      render: (cls) => (
                        <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                          {cls.semester}
                        </Text>
                      ),
                    },
                    {
                      key: 'studentCount',
                      label: 'Số SV',
                      width: 100,
                      align: 'center',
                      render: (cls) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 14, fontWeight: '500', color: Colors.primary }}>
                            {cls.studentCount}
                          </Text>
                        </View>
                      ),
                    },
                  ]}
                  data={filteredClasses}
                  onRowPress={(cls) => router.push(`/admin/classes/${cls.id}` as any)}
                  zebraStriping={true}
                  stickyHeader={true}
                />
              ) : (
                /* Mobile: Card View */
                <>
                  {filteredClasses.map((cls) => (
                    <Card key={cls.id} onPress={() => router.push(`/admin/classes/${cls.id}` as any)} style={{ marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            backgroundColor: Colors.infoLight,
                          }}
                        >
                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primary }}>
                            {cls.code.substring(0, 2)}
                          </Text>
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: 4, gap: 4 }}>
                            <Text style={{ fontWeight: '600', fontSize: 15, color: Colors.text }}>
                              {cls.code}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={{ fontSize: 13, marginRight: 4, color: Colors.textSecondary }}>👥</Text>
                              <Text style={{ fontSize: 13, fontWeight: '500', color: Colors.primary }}>
                                {cls.studentCount}
                              </Text>
                            </View>
                          </View>

                          <Text style={{ fontSize: 13, marginBottom: 8, color: Colors.text }}>
                            {cls.name}
                          </Text>

                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                              <Text style={{ fontSize: 12, marginRight: 4, color: Colors.textSecondary }}>📚</Text>
                              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                                {cls.subject}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                              <Text style={{ fontSize: 12, marginRight: 4, color: Colors.textSecondary }}>👨‍🏫</Text>
                              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                                {cls.teacher}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                              <Text style={{ fontSize: 12, marginRight: 4, color: Colors.textSecondary }}>📅</Text>
                              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                                {cls.semester}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Card>
                  ))}
                </>
              )}
            </>
          ) : (
            <View 
              style={{ 
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: Colors.gray200,
                borderRadius: 8,
                padding: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 24,
              }}
            >
              {searchQuery ? (
                <>
                  <EmptySearchIcon size={80} color={Colors.gray300} />
                  <Text 
                    style={{ fontSize: 20, fontWeight: '600', marginBottom: 8, marginTop: 16, color: Colors.text, lineHeight: 32, textAlign: 'center' }}
                  >
                    Không tìm thấy kết quả
                  </Text>
                  <Text 
                    style={{ fontSize: 16, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
                  >
                    Không tìm thấy lớp học nào phù hợp với "{searchQuery}". Thử tìm kiếm với từ khóa khác.
                  </Text>
                </>
              ) : (
                <>
                  <EmptyListIcon size={80} color={Colors.gray300} />
                  <Text 
                    style={{ fontSize: 20, fontWeight: '600', marginBottom: 8, marginTop: 16, color: Colors.text, lineHeight: 32, textAlign: 'center' }}
                  >
                    Chưa có lớp học
                  </Text>
                  <Text 
                    style={{ fontSize: 16, marginBottom: 16, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
                  >
                    Bắt đầu bằng cách tạo lớp học mới cho học kỳ.
                  </Text>
                  <PrimaryButton
                    title="+ Tạo lớp học mới"
                    onPress={() => router.push('/admin/classes/create' as any)}
                  />
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
