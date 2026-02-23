/**
 * UserCard — Generic user card with a 3-dot context menu
 *
 * Props:
 *  name, code, email            : thông tin cơ bản
 *  isActive                     : trạng thái hoạt động
 *  department?, joinedAt?       : tuỳ chọn
 *  codeLabel?                   : nhãn trước mã  (mặc định "Mã")
 *  accentColor?                 : override màu avatar
 *  extraDetails?                : thêm dòng info tuỳ ý  { icon, text }
 *  actions?                     : danh sách hành động  { label, icon, color, onPress }
 */

import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    StyleSheet,
    Animated,
    Platform,
    type LayoutRectangle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserCardAction {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
    onPress: () => void;
}

export interface UserCardDetailRow {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    text: string;
}

export interface UserCardProps {
    name: string;
    code: string;
    email: string;
    isActive: boolean;
    department?: string | null;
    joinedAt?: string | null;
    codeLabel?: string;
    accentColor?: string;
    extraDetails?: UserCardDetailRow[];
    actions?: UserCardAction[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor = (isActive: boolean) => (isActive ? '#10b981' : '#f59e0b');
const statusText = (isActive: boolean) => (isActive ? 'Hoạt động' : 'Tạm khóa');

function formatDate(iso: string) {
    try { return new Date(iso).toLocaleDateString('vi-VN'); }
    catch { return '—'; }
}

// ─── Component ────────────────────────────────────────────────────────────────

const MENU_WIDTH = 180;

export const UserCard: React.FC<UserCardProps> = ({
    name,
    code,
    email,
    isActive,
    department,
    joinedAt,
    codeLabel = 'Mã',
    accentColor,
    extraDetails = [],
    actions = [],
}) => {
    const accent = accentColor ?? statusColor(isActive);
    const initials = name.trim().charAt(0).toUpperCase();

    // ── Menu state ──
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 16 });
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.88)).current;
    const menuBtnRef = useRef<View>(null);

    const openMenu = () => {
        menuBtnRef.current?.measure((fx, fy, w, h, px, py) => {
            // Hiện menu ngay dưới nút, căn phải
            setMenuPos({
                top: py + h + 6,
                right: Math.max(8, (Platform.OS === 'web' ? 0 : 0)),
            });

            setMenuVisible(true);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 280 }),
            ]).start();
        });
    };

    const closeMenu = (callback?: () => void) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 110, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.88, duration: 110, useNativeDriver: true }),
        ]).start(() => {
            setMenuVisible(false);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.88);
            callback?.();
        });
    };

    return (
        <View style={styles.card}>

            {/* ── Header ── */}
            <View style={styles.header}>
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: accent + '20' }]}>
                    <Text style={[styles.avatarText, { color: accent }]}>{initials}</Text>
                </View>

                {/* Name + code */}
                <View style={styles.nameBlock}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.code}>{codeLabel}: {code || '—'}</Text>
                </View>

                {/* Status pill */}
                <View style={[styles.statusPill, { backgroundColor: statusColor(isActive) + '18' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor(isActive) }]} />
                    <Text style={[styles.statusText, { color: statusColor(isActive) }]}>
                        {statusText(isActive)}
                    </Text>
                </View>

                {/* 3-dot menu button */}
                {actions.length > 0 && (
                    <View ref={menuBtnRef} collapsable={false}>
                        <TouchableOpacity
                            style={styles.menuBtn}
                            onPress={openMenu}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="ellipsis-vertical" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* ── Detail rows ── */}
            <View style={styles.details}>
                <DetailRow icon="mail-outline" text={email} />
                {!!department && <DetailRow icon="business-outline" text={department} />}
                {!!joinedAt && <DetailRow icon="calendar-outline" text={`Tham gia: ${formatDate(joinedAt)}`} />}
                {extraDetails.map((d, i) => <DetailRow key={i} icon={d.icon} text={d.text} />)}
            </View>

            {/* ── Dropdown menu (Modal) ── */}
            <Modal
                transparent
                visible={menuVisible}
                animationType="none"
                onRequestClose={() => closeMenu()}
                statusBarTranslucent
            >
                {/* Backdrop — nhấn ngoài để đóng */}
                <TouchableWithoutFeedback onPress={() => closeMenu()}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                {/* Menu popup */}
                <Animated.View
                    style={[
                        styles.menu,
                        {
                            top: menuPos.top,
                            right: 16,
                            width: MENU_WIDTH,
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {actions.map((action, idx) => {
                        const isLast = idx === actions.length - 1;
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                                activeOpacity={0.75}
                                onPress={() =>
                                    closeMenu(() => {
                                        // nhỏ delay để animation đóng xong rồi mới execute
                                        setTimeout(action.onPress, 50);
                                    })
                                }
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: action.color + '18' }]}>
                                    <Ionicons name={action.icon} size={15} color={action.color} />
                                </View>
                                <Text style={[styles.menuItemLabel, { color: action.color }]}>
                                    {action.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </Animated.View>
            </Modal>
        </View>
    );
};

// ─── Sub-component ────────────────────────────────────────────────────────────

function DetailRow({
    icon,
    text,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    text: string;
}) {
    return (
        <View style={styles.detailRow}>
            <Ionicons name={icon} size={13} color="#94a3b8" />
            <Text style={styles.detailText} numberOfLines={1}>{text}</Text>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'visible',        // cho phép dropdown ra ngoài
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 10,
        gap: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    nameBlock: {
        flex: 1,
        gap: 2,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    code: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },

    // 3-dot button
    menuBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },

    // Details
    details: {
        paddingHorizontal: 14,
        paddingBottom: 14,
        paddingLeft: 68,        // align với name
        gap: 5,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: '#64748b',
        flex: 1,
    },

    // Dropdown
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    menu: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 6,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        transformOrigin: 'top right',   // anchor animation từ góc trên phải
    } as any,
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 11,
        gap: 10,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    menuItemIcon: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default UserCard;
