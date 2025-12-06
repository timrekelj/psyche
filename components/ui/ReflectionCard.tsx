import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CryEntry } from '@/lib/cryingService';
import { emotionLabels, formatRelativeDate } from '@/lib/reflectionUtils';

interface ReflectionCardProps {
    entry: CryEntry;
    onPress: () => void;
}

export default function ReflectionCard({
    entry,
    onPress,
}: ReflectionCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="mb-4 rounded-lg border border-gray-200 bg-white p-5"
        >
            <View className="flex-row items-center justify-between">
                <Text className="font-instrument-serif-bold text-lg text-black">
                    {emotionLabels[entry.emotions] || entry.emotions}
                </Text>
                <Text className="font-instrument-serif text-sm text-gray-400">
                    {formatRelativeDate(entry.cried_at)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
