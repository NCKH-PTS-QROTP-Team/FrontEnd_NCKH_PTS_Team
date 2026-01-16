import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/colors';
import { mockClasses } from '@/constants/mockData';
import { AppHeader } from '@/components/AppHeader';
import  Card  from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptySearchIcon, EmptyListIcon } from '@/components/EmptyStateIllustration';

export default function ClassManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 1200 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  const filteredClasses = mockClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />
      <AppHeader title="Quản lý lớp học" showLogout={true} />
      
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal, paddingVertical: 24, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          
          <PrimaryButton
            title="+ Tạo lớp học mới"
            onPress={() => router.push('/admin/classes/create' as any)}
            className="mb-4"
          />

          <TextInput
            className="border-2 rounded-lg px-4 mb-4"
            style={{
              height: 48,
              borderColor: Colors.gray200,
              color: Colors.text,
              lineHeight: 24,
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
              <Text className="text-sm mb-3" style={{ color: Colors.textSecondary }}>
                {filteredClasses.length} lớp học
              </Text>

              {filteredClasses.map((cls) => (
            <Card key={cls.id} onPress={() => router.push(`/admin/classes/${cls.id}` as any)} className="mb-3">
              <View className="flex-row items-start">
                <View
                  className="w-14 h-14 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: Colors.infoLight }}
                >
                  <Text className="text-xl font-bold" style={{ color: Colors.primary }}>
                    {cls.code.substring(0, 2)}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-semibold text-base" style={{ color: Colors.text }}>
                      {cls.code}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-sm mr-1" style={{ color: Colors.textSecondary }}>👥</Text>
                      <Text className="text-sm font-medium" style={{ color: Colors.primary }}>
                        {cls.studentCount}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-sm mb-2" style={{ color: Colors.text }}>
                    {cls.name}
                  </Text>

                  <View className="flex-row flex-wrap">
                    <View className="flex-row items-center mr-4 mb-1">
                      <Text className="text-xs mr-1" style={{ color: Colors.textSecondary }}>📚</Text>
                      <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                        {cls.subject}
                      </Text>
                    </View>
                    <View className="flex-row items-center mr-4 mb-1">
                      <Text className="text-xs mr-1" style={{ color: Colors.textSecondary }}>👨‍🏫</Text>
                      <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                        {cls.teacher}
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <Text className="text-xs mr-1" style={{ color: Colors.textSecondary }}>📅</Text>
                      <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                        {cls.semester}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text className="text-2xl ml-2" style={{ color: Colors.gray300 }}>›</Text>
              </View>
            </Card>
          ))}
            </>
          ) : (
            <View 
              className="bg-white border rounded-lg"
              style={{ 
                borderColor: Colors.gray200,
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
                    className="text-xl font-semibold mb-2 mt-4" 
                    style={{ color: Colors.text, lineHeight: 32, textAlign: 'center' }}
                  >
                    Không tìm thấy kết quả
                  </Text>
                  <Text 
                    className="text-base" 
                    style={{ color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
                  >
                    Không tìm thấy lớp học nào phù hợp với "{searchQuery}". Thử tìm kiếm với từ khóa khác.
                  </Text>
                </>
              ) : (
                <>
                  <EmptyListIcon size={80} color={Colors.gray300} />
                  <Text 
                    className="text-xl font-semibold mb-2 mt-4" 
                    style={{ color: Colors.text, lineHeight: 32, textAlign: 'center' }}
                  >
                    Chưa có lớp học
                  </Text>
                  <Text 
                    className="text-base mb-4" 
                    style={{ color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
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

// Updated: 2026-01-02 13:16:06
