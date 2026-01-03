import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { mockSubjects } from '../../../constants/mockData';
import AppHeader from '../../../components/AppHeader';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import PrimaryButton from '../../../components/PrimaryButton';
import { EmptySearchIcon, EmptyDocumentIcon } from '../../../components/EmptyStateIllustration';

export default function SubjectManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = mockSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Quản lý môn học" showLogout={true} />
      
      <ScrollView className="flex-1">
        <View className="p-4" style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          
          <PrimaryButton
            title="+ Tạo môn học mới"
            onPress={() => router.push('/admin/subjects/create' as any)}
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
            placeholder="Tìm kiếm môn học..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {filteredSubjects.length > 0 ? (
            <>
              <Text className="text-sm mb-3" style={{ color: Colors.textSecondary }}>
                {filteredSubjects.length} môn học
              </Text>

              {filteredSubjects.map((subject) => (
            <Card key={subject.id} onPress={() => alert(`Chi tiết ${subject.name}`)} className="mb-3">
              <View className="flex-row items-start">
                <View
                  className="w-14 h-14 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: Colors.successLight }}
                >
                  <Text className="text-2xl font-bold" style={{ color: Colors.success }}>
                    {subject.credits}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-semibold text-base" style={{ color: Colors.text }}>
                      {subject.code}
                    </Text>
                    <Badge label={`${subject.credits} tín chỉ`} variant="success" size="sm" />
                  </View>

                  <Text className="text-sm mb-2" style={{ color: Colors.text }}>
                    {subject.name}
                  </Text>

                  {subject.teacher && (
                    <View className="flex-row items-center">
                      <Text className="text-xs mr-1" style={{ color: Colors.textSecondary }}>👨‍🏫</Text>
                      <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                        {subject.teacher}
                      </Text>
                    </View>
                  )}

                  {!subject.teacher && (
                    <Badge label="Chưa phân công GV" variant="warning" size="sm" />
                  )}
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
                    Không tìm thấy môn học nào phù hợp với "{searchQuery}". Thử tìm kiếm với từ khóa khác.
                  </Text>
                </>
              ) : (
                <>
                  <EmptyDocumentIcon size={80} color={Colors.gray300} />
                  <Text 
                    className="text-xl font-semibold mb-2 mt-4" 
                    style={{ color: Colors.text, lineHeight: 32, textAlign: 'center' }}
                  >
                    Chưa có môn học
                  </Text>
                  <Text 
                    className="text-base mb-4" 
                    style={{ color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
                  >
                    Bắt đầu bằng cách tạo môn học mới cho hệ thống.
                  </Text>
                  <PrimaryButton
                    title="+ Tạo môn học mới"
                    onPress={() => router.push('/admin/subjects/create' as any)}
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

// Updated: 2026-01-02 13:16:07
