import React, { useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

interface TimePickerProps {
    value: Date | null;
    onChange: (date: Date) => void;
    placeholder?: string;
}

export default function TimePicker({
    value,
    onChange,
    placeholder = 'Select time',
}: TimePickerProps) {
    const { isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [tempTime, setTempTime] = useState<Date | null>(null);

    const openPicker = () => {
        setTempTime(value || new Date());
        setIsVisible(true);
    };

    const closePicker = () => {
        setIsVisible(false);
        setTempTime(null);
    };

    const handleConfirm = (selectedTime: Date) => {
        const base = value ? new Date(value) : new Date();
        base.setHours(selectedTime.getHours());
        base.setMinutes(selectedTime.getMinutes());
        setTempTime(base);
        onChange(base);
        closePicker();
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
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
                    {value ? formatTime(value) : placeholder}
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
                            value={tempTime || value || new Date()}
                            mode="time"
                            display={
                                Platform.OS === 'ios' ? 'spinner' : 'default'
                            }
                            themeVariant={isDark ? 'dark' : 'light'}
                            onChange={(_, selectedDate) =>
                                setTempTime(
                                    selectedDate || tempTime || new Date()
                                )
                            }
                        />

                        <View className="mt-4 gap-3">
                            <Button
                                title="Confirm"
                                onPress={() =>
                                    handleConfirm(
                                        tempTime || value || new Date()
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
