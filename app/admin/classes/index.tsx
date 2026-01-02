import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { mockClasses } from '../../../constants/mockData';
import AppHeader from '../../../components/AppHeader';
import Card from '../../../components/Card';
import PrimaryButton from '../../../components/PrimaryButton';

export default function ClassManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = mockClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Quản lý lớp học" />
      
      <ScrollView className="flex-1">
        <View className="p-4" style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          
          <PrimaryButton
            title="+ Tạo lớp học mới"
            onPress={() => router.push('/admin/classes/create' as any)}
            className="mb-4"
          />

          <TextInput
            className="border rounded-xl px-4 py-3 mb-4"
            style={{ borderColor: Colors.border, color: Colors.text }}
            placeholder="Tìm kiếm lớp học..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

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
        </View>
      </ScrollView>
    </View>
  );
}
