import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { EmotionType } from '@/contexts/CryingContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SelectOption {
    value: EmotionType;
    label: string;
    description?: string;
}

interface SelectInputProps {
    value: EmotionType | null;
    onChange: (value: EmotionType) => void;
    options: SelectOption[];
    label?: string;
    placeholder?: string;
}

export default function SelectInput({
    value,
    onChange,
    options,
    label = 'Select an option',
    placeholder = 'Choose an option',
}: SelectInputProps) {
    const { isDark } = useTheme();

    return (
        <View>
            {label && (
                <Text
                    className={`mb-4 font-instrument-serif text-lg ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                >
                    {label}
                </Text>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        className={`mb-3 rounded-lg border p-4 ${
                            value === option.value
                                ? isDark
                                    ? 'border-white bg-white'
                                    : 'border-black bg-black'
                                : isDark
                                  ? 'border-gray-600 bg-black'
                                  : 'border-gray-300 bg-white'
                        }`}
                    >
                        <Text
                            className={`font-instrument-serif text-base ${
                                value === option.value
                                    ? isDark
                                        ? 'text-black'
                                        : 'text-white'
                                    : isDark
                                      ? 'text-white'
                                      : 'text-black'
                            }`}
                        >
                            {option.label}
                        </Text>
                        {option.description && (
                            <Text
                                className={`mt-1 font-instrument-serif text-sm ${
                                    value === option.value
                                        ? isDark
                                            ? 'text-gray-700'
                                            : 'text-gray-200'
                                        : isDark
                                          ? 'text-gray-400'
                                          : 'text-gray-600'
                                }`}
                            >
                                {option.description}
                            </Text>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
