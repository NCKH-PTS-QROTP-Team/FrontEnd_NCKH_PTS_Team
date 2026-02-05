import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Teacher {
    id: string;
    teacherId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    subjects: string[];
    status: 'active' | 'inactive' | 'on-leave';
}

export default function TeachersManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([
        {
            id: '1',
            teacherId: 'GV001',
            name: 'TS. Nguyễn Văn A',
            email: 'nva@university.edu.vn',
            phone: '0123456789',
            department: 'Khoa CNTT',
            subjects: ['Lập trình Web', 'Cơ sở dữ liệu'],
            status: 'active',
        },
        {
            id: '2',
            teacherId: 'GV002',
            name: 'ThS. Trần Thị B',
            email: 'ttb@university.edu.vn',
            phone: '0987654321',
            department: 'Khoa CNTT',
            subjects: ['Mạng máy tính', 'An toàn thông tin'],
            status: 'active',
        },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#10b981';
            case 'inactive':
                return '#ef4444';
            case 'on-leave':
                return '#f59e0b';
            default:
                return '#94a3b8';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Đang giảng dạy';
            case 'inactive':
                return 'Không hoạt động';
            case 'on-leave':
                return 'Nghỉ phép';
            default:
                return status;
        }
    };

    const filteredTeachers = teachers.filter((teacher) => {
        const matchesSearch =
            teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.teacherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterStatus === 'all' || teacher.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <View style={styles.container}>
            {/* Search and Filter Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm giảng viên..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
            >
                {['all', 'active', 'on-leave', 'inactive'].map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.filterTab,
                            filterStatus === status && styles.filterTabActive,
                        ]}
                        onPress={() => setFilterStatus(status)}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                filterStatus === status && styles.filterTabTextActive,
                            ]}
                        >
                            {status === 'all'
                                ? 'Tất cả'
                                : status === 'active'
                                    ? 'Đang giảng dạy'
                                    : status === 'on-leave'
                                        ? 'Nghỉ phép'
                                        : 'Không hoạt động'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Teachers List */}
            <ScrollView style={styles.listContainer}>
                {filteredTeachers.map((teacher) => (
                    <View key={teacher.id} style={styles.teacherCard}>
                        <View style={styles.teacherHeader}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="person" size={24} color="#fff" />
                            </View>
                            <View style={styles.teacherInfo}>
                                <Text style={styles.teacherName}>{teacher.name}</Text>
                                <Text style={styles.teacherId}>{teacher.teacherId}</Text>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(teacher.status) + '20' },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: getStatusColor(teacher.status) },
                                    ]}
                                >
                                    {getStatusText(teacher.status)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.teacherDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="mail-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{teacher.email}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="call-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{teacher.phone}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="business-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{teacher.department}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="book-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>
                                    {teacher.subjects.join(', ')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="calendar-outline" size={20} color="#10b981" />
                                <Text style={[styles.actionButtonText, { color: '#10b981' }]}>
                                    Lịch dạy
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="create-outline" size={20} color="#3b82f6" />
                                <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>
                                    Sửa
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons
                                    name="information-circle-outline"
                                    size={20}
                                    color="#8b5cf6"
                                />
                                <Text style={[styles.actionButtonText, { color: '#8b5cf6' }]}>
                                    Chi tiết
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Add Teacher Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thêm giảng viên mới</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <Text style={styles.label}>Mã giảng viên</Text>
                            <TextInput style={styles.input} placeholder="VD: GV001" />

                            <Text style={styles.label}>Họ và tên</Text>
                            <TextInput style={styles.input} placeholder="Nhập họ tên" />

                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="email@university.edu.vn"
                                keyboardType="email-address"
                            />

                            <Text style={styles.label}>Số điện thoại</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0123456789"
                                keyboardType="phone-pad"
                            />

                            <Text style={styles.label}>Khoa</Text>
                            <TextInput style={styles.input} placeholder="VD: Khoa CNTT" />

                            <Text style={styles.label}>Môn giảng dạy</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: Lập trình Web, Cơ sở dữ liệu"
                            />

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => {
                                    Alert.alert('Thành công', 'Đã thêm giảng viên mới');
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.submitButtonText}>Thêm giảng viên</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: '#1e293b',
    },
    addButton: {
        width: 48,
        height: 48,
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    filterContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: '#8b5cf6',
    },
    filterTabText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    filterTabTextActive: {
        color: '#fff',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    teacherCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    teacherHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    teacherInfo: {
        flex: 1,
    },
    teacherName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    teacherId: {
        fontSize: 13,
        color: '#64748b',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    teacherDetails: {
        gap: 8,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    submitButton: {
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
