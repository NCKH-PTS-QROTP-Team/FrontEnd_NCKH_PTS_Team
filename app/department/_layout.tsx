import React from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DepartmentLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Giáo vụ khoa - Tổng quan',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="students"
        options={{
          title: 'Quản lý sinh viên',
        }}
      />
      <Stack.Screen
        name="teachers"
        options={{
          title: 'Quản lý giảng viên',
        }}
      />
      <Stack.Screen
        name="classes"
        options={{
          title: 'Quản lý lớp học',
        }}
      />
      <Stack.Screen
        name="courses"
        options={{
          title: 'Quản lý khóa học',
        }}
      />
      <Stack.Screen
        name="schedules"
        options={{
          title: 'Quản lý lịch học',
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: 'Báo cáo & Thống kê',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Cài đặt',
        }}
      />
    </Stack>
  );
}
