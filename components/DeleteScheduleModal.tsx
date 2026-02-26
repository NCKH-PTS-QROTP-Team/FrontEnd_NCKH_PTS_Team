/**
 * DeleteScheduleModal
 *
 * Cho phép xóa lịch học theo 3 cách:
 *  1. Xóa 1 ngày cụ thể       → PATCH /schedules/{id}/exclude  { dates: [iso] }
 *  2. Xóa theo đoạn thời gian → PATCH /schedules/{id}/exclude  { rangeStart, rangeEnd }
 *  3. Xóa toàn bộ lịch học    → DELETE /schedules/{id}
 */
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scheduleService } from '@/apis/services/schedule.service';
import { ScheduleResponse } from '@/apis/types/schedule.types';

// ── helpers ────────────────────────────────────────────────────────────────────

const TEAL = '#0ea5e9';
const RED = '#ef4444';
const PURPLE = '#8b5cf6';

function dateToISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function jsDayToBackend(jsDay: number): number { return jsDay === 0 ? 8 : jsDay + 1; }

const DAY_LABELS: Record<number, string> = {
    2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4',
    5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7', 8: 'CN',
};

// ── Mini Calendar (reused from ScheduleFormModal pattern) ─────────────────────

const CAL_HEADS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function buildGrid(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    let offset = firstDay.getDay() - 1;
    if (offset < 0) offset = 6;
    const cells: { iso: string; date: number; inMonth: boolean }[] = [];
    const cur = new Date(year, month, 1 - offset);
    for (let i = 0; i < 42; i++) {
        cells.push({ iso: dateToISO(cur), date: cur.getDate(), inMonth: cur.getMonth() === month });
        cur.setDate(cur.getDate() + 1);
    }
    return cells;
}

function MiniCalPicker({ selected, onSelect, accent = TEAL }: {
    selected: string;
    onSelect: (iso: string) => void;
    accent?: string;
}) {
    const today = dateToISO(new Date());
    const init = selected ? new Date(selected + 'T00:00:00') : new Date();
    const [year, setYear] = useState(init.getFullYear());
    const [month, setMonth] = useState(init.getMonth());
    const cells = React.useMemo(() => buildGrid(year, month), [year, month]);
    const monthName = new Date(year, month, 1).toLocaleString('vi-VN', { month: 'long' });
    const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const { width: winW } = useWindowDimensions();
    const calW = Math.min(winW - 80, 300);
    const cellSz = Math.floor(calW / 7);

    return (
        <View style={[dc.calBox, { maxWidth: 300, alignSelf: 'stretch' }]}>
            <View style={dc.calNav}>
                <TouchableOpacity style={dc.calNavBtn} onPress={prev}>
                    <Ionicons name="chevron-back" size={14} color={accent} />
                </TouchableOpacity>
                <Text style={dc.calNavTitle}>
                    {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
                </Text>
                <TouchableOpacity style={dc.calNavBtn} onPress={next}>
                    <Ionicons name="chevron-forward" size={14} color={accent} />
                </TouchableOpacity>
            </View>
            <View style={dc.calHeadRow}>
                {CAL_HEADS.map((h, i) => (
                    <Text key={i} style={[dc.calHead, i === 6 && { color: RED }]}>{h}</Text>
                ))}
            </View>
            <View style={dc.calGrid}>
                {cells.map((c) => {
                    const isSel = c.iso === selected;
                    const isToday = c.iso === today;
                    const isSun = jsDayToBackend(new Date(c.iso + 'T00:00:00').getDay()) === 8;
                    return (
                        <TouchableOpacity
                            key={c.iso}
                            style={[
                                dc.calCell,
                                { width: cellSz, height: cellSz },
                                isSel && { backgroundColor: accent, borderRadius: 8 },
                                isToday && !isSel && { borderWidth: 1.5, borderColor: accent, borderRadius: 8 },
                                !c.inMonth && { opacity: 0.3 },
                            ]}
                            onPress={() => onSelect(c.iso)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                dc.calCellText,
                                isSel && { color: '#fff', fontWeight: '800' },
                                isToday && !isSel && { color: accent, fontWeight: '800' },
                                isSun && !isSel && { color: RED },
                            ]}>{c.date}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

// ── Tab types ─────────────────────────────────────────────────────────────────

type DeleteMode = 'one' | 'range' | 'all';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
    visible: boolean;
    schedule: ScheduleResponse | null;
    onClose: () => void;
    onDeleted: (scheduleId: string, fullyDeleted: boolean, updated?: ScheduleResponse) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DeleteScheduleModal({ visible, schedule, onClose, onDeleted }: Props) {
    const [mode, setMode] = useState<DeleteMode>('one');
    const [singleDate, setSingleDate] = useState('');
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!schedule) return null;

    const dayLabel = DAY_LABELS[schedule.dayOfWeek ?? 2] ?? '';
    const title = schedule.subjectName ?? 'Lịch học';

    const handleDelete = async () => {
        if (!schedule) return;
        try {
            setSubmitting(true);
            if (mode === 'all') {
                await scheduleService.deleteSchedule(schedule.id);
                onDeleted(schedule.id, true);
            } else if (mode === 'one') {
                if (!singleDate) { alert('Vui lòng chọn ngày cần hủy.'); return; }
                const updated = await scheduleService.excludeDates(schedule.id, { dates: [singleDate] });
                onDeleted(schedule.id, false, updated);
            } else {
                if (!rangeStart || !rangeEnd) { alert('Vui lòng chọn đầy đủ khoảng ngày.'); return; }
                if (rangeEnd < rangeStart) { alert('Ngày kết thúc phải sau ngày bắt đầu.'); return; }
                const updated = await scheduleService.excludeDates(schedule.id, { rangeStart, rangeEnd });
                onDeleted(schedule.id, false, updated);
            }
            onClose();
        } catch (err: any) {
            alert(err?.message || 'Không thể xóa lịch học.');
        } finally {
            setSubmitting(false);
        }
    };

    const MODES: { key: DeleteMode; label: string; icon: any; color: string; desc: string }[] = [
        { key: 'one', label: 'Hủy 1 buổi', icon: 'calendar-clear-outline', color: PURPLE, desc: 'Chỉ hủy 1 ngày học cụ thể' },
        { key: 'range', label: 'Hủy theo đoạn', icon: 'calendar-outline', color: '#f59e0b', desc: 'Hủy nhiều buổi trong khoảng thời gian' },
        { key: 'all', label: 'Xóa toàn bộ', icon: 'trash-outline', color: RED, desc: 'Xóa hẳn lịch học này' },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
            <View style={dc.overlay}>
                <View style={dc.sheet}>
                    <View style={dc.handle} />

                    {/* Header */}
                    <View style={dc.header}>
                        <View style={dc.headerIcon}>
                            <Ionicons name="trash" size={20} color={RED} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={dc.headerTitle} numberOfLines={1}>{title}</Text>
                            <Text style={dc.headerSub}>{dayLabel} • {schedule.startTime}–{schedule.endTime}{schedule.room ? ` • ${schedule.room}` : ''}</Text>
                        </View>
                        <TouchableOpacity style={dc.closeBtn} onPress={onClose}>
                            <Ionicons name="close" size={18} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Mode tabs */}
                    <View style={dc.modeTabs}>
                        {MODES.map((m) => (
                            <TouchableOpacity
                                key={m.key}
                                style={[dc.modeTab, mode === m.key && { borderColor: m.color, backgroundColor: m.color + '12' }]}
                                onPress={() => setMode(m.key)}
                                activeOpacity={0.75}
                            >
                                <Ionicons name={m.icon} size={18} color={mode === m.key ? m.color : '#94a3b8'} />
                                <Text style={[dc.modeTabLabel, mode === m.key && { color: m.color }]}>{m.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={dc.modeDesc}>{MODES.find(m => m.key === mode)?.desc}</Text>

                    {/* Content */}
                    {mode === 'one' && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={dc.calLabel}>Chọn ngày cần hủy</Text>
                            <MiniCalPicker selected={singleDate} onSelect={setSingleDate} accent={PURPLE} />
                            {singleDate !== '' && (
                                <View style={dc.selectedInfo}>
                                    <Ionicons name="alert-circle-outline" size={13} color={PURPLE} />
                                    <Text style={[dc.selectedText, { color: PURPLE }]}>Sẽ hủy buổi ngày {singleDate}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {mode === 'range' && (
                        <View style={{ marginTop: 8, gap: 10 }}>
                            <Text style={dc.calLabel}>Từ ngày</Text>
                            <MiniCalPicker
                                selected={rangeStart}
                                onSelect={(iso) => {
                                    setRangeStart(iso);
                                    if (rangeEnd && rangeEnd < iso) setRangeEnd('');
                                }}
                                accent="#f59e0b"
                            />
                            <Text style={[dc.calLabel, { marginTop: 4 }]}>Đến ngày</Text>
                            <MiniCalPicker
                                selected={rangeEnd}
                                onSelect={(iso) => setRangeEnd(iso)}
                                accent="#f59e0b"
                            />
                            {rangeStart && rangeEnd && rangeEnd >= rangeStart && (
                                <View style={dc.selectedInfo}>
                                    <Ionicons name="alert-circle-outline" size={13} color="#f59e0b" />
                                    <Text style={[dc.selectedText, { color: '#92400e' }]}>
                                        Sẽ hủy tất cả buổi học từ {rangeStart} đến {rangeEnd}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {mode === 'all' && (
                        <View style={dc.allWarn}>
                            <Ionicons name="warning-outline" size={22} color={RED} />
                            <Text style={dc.allWarnText}>
                                Hành động này sẽ <Text style={{ fontWeight: '800' }}>xóa vĩnh viễn</Text> toàn bộ lịch học
                                "{title}" khỏi hệ thống. Không thể hoàn tác.
                            </Text>
                        </View>
                    )}

                    {/* Action button */}
                    <TouchableOpacity
                        style={[dc.actionBtn, { backgroundColor: MODES.find(m => m.key === mode)?.color }, submitting && { opacity: 0.65 }]}
                        onPress={handleDelete}
                        disabled={submitting}
                    >
                        {submitting
                            ? <ActivityIndicator color="#fff" />
                            : <>
                                <Ionicons name={mode === 'all' ? 'trash' : 'close-circle-outline'} size={18} color="#fff" />
                                <Text style={dc.actionBtnText}>
                                    {mode === 'one' ? 'Hủy buổi học này' : mode === 'range' ? 'Hủy các buổi trong đoạn' : 'Xóa toàn bộ lịch học'}
                                </Text>
                            </>
                        }
                    </TouchableOpacity>
                    <View style={{ height: 20 }} />
                </View>
            </View>
        </Modal>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const dc = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 20, paddingBottom: 4, maxHeight: '90%',
    },
    handle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 12 },

    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    headerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: RED + '15', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
    headerSub: { fontSize: 12, color: '#64748b', marginTop: 1 },
    closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },

    modeTabs: { flexDirection: 'row', gap: 8, marginBottom: 6 },
    modeTab: {
        flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10,
        borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    modeTabLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textAlign: 'center' },
    modeDesc: { fontSize: 12, color: '#64748b', marginBottom: 4, fontStyle: 'italic' },

    calLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 },

    calBox: {
        backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0',
        padding: 8,
    },
    calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    calNavBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: TEAL + '15', alignItems: 'center', justifyContent: 'center' },
    calNavTitle: { fontSize: 12, fontWeight: '700', color: '#1e293b' },
    calHeadRow: { flexDirection: 'row', marginBottom: 2 },
    calHead: { flex: 1, textAlign: 'center', fontSize: 9, fontWeight: '700', color: '#94a3b8' },
    calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calCell: { alignItems: 'center', justifyContent: 'center' },
    calCellText: { fontSize: 11, fontWeight: '600', color: '#1e293b' },

    selectedInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    selectedText: { fontSize: 12, fontWeight: '600', flex: 1 },

    allWarn: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: RED + '10', borderRadius: 14, padding: 16, marginTop: 8, borderWidth: 1, borderColor: RED + '30' },
    allWarnText: { flex: 1, fontSize: 13, color: '#7f1d1d', lineHeight: 20 },

    actionBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 14, padding: 16, marginTop: 16 },
    actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
