import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CryEntry } from '@/lib/cryingService';
import { emotionLabels, formatRelativeDate } from '@/lib/reflectionUtils';

interface ReflectionCardProps {
    entry: CryEntry;
    onPress: () => void;
    isDark?: boolean;
}

export default function ReflectionCard({
    entry,
    onPress,
    isDark = false,
}: ReflectionCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`mb-4 rounded-lg border p-5 ${
                isDark ? 'border-gray-700 bg-black' : 'border-gray-200 bg-white'
            }`}
        >
            <View className="flex-row items-center justify-between">
                <Text
                    className={`font-instrument-serif-bold text-lg ${
                        isDark ? 'text-white' : 'text-black'
                    }`}
                >
                    {emotionLabels[entry.emotions] || entry.emotions}
                </Text>
                <Text
                    className={`font-instrument-serif text-sm ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                >
                    {formatRelativeDate(entry.cried_at)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
