import React, { useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

interface DatePickerProps {
    value: Date | null;
    onChange: (date: Date) => void;
    placeholder?: string;
}

export default function DatePicker({
    value,
    onChange,
    placeholder = 'Select date',
}: DatePickerProps) {
    const { isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const openPicker = () => {
        setTempDate(value || new Date());
        setIsVisible(true);
    };

    const closePicker = () => {
        setIsVisible(false);
        setTempDate(null);
    };

    const handleConfirm = (selectedDate: Date) => {
        setTempDate(selectedDate);
        onChange(selectedDate);
        closePicker();
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <View>
            <TouchableOpacity
                onPress={openPicker}
                className={`rounded-lg border px-4 py-4 ${
                    isDark
                        ? 'border-gray-600 bg-black'
                        : 'border-gray-300 bg-white'
                }`}
            >
                <Text
                    className={`font-instrument-serif text-base ${
                        value
                            ? isDark
                                ? 'text-white'
                                : 'text-black'
                            : isDark
                              ? 'text-gray-500'
                              : 'text-gray-400'
                    }`}
                >
                    {value ? formatDate(value) : placeholder}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent
                animationType="fade"
                onRequestClose={closePicker}
            >
                <View className="flex-1 items-center justify-center bg-black/50 px-6">
                    <View
                        className={`w-full rounded-2xl p-4 ${
                            isDark ? 'bg-neutral-900' : 'bg-white'
                        }`}
                    >
                        <DateTimePicker
                            value={tempDate || value || new Date()}
                            mode="date"
                            display={
                                Platform.OS === 'ios' ? 'spinner' : 'default'
                            }
                            themeVariant={isDark ? 'dark' : 'light'}
                            onChange={(_, selectedDate) =>
                                setTempDate(
                                    selectedDate || tempDate || new Date()
                                )
                            }
                        />

                        <View className="mt-4 gap-3">
                            <Button
                                title="Confirm"
                                onPress={() =>
                                    handleConfirm(
                                        tempDate || value || new Date()
                                    )
                                }
                            ></Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
