import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import Card from '@/components/Card';
import { Badge } from '@/components/Badge';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptySearchIcon, EmptyDocumentIcon } from '@/components/EmptyStateIllustration';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { SkeletonCard } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import { useToast } from '@/components/ToastProvider';
import { subjectService, Subject } from '@/apis/services/subject.service';
import { userService, User } from '@/apis/services/user.service';
import { UserRole } from '@/apis/types/auth.types';

type TeacherType = 'LT' | 'TH';

export default function SubjectManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [subjectData, teacherData] = await Promise.all([
        subjectService.getSubjects(),
        userService.getUsers(UserRole.TEACHER),
      ]);
      setSubjects(subjectData);
      setTeachers(teacherData);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTeacherType, setSelectedTeacherType] = useState<TeacherType>('LT');
  const [teacherSearch, setTeacherSearch] = useState('');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const showTable = isDesktop; // Chỉ desktop mới hiển thị table

  const contentMaxWidth = isDesktop ? 1200 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const teacherOptions = useMemo(
    () =>
      teachers
        .filter((u) =>
          `${u.teacherId || ''} ${u.name}`.toLowerCase().includes(teacherSearch.toLowerCase())
        ),
    [teacherSearch, teachers]
  );

  const openAssignModal = (subject: Subject, teacherType: TeacherType = 'LT') => {
    setSelectedSubject(subject);
    setSelectedTeacherType(teacherType);
    setTeacherSearch('');
    setModalVisible(true);
  };

  const handleAssign = async (teacherId?: string, teacherName?: string) => {
    if (!selectedSubject) return;
    try {
      const updateData = selectedTeacherType === 'LT'
        ? { teacherLTId: teacherId }
        : { teacherTHId: teacherId };
      await subjectService.updateSubject(selectedSubject.id, updateData);
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== selectedSubject.id) return s;
          if (selectedTeacherType === 'LT') {
            return { ...s, teacherLTId: teacherId, teacherLTName: teacherName };
          } else {
            return { ...s, teacherTHId: teacherId, teacherTHName: teacherName };
          }
        })
      );
      showToast('Phân công giảng viên thành công', 'success');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Lỗi phân công giảng viên';
      showToast(message, 'error');
    }
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal, paddingVertical, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          
          {/* Page Title */}
          <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: '600', marginBottom: isMobile ? 16 : 24, color: Colors.text }}>
            Quản lý môn học
          </Text>
          
          <View style={{ marginBottom: isMobile ? 12 : 16 }}>
            <PrimaryButton
              title="+ Tạo môn học mới"
              onPress={() => router.push('/admin/subjects/create' as any)}
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
            placeholder="Tìm kiếm môn học..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {filteredSubjects.length > 0 ? (
            <>
              <Text style={{ fontSize: 14, marginBottom: 12, color: Colors.textSecondary }}>
                {filteredSubjects.length} môn học
              </Text>

              {/* Desktop: Table View */}
              {showTable ? (
                <DataTable
                  columns={[
                    {
                      key: 'code',
                      label: 'Mã môn học',
                      width: 120,
                      render: (subject) => (
                        <Text style={{ fontWeight: '600', fontSize: 14, color: Colors.text }}>
                          {subject.code}
                        </Text>
                      ),
                    },
                    {
                      key: 'name',
                      label: 'Tên môn học',
                      width: 300,
                      render: (subject) => (
                        <Text style={{ fontSize: 14, color: Colors.text }}>
                          {subject.name}
                        </Text>
                      ),
                    },
                    {
                      key: 'credits',
                      label: 'Tín chỉ',
                      width: 100,
                      align: 'center',
                      render: (subject) => (
                        <Badge variant="success" size="small">
                          {subject.credits} tín chỉ
                        </Badge>
                      ),
                    },
                    {
                      key: 'teacherLT',
                      label: 'GV Lý thuyết',
                      width: 200,
                      render: (subject) => (
                        <View style={{ gap: 6 }}>
                          {subject.teacherLTName ? (
                            <View>
                              <Text style={{ fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 2 }}>
                                {subject.teacherLTName}
                              </Text>
                              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                                {subject.teacherLTId}
                              </Text>
                            </View>
                          ) : (
                            <Badge variant="warning" size="small">
                              Chưa phân công
                            </Badge>
                          )}
                        </View>
                      ),
                    },
                    {
                      key: 'teacherTH',
                      label: 'GV Thực hành',
                      width: 200,
                      render: (subject) => (
                        <View style={{ gap: 6 }}>
                          {subject.teacherTHName ? (
                            <View>
                              <Text style={{ fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 2 }}>
                                {subject.teacherTHName}
                              </Text>
                              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                                {subject.teacherTHId}
                              </Text>
                            </View>
                          ) : (
                            <Badge variant="warning" size="small">
                              Chưa phân công
                            </Badge>
                          )}
                        </View>
                      ),
                    },
                    {
                      key: 'actions',
                      label: 'Thao tác',
                      width: 180,
                      align: 'center',
                      render: (subject) => (
                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <PrimaryButton
                            title={subject.teacherLTName ? 'Đổi LT' : 'GV LT'}
                            variant="outline"
                            onPress={() => openAssignModal(subject, 'LT')}
                            style={{ paddingVertical: 6, paddingHorizontal: 10, minHeight: 32 }}
                          />
                          <PrimaryButton
                            title={subject.teacherTHName ? 'Đổi TH' : 'GV TH'}
                            variant="outline"
                            onPress={() => openAssignModal(subject, 'TH')}
                            style={{ paddingVertical: 6, paddingHorizontal: 10, minHeight: 32 }}
                          />
                        </View>
                      ),
                    },
                  ]}
                  data={filteredSubjects}
                  onRowPress={(subject) => alert(`Chi tiết ${subject.name}`)}
                  zebraStriping={true}
                  stickyHeader={true}
                />
              ) : (
                /* Mobile: Card View */
                <>
                  {filteredSubjects.map((subject) => (
                    <Card key={subject.id} onPress={() => alert(`Chi tiết ${subject.name}`)} style={{ marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            backgroundColor: Colors.successLight,
                          }}
                        >
                          <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.success }}>
                            {subject.credits}
                          </Text>
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: 4, gap: 4 }}>
                            <Text style={{ fontWeight: '600', fontSize: 15, color: Colors.text }}>
                              {subject.code}
                            </Text>
                            <Badge variant="success" size="small">
                              {subject.credits} tín chỉ
                            </Badge>
                          </View>

                          <Text style={{ fontSize: 13, marginBottom: 8, color: Colors.text }}>
                            {subject.name}
                          </Text>

                        {/* Giảng viên Lý thuyết */}
                        <View style={{ marginBottom: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, marginRight: 6 }}>
                              LT:
                            </Text>
                            {subject.teacherLTName ? (
                              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                                {subject.teacherLTName} {subject.teacherLTId ? `(${subject.teacherLTId})` : ''}
                              </Text>
                            ) : (
                              <Badge variant="warning" size="small">
                                Chưa phân công
                              </Badge>
                            )}
                          </View>
                          <PrimaryButton
                            title={subject.teacherLTName ? 'Đổi GV LT' : 'Phân công GV LT'}
                            variant="outline"
                            onPress={() => openAssignModal(subject, 'LT')}
                            style={{ paddingVertical: 6, paddingHorizontal: 12 }}
                          />
                        </View>

                        {/* Giảng viên Thực hành */}
                        <View style={{ marginBottom: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, marginRight: 6 }}>
                              TH:
                            </Text>
                            {subject.teacherTHName ? (
                              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                                {subject.teacherTHName} {subject.teacherTHId ? `(${subject.teacherTHId})` : ''}
                              </Text>
                            ) : (
                              <Badge variant="warning" size="small">
                                Chưa phân công
                              </Badge>
                            )}
                          </View>
                          <PrimaryButton
                            title={subject.teacherTHName ? 'Đổi GV TH' : 'Phân công GV TH'}
                            variant="outline"
                            onPress={() => openAssignModal(subject, 'TH')}
                            style={{ paddingVertical: 6, paddingHorizontal: 12 }}
                          />
                        </View>
                      </View> </View>
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
                    Không tìm thấy môn học nào phù hợp với "{searchQuery}". Thử tìm kiếm với từ khóa khác.
                  </Text>
                </>
              ) : (
                <>
                  <EmptyDocumentIcon size={80} color={Colors.gray300} />
                  <Text 
                    style={{ fontSize: 20, fontWeight: '600', marginBottom: 8, marginTop: 16, color: Colors.text, lineHeight: 32, textAlign: 'center' }}
                  >
                    Chưa có môn học
                  </Text>
                  <Text 
                    style={{ fontSize: 16, marginBottom: 16, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
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

      {/* Modal phân công GV */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={`Phân công GV ${selectedTeacherType === 'LT' ? 'Lý thuyết' : 'Thực hành'}`}
        variant="center"
        width={520}
      >
        {selectedSubject && (
          <View style={{ gap: 12 }}>
            <View
              style={{
                padding: 12,
                backgroundColor: Colors.gray50,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.gray200,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text }}>
                {selectedSubject.code} - {selectedSubject.name}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                Tín chỉ: {selectedSubject.credits}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4 }}>
                    Loại phân công:
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setSelectedTeacherType('LT')}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: selectedTeacherType === 'LT' ? Colors.primary : Colors.white,
                        borderWidth: 2,
                        borderColor: selectedTeacherType === 'LT' ? Colors.primary : Colors.gray200,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: selectedTeacherType === 'LT' ? Colors.white : Colors.text }}>
                        Lý thuyết (LT)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setSelectedTeacherType('TH')}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: selectedTeacherType === 'TH' ? Colors.primary : Colors.white,
                        borderWidth: 2,
                        borderColor: selectedTeacherType === 'TH' ? Colors.primary : Colors.gray200,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: selectedTeacherType === 'TH' ? Colors.white : Colors.text }}>
                        Thực hành (TH)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {(selectedTeacherType === 'LT' ? selectedSubject.teacherLTName : selectedSubject.teacherTHName) && (
                <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 8 }}>
                  Đang phân công: {selectedTeacherType === 'LT' ? selectedSubject.teacherLTName : selectedSubject.teacherTHName}
                </Text>
              )}
            </View>

            <TextInput
              style={{
                height: 44,
                borderWidth: 1,
                borderColor: Colors.gray200,
                borderRadius: 10,
                paddingHorizontal: 12,
                color: Colors.text,
                ...Platform.select({
                  web: { outlineStyle: 'none' as any },
                }),
              }}
              placeholder="Tìm giảng viên theo tên hoặc mã..."
              placeholderTextColor={Colors.gray400}
              value={teacherSearch}
              onChangeText={setTeacherSearch}
            />

            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: 8 }}>
              {teacherOptions.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => handleAssign(t.teacherId, t.name)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: Colors.gray200,
                    backgroundColor: Colors.white,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>
                      {t.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                      {t.teacherId}
                    </Text>
                  </View>
                  <Badge variant="primary" size="small">
                    Chọn
                  </Badge>
                </TouchableOpacity>
              ))}

              {teacherOptions.length === 0 && (
                <Text style={{ textAlign: 'center', color: Colors.textSecondary, paddingVertical: 12 }}>
                  Không tìm thấy giảng viên
                </Text>
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <PrimaryButton
                title="Bỏ phân công"
                variant="outline"
                onPress={() => handleAssign(undefined, undefined)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Đóng"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}
