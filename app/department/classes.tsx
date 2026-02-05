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

interface Class {
    id: string;
    classId: string;
    className: string;
    course: string;
    totalStudents: number;
    headTeacher: string;
    academicYear: string;
    status: 'active' | 'completed' | 'upcoming';
}

export default function ClassesManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [classes, setClasses] = useState<Class[]>([
        {
            id: '1',
            classId: 'CNTT-K18-01',
            className: 'Công nghệ thông tin K18 - Lớp 1',
            course: 'Khóa 18',
            totalStudents: 45,
            headTeacher: 'TS. Nguyễn Văn A',
            academicYear: '2023-2024',
            status: 'active',
        },
        {
            id: '2',
            classId: 'CNTT-K18-02',
            className: 'Công nghệ thông tin K18 - Lớp 2',
            course: 'Khóa 18',
            totalStudents: 42,
            headTeacher: 'ThS. Trần Thị B',
            academicYear: '2023-2024',
            status: 'active',
        },
        {
            id: '3',
            classId: 'CNTT-K17-01',
            className: 'Công nghệ thông tin K17 - Lớp 1',
            course: 'Khóa 17',
            totalStudents: 40,
            headTeacher: 'PGS.TS. Lê Văn C',
            academicYear: '2022-2023',
            status: 'completed',
        },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#10b981';
            case 'completed':
                return '#6366f1';
            case 'upcoming':
                return '#f59e0b';
            default:
                return '#94a3b8';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Đang học';
            case 'completed':
                return 'Đã hoàn thành';
            case 'upcoming':
                return 'Sắp khai giảng';
            default:
                return status;
        }
    };

    const filteredClasses = classes.filter((cls) => {
        const matchesSearch =
            cls.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.classId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.headTeacher.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || cls.status === filterStatus;
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
                        placeholder="Tìm kiếm lớp học..."
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
                {['all', 'active', 'upcoming', 'completed'].map((status) => (
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
                                    : status === 'upcoming'
                                        ? 'Sắp khai giảng'
                                        : 'Đã hoàn thành'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Classes List */}
            <ScrollView style={styles.listContainer}>
                {filteredClasses.map((cls) => (
                    <View key={cls.id} style={styles.classCard}>
                        <View style={styles.classHeader}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="school" size={28} color="#ec4899" />
                            </View>
                            <View style={styles.classInfo}>
                                <Text style={styles.className}>{cls.className}</Text>
                                <Text style={styles.classId}>{cls.classId}</Text>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(cls.status) + '20' },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: getStatusColor(cls.status) },
                                    ]}
                                >
                                    {getStatusText(cls.status)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.classDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="book-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{cls.course}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>
                                    Năm học: {cls.academicYear}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="person-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>GVCN: {cls.headTeacher}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="people-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>
                                    Sĩ số: {cls.totalStudents} sinh viên
                                </Text>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="list-outline" size={20} color="#10b981" />
                                <Text style={[styles.actionButtonText, { color: '#10b981' }]}>
                                    Danh sách SV
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

            {/* Add Class Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tạo lớp học mới</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <Text style={styles.label}>Mã lớp học</Text>
                            <TextInput style={styles.input} placeholder="VD: CNTT-K18-01" />

                            <Text style={styles.label}>Tên lớp học</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Công nghệ thông tin K18 - Lớp 1"
                            />

                            <Text style={styles.label}>Khóa học</Text>
                            <TextInput style={styles.input} placeholder="VD: Khóa 18" />

                            <Text style={styles.label}>Năm học</Text>
                            <TextInput style={styles.input} placeholder="VD: 2023-2024" />

                            <Text style={styles.label}>Giáo viên chủ nhiệm</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Chọn giáo viên chủ nhiệm"
                            />

                            <Text style={styles.label}>Sĩ số tối đa</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: 45"
                                keyboardType="numeric"
                            />

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => {
                                    Alert.alert('Thành công', 'Đã tạo lớp học mới');
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.submitButtonText}>Tạo lớp học</Text>
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
        backgroundColor: '#ec4899',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ec4899',
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
        backgroundColor: '#ec4899',
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
    classCard: {
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
    classHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#fce7f3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    classInfo: {
        flex: 1,
    },
    className: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    classId: {
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
    classDetails: {
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
        backgroundColor: '#ec4899',
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
