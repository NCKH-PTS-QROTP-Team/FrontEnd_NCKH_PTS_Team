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

interface Course {
    id: string;
    courseId: string;
    courseName: string;
    credits: number;
    semester: string;
    department: string;
    instructor: string;
    totalStudents: number;
    maxStudents: number;
    status: 'active' | 'completed' | 'upcoming';
}

export default function CoursesManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [courses, setCourses] = useState<Course[]>([
        {
            id: '1',
            courseId: 'IT101',
            courseName: 'Lập trình Web',
            credits: 3,
            semester: 'HK1 2023-2024',
            department: 'Khoa CNTT',
            instructor: 'TS. Nguyễn Văn A',
            totalStudents: 45,
            maxStudents: 50,
            status: 'active',
        },
        {
            id: '2',
            courseId: 'IT102',
            courseName: 'Cơ sở dữ liệu',
            credits: 4,
            semester: 'HK1 2023-2024',
            department: 'Khoa CNTT',
            instructor: 'ThS. Trần Thị B',
            totalStudents: 38,
            maxStudents: 45,
            status: 'active',
        },
        {
            id: '3',
            courseId: 'IT103',
            courseName: 'Mạng máy tính',
            credits: 3,
            semester: 'HK2 2023-2024',
            department: 'Khoa CNTT',
            instructor: 'PGS.TS. Lê Văn C',
            totalStudents: 0,
            maxStudents: 40,
            status: 'upcoming',
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
                return 'Đang mở';
            case 'completed':
                return 'Đã kết thúc';
            case 'upcoming':
                return 'Sắp mở';
            default:
                return status;
        }
    };

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.courseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterStatus === 'all' || course.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getEnrollmentPercentage = (current: number, max: number) => {
        return Math.round((current / max) * 100);
    };

    return (
        <View style={styles.container}>
            {/* Search and Filter Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm khóa học..."
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
                                    ? 'Đang mở'
                                    : status === 'upcoming'
                                        ? 'Sắp mở'
                                        : 'Đã kết thúc'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Courses List */}
            <ScrollView style={styles.listContainer}>
                {filteredCourses.map((course) => (
                    <View key={course.id} style={styles.courseCard}>
                        <View style={styles.courseHeader}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="book" size={28} color="#f59e0b" />
                            </View>
                            <View style={styles.courseInfo}>
                                <Text style={styles.courseName}>{course.courseName}</Text>
                                <Text style={styles.courseId}>{course.courseId}</Text>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(course.status) + '20' },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: getStatusColor(course.status) },
                                    ]}
                                >
                                    {getStatusText(course.status)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.courseDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="star-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{course.credits} tín chỉ</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{course.semester}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="business-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{course.department}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="person-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>GV: {course.instructor}</Text>
                            </View>
                        </View>

                        {/* Enrollment Progress */}
                        <View style={styles.enrollmentContainer}>
                            <View style={styles.enrollmentHeader}>
                                <Text style={styles.enrollmentLabel}>Đăng ký</Text>
                                <Text style={styles.enrollmentValue}>
                                    {course.totalStudents}/{course.maxStudents} sinh viên
                                </Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${getEnrollmentPercentage(
                                                course.totalStudents,
                                                course.maxStudents
                                            )}%`,
                                            backgroundColor:
                                                getEnrollmentPercentage(
                                                    course.totalStudents,
                                                    course.maxStudents
                                                ) >= 90
                                                    ? '#ef4444'
                                                    : getEnrollmentPercentage(
                                                        course.totalStudents,
                                                        course.maxStudents
                                                    ) >= 70
                                                        ? '#f59e0b'
                                                        : '#10b981',
                                        },
                                    ]}
                                />
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

            {/* Add Course Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tạo khóa học mới</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <Text style={styles.label}>Mã khóa học</Text>
                            <TextInput style={styles.input} placeholder="VD: IT101" />

                            <Text style={styles.label}>Tên khóa học</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: Lập trình Web"
                            />

                            <Text style={styles.label}>Số tín chỉ</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: 3"
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Học kỳ</Text>
                            <TextInput style={styles.input} placeholder="VD: HK1 2023-2024" />

                            <Text style={styles.label}>Khoa</Text>
                            <TextInput style={styles.input} placeholder="VD: Khoa CNTT" />

                            <Text style={styles.label}>Giảng viên</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Chọn giảng viên"
                            />

                            <Text style={styles.label}>Số lượng sinh viên tối đa</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: 50"
                                keyboardType="numeric"
                            />

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => {
                                    Alert.alert('Thành công', 'Đã tạo khóa học mới');
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.submitButtonText}>Tạo khóa học</Text>
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
        backgroundColor: '#f59e0b',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f59e0b',
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
        backgroundColor: '#f59e0b',
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
    courseCard: {
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
    courseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    courseInfo: {
        flex: 1,
    },
    courseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    courseId: {
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
    courseDetails: {
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
    enrollmentContainer: {
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    enrollmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    enrollmentLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    enrollmentValue: {
        fontSize: 13,
        color: '#1e293b',
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
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
        backgroundColor: '#f59e0b',
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
