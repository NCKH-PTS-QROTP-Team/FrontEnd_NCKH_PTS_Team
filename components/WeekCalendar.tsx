import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleResponse } from '@/apis/types/schedule.types';

const TEAL = '#0ea5e9';
const COL_HEADS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface WeekCalendarProps {
    schedules: ScheduleResponse[];
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    weekOffset: number;
    setWeekOffset: React.Dispatch<React.SetStateAction<number>>;
}

export function WeekCalendar({
    schedules, selectedDate, setSelectedDate, weekOffset, setWeekOffset
}: WeekCalendarProps) {
    const weekDays = useMemo(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setDate(monday.getDate() + weekOffset * 7);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const temp = new Date(monday);
            temp.setDate(temp.getDate() + i);
            days.push(temp);
        }
        return days;
    }, [weekOffset]);

    return (
        <View>
            <View style={s.weekSelectorRow}>
                <TouchableOpacity onPress={() => setWeekOffset(o => o - 1)} style={s.weekSelectorBtn}>
                    <Ionicons name="chevron-back" size={18} color={TEAL} />
                </TouchableOpacity>
                <Text style={s.weekSelectorText}>
                    {weekDays[0].toLocaleDateString('vi-VN')} - {weekDays[6].toLocaleDateString('vi-VN')}
                </Text>
                <TouchableOpacity onPress={() => setWeekOffset(o => o + 1)} style={s.weekSelectorBtn}>
                    <Ionicons name="chevron-forward" size={18} color={TEAL} />
                </TouchableOpacity>
            </View>

            <View style={s.weekDaysRow}>
                {weekDays.map((d, i) => {
                    const dow = d.getDay() === 0 ? 8 : d.getDay() + 1;
                    const isSelected = selectedDate.toDateString() === d.toDateString();
                    const hasSchedule = schedules.some(sc => sc.dayOfWeek === dow);
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setSelectedDate(d)}
                            style={[s.weekDayItem, isSelected && s.weekDayItemActive]}
                        >
                            <Text style={[s.weekDayLabel, isSelected && s.weekDayLabelActive]}>{COL_HEADS[i]}</Text>
                            <Text style={[s.weekDayDate, isSelected && s.weekDayDateActive]}>{d.getDate()}</Text>
                            {hasSchedule && (
                                <View style={[s.weekDayDot, isSelected && s.weekDayDotActive]} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    weekSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#fff', borderRadius: 12, padding: 8, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
    weekSelectorBtn: { padding: 8, backgroundColor: '#f8fafc', borderRadius: 8 },
    weekSelectorText: { fontSize: 14, fontWeight: '600', color: '#334155' },
    weekDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    weekDayItem: { flex: 1, backgroundColor: '#fff', marginHorizontal: 3, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    weekDayItemActive: { backgroundColor: TEAL, borderColor: TEAL },
    weekDayLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 4 },
    weekDayLabelActive: { color: 'rgba(255,255,255,0.8)' },
    weekDayDate: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    weekDayDateActive: { color: '#fff' },
    weekDayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: TEAL, marginTop: 4 },
    weekDayDotActive: { backgroundColor: '#fff' },
});
