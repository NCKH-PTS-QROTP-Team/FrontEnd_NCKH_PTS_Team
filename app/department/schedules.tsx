import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

interface Schedule {
    id: string;
    courseId: string;
    courseName: string;
    instructor: string;
    class: string;
    room: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    date: string;
}

export default function SchedulesManagement() {
    const [selectedDate, setSelectedDate] = useState('2024-02-05');
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [modalVisible, setModalVisible] = useState(false);
    const [schedules, setSchedules] = useState<Schedule[]>([
        {
            id: '1',
            courseId: 'IT101',
            courseName: 'Lập trình Web',
            instructor: 'TS. Nguyễn Văn A',
            class: 'CNTT-K18-01',
            room: 'A101',
            dayOfWeek: 'Thứ 2',
            startTime: '07:00',
            endTime: '09:00',
            date: '2024-02-05',
        },
        {
            id: '2',
            courseId: 'IT102',
            courseName: 'Cơ sở dữ liệu',
            instructor: 'ThS. Trần Thị B',
            class: 'CNTT-K18-01',
            room: 'B202',
            dayOfWeek: 'Thứ 2',
            startTime: '09:15',
            endTime: '11:15',
            date: '2024-02-05',
        },
        {
            id: '3',
            courseId: 'IT103',
            courseName: 'Mạng máy tính',
            instructor: 'PGS.TS. Lê Văn C',
            class: 'CNTT-K18-02',
            room: 'C303',
            dayOfWeek: 'Thứ 3',
            startTime: '13:00',
            endTime: '15:00',
            date: '2024-02-06',
        },
    ]);

    const markedDates = {
        [selectedDate]: {
            selected: true,
            selectedColor: '#10b981',
        },
        '2024-02-05': { marked: true, dotColor: '#3b82f6' },
        '2024-02-06': { marked: true, dotColor: '#3b82f6' },
        '2024-02-07': { marked: true, dotColor: '#3b82f6' },
    };

    const filteredSchedules = schedules.filter(
        (schedule) => schedule.date === selectedDate
    );

    const getTimeColor = (startTime: string) => {
        const hour = parseInt(startTime.split(':')[0]);
        if (hour < 12) return '#3b82f6';
        if (hour < 17) return '#10b981';
        return '#8b5cf6';
    };

    return (
        <View style={styles.container}>
            {/* View Mode Toggle */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        viewMode === 'calendar' && styles.toggleButtonActive,
                    ]}
                    onPress={() => setViewMode('calendar')}
                >
                    <Ionicons
                        name="calendar"
                        size={20}
                        color={viewMode === 'calendar' ? '#fff' : '#64748b'}
                    />
                    <Text
                        style={[
                            styles.toggleText,
                            viewMode === 'calendar' && styles.toggleTextActive,
                        ]}
                    >
                        Lịch
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        viewMode === 'list' && styles.toggleButtonActive,
                    ]}
                    onPress={() => setViewMode('list')}
                >
                    <Ionicons
                        name="list"
                        size={20}
                        color={viewMode === 'list' ? '#fff' : '#64748b'}
                    />
                    <Text
                        style={[
                            styles.toggleText,
                            viewMode === 'list' && styles.toggleTextActive,
                        ]}
                    >
                        Danh sách
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {viewMode === 'calendar' ? (
                <ScrollView style={styles.content}>
                    {/* Calendar */}
                    <View style={styles.calendarContainer}>
                        <Calendar
                            current={selectedDate}
                            onDayPress={(day) => setSelectedDate(day.dateString)}
                            markedDates={markedDates}
                            theme={{
                                backgroundColor: '#ffffff',
                                calendarBackground: '#ffffff',
                                textSectionTitleColor: '#64748b',
                                selectedDayBackgroundColor: '#10b981',
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: '#3b82f6',
                                dayTextColor: '#1e293b',
                                textDisabledColor: '#cbd5e1',
                                dotColor: '#3b82f6',
                                selectedDotColor: '#ffffff',
                                arrowColor: '#3b82f6',
                                monthTextColor: '#1e293b',
                                textDayFontWeight: '500',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '600',
                            }}
                        />
                    </View>

                    {/* Schedule for Selected Date */}
                    <View style={styles.scheduleSection}>
                        <Text style={styles.sectionTitle}>
                            Lịch học ngày {selectedDate}
                        </Text>
                        {filteredSchedules.length > 0 ? (
                            filteredSchedules.map((schedule) => (
                                <View key={schedule.id} style={styles.scheduleCard}>
                                    <View
                                        style={[
                                            styles.timeIndicator,
                                            { backgroundColor: getTimeColor(schedule.startTime) },
                                        ]}
                                    />
                                    <View style={styles.scheduleContent}>
                                        <View style={styles.scheduleHeader}>
                                            <Text style={styles.courseName}>
                                                {schedule.courseName}
                                            </Text>
                                            <View style={styles.timeBadge}>
                                                <Ionicons name="time-outline" size={14} color="#fff" />
                                                <Text style={styles.timeText}>
                                                    {schedule.startTime} - {schedule.endTime}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.scheduleDetails}>
                                            <View style={styles.detailRow}>
                                                <Ionicons
                                                    name="person-outline"
                                                    size={16}
                                                    color="#64748b"
                                                />
                                                <Text style={styles.detailText}>
                                                    {schedule.instructor}
                                                </Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Ionicons
                                                    name="school-outline"
                                                    size={16}
                                                    color="#64748b"
                                                />
                                                <Text style={styles.detailText}>{schedule.class}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Ionicons
                                                    name="location-outline"
                                                    size={16}
                                                    color="#64748b"
                                                />
                                                <Text style={styles.detailText}>
                                                    Phòng {schedule.room}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyText}>
                                    Không có lịch học trong ngày này
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <ScrollView style={styles.content}>
                    <View style={styles.listSection}>
                        <Text style={styles.sectionTitle}>Tất cả lịch học</Text>
                        {schedules.map((schedule) => (
                            <View key={schedule.id} style={styles.scheduleCard}>
                                <View
                                    style={[
                                        styles.timeIndicator,
                                        { backgroundColor: getTimeColor(schedule.startTime) },
                                    ]}
                                />
                                <View style={styles.scheduleContent}>
                                    <View style={styles.scheduleHeader}>
                                        <Text style={styles.courseName}>{schedule.courseName}</Text>
                                        <View style={styles.timeBadge}>
                                            <Ionicons name="time-outline" size={14} color="#fff" />
                                            <Text style={styles.timeText}>
                                                {schedule.startTime} - {schedule.endTime}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.scheduleDetails}>
                                        <View style={styles.detailRow}>
                                            <Ionicons
                                                name="calendar-outline"
                                                size={16}
                                                color="#64748b"
                                            />
                                            <Text style={styles.detailText}>
                                                {schedule.dayOfWeek} - {schedule.date}
                                            </Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Ionicons
                                                name="person-outline"
                                                size={16}
                                                color="#64748b"
                                            />
                                            <Text style={styles.detailText}>
                                                {schedule.instructor}
                                            </Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Ionicons
                                                name="school-outline"
                                                size={16}
                                                color="#64748b"
                                            />
                                            <Text style={styles.detailText}>{schedule.class}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Ionicons
                                                name="location-outline"
                                                size={16}
                                                color="#64748b"
                                            />
                                            <Text style={styles.detailText}>
                                                Phòng {schedule.room}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <Ionicons name="create-outline" size={18} color="#3b82f6" />
                                            <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>
                                                Sửa
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>
                                                Xóa
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}

            {/* Add Schedule Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thêm lịch học mới</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalText}>
                            Chức năng thêm lịch học sẽ được phát triển...
                        </Text>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => {
                                Alert.alert('Thông báo', 'Chức năng đang phát triển');
                                setModalVisible(false);
                            }}
                        >
                            <Text style={styles.submitButtonText}>Đóng</Text>
                        </TouchableOpacity>
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
    toggleContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 12,
        gap: 6,
    },
    toggleButtonActive: {
        backgroundColor: '#10b981',
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    toggleTextActive: {
        color: '#fff',
    },
    addButton: {
        width: 48,
        height: 48,
        backgroundColor: '#10b981',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    calendarContainer: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    scheduleSection: {
        padding: 16,
        paddingTop: 0,
    },
    listSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    scheduleCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    timeIndicator: {
        width: 6,
    },
    scheduleContent: {
        flex: 1,
        padding: 16,
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    courseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#64748b',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    scheduleDetails: {
        gap: 8,
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
        gap: 16,
        marginTop: 12,
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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 15,
        color: '#94a3b8',
        marginTop: 16,
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
    modalText: {
        fontSize: 15,
        color: '#64748b',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
