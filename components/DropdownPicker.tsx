import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DropdownPickerProps {
    label: string;
    options: { label: string; value: string | null }[];
    selectedValue: string | null;
    onValueChange: (val: string | null) => void;
    placeholder: string;
    themeColor?: string;
}

export function DropdownPicker({
    label,
    options,
    selectedValue,
    onValueChange,
    placeholder,
    themeColor = '#0ea5e9' // Default to TEAL
}: DropdownPickerProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const selectedOption = options.find(o => o.value === selectedValue);

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;
        const q = searchQuery.toLowerCase();
        return options.filter(o => o.label.toLowerCase().includes(q));
    }, [options, searchQuery]);

    const handleOpen = () => {
        setSearchQuery('');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <View style={s.dropdownWrapper}>
            <Text style={s.dropdownLabel}>{label}</Text>
            <TouchableOpacity
                style={s.dropdownButton}
                activeOpacity={0.7}
                onPress={handleOpen}
            >
                <Text style={[s.dropdownButtonText, !selectedValue && { color: '#94a3b8' }]} numberOfLines={1}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade" onRequestClose={handleClose}>
                <TouchableOpacity style={s.dropdownOverlay} activeOpacity={1} onPress={handleClose}>
                    <TouchableWithoutFeedback>
                        <View style={s.dropdownMenu}>
                            {/* Search bar */}
                            <View style={s.searchContainer}>
                                <Ionicons name="search" size={16} color="#94a3b8" />
                                <TextInput
                                    style={s.searchInput}
                                    placeholder="Tìm kiếm..."
                                    placeholderTextColor="#94a3b8"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Ionicons name="close-circle" size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 8 }}>
                                {filteredOptions.length === 0 ? (
                                    <Text style={s.noResultText}>Không tìm thấy kết quả</Text>
                                ) : (
                                    filteredOptions.map((opt, idx) => {
                                        const isSelected = selectedValue === opt.value;
                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                style={[s.dropdownItem, isSelected && { backgroundColor: themeColor + '15' }]}
                                                onPress={() => { onValueChange(opt.value); handleClose(); }}
                                            >
                                                <Text style={[s.dropdownItemText, isSelected && { color: themeColor, fontWeight: '700' }]} numberOfLines={1}>
                                                    {opt.label}
                                                </Text>
                                                {isSelected && <Ionicons name="checkmark" size={18} color={themeColor} />}
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    dropdownWrapper: { flex: 1 },
    dropdownLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 4, marginLeft: 4 },
    dropdownButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, height: 38 },
    dropdownButtonText: { fontSize: 13, color: '#1e293b', flex: 1, marginRight: 8 },
    dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    dropdownMenu: { backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 320, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10, overflow: 'hidden' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 8, paddingHorizontal: 10, margin: 8, height: 36, borderWidth: 1, borderColor: '#e2e8f0' },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#334155' },
    noResultText: { textAlign: 'center', color: '#94a3b8', fontSize: 13, paddingVertical: 12 },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 2 },
    dropdownItemText: { fontSize: 14, color: '#475569', flex: 1 },
});
