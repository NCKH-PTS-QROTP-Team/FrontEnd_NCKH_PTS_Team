import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function DepartmentProfile() {
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => {
                        // Clear auth and navigate to login
                        router.replace('/auth/login' as any);
                    },
                },
            ]
        );
    };

    type ProfileItem = {
        icon: string;
        label: string;
        value?: string;
        onPress?: () => void;
    };

    type ProfileSection = {
        title: string;
        items: ProfileItem[];
    };

    const profileSections: ProfileSection[] = [
        {
            title: 'Thông tin cá nhân',
            items: [
                {
                    icon: 'person-outline',
                    label: 'Họ và tên',
                    value: 'Nguyễn Thị Thanh Hương',
                },
                {
                    icon: 'briefcase-outline',
                    label: 'Chức vụ',
                    value: 'Giáo vụ khoa',
                },
                {
                    icon: 'school-outline',
                    label: 'Khoa',
                    value: 'Khoa Công nghệ thông tin',
                },
                {
                    icon: 'mail-outline',
                    label: 'Email',
                    value: 'gvk001@iuh.edu.vn',
                },
                {
                    icon: 'call-outline',
                    label: 'Số điện thoại',
                    value: '0123 456 789',
                },
            ],
        },
        {
            title: 'Cài đặt',
            items: [
                {
                    icon: 'key-outline',
                    label: 'Đổi mật khẩu',
                    onPress: () => {
                        Alert.alert('Thông báo', 'Chức năng đang phát triển');
                    },
                },
                {
                    icon: 'notifications-outline',
                    label: 'Thông báo',
                    onPress: () => {
                        Alert.alert('Thông báo', 'Chức năng đang phát triển');
                    },
                },
                {
                    icon: 'language-outline',
                    label: 'Ngôn ngữ',
                    value: 'Tiếng Việt',
                    onPress: () => {
                        Alert.alert('Thông báo', 'Chức năng đang phát triển');
                    },
                },
            ],
        },
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={80} color={Colors.primary} />
                </View>
                <Text style={styles.name}>Nguyễn Thị Thanh Hương</Text>
                <Text style={styles.role}>Giáo vụ khoa CNTT</Text>
                <Text style={styles.id}>GVK001</Text>
            </View>

            {/* Profile Sections */}
            {profileSections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.card}>
                        {section.items.map((item, itemIndex) => (
                            <TouchableOpacity
                                key={itemIndex}
                                style={[
                                    styles.item,
                                    itemIndex !== section.items.length - 1 && styles.itemBorder,
                                ]}
                                onPress={item.onPress}
                                disabled={!item.onPress}
                            >
                                <View style={styles.itemLeft}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={22}
                                        color={Colors.primary}
                                    />
                                    <Text style={styles.itemLabel}>{item.label}</Text>
                                </View>
                                {item.value && (
                                    <Text style={styles.itemValue}>{item.value}</Text>
                                )}
                                {item.onPress && (
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color={Colors.textSecondary}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: Colors.white,
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textHeading,
        marginBottom: 5,
    },
    role: {
        fontSize: 15,
        color: Colors.textSecondary,
        marginBottom: 3,
    },
    id: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textHeading,
        marginBottom: 12,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemLabel: {
        fontSize: 15,
        color: Colors.text,
        marginLeft: 12,
    },
    itemValue: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginRight: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        marginHorizontal: 20,
        marginTop: 30,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ef4444',
        marginLeft: 8,
    },
});
