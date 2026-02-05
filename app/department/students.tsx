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

interface Student {
    id: string;
    studentId: string;
    name: string;
    email: string;
    phone: string;
    class: string;
    course: string;
    status: 'active' | 'inactive' | 'graduated';
}

export default function StudentsManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [students, setStudents] = useState<Student[]>([
        {
            id: '1',
            studentId: 'SV001',
            name: 'Nguyễn Văn A',
            email: 'nva@student.edu.vn',
            phone: '0123456789',
            class: 'CNTT-K18',
            course: 'Khóa 18',
            status: 'active',
        },
        {
            id: '2',
            studentId: 'SV002',
            name: 'Trần Thị B',
            email: 'ttb@student.edu.vn',
            phone: '0987654321',
            class: 'CNTT-K18',
            course: 'Khóa 18',
            status: 'active',
        },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#10b981';
            case 'inactive':
                return '#f59e0b';
            case 'graduated':
                return '#6366f1';
            default:
                return '#94a3b8';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Đang học';
            case 'inactive':
                return 'Tạm nghỉ';
            case 'graduated':
                return 'Đã tốt nghiệp';
            default:
                return status;
        }
    };

    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterStatus === 'all' || student.status === filterStatus;
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
                        placeholder="Tìm kiếm sinh viên..."
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
                {['all', 'active', 'inactive', 'graduated'].map((status) => (
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
                                    ? 'Đang học'
                                    : status === 'inactive'
                                        ? 'Tạm nghỉ'
                                        : 'Đã tốt nghiệp'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Students List */}
            <ScrollView style={styles.listContainer}>
                {filteredStudents.map((student) => (
                    <View key={student.id} style={styles.studentCard}>
                        <View style={styles.studentHeader}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {student.name.charAt(0)}
                                </Text>
                            </View>
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.studentId}>{student.studentId}</Text>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(student.status) + '20' },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: getStatusColor(student.status) },
                                    ]}
                                >
                                    {getStatusText(student.status)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.studentDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="mail-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{student.email}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="call-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{student.phone}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="school-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>
                                    {student.class} - {student.course}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
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
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>
                                    Xóa
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Add Student Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thêm sinh viên mới</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <Text style={styles.label}>Mã sinh viên</Text>
                            <TextInput style={styles.input} placeholder="VD: SV001" />

                            <Text style={styles.label}>Họ và tên</Text>
                            <TextInput style={styles.input} placeholder="Nhập họ tên" />

                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="email@student.edu.vn"
                                keyboardType="email-address"
                            />

                            <Text style={styles.label}>Số điện thoại</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0123456789"
                                keyboardType="phone-pad"
                            />

                            <Text style={styles.label}>Lớp</Text>
                            <TextInput style={styles.input} placeholder="VD: CNTT-K18" />

                            <Text style={styles.label}>Khóa học</Text>
                            <TextInput style={styles.input} placeholder="VD: Khóa 18" />

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => {
                                    Alert.alert('Thành công', 'Đã thêm sinh viên mới');
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.submitButtonText}>Thêm sinh viên</Text>
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
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3b82f6',
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
        backgroundColor: '#3b82f6',
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
    studentCard: {
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
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    studentId: {
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
    studentDetails: {
        gap: 8,
        marginBottom: 12,
        paddingLeft: 60,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#64748b',
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
        backgroundColor: '#3b82f6',
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
