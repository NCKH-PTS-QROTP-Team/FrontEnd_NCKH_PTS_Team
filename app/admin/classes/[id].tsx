import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { mockClasses, mockStudents } from '../../../constants/mockData';
import Card from '../../../components/Card';
import PrimaryButton from '../../../components/PrimaryButton';
import Tabs from '../../../components/Tabs';
import StudentCard from '../../../components/StudentCard';
import AttendanceStatusTag from '../../../components/AttendanceStatusTag';

export default function ClassDetail() {
  const { id } = useLocalSearchParams();
  const classData = mockClasses.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState('info');

  if (!classData) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.textSecondary }}>Không tìm thấy lớp học</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa lớp ${classData.code}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            alert('Đã xóa lớp học');
            router.back();
          }
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Page Title */}
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 16, color: Colors.text }}>
          {classData.code}
        </Text>
      </View>
      
      <Tabs
        tabs={[
          { key: 'info', label: 'Thông tin' },
          { key: 'students', label: 'Sinh viên' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16, maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          
          {activeTab === 'info' && (
            <>
              <Card style={{ marginBottom: 16 }}>
                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                      backgroundColor: Colors.primary,
                    }}
                  >
                    <Text style={{ fontSize: 32, fontWeight: 'bold', color: Colors.white }}>
                      {classData.code.substring(0, 2)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: Colors.text }}>
                    {classData.name}
                  </Text>
                  <Text style={{ fontSize: 16, color: Colors.textSecondary }}>
                    {classData.code}
                  </Text>
                </View>
              </Card>

              <Card style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: Colors.text }}>
                  Chi tiết lớp học
                </Text>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, marginBottom: 4, color: Colors.textSecondary }}>Môn học</Text>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.text }}>
                    {classData.subject}
                  </Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, marginBottom: 4, color: Colors.textSecondary }}>Giảng viên</Text>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.text }}>
                    {classData.teacher}
                  </Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, marginBottom: 4, color: Colors.textSecondary }}>Học kỳ</Text>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.text }}>
                    {classData.semester}
                  </Text>
                </View>

                <View>
                  <Text style={{ fontSize: 14, marginBottom: 4, color: Colors.textSecondary }}>Số sinh viên</Text>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.primary }}>
                    {classData.studentCount} sinh viên
                  </Text>
                </View>
              </Card>

              <Card style={{ marginBottom: 16 }}>
                <View style={{ marginBottom: 12 }}>
                  <PrimaryButton
                    title="Thêm sinh viên"
                    variant="outline"
                    onPress={() => alert('Thêm sinh viên')}
                  />
                </View>
                <View style={{ marginBottom: 12 }}>
                  <PrimaryButton
                    title="Upload danh sách CSV"
                    variant="outline"
                    onPress={() => alert('Upload CSV')}
                  />
                </View>
                <PrimaryButton
                  title="Xóa lớp học"
                  variant="outline"
                  onPress={handleDelete}
                  style={{ borderColor: Colors.error }}
                />
              </Card>
            </>
          )}

          {activeTab === 'students' && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontWeight: '500', color: Colors.textSecondary }}>
                  {mockStudents.length} sinh viên
                </Text>
                <PrimaryButton
                  title="+ Thêm"
                  onPress={() => alert('Thêm sinh viên')}
                  style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                />
              </View>

              {mockStudents.map((student) => (
                <View key={student.id} style={{ marginBottom: 12 }}>
                  <StudentCard
                    student={student}
                    onPress={() => alert(`Chi tiết ${student.name}`)}
                  />
                </View>
              ))}
            </>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
